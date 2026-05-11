from fastapi import APIRouter, Query

router = APIRouter()

CITY_DATA = {
    "dallas": {
        "restaurants": [
            {"name": "Pecan Lodge BBQ",          "address": "2702 Main St, Dallas",        "rating": 4.8, "reviews": 4200, "open_now": True,  "maps_url": "https://maps.google.com/?q=Pecan+Lodge+Dallas"},
            {"name": "Knife Steakhouse",          "address": "5300 E Mockingbird Ln",       "rating": 4.6, "reviews": 2100, "open_now": True,  "maps_url": "https://maps.google.com/?q=Knife+Steakhouse+Dallas"},
            {"name": "Velvet Taco",               "address": "3012 N Henderson Ave",        "rating": 4.5, "reviews": 1800, "open_now": True,  "maps_url": "https://maps.google.com/?q=Velvet+Taco+Dallas"},
            {"name": "Al Biernat's",              "address": "4217 Oak Lawn Ave",           "rating": 4.7, "reviews": 980,  "open_now": False, "maps_url": "https://maps.google.com/?q=Al+Biernat+Dallas"},
        ],
        "attractions": [
            {"name": "AT&T Stadium Tour",         "address": "1 AT&T Way, Arlington",       "rating": 4.8, "reviews": 9800, "open_now": True,  "maps_url": "https://maps.google.com/?q=ATT+Stadium+Arlington"},
            {"name": "Sixth Floor Museum",        "address": "411 Elm St, Dallas",          "rating": 4.7, "reviews": 7600, "open_now": True,  "maps_url": "https://maps.google.com/?q=Sixth+Floor+Museum+Dallas"},
            {"name": "Dallas Arboretum",          "address": "8525 Garland Rd, Dallas",     "rating": 4.8, "reviews": 5400, "open_now": True,  "maps_url": "https://maps.google.com/?q=Dallas+Arboretum"},
            {"name": "Reunion Tower",             "address": "300 Reunion Blvd E, Dallas",  "rating": 4.6, "reviews": 4200, "open_now": True,  "maps_url": "https://maps.google.com/?q=Reunion+Tower+Dallas"},
        ],
    },
    "los angeles": {
        "restaurants": [
            {"name": "Bestia",                   "address": "2121 E 7th Pl, Los Angeles",  "rating": 4.7, "reviews": 3800, "open_now": True,  "maps_url": "https://maps.google.com/?q=Bestia+LA"},
            {"name": "Republique",               "address": "624 S La Brea Ave",           "rating": 4.6, "reviews": 2900, "open_now": True,  "maps_url": "https://maps.google.com/?q=Republique+LA"},
            {"name": "Grand Central Market",     "address": "317 S Broadway, Los Angeles", "rating": 4.5, "reviews": 8700, "open_now": True,  "maps_url": "https://maps.google.com/?q=Grand+Central+Market+LA"},
            {"name": "In-N-Out Burger",          "address": "7009 Sunset Blvd",            "rating": 4.6, "reviews": 6200, "open_now": True,  "maps_url": "https://maps.google.com/?q=In-N-Out+Sunset+Blvd"},
        ],
        "attractions": [
            {"name": "SoFi Stadium Tour",        "address": "1001 Stadium Dr, Inglewood",  "rating": 4.9, "reviews": 5400, "open_now": True,  "maps_url": "https://maps.google.com/?q=SoFi+Stadium"},
            {"name": "Griffith Observatory",     "address": "2800 E Observatory Rd",       "rating": 4.8, "reviews": 9200, "open_now": True,  "maps_url": "https://maps.google.com/?q=Griffith+Observatory"},
            {"name": "Getty Center",             "address": "1200 Getty Center Dr",        "rating": 4.8, "reviews": 7800, "open_now": True,  "maps_url": "https://maps.google.com/?q=Getty+Center+LA"},
            {"name": "Santa Monica Pier",        "address": "200 Santa Monica Pier",       "rating": 4.6, "reviews": 12000,"open_now": True,  "maps_url": "https://maps.google.com/?q=Santa+Monica+Pier"},
        ],
    },
    "new york": {
        "restaurants": [
            {"name": "Carbone",                  "address": "181 Thompson St, New York",   "rating": 4.7, "reviews": 4100, "open_now": True,  "maps_url": "https://maps.google.com/?q=Carbone+NYC"},
            {"name": "Katz's Delicatessen",      "address": "205 E Houston St",            "rating": 4.6, "reviews": 9800, "open_now": True,  "maps_url": "https://maps.google.com/?q=Katz+Deli+NYC"},
            {"name": "Le Bernardin",             "address": "155 W 51st St",               "rating": 4.8, "reviews": 2900, "open_now": False, "maps_url": "https://maps.google.com/?q=Le+Bernardin+NYC"},
            {"name": "Joe's Pizza",              "address": "7 Carmine St, New York",      "rating": 4.5, "reviews": 7600, "open_now": True,  "maps_url": "https://maps.google.com/?q=Joes+Pizza+NYC"},
        ],
        "attractions": [
            {"name": "MetLife Stadium Tour",     "address": "1 MetLife Stadium Dr, NJ",    "rating": 4.8, "reviews": 4300, "open_now": True,  "maps_url": "https://maps.google.com/?q=MetLife+Stadium"},
            {"name": "Central Park",             "address": "Central Park, New York",      "rating": 4.9, "reviews": 45000,"open_now": True,  "maps_url": "https://maps.google.com/?q=Central+Park+NYC"},
            {"name": "Empire State Building",    "address": "20 W 34th St, New York",      "rating": 4.7, "reviews": 32000,"open_now": True,  "maps_url": "https://maps.google.com/?q=Empire+State+Building"},
            {"name": "The High Line",            "address": "New York, NY 10011",          "rating": 4.7, "reviews": 18000,"open_now": True,  "maps_url": "https://maps.google.com/?q=High+Line+NYC"},
        ],
    },
    "miami": {
        "restaurants": [
            {"name": "Joe's Stone Crab",         "address": "11 Washington Ave, Miami",    "rating": 4.6, "reviews": 5400, "open_now": True,  "maps_url": "https://maps.google.com/?q=Joes+Stone+Crab+Miami"},
            {"name": "Versailles Restaurant",    "address": "3555 SW 8th St",              "rating": 4.5, "reviews": 6700, "open_now": True,  "maps_url": "https://maps.google.com/?q=Versailles+Restaurant+Miami"},
            {"name": "Zuma Miami",               "address": "270 Biscayne Blvd Way",       "rating": 4.7, "reviews": 3200, "open_now": False, "maps_url": "https://maps.google.com/?q=Zuma+Miami"},
            {"name": "La Mar by Gaston Acurio",  "address": "500 Brickell Key Dr",         "rating": 4.6, "reviews": 2800, "open_now": True,  "maps_url": "https://maps.google.com/?q=La+Mar+Miami"},
        ],
        "attractions": [
            {"name": "Hard Rock Stadium",        "address": "347 Don Shula Dr",            "rating": 4.7, "reviews": 6800, "open_now": True,  "maps_url": "https://maps.google.com/?q=Hard+Rock+Stadium+Miami"},
            {"name": "Art Deco Historic District","address": "Ocean Dr, Miami Beach",      "rating": 4.8, "reviews": 9200, "open_now": True,  "maps_url": "https://maps.google.com/?q=Art+Deco+Miami+Beach"},
            {"name": "Wynwood Walls",            "address": "2516 NW 2nd Ave, Miami",      "rating": 4.7, "reviews": 8400, "open_now": True,  "maps_url": "https://maps.google.com/?q=Wynwood+Walls+Miami"},
            {"name": "Everglades National Park", "address": "40001 SR-9336, Homestead",    "rating": 4.8, "reviews": 7600, "open_now": True,  "maps_url": "https://maps.google.com/?q=Everglades+National+Park"},
        ],
    },
    "mexico city": {
        "restaurants": [
            {"name": "Pujol",                    "address": "Tennyson 133, Polanco",        "rating": 4.9, "reviews": 3200, "open_now": True,  "maps_url": "https://maps.google.com/?q=Pujol+Mexico+City"},
            {"name": "El Cardenal",              "address": "Palma 23, Centro Historico",  "rating": 4.7, "reviews": 5600, "open_now": True,  "maps_url": "https://maps.google.com/?q=El+Cardenal+Mexico+City"},
            {"name": "Quintonil",                "address": "Newton 55, Polanco",           "rating": 4.8, "reviews": 2100, "open_now": False, "maps_url": "https://maps.google.com/?q=Quintonil+Mexico+City"},
            {"name": "Mercado de San Juan",      "address": "Ernesto Pugibet 21",          "rating": 4.6, "reviews": 4300, "open_now": True,  "maps_url": "https://maps.google.com/?q=Mercado+San+Juan+Mexico+City"},
        ],
        "attractions": [
            {"name": "Estadio Azteca",           "address": "Calz. de Tlalpan 3465",       "rating": 4.8, "reviews": 12000,"open_now": True,  "maps_url": "https://maps.google.com/?q=Estadio+Azteca"},
            {"name": "Teotihuacan Pyramids",     "address": "San Juan Teotihuacán",        "rating": 4.9, "reviews": 28000,"open_now": True,  "maps_url": "https://maps.google.com/?q=Teotihuacan+Pyramids"},
            {"name": "Frida Kahlo Museum",       "address": "Londres 247, Coyoacán",       "rating": 4.8, "reviews": 14000,"open_now": True,  "maps_url": "https://maps.google.com/?q=Frida+Kahlo+Museum"},
            {"name": "Chapultepec Castle",       "address": "Bosque de Chapultepec",       "rating": 4.7, "reviews": 9800, "open_now": True,  "maps_url": "https://maps.google.com/?q=Chapultepec+Castle"},
        ],
    },
    "toronto": {
        "restaurants": [
            {"name": "Canoe Restaurant",         "address": "66 Wellington St W",          "rating": 4.7, "reviews": 2800, "open_now": True,  "maps_url": "https://maps.google.com/?q=Canoe+Restaurant+Toronto"},
            {"name": "St. Lawrence Market",      "address": "93 Front St E, Toronto",      "rating": 4.8, "reviews": 9200, "open_now": True,  "maps_url": "https://maps.google.com/?q=St+Lawrence+Market+Toronto"},
            {"name": "Pai Northern Thai",        "address": "18 Duncan St, Toronto",       "rating": 4.6, "reviews": 3400, "open_now": True,  "maps_url": "https://maps.google.com/?q=Pai+Thai+Toronto"},
            {"name": "Baro Toronto",             "address": "485 King St W",               "rating": 4.5, "reviews": 1900, "open_now": False, "maps_url": "https://maps.google.com/?q=Baro+Toronto"},
        ],
        "attractions": [
            {"name": "BMO Field",                "address": "170 Princes' Blvd, Toronto",  "rating": 4.7, "reviews": 5600, "open_now": True,  "maps_url": "https://maps.google.com/?q=BMO+Field+Toronto"},
            {"name": "CN Tower",                 "address": "290 Bremner Blvd, Toronto",   "rating": 4.8, "reviews": 24000,"open_now": True,  "maps_url": "https://maps.google.com/?q=CN+Tower+Toronto"},
            {"name": "Royal Ontario Museum",     "address": "100 Queens Park, Toronto",    "rating": 4.7, "reviews": 11000,"open_now": True,  "maps_url": "https://maps.google.com/?q=Royal+Ontario+Museum"},
            {"name": "Distillery District",      "address": "55 Mill St, Toronto",         "rating": 4.7, "reviews": 8900, "open_now": True,  "maps_url": "https://maps.google.com/?q=Distillery+District+Toronto"},
        ],
    },
}

