import os, json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import httpx
load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

async def groq_chat(messages: list, max_tokens: int = 1500) -> str:
    if not GROQ_API_KEY:
        return None
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "messages": messages, "max_tokens": max_tokens},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

class IntentRequest(BaseModel):
    message: str

class ItineraryRequest(BaseModel):
    user_message: str
    matches:      list
    hotels:       list
    restaurants:  list
    attractions:  list

class ChatMessage(BaseModel):
    role:    str
    content: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    message: str

@router.post("/extract-intent")
async def extract_intent(req: IntentRequest):
    if not GROQ_API_KEY:
        return _mock_intent()
    try:
        result = await groq_chat([
            {"role": "system", "content": (
                "You are a FIFA World Cup 2026 travel assistant. "
                "Extract travel details from the user message. "
                "Return ONLY valid JSON with these fields: "
                '{"origin_city":"","budget_usd":0,"travel_dates":{"from":"","to":""},'
                '"interests":[],"group_size":1,"accommodation_pref":""}'
            )},
            {"role": "user", "content": req.message},
        ], max_tokens=300)
        # strip markdown fences if present
        clean = result.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except Exception as e:
        return _mock_intent()

@router.post("/generate-itinerary")
async def generate_itinerary(req: ItineraryRequest):
    if not GROQ_API_KEY:
        return {"itinerary": _mock_itinerary(req.matches)}
    matches_txt = "\n".join(f"- {m.get('team_a')} vs {m.get('team_b')} on {m.get('date')} at {m.get('stadium')}, {m.get('city')}" for m in req.matches[:5])
    hotels_txt  = "\n".join(f"- {h.get('name')} ({h.get('price_per_night_usd')}/night, {h.get('stars')} stars)" for h in req.hotels[:4])
    rest_txt    = "\n".join(f"- {r.get('name')} (rating {r.get('rating')})" for r in req.restaurants[:5])
    attr_txt    = "\n".join(f"- {a.get('name')}" for a in req.attractions[:5])
    prompt = f"""You are a World Cup 2026 travel expert. Create an exciting practical day-by-day itinerary.

USER REQUEST: {req.user_message}

SELECTED MATCHES:
{matches_txt}

HOTELS (pick the best fit):
{hotels_txt}

RESTAURANTS NEARBY:
{rest_txt}

ATTRACTIONS NEARBY:
{attr_txt}

Write a friendly day-by-day itinerary with Morning / Afternoon / Evening structure.
Include hotel recommendation, match day tips, restaurant picks, and attractions for free days.
Use Day 1, Day 2 headings. Keep it exciting and fan-focused."""

    try:
        result = await groq_chat([{"role": "user", "content": prompt}])
        return {"itinerary": result}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.post("/chat")
async def chat(req: ChatRequest):
    if not GROQ_API_KEY:
        return {"reply": "Add GROQ_API_KEY to .env for live AI chat! Get it free at console.groq.com", "history": req.history}
    messages = [
        {"role": "system", "content": "You are a helpful FIFA World Cup 2026 travel assistant. Be concise, friendly and practical."},
        *[{"role": m.role, "content": m.content} for m in req.history],
        {"role": "user", "content": req.message},
    ]
    try:
        reply = await groq_chat(messages, max_tokens=600)
        new_history = req.history + [
            ChatMessage(role="user",      content=req.message),
            ChatMessage(role="assistant", content=reply),
        ]
        return {"reply": reply, "history": new_history}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

def _mock_intent():
    return {"origin_city": "London", "budget_usd": 3000, "interests": ["football", "food"], "group_size": 2}

def _mock_itinerary(matches):
    return """Your World Cup 2026 Itinerary (Add GROQ_API_KEY to .env for AI-generated plan - free at console.groq.com)

Day 1 - Arrival
Morning: Fly in and check into your hotel near the stadium
Afternoon: Explore the city centre and grab lunch at a local spot
Evening: Pre-match dinner at the Stadium Grill

Day 2 - Match Day
Morning: Fan zone visit and stadium tour
Afternoon: Early lunch then head to the stadium - arrive 2 hours early
Evening: Celebrate after the match at Fanzone BBQ

Day 3 - Explore the City
Morning: City Museum visit
Afternoon: Waterfront Park and local shopping
Evening: Fine dining at World Cup Seafood House"""
