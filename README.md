# Shopaluru Strategic Assistant 🚀
### Merchant Intelligence RAG Dashboard for E-commerce Founders

Shopaluru is a high-end **Merchant Intelligence Platform** designed to help e-commerce founders extract actionable, "money-making" insights from unstructured data like customer reviews, support tickets, and market reports.

---

## 🌟 Key Features

### 🔍 Grounded Intelligence
- **Hallucination Shield**: A strict system prompt ensures the AI only answers based on uploaded context.
- **Source Citations**: Every claim made by the AI includes a `[Source: ID]` bracketed reference.
- **Transparency Mode**: A dedicated side-panel showing raw context chunks retrieved from the Vector DB for auditing.

### 📊 Strategic Analysis
- **Self-Querying Retrieval**: Translates natural language questions into structured metadata filters (e.g., filtering by location or date).
- **Market Insights Sidebar**: Automatically generates 3 high-impact market trends based on current repository data.
- **Citation Cards**: Interactive UI components showing similarity scores, file snippets, and source metadata.

### 📥 Seamless Ingestion
- **Multi-Format Support**: Drag-and-drop ingestion for **PDF** (market reports) and **CSV** (customer reviews).
- **Advanced Chunking**: Uses `RecursiveCharacterTextSplitter` with optimized chunk sizes (1000) and overlap (200).

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: FastAPI (Python 3.13)
- **Orchestration**: LangChain (Modular v1.x)
- **Vector Database**: PostgreSQL + PGVector
- **Embeddings**: OpenAI `text-embedding-3-small`
- **Reasoning**: OpenAI `gpt-4o`

### **Frontend**
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Premium "SaaS" Aesthetic)
- **Animations**: Framer Motion
- **Icons**: Lucide-react
- **Content**: React Markdown

---

## 🏗️ Project Structure

```text
LLM/
├── frontend/             # React (Vite) Dashboard
│   ├── src/
│   │   ├── components/   # Modular UI Components (Layout, Sidebar, Chat, etc.)
│   │   └── App.jsx       # Main Dashboard Logic
│   └── tailwind.config.js
├── main.py               # FastAPI Backend & RAG Chain
├── setup_db.py           # Database Initialization Script
├── schema.sql            # PostgreSQL Schema & Vector Indexes
├── docker-compose.yml    # PostgreSQL + PGVector Container
├── requirements.txt      # Python Dependencies
└── .env                  # Credentials (OPENAI_API_KEY, DATABASE_URL)
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js (for frontend)
- OpenAI API Key

### 2. Database Initialization
```bash
# Start PostgreSQL with pgvector
docker-compose up -d

# Initialize tables and schema
python setup_db.py
```

### 3. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
# OPENAI_API_KEY=sk-...
# DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/shopaluru

# Start FastAPI server
python main.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Usage Guide

1. **Upload Data**: Navigate to the "Data Hub" in the sidebar. Drop a CSV of reviews or a PDF report.
2. **Wait for Ingestion**: Watch the processing "pulse" animation.
3. **Query the AI**: Ask questions like *"What are the top 3 complaints in Bangalore?"* or *"Summarize the feedback on packaging."*
4. **Audit Sources**: Toggle **Transparency Mode** in the header to see exactly what data the model is reading.

---

## 🔒 Data Sovereignty
Shopaluru strictly adheres to the principle of context-only reasoning. If information is not found in your uploaded records, the assistant will politely state: *"I don't have data on that specific item in your current records."*

---
*Built for the next generation of e-commerce founders.*
