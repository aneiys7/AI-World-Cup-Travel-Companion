// MatchSelector.js — WC 2026 professional theme
// White cards, dark headers like schedule image, click team → fixtures inline
// Sticky bottom bar always visible above fold
// Drop into: frontend/src/components/MatchSelector.js

import { useState, useEffect, useMemo } from "react";
import { fetchMatches } from "../lib/api";
import MatchCard from "./MatchCard";
import { useTripStore } from "../store/tripStore";
import toast from "react-hot-toast";

// All 48 WC 2026 teams with flags — for the team-click feature
const TEAM_DATA = {
  "Mexico": "🇲🇽", "South Africa": "🇿🇦", "Korea Republic": "🇰🇷",
  "Canada": "🇨🇦", "Qatar": "🇶🇦", "Switzerland": "🇨🇭",
  "Brazil": "🇧🇷", "Morocco": "🇲🇦", "Haiti": "🇭🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺",
  "Germany": "🇩🇪", "Curaçao": "🇨🇼", "Côte d'Ivoire": "🇨🇮", "Ecuador": "🇪🇨",
  "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Tunisia": "🇹🇳",
  "Belgium": "🇧🇪", "Egypt": "🇪🇬", "IR Iran": "🇮🇷", "New Zealand": "🇳🇿",
  "Spain": "🇪🇸", "Cabo Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾",
  "France": "🇫🇷", "Senegal": "🇸🇳", "Norway": "🇳🇴",
  "Argentina": "🇦🇷", "Algeria": "🇩🇿", "Austria": "🇦🇹", "Jordan": "🇯🇴",
  "Portugal": "🇵🇹", "Uzbekistan": "🇺🇿", "Colombia": "🇨🇴",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷", "Ghana": "🇬🇭", "Panama": "🇵🇦",
};

const ALL_STAGES = [
  "All Stages",
  "Group A","Group B","Group C","Group D","Group E","Group F",
  "Group G","Group H","Group I","Group J","Group K","Group L",
  "Round of 32","Round of 16","Quarter Final","Semi Final","Third Place","Final",
];
const COUNTRIES = ["All Countries","USA","Mexico","Canada"];

// WC 2026 official colors for group headers — matches the schedule screenshot exactly
const GROUP_BG = {
  A: "#0d0d0d", B: "#0d0d0d", C: "#0d0d0d", D: "#0d0d0d",
  E: "#0d0d0d", F: "#0d0d0d", G: "#0d0d0d", H: "#0d0d0d",
  I: "#0d0d0d", J: "#0d0d0d", K: "#0d0d0d", L: "#0d0d0d",
};

