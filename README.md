# 🧠 HCP Interaction – AI-First CRM System

An AI-powered **Healthcare Professional (HCP) Interaction Management System** designed to simplify how field representatives log and analyze interactions using **LangGraph + LLM integration + Full Stack architecture**.

---

## 🚀 Project Overview

This project helps pharma/medical sales representatives record interactions with doctors (HCPs) using natural language instead of manual form filling.

The system uses **AI to extract structured data**, enrich it, and store it efficiently in a database.

---

## ✨ Key Features

- 💬 Chat-based interaction logging (like ChatGPT UI)
- 🧠 AI-powered information extraction from text
- 🔄 LangGraph workflow orchestration
- ✏️ Automatic data editing & refinement
- 📊 Structured storage of interactions in MySQL
- 🔍 Sentiment detection (Positive / Negative / Neutral)
- 📌 Extraction of:
  - Interaction type
  - Topics discussed
  - Materials shared
  - Outcomes
  - Follow-up actions
- ⚡ Real-time frontend + backend integration

---

## 🧩 LangGraph Tools Used

This project uses **5 core LangGraph tools**:

1. **Extraction Tool**
   - Extracts structured fields from raw user input

2. **Edit Tool**
   - Refines or updates extracted information

3. **Validation Tool**
   - Ensures correctness and completeness of extracted data

4. **Memory/State Tool**
   - Maintains conversation + interaction context

5. **Database Tool**
   - Stores final structured interaction into MySQL

---

## 🏗️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript (Chat-style UI)

### Backend
- Java / Python (based on your implementation)
- FastAPI / Spring Boot (if used)
- LangGraph + LLM (Groq / OpenAI integration)

### Database
- MySQL

---


---

## ⚙️ How It Works

1. User types interaction in natural language
2. AI extracts structured fields using LangGraph
3. Data is validated and refined
4. Sentiment + outcomes are generated
5. Final structured record is stored in MySQL
6. UI displays formatted interaction summary

---

## 💡 Example Interaction

**Input:**
> Met Dr. Sharma today. Discussed diabetes treatment. Shared product brochure. Positive response. Follow-up next week.

**Output:**
```json
{
  "name": "Dr. Sharma",
  "interaction_type": "Visit",
  "topics": ["Diabetes Treatment"],
  "materials_shared": ["Product Brochure"],
  "sentiment": "Positive",
  "outcomes": "Interested in product",
  "follow_up": "Next week visit scheduled"
}
