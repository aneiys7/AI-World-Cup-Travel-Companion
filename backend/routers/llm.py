import os
import json
import logging
import httpx
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Initialize environment and logger
load_dotenv()
logger = logging.getLogger("uvicorn")

router = APIRouter()

def get_groq_config():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("DEPLOYMENT ERROR: GROQ_API_KEY is missing from environment variables!")
    return api_key

GROQ_URL = "[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)"
GROQ_MODEL = "llama-3.3-70b-versatile"

async def groq_chat(messages: list, max_tokens: int = 1500) -> str:
    api_key = get_groq_config()
    if not api_key:
        return None
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            r = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": GROQ_MODEL, 
                    "messages": messages, 
                    "max_tokens": max_tokens,
                    "temperature": 0.7
                },
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            logger.error(f"Groq API Error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail="AI Service Error")
        except Exception as e:
            logger.error(f"Internal Error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

class IntentRequest(BaseModel):
    message: str

class ItineraryRequest(BaseModel):
    user_message: str
    matches: list
    hotels: list
    restaurants: list
    attractions: list

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    message: str

@router.post("/extract-intent")
async def extract_intent(req: IntentRequest):
    api_key = get_groq_config()
    if not api_key:
        return _mock_intent()
        
    try:
        result = await groq_chat([
            {"role": "system", "content": (
                "You are a FIFA World Cup 2026 travel assistant. "
                "Extract travel details from the user message. "
                "Return ONLY valid JSON. No conversational text."
                '{"origin_city":"","budget_usd":0,"travel_dates":{"from":"","to":""},'
                '"interests":[],"group_size":1,"accommodation_pref":""}'
            )},
            {"role": "user", "content": req.message},
        ], max_tokens=300)
        
        if not result:
            return _mock_intent()

        # Robust JSON cleaning without using risky backticks in the source code
        clean = result.strip()
        bt = chr(96) * 3 # This creates the ``` string safely
        if bt in clean:
            parts = clean.split(bt)
            clean = parts[1]
            if clean.startswith("json"):
                clean = clean[4:]
        
        return json.loads(clean.strip())
    except Exception as e:
        logger.warning(f"Failed to parse AI Intent: {str(e)}")
        return _mock_intent()

@router.post("/generate-itinerary")
async def generate_itinerary(req: ItineraryRequest):
    api_key = get_groq_config()
    if not api_key:
        return {"itinerary": _mock_itinerary(req.matches)}

    matches_txt = "\n".join(f"- {m.get('team_a')} vs {m.get('team_b')} on {m.get('date')} at {m.get('stadium')}, {m.get('city')}" for m in req.matches[:5])
    hotels_txt  = "\n".join(f"- {h.get('name')} ({h.get('price_per_night_usd')}/night, {h.get('stars')} stars)" for h in req.hotels[:4])
    rest_txt    = "\n".join(f"- {r.get('name')} (rating {r.get('rating')})" for r in req.restaurants[:5])
    attr_txt    = "\n".join(f"- {a.get('name')}" for a in req.attractions[:5])

    prompt = f"Create an itinerary for: {req.user_message}. Matches: {matches_txt}. Hotels: {hotels_txt}. Restaurants: {rest_txt}. Attractions: {attr_txt}."

    result = await groq_chat([{"role": "user", "content": prompt}])
    return {"itinerary": result if result else _mock_itinerary(req.matches)}

@router.post("/chat")
async def chat(req: ChatRequest):
    api_key = get_groq_config()
    if not api_key:
        return {"reply": "AI Chat is offline.", "history": req.history}

    messages = [
        {"role": "system", "content": "You are a FIFA World Cup 2026 travel assistant."},
        *[{"role": m.role, "content": m.content} for m in req.history],
        {"role": "user", "content": req.message},
    ]
    
    reply = await groq_chat(messages, max_tokens=600)
    new_history = [m.model_dump() for m in req.history] + [
        {"role": "user", "content": req.message},
        {"role": "assistant", "content": reply if reply else "Error."}
    ]
    return {"reply": reply if reply else "Error.", "history": new_history}

def _mock_intent():
    return {"origin_city": "London", "budget_usd": 3000, "interests": ["football"], "group_size": 2}

def _mock_itinerary(matches):
    return "Your itinerary is being prepared (mock mode)."