function StageHeader({ stageName }) {
  const letter = stageName.match(/^Group ([A-L])$/)?.[1];
  return (
    <div style={{
      background: "#0d0d0d",
      color: "#fff",
      borderRadius: "10px 10px 0 0",
      padding: "10px 18px",
      fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
      fontWeight: 900, fontSize: 15, letterSpacing: 1,
      textTransform: "uppercase",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      {letter && (
        <span style={{
          background: "#C8102E", color: "#fff",
          borderRadius: 6, width: 28, height: 28,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, flexShrink: 0,
        }}>{letter}</span>
      )}
      {stageName}
    </div>
  );
}

export default function MatchSelector({ onNext, externalSearch = "" }) {
  const [matches, setMatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState(externalSearch);
  const [stage, setStage]         = useState("All Stages");
  const [country, setCountry]     = useState("All Countries");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [view, setView]           = useState("grid");

  useEffect(() => { setSearch(externalSearch); }, [externalSearch]);

  const { selectedMatches, removeMatch } = useTripStore();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const data = await fetchMatches();
      setMatches(data.matches || []);
    } catch {
      setError("Backend not reachable. Run: cd backend && uvicorn main:app --reload");
    } finally { setLoading(false); }
  }

  // Team fixtures — click a team name anywhere to filter to their games
  const teamFixtures = useMemo(() => {
    if (!selectedTeam) return null;
    return matches.filter(m =>
      m.team_a === selectedTeam || m.team_b === selectedTeam
    );
  }, [matches, selectedTeam]);

  const filtered = useMemo(() => matches.filter(m => {
    const q = search.toLowerCase();
    const textMatch = !q ||
      m.team_a.toLowerCase().includes(q) ||
      m.team_b.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.stadium.toLowerCase().includes(q) ||
      m.stage.toLowerCase().includes(q);
    const stageMatch   = stage   === "All Stages"    || m.stage   === stage;
    const countryMatch = country === "All Countries" || m.country === country;
    return textMatch && stageMatch && countryMatch;
  }), [matches, search, stage, country]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(m => { (g[m.stage] = g[m.stage] || []).push(m); });
    return g;
  }, [filtered]);

  const stageOrder = ALL_STAGES.filter(s => s !== "All Stages");

  const inputStyle = {
    background: "white",
    border: "1.5px solid #e5e5e5",
    borderRadius: 8,
    padding: "9px 14px",
    color: "#1a1a1a",
    fontSize: 13,
    outline: "none",
    fontFamily: "'Barlow', Arial, sans-serif",
    cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>

      {/* ── Hero banner — WC 2026 official red ── */}
      <div style={{
        background: "linear-gradient(135deg, #C8102E 0%, #8B0000 100%)",
        padding: "32px 24px 28px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle diagonal stripes in background */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute", left: `${i * 20}%`, top: 0, bottom: 0,
              width: "8%", background: "#fff", transform: "skewX(-12deg)",
            }} />
          ))}
        </div>

        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative" }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
            fontSize: 40, color: "#fff", letterSpacing: 4,
            marginBottom: 6,
          }}>
            SELECT YOUR MATCHES
          </h1>
          <div style={{
            display: "inline-flex", alignItems: "center",
            background: "#C8102E", color: "#fff",
            borderRadius: 20, padding: "4px 18px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 12,
            textTransform: "uppercase", letterSpacing: 2,
            marginBottom: 20,
          }}>
            Group Stage & Knockout Rounds · 104 Matches
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Total Matches", val: matches.length || 104 },
              { label: "Host Cities",   val: 16 },
              { label: "Teams",         val: 48 },
              { label: "Selected",      val: selectedMatches.length },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 10, padding: "10px 20px",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                minWidth: 80,
              }}>
                <div style={{
                  fontSize: 28, fontWeight: 900, color: "#fff",
                  fontFamily: "'Bebas Neue', sans-serif",
                  lineHeight: 1,
                }}>{s.val}</div>
                <div style={{
                  fontSize: 9, color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase", letterSpacing: 1,
                  fontFamily: "'Barlow', Arial, sans-serif",
                  marginTop: 2,
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 120px" }}>

        {/* ── Team quick-select — click a team to see their fixtures inline ── */}
        {matches.length > 0 && (
          <div style={{
            background: "white",
            borderRadius: 12, border: "1px solid #e5e5e5",
            padding: "16px 18px", marginBottom: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 11,
              textTransform: "uppercase", letterSpacing: 2,
              color: "#888", marginBottom: 12,
            }}>
              {selectedTeam
                ? `Showing fixtures for ${TEAM_DATA[selectedTeam] || ""} ${selectedTeam} — `
                : "Click a team to see their fixtures:"
              }
              {selectedTeam && (
                <button
                  onClick={() => setSelectedTeam(null)}
                  style={{
                    background: "#C8102E", color: "white", border: "none",
                    borderRadius: 12, padding: "2px 10px", cursor: "pointer",
                    fontSize: 10, fontFamily: "'Barlow', sans-serif",
                    marginLeft: 8,
                  }}
                >
                  Clear ✕
                </button>
              )}
            </div>

            {/* Team fixtures panel — shown inline below team list */}
            {selectedTeam && teamFixtures && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  background: "#f8f8f8", borderRadius: 10,
                  border: "1.5px solid #C8102E",
                  padding: 16,
                }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900, fontSize: 16, color: "#C8102E",
                    marginBottom: 14, letterSpacing: 1,
                    textTransform: "uppercase",
                  }}>
                    {TEAM_DATA[selectedTeam]} {selectedTeam} · All Fixtures ({teamFixtures.length})
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 12,
                  }}>
                    {teamFixtures.map(m => <MatchCard key={m.match_id} match={m} />)}
                  </div>
                </div>
              </div>
            )}

            {/* Team grid */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 7,
            }}>
              {[...new Set(matches.flatMap(m => [m.team_a, m.team_b]))].sort().map(team => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(selectedTeam === team ? null : team)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 20,
                    border: selectedTeam === team ? "2px solid #C8102E" : "1.5px solid #e5e5e5",
                    background: selectedTeam === team ? "#fff0f2" : "white",
                    color: selectedTeam === team ? "#C8102E" : "#444",
                    fontFamily: "'Barlow', Arial, sans-serif",
                    fontWeight: selectedTeam === team ? 700 : 400,
                    fontSize: 12, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{TEAM_DATA[team] || "🏳️"}</span>
                  <span>{team}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 24,
          flexWrap: "wrap", alignItems: "center",
          background: "white", border: "1px solid #e5e5e5",
          borderRadius: 12, padding: "12px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search team, city, stadium…"
              style={{ ...inputStyle, width: "100%", paddingLeft: 34 }}
            />
          </div>
          <select value={stage} onChange={e => setStage(e.target.value)} style={inputStyle}>
            {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={country} onChange={e => setCountry(e.target.value)} style={inputStyle}>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Grid / List toggle */}
          <div style={{ display: "flex", gap: 3, background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 8, padding: 3 }}>
            {[{ id: "grid", icon: "▦" }, { id: "list", icon: "≡" }].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                padding: "5px 10px", borderRadius: 6, fontSize: 14,
                cursor: "pointer", border: "none",
                background: view === v.id ? "#C8102E" : "transparent",
                color: view === v.id ? "#fff" : "#999",
                transition: "all 0.15s",
              }}>{v.icon}</button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap", fontFamily: "'Barlow', Arial, sans-serif" }}>
            {loading ? "Loading…" : `${filtered.length} matches`}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fca5a5",
            borderRadius: 10, padding: 14, marginBottom: 20,
            fontSize: 12, color: "#c00", fontFamily: "'Barlow', Arial, sans-serif",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ height: 200, borderRadius: 12 }} className="shimmer" />
            ))}
          </div>
        )}

        {/* Matches by stage */}
        {!loading && !error && !selectedTeam && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <p style={{ fontFamily: "'Barlow', Arial, sans-serif" }}>No matches found. Try clearing filters.</p>
              </div>
            ) : (
              stageOrder.map(stageName => {
                const stageMatches = grouped[stageName];
                if (!stageMatches?.length) return null;
                return (
                  <div key={stageName} style={{
                    marginBottom: 28,
                    background: "white",
                    borderRadius: 12, overflow: "hidden",
                    border: "1px solid #e5e5e5",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  }}>
                    {/* Group header — dark like schedule image */}
                    <div style={{
                      background: "#0d0d0d",
                      padding: "11px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
                        fontWeight: 900, fontSize: 15, letterSpacing: 1,
                        textTransform: "uppercase", color: "#fff",
                      }}>
                        {stageName.startsWith("Group") && (
                          <span style={{
                            background: "#C8102E", color: "#fff",
                            borderRadius: 6, width: 28, height: 28,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontSize: 15, fontWeight: 900,
                          }}>
                            {stageName.replace("Group ", "")}
                          </span>
                        )}
                        {stageName}
                      </div>
                      <span style={{
                        fontSize: 10, color: "rgba(255,255,255,0.4)",
                        fontFamily: "'Barlow', Arial, sans-serif",
                      }}>{stageMatches.length} matches</span>
                    </div>

                    {/* Cards */}
                    <div style={{
                      padding: 16,
                      display: view === "grid" ? "grid" : "flex",
                      flexDirection: view === "list" ? "column" : undefined,
                      gridTemplateColumns: view === "grid" ? "repeat(auto-fill,minmax(270px,1fr))" : undefined,
                      gap: 12,
                    }}>
                      {stageMatches.map(m => <MatchCard key={m.match_id} match={m} />)}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* ── Sticky bottom bar — always fixed, never hidden under content ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "white",
        borderTop: "3px solid #C8102E",
        padding: "10px 24px",
        display: "flex", alignItems: "center",
        justifyContent: selectedMatches.length > 0 ? "space-between" : "center",
        gap: 16,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        minHeight: 60,
      }}>
        {selectedMatches.length === 0 ? (
          <span style={{
            fontSize: 12, color: "#aaa",
            fontFamily: "'Barlow', Arial, sans-serif",
          }}>
            Select at least one match to continue
          </span>
        ) : (
          <>
            <div style={{
              display: "flex", gap: 8, flexWrap: "wrap",
              flex: 1, overflow: "hidden", maxHeight: 40,
            }}>
              {selectedMatches.map(m => (
                <div key={m.match_id} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#f8f8f8", border: "1px solid #e5e5e5",
                  borderRadius: 20, padding: "4px 10px",
                  fontSize: 11, color: "#444",
                  whiteSpace: "nowrap", fontFamily: "'Barlow', Arial, sans-serif",
                }}>
                  <span>{m.flag_a} {m.team_a} vs {m.team_b} {m.flag_b}</span>
                  <span style={{ color: "#ccc" }}>·</span>
                  <span style={{ color: "#999" }}>{m.city?.split("/")[0].trim()}</span>
                  <button onClick={() => removeMatch(m.match_id)} style={{
                    background: "none", border: "none", color: "#bbb",
                    cursor: "pointer", fontSize: 12, padding: 0, marginLeft: 2,
                  }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <span style={{
                fontSize: 13, color: "#C8102E", fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                whiteSpace: "nowrap",
              }}>
                {selectedMatches.length} match{selectedMatches.length !== 1 ? "es" : ""} selected
              </span>
              <button onClick={onNext} className="btn-primary" style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                Plan My Trip →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
