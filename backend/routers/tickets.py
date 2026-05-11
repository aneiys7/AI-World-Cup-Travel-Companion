import httpx
import os
from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY")
TICKETMASTER_BASE    = "https://app.ticketmaster.com/discovery/v2"


@router.get("/{match_id}")
async def get_tickets(
    match_id: str,
    stadium:  str = Query(...),
    city:     str = Query(...),
    date:     str = Query(...),
):
    # Always return mock — Ticketmaster won't have WC2026 tickets listed yet
    # When they go on sale, the live call below will automatically pick them up
    if not TICKETMASTER_API_KEY:
        return _mock_tickets(match_id, stadium, city, date)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Search by stadium name — more reliable than "FIFA World Cup 2026"
            resp = await client.get(
                f"{TICKETMASTER_BASE}/events.json",
                params={
                    "apikey":             TICKETMASTER_API_KEY,
                    "keyword":            stadium,
                    "city":               city,
                    "startDateTime":      f"{date}T00:00:00Z",
                    "endDateTime":        f"{date}T23:59:59Z",
                    "classificationName": "Sports",
                    "size":               5,
                },
            )
            resp.raise_for_status()
            events = resp.json().get("_embedded", {}).get("events", [])

            if not events:
                return _mock_tickets(match_id, stadium, city, date)

            tickets = []
            for e in events:
                pr = e.get("priceRanges", [])
                tickets.append({
                    "event_name":   e.get("name"),
                    "url":          e.get("url"),
                    "status":       e.get("dates", {}).get("status", {}).get("code", "unknown"),
                    "venue":        e.get("_embedded", {}).get("venues", [{}])[0].get("name"),
                    "price_ranges": [{"type": p.get("type"), "min": p.get("min"), "max": p.get("max"), "currency": p.get("currency", "USD")} for p in pr],
                })
            return {"match_id": match_id, "source": "ticketmaster_live", "tickets": tickets}

    except Exception:
        return _mock_tickets(match_id, stadium, city, date)


def _mock_tickets(match_id, stadium, city, date):
    return {
        "match_id": match_id,
        "source":   "mock_demo",
        "note":     "Official FIFA World Cup 2026 tickets go on sale closer to the tournament. Showing estimated prices.",
        "tickets": [
            {
                "event_name":   f"FIFA World Cup 2026 - {stadium}",
                "url":          "https://www.ticketmaster.com",
                "status":       "coming_soon",
                "venue":        stadium,
                "price_ranges": [
                    {"type": "Category 4 (Standard)", "min": 150,  "max": 350,  "currency": "USD"},
                    {"type": "Category 3 (Mid-tier)", "min": 400,  "max": 700,  "currency": "USD"},
                    {"type": "Category 2 (Premium)",  "min": 800,  "max": 1500, "currency": "USD"},
                    {"type": "Category 1 (VIP)",      "min": 1500, "max": 5000, "currency": "USD"},
                ],
            }
        ],
    }
