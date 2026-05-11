import httpx, os
from fastapi import APIRouter, Query
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

@router.get("/search")
async def search_hotels(
    city: str  = Query(...),
    check_in:  str = Query(...),
    check_out: str = Query(...),
):
    if not SERPAPI_KEY:
        return _mock(city)
    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            r = await client.get("https://serpapi.com/search", params={
                "engine":      "google_hotels",
                "q":           f"hotels near {city} FIFA World Cup 2026",
                "check_in_date":  check_in,
                "check_out_date": check_out,
                "adults":      "2",
                "currency":    "USD",
                "api_key":     SERPAPI_KEY,
            })
            r.raise_for_status()
            data = r.json()
            results = []
            for h in data.get("properties", [])[:8]:
                results.append({
                    "name":               h.get("name"),
                    "stars":              h.get("hotel_class"),
                    "rating":             h.get("overall_rating"),
                    "reviews":            h.get("reviews"),
                    "price_per_night_usd": h.get("rate_per_night", {}).get("lowest"),
                    "link":               h.get("link"),
                    "image":              h.get("images", [{}])[0].get("thumbnail"),
                })
            return {"city": city, "source": "serpapi_live", "hotels": results}
        except Exception:
            return _mock(city)

def _mock(city):
    return {
        "city": city, "source": "mock",
        "note": "Add SERPAPI_KEY to .env for live hotel data",
        "hotels": [
            {"name": f"Marriott {city}",        "stars": 4, "rating": 8.7, "reviews": 1200, "price_per_night_usd": "$189", "link": "https://marriott.com",  "image": None},
            {"name": f"Hilton {city} Downtown", "stars": 4, "rating": 8.4, "reviews": 980,  "price_per_night_usd": "$165", "link": "https://hilton.com",    "image": None},
            {"name": f"Holiday Inn {city}",     "stars": 3, "rating": 7.9, "reviews": 650,  "price_per_night_usd": "$129", "link": "https://ihg.com",      "image": None},
            {"name": f"Hyatt Regency {city}",   "stars": 5, "rating": 9.1, "reviews": 2100, "price_per_night_usd": "$310", "link": "https://hyatt.com",    "image": None},
        ],
    }