def _get_city_data(city: str, kind: str):
    key = city.lower().strip()
    for city_key, data in CITY_DATA.items():
        if city_key in key or key in city_key:
            return data.get(kind, [])
    return []

@router.get("/restaurants")
async def get_restaurants(lat: float = Query(...), lng: float = Query(...), city: str = Query("")):
    places = _get_city_data(city, "restaurants")
    if not places:
        places = _default_mock(city, "restaurants")
    return {"source": "curated", "places": places}

@router.get("/attractions")
async def get_attractions(lat: float = Query(...), lng: float = Query(...), city: str = Query("")):
    places = _get_city_data(city, "attractions")
    if not places:
        places = _default_mock(city, "attractions")
    return {"source": "curated", "places": places}

def _default_mock(city, kind):
    if kind == "restaurants":
        return [
            {"name": "The Stadium Grill",        "address": f"Near Stadium, {city}", "rating": 4.5, "reviews": 320,  "open_now": True,  "maps_url": f"https://maps.google.com/?q=restaurants+in+{city}", "photo": None},
            {"name": "Fanzone BBQ and Burgers",   "address": f"Fan District, {city}", "rating": 4.3, "reviews": 215,  "open_now": True,  "maps_url": f"https://maps.google.com/?q=bbq+in+{city}",         "photo": None},
            {"name": "World Cup Seafood House",   "address": f"Downtown, {city}",     "rating": 4.7, "reviews": 540,  "open_now": False, "maps_url": f"https://maps.google.com/?q=seafood+in+{city}",     "photo": None},
            {"name": "La Fiesta Mexican Kitchen", "address": f"City Center, {city}",  "rating": 4.2, "reviews": 180,  "open_now": True,  "maps_url": f"https://maps.google.com/?q=mexican+in+{city}",    "photo": None},
        ]
    return [
        {"name": f"{city} City Museum",      "address": f"Museum District, {city}", "rating": 4.6, "reviews": 890,  "open_now": True,  "maps_url": f"https://maps.google.com/?q=museum+in+{city}",      "photo": None},
        {"name": f"{city} Waterfront Park",  "address": f"Waterfront, {city}",      "rating": 4.4, "reviews": 650,  "open_now": True,  "maps_url": f"https://maps.google.com/?q=park+in+{city}",        "photo": None},
        {"name": "Historic Downtown",         "address": f"Old Town, {city}",        "rating": 4.3, "reviews": 430,  "open_now": True,  "maps_url": f"https://maps.google.com/?q=downtown+{city}",       "photo": None},
        {"name": f"{city} Art Gallery",      "address": f"Arts District, {city}",   "rating": 4.5, "reviews": 310,  "open_now": False, "maps_url": f"https://maps.google.com/?q=art+gallery+in+{city}", "photo": None},
    ]