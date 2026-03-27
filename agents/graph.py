import operator
import random
from typing import Annotated, List, TypedDict, Optional, Dict
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# --- State Definition ---
class AgentState(TypedDict):
    current_sku: str
    strategy: str
    competitor_prices: List[float]
    internal_cogs: float
    current_price: float
    recommended_price: float
    approval_status: bool
    logs: Annotated[List[str], operator.add]
    last_action_summary: Optional[str]
    is_paused: bool

# --- Tools (Mocked) ---
def search_competitor(sku: str) -> List[float]:
    """Mock tool to search competitor prices."""
    # Returns 3 random prices around a reasonable range for the SKU
    base_price = 450.0 if "RICE" in sku else 100.0
    return [round(random.uniform(base_price * 0.9, base_price * 1.1), 2) for _ in range(3)]

def update_market_price(sku: str, price: float) -> str:
    """Mock tool to update the price in the database."""
    return f"Successfully updated {sku} to ₹{price}"

# --- Agent Nodes ---
def scout_node(state: AgentState) -> Dict:
    sku = state["current_sku"]
    prices = search_competitor(sku)
    log = f"Scout Agent: Found competitor prices for {sku}: {', '.join([f'₹{p}' for p in prices])}"
    return {
        "competitor_prices": prices,
        "logs": [log]
    }

def analyst_node(state: AgentState) -> Dict:
    sku = state["current_sku"]
    strategy = state["strategy"]
    competitor_prices = state["competitor_prices"]
    internal_cogs = state["internal_cogs"]
    current_price = state["current_price"]
    
    min_comp = min(competitor_prices)
    recommended = current_price
    
    # Simple Logic: Match Lowest or 5% under
    if strategy == "match_lowest":
        recommended = min_comp - 0.01
    elif strategy == "5_percent_under":
        recommended = round(min_comp * 0.95, 2)
        
    # Safety Check: Must be above COGS + 10% margin
    min_allowed = internal_cogs * 1.1
    if recommended < min_allowed:
        recommended = round(min_allowed, 2)
        log = f"Analyst Agent: Recommended price adjusted to ₹{recommended} to maintain 10% margin above COGS."
    else:
        margin = round(((recommended - internal_cogs) / internal_cogs) * 100, 1)
        log = f"Analyst Agent: We recommend changing {sku} price from ₹{current_price} to ₹{recommended} to {strategy.replace('_', ' ')} (₹{min_comp}). Your margin will remain at {margin}%."

    return {
        "recommended_price": recommended,
        "last_action_summary": log,
        "logs": [log],
        "is_paused": True # Signal that we need human approval before executive node
    }

def executive_node(state: AgentState) -> Dict:
    if not state.get("approval_status"):
        return {"logs": ["Executive Agent: Action rejected or not yet approved."]}
    
    sku = state["current_sku"]
    price = state["recommended_price"]
    result = update_market_price(sku, price)
    return {
        "logs": [f"Executive Agent: {result}"],
        "is_paused": False
    }

# --- Graph Logic ---
def should_continue(state: AgentState):
    if state.get("is_paused") and not state.get("approval_status"):
        return "pause"
    return "execute"

# --- Define the Graph ---
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("scout", scout_node)
workflow.add_node("analyst", analyst_node)
workflow.add_node("executive", executive_node)

# Set Entry Point
workflow.set_entry_point("scout")

# Define Edges
workflow.add_edge("scout", "analyst")

# The "Pause" logic: Analyst always leads to a potential pause.
# We use a conditional edge or just break the flow.
# In LangGraph, we can use `interrupt_before` or `interrupt_after`.
# Here, we'll interrupt BEFORE the executive node.

workflow.add_edge("analyst", "executive")
workflow.add_edge("executive", END)

# Compile the graph with a memory saver for checkpointing (threads)
memory = MemorySaver()
graph = workflow.compile(
    checkpointer=memory,
    interrupt_before=["executive"]
)
