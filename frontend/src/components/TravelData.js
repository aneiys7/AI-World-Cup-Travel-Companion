import { useState, useEffect } from "react";
import { useTripStore } from "../store/tripStore";
import { fetchHotels, fetchRestaurants, fetchAttractions } from "../lib/api";
 
export default function TravelData({ onBack, onNext }) {
  const { selectedMatches, hotels, restaurants, attractions, setHotels, setRestaurants, setAttractions } = useTripStore();
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("hotels");
 
  const primary   = selectedMatches[0];
  const city      = primary?.city || "New York";
  const lat       = primary?.lat  || 40.8135;
  const lng       = primary?.lng  || -74.0745;
  const checkIn   = primary?.date || "2026-06-15";
  const checkOut  = new Date(new Date(checkIn).getTime() + 3 * 86400000).toISOString().split("T")[0];
 
  useEffect(() => { load(); }, []);
 
  async function load() {
    setLoading(true);
    try {
      const [h, r, a] = await Promise.all([
        fetchHotels({ city, check_in: checkIn, check_out: checkOut }),
        fetchRestaurants({ lat, lng, city }),
        fetchAttractions({ lat, lng, city }),
      ]);
      setHotels(h.hotels || []);
      setRestaurants(r.places || []);
      setAttractions(a.places || []);
    } catch(e) { console.error(e); setHotels([]); setRestaurants([]); setAttractions([]); }
    finally { setLoading(false); }
  }
 
  const tabs = [
    { id: "hotels",       label: "🏨 Hotels",      data: hotels      },
    { id: "restaurants",  label: "🍽 Restaurants",  data: restaurants },
    { id: "attractions",  label: "🗺 Attractions",  data: attractions },
  ];
 
  // ✅ FIX: open link only if a real URL exists; do nothing if no URL
  function handleCardClick(e, url) {
    if (!url || url === "#") {
      e.preventDefault();
      return;
    }
    // valid URL — let the <a> open naturally in new tab
  }
 
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-1">← Back</button>
      <h2 className="text-2xl font-bold text-white mb-1">Hotels, Restaurants & Attractions</h2>
      <p className="text-white/50 text-sm mb-4">Results for <span className="text-green-400">{city}</span></p>
 
      <div className="flex flex-wrap gap-2 mb-6">
        {selectedMatches.map(m => (
          <span key={m.match_id} className="text-xs bg-green-900/30 border border-green-700/30 text-green-300 px-3 py-1 rounded-full">
            ⚽ {m.team_a} vs {m.team_b} · {m.city.split("/")[0].trim()} · {new Date(m.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}
          </span>
        ))}
      </div>
 
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-green-600 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            {t.label} {t.data.length > 0 && <span className="ml-1 text-xs opacity-60">({t.data.length})</span>}
          </button>
        ))}
      </div>
 
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_,i) => <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tabs.find(t => t.id === activeTab)?.data.map((item, i) => {
            const url = item.link || item.maps_url || null;
            return (
              // ✅ FIX: no href="#" fallback — use href only when a real URL exists
              <a
                key={i}
                href={url || undefined}
                target={url ? "_blank" : undefined}
                rel={url ? "noreferrer" : undefined}
                onClick={(e) => handleCardClick(e, url)}
                className={`block bg-white/5 border border-white/10 hover:border-green-500/40 rounded-xl p-4 transition-all ${!url ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-white/40 mt-1">{item.address || item.vicinity}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {item.rating && <span className="text-xs text-yellow-400">★ {item.rating}</span>}
                      {item.reviews && <span className="text-xs text-white/30">({item.reviews} reviews)</span>}
                      {item.open_now !== undefined && item.open_now !== null && (
                        <span className={`text-xs ${item.open_now ? "text-green-400" : "text-red-400"}`}>
                          {item.open_now ? "Open" : "Closed"}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.price_per_night_usd && (
                    <div className="text-right shrink-0">
                      <p className="text-green-400 font-bold text-sm">{item.price_per_night_usd}</p>
                      <p className="text-white/30 text-xs">/night</p>
                    </div>
                  )}
                  {item.stars && !item.price_per_night_usd && (
                    <span className="text-xs text-yellow-400 shrink-0">{"⭐".repeat(Math.min(item.stars,5))}</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
 
      <button onClick={onNext}
        className="mt-8 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        Generate AI Itinerary →
      </button>
    </div>
  );
}