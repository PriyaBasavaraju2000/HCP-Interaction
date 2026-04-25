"""
LangGraph-based AI Agent for parsing HCP interaction details from natural language.
Uses Groq API with mixtral-8x7b-32768 model.
"""

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from typing import TypedDict, List, Optional, Annotated
import json
import os
import operator


SYSTEM_PROMPT = """You are an AI assistant embedded in a pharmaceutical CRM application. 
Your role is to help pharmaceutical sales representatives log their interactions with Healthcare Professionals (HCPs).

When a user describes an interaction, you must:
1. Extract structured data from their message
2. Provide a helpful conversational response

Extract these fields when mentioned:
- hcp_name: Full name of the healthcare professional (e.g., "Dr. Smith", "Dr. Sarah Johnson")
- interaction_type: One of "Meeting", "Call", "Email", "Conference", "Lunch", "Other"
- date: Date of interaction in YYYY-MM-DD format. If relative dates are used (e.g., "today", "yesterday"), interpret them relative to the current date.
- time: Time in HH:MM format (24-hour)
- attendees: Comma-separated list of attendee names
- topics: Key topics discussed, as a brief summary
- materials_shared: Any brochures, studies, or materials shared
- samples_distributed: Any product samples given, with quantities if mentioned
- sentiment: Overall HCP sentiment - "Positive", "Neutral", or "Negative"
- outcomes: Key outcomes or agreements reached
- follow_up: Suggested follow-up actions

IMPORTANT RULES:
- Only extract fields that are explicitly or clearly implied in the user's message.
- Use null for fields not mentioned.
- Be conversational and helpful in your response.
- If the user's message is a greeting or general question (not about logging an interaction), respond naturally without extracting data.
- After extracting data, confirm what you found and suggest any missing important fields.
- If the interaction was logged successfully, mention that the form fields have been auto-populated.

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "extracted_data": {
    "hcp_name": "string or null",
    "interaction_type": "string or null",
    "date": "string or null",
    "time": "string or null",
    "attendees": "string or null",
    "topics": "string or null",
    "materials_shared": "string or null",
    "samples_distributed": "string or null",
    "sentiment": "string or null",
    "outcomes": "string or null",
    "follow_up": "string or null"
  },
  "response": "Your conversational response here"
}

Do NOT include any text before or after the JSON object. Return ONLY valid JSON.
"""


class AgentState(TypedDict):
    messages: List
    extracted_data: Optional[dict]
    response: Optional[str]


def create_agent():
    """Create and compile the LangGraph agent."""
    
    api_key = os.getenv("GROQ_API_KEY", "")
    print("API KEY:", api_key)
    
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=api_key,
        temperature=0.3,
        max_tokens=2048,
    )

    def process_message(state: AgentState) -> dict:
        """Process user message, extract interaction data, and generate response."""
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
        
        try:
            ai_response = llm.invoke(messages)
            content = ai_response.content.strip()
            
            # Try to extract JSON from the response
            # Sometimes the model wraps it in markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            result = json.loads(content)
            
            extracted = result.get("extracted_data", {})
            response_text = result.get("response", "I've processed your message.")
            
            # Clean null values
            if extracted:
                extracted = {k: v for k, v in extracted.items() if v is not None}
            
            return {
                "extracted_data": extracted if extracted else {},
                "response": response_text,
                "messages": state["messages"] + [AIMessage(content=content)],
            }
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw response
            return {
                "extracted_data": {},
                "response": ai_response.content if ai_response else "I'm sorry, I had trouble processing that. Could you try rephrasing?",
                "messages": state["messages"] + [AIMessage(content=ai_response.content if ai_response else "")],
            }
        except Exception as e:
            error_msg = f"I encountered an issue processing your request. Please try again. (Error: {str(e)[:100]})"
            return {
                "extracted_data": {},
                "response": error_msg,
                "messages": state["messages"],
            }

    # Build the graph
    workflow = StateGraph(AgentState)
    workflow.add_node("process", process_message)
    workflow.set_entry_point("process")
    workflow.add_edge("process", END)

    return workflow.compile()


# Singleton agent instance
_agent = None


def get_agent():
    """Get or create the singleton agent instance."""
    global _agent
    if _agent is None:
        _agent = create_agent()
    return _agent


def run_agent(user_message: str, chat_history: list = None) -> dict:
    """
    Run the agent with a user message and optional chat history.
    
    Returns:
        dict with 'response' (str) and 'extracted_data' (dict)
    """
    agent = get_agent()
    
    messages = []
    if chat_history:
        for msg in chat_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
    
    messages.append(HumanMessage(content=user_message))
    
    initial_state = {
        "messages": messages,
        "extracted_data": None,
        "response": None,
    }
    
    result = agent.invoke(initial_state)
    
    return {
        "response": result.get("response", ""),
        "extracted_data": result.get("extracted_data", {}),
    }
