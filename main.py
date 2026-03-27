import os
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain imports
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_postgres import PGVector
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_classic.retrievers.self_query.base import SelfQueryRetriever
from langchain_classic.chains.query_constructor.base import AttributeInfo
from langchain_classic.chains import ConversationalRetrievalChain

# Load environment variables
load_dotenv()

app = FastAPI(title="Shopaluru Strategic Assistant API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/shopaluru")
COLLECTION_NAME = "merchant_insights"

# Initialize components
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vector_store = PGVector(
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    connection=DATABASE_URL,
    use_jsonb=True,
)

# Text Splitter with requested chunk size 1000 and overlap 200
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    add_start_index=True
)

# --- Metadata definitions for SelfQueryRetriever ---
metadata_field_info = [
    AttributeInfo(
        name="location",
        description="The geographic location of the customer or market (e.g., Bangalore, Mumbai)",
        type="string",
    ),
    AttributeInfo(
        name="date",
        description="The date of the review or report in YYYY-MM-DD format",
        type="string",
    ),
    AttributeInfo(
        name="source_type",
        description="The type of document, either 'review' or 'market_report'",
        type="string",
    ),
]
document_content_description = "Reviews from customers and market reports about e-commerce trends"

# --- Models for Chat ---
class ChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[tuple]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]

class InsightSummary(BaseModel):
    trends: List[str]

# --- Prompt Template ---
SYSTEM_PROMPT = """You are the Shopaluru Strategic Assistant. Your goal is to help e-commerce founders extract 'Money-Making Insights' from their unstructured data (reviews, tickets, and reports).

Operational Rules:
1. Data Sovereignty: Use ONLY the provided context retrieved from the vector database. If a user asks about a competitor or a product not mentioned in the context, politely state: 'I don't have data on that specific item in your current records.'
2. Citation Format: For every claim you make (e.g., 'Customers in Bangalore dislike the delivery speed'), you MUST append a bracketed reference like [Source: review_id_123] or [Source: market_report_p4].
3. Actionability: End every insight with a 'Recommended Action.' (Example: 'Sentiment on packaging is low; Recommendation: Review the bubble-wrap supplier.')
4. Tone: Professional, data-driven, and supportive of a growing business owner.
5. Strictness: If the answer is not in the provided context, say you do not know. Do not use outside knowledge.

Context:
{context}

Question: {question}
Chat History: {chat_history}

Helpful Answer:"""

PROMPT = PromptTemplate(
    template=SYSTEM_PROMPT, 
    input_variables=["context", "question", "chat_history"]
)

# --- Endpoints ---

@app.post("/ingest/pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    """Ingest a PDF market report."""
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        loader = PyPDFLoader(temp_path)
        docs = loader.load()
        
        # Add metadata
        for doc in docs:
            doc.metadata["source_type"] = "market_report"
            doc.metadata["source_name"] = file.filename
        
        chunks = text_splitter.split_documents(docs)
        vector_store.add_documents(chunks)
        
        return {"status": "success", "chunks_added": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/ingest/csv")
async def ingest_csv(file: UploadFile = File(...)):
    """Ingest a CSV of customer reviews with metadata mapping."""
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        df = pd.read_csv(temp_path)
        documents = []
        for _, row in df.iterrows():
            content = " ".join([f"{col}: {val}" for col, val in row.items()])
            metadata = {
                "source_type": "review",
                "source_name": file.filename,
                "location": str(row.get("location", "Unknown")),
                "date": str(row.get("date", "Unknown")),
                "review_id": str(row.get("review_id", "Unknown"))
            }
            documents.append(Document(page_content=content, metadata=metadata))
        
        chunks = text_splitter.split_documents(documents)
        vector_store.add_documents(chunks)
        
        return {"status": "success", "chunks_added": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the strategic assistant using gpt-4o RAG."""
    
    # Initialize LLM with gpt-4o as requested
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
    
    # Setup SelfQueryRetriever
    retriever = SelfQueryRetriever.from_llm(
        llm,
        vector_store,
        document_content_description,
        metadata_field_info,
        search_kwargs={"k": 4}, # Requesting top 4 chunks
        verbose=True
    )
    
    # Setup ConversationalRetrievalChain
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
        combine_docs_chain_kwargs={"prompt": PROMPT}
    )
    
    # Execute query
    result = chain.invoke({
        "question": request.message,
        "chat_history": request.chat_history
    })
    
    # Extract sources for citation display in UI
    sources = [
        {
            "content": doc.page_content[:200] + "...", # Snippet for CitationCard
            "metadata": doc.metadata,
            "full_content": doc.page_content # For Transparency Mode
        }
        for doc in result["source_documents"]
    ]
    
    return ChatResponse(
        answer=result["answer"],
        sources=sources
    )

@app.get("/insights", response_model=InsightSummary)
async def get_insights():
    """Generate 3 bullet points of Market Trends based on data."""
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.7)
    
    # Get random context for insight generation
    docs = vector_store.similarity_search("General market trends and feedback", k=10)
    context = "\n".join([d.page_content for d in docs])
    
    prompt = f"Based on the following context, summarize 3 distinct market trends as short bullet points for an e-commerce founder. Context: {context}"
    
    response = llm.invoke(prompt)
    trends = [line.strip("- ").strip() for line in response.content.split("\n") if line.strip()][:3]
    
    return InsightSummary(trends=trends)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
