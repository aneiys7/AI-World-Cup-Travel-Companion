// TravelData.js — Hotels, Restaurants & Attractions with INLINE maps
// Google Maps embedded directly in the app — no popup to external browser
// Drop into: frontend/src/components/TravelData.js

import { useState, useEffect } from "react";
import { useTripStore } from "../store/tripStore";
import { fetchHotels, fetchRestaurants, fetchAttractions } from "../lib/api";

// Build an inline Google Maps embed URL for a place
function mapsEmbedUrl(lat, lng, placeName, city) {
  const q = encodeURIComponent(placeName ? `${placeName}, ${city}` : city);
  // Uses the Maps embed API (no key needed for basic embeds)
  return `https://maps.google.com/maps?q=${q}&t=m&z=15&output=embed&iwloc=near`;
}

function PlaceCard({ item, type, city, lat, lng, onSelect, isSelected }) {
  const [showMap, setShowMap] = useState(false);

  const placeLat = item.lat || lat;
  const placeLng = item.lng || lng;
  const url = item.link || item.maps_url || item.url || null;

  const embedUrl = mapsEmbedUrl(placeLat, placeLng, item.name, city);

  const accentColor = "#C8102E"; // unified WC red for all types

  return (
    <div style={{
      background: "white",
      borderRadius: 12,
      border: isSelected ? `2px solid ${accentColor}` : "1px solid #e5e5e5",
      borderTop: `3px solid ${accentColor}`,
      overflow: "hidden",
      boxShadow: isSelected
        ? `0 4px 20px ${accentColor}22`
        : "0 2px 8px rgba(0,0,0,0.06)",
      transition: "all 0.2s",
    }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontWeight: 700, color: "#1a1a1a", fontSize: 14, marginBottom: 4,
              fontFamily: "'Barlow Condensed', sans-serif",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>{item.name}</p>
            <p style={{
              fontSize: 11, color: "#999", marginBottom: 6,
              fontFamily: "'Barlow', Arial, sans-serif",
            }}>{item.address || item.vicinity || city}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {item.rating && (
                <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>
                  ★ {item.rating}
                  {item.reviews && <span style={{ color: "#bbb", fontWeight: 400 }}> ({item.reviews})</span>}
                </span>
              )}
              {item.open_now !== undefined && item.open_now !== null && (
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: item.open_now ? "#6DC135" : "#C8102E",
                  fontFamily: "'Barlow', Arial, sans-serif",
                }}>
                  {item.open_now ? "● Open" : "● Closed"}
                </span>
              )}
              {item.stars && (
                <span style={{ fontSize: 10, color: "#f59e0b" }}>
                  {"⭐".repeat(Math.min(item.stars, 5))}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {item.price_per_night_usd && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: accentColor, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {item.price_per_night_usd}
                </div>
                <div style={{ fontSize: 9, color: "#bbb" }}>/night</div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setShowMap(v => !v)}
            style={{
              flex: 1, padding: "7px 0",
              background: showMap ? accentColor : "white",
              color: showMap ? "white" : accentColor,
              border: `1.5px solid ${accentColor}`,
              borderRadius: 8, fontSize: 11, fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: 0.5,
            }}
          >
            {showMap ? "▲ Hide Map" : "🗺 View on Map"}
          </button>

          <button
            onClick={() => onSelect(item)}
            style={{
              flex: 1, padding: "7px 0",
              background: isSelected ? accentColor : "white",
              color: isSelected ? "white" : accentColor,
              border: `1.5px solid ${accentColor}`,
              borderRadius: 8, fontSize: 11, fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: 0.5,
            }}
          >
            {isSelected ? "✓ Selected" : "+ Select"}
          </button>

          {url && (
            <a
              href={url} target="_blank" rel="noreferrer"
              style={{
                padding: "7px 12px",
                background: "white", color: "#888",
                border: "1px solid #e5e5e5",
                borderRadius: 8, fontSize: 11,
                cursor: "pointer", textDecoration: "none",
                display: "flex", alignItems: "center",
                fontFamily: "'Barlow', Arial, sans-serif",
              }}
            >
              ↗
            </a>
          )}
        </div>
      </div>

      {/* Inline map — embedded directly, no popup */}
      {showMap && (
        <div style={{
          borderTop: "1px solid #f0f0f0",
          background: "#f8f8f8",
          padding: 0,
          overflow: "hidden",
          borderRadius: "0 0 12px 12px",
        }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="220"
            style={{ border: "none", display: "block" }}
            title={`Map for ${item.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}

export default function TravelData({ onBack, onNext }) {
  const { selectedMatches, hotels, restaurants, attractions, setHotels, setRestaurants, setAttractions } = useTripStore();
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("hotels");
  const [selections, setSelections] = useState({ hotels: [], restaurants: [], attractions: [] });
  const [mapView,    setMapView]    = useState(false);

  const primary  = selectedMatches[0];
  const city     = primary?.city || "New York";
  const lat      = primary?.lat  || 40.8135;
  const lng      = primary?.lng  || -74.0745;
  const checkIn  = primary?.date || "2026-06-15";
  const checkOut = new Date(new Date(checkIn).getTime() + 3 * 86400000).toISOString().split("T")[0];

  // City-wide overview map URL
  const cityMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(city)}&t=m&z=12&output=embed&iwloc=near`;

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
    } catch(e) {
      console.error(e);
      setHotels([]); setRestaurants([]); setAttractions([]);
    } finally { setLoading(false); }
  }

  function toggleSelection(type, item) {
    setSelections(prev => {
      const list = prev[type];
      const exists = list.some(i => i.name === item.name);
      return {
        ...prev,
        [type]: exists ? list.filter(i => i.name !== item.name) : [...list, item],
      };
    });
  }

  const tabs = [
    { id: "hotels",      label: "🏨 Hotels",      data: hotels,      color: "#C8102E" },
    { id: "restaurants", label: "🍽 Restaurants",  data: restaurants, color: "#C8102E" },
    { id: "attractions", label: "🗺 Attractions",  data: attractions, color: "#C8102E" },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 100 }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)",
        padding: "28px 24px",
        borderBottom: "3px solid #C8102E",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <button
            onClick={onBack}
            style={{
              background: "transparent", color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              padding: "5px 14px", fontSize: 12, cursor: "pointer",
              marginBottom: 16, fontFamily: "'Barlow', Arial, sans-serif",
              transition: "all 0.15s",
            }}
          >
            ← Back to Matches
          </button>

          <h2 style={{
            fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
            fontSize: 36, color: "white", letterSpacing: 3, marginBottom: 4,
          }}>
            Hotels, Restaurants & Attractions
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.45)", fontSize: 13,
            fontFamily: "'Barlow', Arial, sans-serif", marginBottom: 16,
          }}>
            Showing results for{" "}
            <span style={{ color: "#C8102E", fontWeight: 700 }}>
              {city.split("/")[0].trim()}
            </span>
            {" "}· {new Date(checkIn + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>

          {/* Match chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedMatches.map(m => (
              <span key={m.match_id} style={{
                fontSize: 11,
                background: "rgba(200,16,46,0.15)",
                border: "1px solid rgba(200,16,46,0.3)",
                color: "#f87171", padding: "4px 14px", borderRadius: 20,
                fontFamily: "'Barlow', Arial, sans-serif",
              }}>
                ⚽ {m.team_a} vs {m.team_b} · {m.city?.split("/")[0].trim()} · {new Date(m.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>

        {/* City overview map — always visible inline */}
        <div style={{
          background: "white",
          borderRadius: 12, overflow: "hidden",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          marginBottom: 24,
        }}>
          <div style={{
            padding: "12px 18px",
            background: "#0d0d0d",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 14, color: "white",
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              📍 {city.split("/")[0].trim()} — City Overview
            </span>
            <button
              onClick={() => setMapView(v => !v)}
              style={{
                background: mapView ? "#C8102E" : "rgba(255,255,255,0.1)",
                color: "white",
                border: "none", borderRadius: 8,
                padding: "4px 12px", fontSize: 11, cursor: "pointer",
                fontFamily: "'Barlow', Arial, sans-serif",
              }}
            >
              {mapView ? "Hide Map" : "Show Map"}
            </button>
          </div>
          {mapView && (
            <iframe
              src={cityMapUrl}
              width="100%"
              height="300"
              style={{ border: "none", display: "block" }}
              title="City Map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "9px 20px", borderRadius: 20,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: 0.5, transition: "all 0.15s",
                background: activeTab === t.id ? t.color : "white",
                color: activeTab === t.id ? "white" : "#666",
                border: activeTab === t.id ? "none" : "1.5px solid #e5e5e5",
                boxShadow: activeTab === t.id ? `0 4px 12px ${t.color}33` : "none",
              }}
            >
              {t.label}
              {t.data.length > 0 && (
                <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 11 }}>({t.data.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 160, borderRadius: 12 }} className="shimmer" />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {currentTab?.data.length === 0 ? (
              <div style={{
                gridColumn: "1 / -1", textAlign: "center",
                padding: "40px 20px", color: "#bbb",
                fontFamily: "'Barlow', Arial, sans-serif",
              }}>
                No {activeTab} found for this city. Start your backend to load live data.
              </div>
            ) : (
              currentTab?.data.map((item, i) => (
                <PlaceCard
                  key={i}
                  item={item}
                  type={activeTab}
                  city={city.split("/")[0].trim()}
                  lat={lat} lng={lng}
                  isSelected={selections[activeTab].some(s => s.name === item.name)}
                  onSelect={(item) => toggleSelection(activeTab, item)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom — shows selections and next button */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "white", borderTop: "3px solid #C8102E",
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
      }}>
        <div style={{ fontSize: 12, color: "#888", fontFamily: "'Barlow', Arial, sans-serif" }}>
          {Object.values(selections).flat().length > 0
            ? `${Object.values(selections).flat().length} places selected`
            : "Select hotels, restaurants & attractions"
          }
        </div>
        <button onClick={onNext} className="btn-primary" style={{ fontSize: 13 }}>
          Generate AI Itinerary →
        </button>
      </div>
    </div>
  );
}
