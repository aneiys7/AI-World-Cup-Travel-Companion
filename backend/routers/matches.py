import json
from pathlib import Path
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

# Load match data once at startup
DATA_PATH = Path(__file__).parent.parent / "data" / "matches.json"
with open(DATA_PATH) as f:
    ALL_MATCHES = json.load(f)


@router.get("/")
def get_matches(
    city: Optional[str] = Query(None, description="Filter by city name"),
    stage: Optional[str] = Query(None, description="Filter by stage e.g. 'Group A'"),
    team: Optional[str] = Query(None, description="Filter by team name"),
    country: Optional[str] = Query(None, description="Filter by country: USA, Mexico, Canada"),
):
    """
    Return all matches. Optionally filter by city, stage, team, or country.
    Example: GET /matches?team=Brazil&city=New York
    """
    results = ALL_MATCHES

    if city:
        results = [m for m in results if city.lower() in m["city"].lower()]

    if stage:
        results = [m for m in results if stage.lower() in m["stage"].lower()]

    if team:
        results = [
            m for m in results
            if team.lower() in m["team_a"].lower() or team.lower() in m["team_b"].lower()
        ]

    if country:
        results = [m for m in results if country.lower() == m["country"].lower()]

    return {"count": len(results), "matches": results}


@router.get("/{match_id}")
def get_match(match_id: str):
    """Return a single match by its ID."""
    match = next((m for m in ALL_MATCHES if m["match_id"] == match_id), None)
    if not match:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Match {match_id} not found")
    return match


@router.get("/cities/list")
def get_cities():
    """Return all unique host cities with their country and airport code."""
    seen = set()
    cities = []
    for m in ALL_MATCHES:
        key = m["city"]
        if key not in seen:
            seen.add(key)
            cities.append({
                "city": m["city"],
                "country": m["country"],
                "airport_code": m["airport_code"],
                "city_code": m["city_code"],
            })
    return {"cities": cities}
