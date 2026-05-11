from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import matches, tickets, hotels, places, llm, pdf

app = FastAPI(title="AI World Cup 2026 Travel Companion", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches.router, prefix="/matches", tags=["Matches"])
app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
app.include_router(hotels.router,  prefix="/hotels",  tags=["Hotels"])
app.include_router(places.router,  prefix="/places",  tags=["Places"])
app.include_router(llm.router,     prefix="/ai",      tags=["AI"])
app.include_router(pdf.router,     prefix="/pdf",     tags=["PDF"])

@app.get("/")
def root():
    return {"message": "World Cup 2026 Travel Companion API is running ⚽"}
