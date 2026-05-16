// MatchCard.js — White card, WC 2026 professional theme
// Drop into: frontend/src/components/MatchCard.js

import { useState } from "react";
import { fetchTickets } from "../lib/api";
import { useTripStore } from "../store/tripStore";
import toast from "react-hot-toast";

const HOST_FLAG = { USA: "🇺🇸", Mexico: "🇲🇽", Canada: "🇨🇦" };

const KO_BADGE = {
  "Final":         { bg: "#7c3aed", color: "#fff" },
  "Semi Final":    { bg: "#b45309", color: "#fff" },
  "Third Place":   { bg: "#c2410c", color: "#fff" },
  "Quarter Final": { bg: "#1d4ed8", color: "#fff" },
  "Round of 16":   { bg: "#0f766e", color: "#fff" },
  "Round of 32":   { bg: "#374151", color: "#fff" },
};

const GROUP_COLORS = {
  "Group A": "#C8102E", "Group B": "#C8102E", "Group C": "#C8102E",
  "Group D": "#C8102E", "Group E": "#C8102E", "Group F": "#C8102E",
  "Group G": "#C8102E", "Group H": "#C8102E", "Group I": "#C8102E",
  "Group J": "#C8102E", "Group K": "#C8102E", "Group L": "#C8102E",
};

export default function MatchCard({ match }) {
  const [tickets,  setTickets]  = useState(null);
  const [tLoading, setTLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { selectedMatches, selectMatch, removeMatch, setTickets: storeTickets } = useTripStore();
  const isSelected = selectedMatches.some(m => m.match_id === match.match_id);
  const koBadge    = KO_BADGE[match.stage];

  async function handleTickets() {
    if (tickets) { setExpanded(e => !e); return; }
    setTLoading(true);
    try {
      const data = await fetchTickets(match);
      setTickets(data);
      storeTickets(match.match_id, data);
      setExpanded(true);
    } catch { toast.error("Could not load ticket info"); }
    finally { setTLoading(false); }
  }

  function handleSelect() {
    if (isSelected) {
      removeMatch(match.match_id);
      toast("Removed from trip", { icon: "🗑️" });
    } else {
      selectMatch(match);
      toast.success("Added to your trip!");
    }
  }

  const fmt = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div style={{
      background: "white",
      border: isSelected ? "2px solid #C8102E" : "1px solid #e5e5e5",
      borderTop: `3px solid ${isSelected ? "#C8102E" : "#C8102E"}`,
      borderRadius: 10,
      overflow: "hidden",
      transition: "all 0.2s",
      boxShadow: isSelected
        ? "0 0 0 1px #C8102E22, 0 6px 20px rgba(200,16,46,0.15)"
        : "0 2px 8px rgba(0,0,0,0.07)",
      transform: isSelected ? "translateY(-2px)" : "none",
    }}>
      <div style={{ padding: "12px 14px" }}>

        {/* Stage + Date row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {koBadge ? (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
              background: koBadge.bg, color: koBadge.color,
              textTransform: "uppercase", letterSpacing: 1,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>{match.stage}</span>
          ) : (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
              background: "#fff0f2", color: "#C8102E",
              border: "1px solid #fca5a5",
              textTransform: "uppercase", letterSpacing: 1,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>{match.stage}</span>
          )}
          <span style={{ fontSize: 9, color: "#999", fontFamily: "'Barlow', Arial, sans-serif" }}>
            {fmt(match.date)} · {match.time}
          </span>
        </div>

        {/* Teams */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>{match.flag_a || "🏳️"}</div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#1a1a1a",
              marginTop: 5, lineHeight: 1.2,
              fontFamily: "'Barlow Condensed', sans-serif",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>{match.team_a}</div>
          </div>
          <div style={{
            padding: "5px 10px",
            background: "#f5f5f5", borderRadius: 6,
            border: "1px solid #e5e5e5",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 900, color: "#999",
              letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif",
            }}>VS</span>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>{match.flag_b || "🏳️"}</div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#1a1a1a",
              marginTop: 5, lineHeight: 1.2,
              fontFamily: "'Barlow Condensed', sans-serif",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>{match.team_b}</div>
          </div>
        </div>

        {/* Venue */}
        <div style={{
          background: "#f8f8f8", borderRadius: 8,
          padding: "7px 10px", marginBottom: 10,
          border: "1px solid #efefef",
        }}>
          <div style={{ fontSize: 9, color: "#888", marginBottom: 2, fontFamily: "'Barlow', Arial, sans-serif" }}>
            🏟️ {match.stadium}
          </div>
          <div style={{ fontSize: 9, color: "#aaa", fontFamily: "'Barlow', Arial, sans-serif" }}>
            {HOST_FLAG[match.country] || "📍"} {match.city} · {match.country}
            {match.capacity && ` · ${match.capacity.toLocaleString()} cap`}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={handleSelect} style={{
            flex: 1, padding: "8px 0", borderRadius: 8,
            fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
            background: isSelected ? "#C8102E" : "white",
            color: isSelected ? "#fff" : "#C8102E",
            border: isSelected ? "none" : "1.5px solid #C8102E",
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: 0.5,
          }}>
            {isSelected ? "✓ Added — Remove" : "+ Add to Trip"}
          </button>
          <button onClick={handleTickets} disabled={tLoading} style={{
            padding: "8px 12px", borderRadius: 8, fontSize: 12,
            cursor: "pointer", transition: "all 0.15s",
            background: "white", color: "#C8102E",
            border: "1.5px solid #C8102E",
          }}>
            {tLoading ? "…" : expanded ? "▲" : "🎟"}
          </button>
        </div>
      </div>

      {/* Tickets panel */}
      {expanded && tickets && (
        <div style={{
          borderTop: "1px solid #e5e5e5",
          background: "#fafafa", padding: "10px 14px",
        }}>
          {tickets.source === "mock_demo" && (
            <p style={{ fontSize: 9, color: "#C8102E", marginBottom: 6, opacity: 0.7, fontFamily: "'Barlow', Arial, sans-serif" }}>
              ⚠️ Estimated prices — add TICKETMASTER_API_KEY for live data
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {tickets.tickets?.[0]?.price_ranges?.map((tier, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: "#888", fontFamily: "'Barlow', Arial, sans-serif" }}>{tier.type}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#C8102E", fontFamily: "'Barlow Condensed', sans-serif" }}>
                  ${tier.min.toLocaleString()} – ${tier.max.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <a href={tickets.tickets?.[0]?.url || "https://www.ticketmaster.com"}
            target="_blank" rel="noreferrer"
            style={{
              display: "block", textAlign: "center",
              marginTop: 8, fontSize: 9, color: "#C8102E",
              textDecoration: "underline", fontFamily: "'Barlow', Arial, sans-serif",
            }}>
            View on Ticketmaster →
          </a>
        </div>
      )}
    </div>
  );
}
