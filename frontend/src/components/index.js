// pages/index.js — FIFA World Cup 2026 — Improved header with search + clean step bar
// Drop into: frontend/src/pages/index.js

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import MatchSelector from "../components/MatchSelector";
import TravelData    from "../components/TravelData";
import AIItinerary   from "../components/AIItinerary";
import ExportPDF     from "../components/ExportPDF";
import SplashScreen  from "../components/SplashScreen";
import WCLogo        from "../components/WCLogo";
import { useTripStore } from "../store/tripStore";

const STEPS = [
  { id: 1, icon: "⚽", label: "Select Matches"  },
  { id: 2, icon: "🏨", label: "Hotels & Places" },
  { id: 3, icon: "🤖", label: "AI Itinerary"    },
  { id: 4, icon: "📄", label: "Export PDF"      },
];

export default function Home() {
  const [step,        setStep]    = useState(1);
  const [splashDone,  setSplash]  = useState(false);
  const [search,      setSearch]  = useState("");
  const { selectedMatches, reset } = useTripStore();

  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplash(true)} />;
  }

  // Pass search down to MatchSelector
  const handleSearch = (val) => setSearch(val);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f2f2f2; }
        .step-pill { transition: all 0.2s; }
        .step-pill:hover { opacity: 0.85; }
        .search-wrap input:focus { border-color: #C8102E !important; outline: none; }
        .search-wrap input::placeholder { color: #aaa; }
        .host-pill { transition: background 0.15s; }
        .host-pill:hover { background: rgba(255,255,255,0.13) !important; }
        @keyframes fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .page-fade { animation: fadein 0.3s ease; }
      `}</style>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#1a1a1a",
            border: "1px solid #e5e5e5",
            fontSize: 13,
            fontFamily: "'Barlow', Arial, sans-serif",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
          success: { iconTheme: { primary: "#6DC135", secondary: "#fff" } },
        }}
      />

      <div style={{ minHeight: "100vh", background: "#f2f2f2" }}>

        {/* ── HEADER ── */}
        <header style={{
          background: "#0d0d0d",
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}>
          {/* Red-green top stripe */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #C8102E 50%, #6DC135 50%)" }} />

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px" }}>

            {/* Top row: Logo | Search | Host nations */}
            <div style={{
              display: "flex", alignItems: "center",
              gap: 16, padding: "10px 0 8px",
              flexWrap: "wrap",
            }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <WCLogo size={46} />
                <div>
                  <div style={{
                    fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                    fontSize: 18, color: "#fff", letterSpacing: 3, lineHeight: 1,
                  }}>
                    FIFA World Cup 2026™
                  </div>
                  <div style={{
                    fontSize: 8, color: "rgba(255,255,255,0.3)",
                    letterSpacing: 4, textTransform: "uppercase",
                    marginTop: 2, fontFamily: "'Barlow', Arial, sans-serif",
                  }}>
                    AI Travel Companion
                  </div>
                </div>
              </div>

              {/* Search bar — only show on step 1 */}
              {step === 1 && (
                <div className="search-wrap" style={{ flex: 1, minWidth: 200, maxWidth: 420 }}>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      fontSize: 15, pointerEvents: "none",
                    }}>🔍</span>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search teams, cities, venues..."
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.08)",
                        border: "1.5px solid rgba(255,255,255,0.12)",
                        borderRadius: 24, padding: "8px 14px 8px 36px",
                        fontSize: 13, color: "#fff",
                        fontFamily: "'Barlow', Arial, sans-serif",
                        transition: "border-color 0.2s",
                      }}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        style={{
                          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
                          width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", color: "#fff", fontSize: 10,
                        }}
                      >✕</button>
                    )}
                  </div>
                </div>
              )}
              {step !== 1 && <div style={{ flex: 1 }} />}

              {/* Host nations + badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {["🇺🇸 USA", "🇨🇦 Canada", "🇲🇽 Mexico"].map(c => (
                  <span key={c} className="host-pill" style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 20,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "'Barlow', Arial, sans-serif",
                    cursor: "default",
                  }}>{c}</span>
                ))}
                <div style={{
                  borderLeft: "1px solid rgba(255,255,255,0.1)",
                  paddingLeft: 10, marginLeft: 2,
                }}>
                  <div style={{
                    fontSize: 8, color: "#C8102E",
                    textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>AI Bootcamp</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "Arial, sans-serif" }}>
                    Cohort 16
                  </div>
                </div>
              </div>
            </div>

            {/* Step progress bar */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 0,
              paddingBottom: 10, paddingTop: 2,
            }}>
              {STEPS.map((s, i) => {
                const active   = s.id === step;
                const complete = s.id < step;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                    <div
                      className="step-pill"
                      onClick={() => complete && setStep(s.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 14px", borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        cursor: complete ? "pointer" : "default",
                        background: active
                          ? "#C8102E"
                          : complete
                          ? "transparent"
                          : "transparent",
                        color: active
                          ? "#fff"
                          : complete
                          ? "#6DC135"
                          : "rgba(255,255,255,0.22)",
                        border: active
                          ? "none"
                          : complete
                          ? "1.5px solid #6DC135"
                          : "1.5px solid rgba(255,255,255,0.1)",
                        fontFamily: "'Barlow Condensed', Arial, sans-serif",
                        letterSpacing: 0.3,
                      }}
                    >
                      <span style={{
                        width: 17, height: 17, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, fontWeight: 900, flexShrink: 0,
                        background: active
                          ? "rgba(255,255,255,0.2)"
                          : complete
                          ? "#6DC135"
                          : "rgba(255,255,255,0.07)",
                        color: "#fff",
                      }}>
                        {complete ? "✓" : s.id}
                      </span>
                      <span style={{ fontSize: 12 }}>{s.icon}</span>
                      <span>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        height: 1, width: 20,
                        background: complete
                          ? "#6DC135"
                          : "rgba(255,255,255,0.07)",
                        transition: "background 0.3s",
                      }} />
                    )}
                  </div>
                );
              })}

              {/* Match counter chip */}
              {selectedMatches?.length > 0 && (
                <div style={{
                  marginLeft: 16,
                  background: "rgba(109,193,53,0.15)",
                  border: "1px solid rgba(109,193,53,0.4)",
                  borderRadius: 20, padding: "3px 12px",
                  fontSize: 11, color: "#6DC135",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, letterSpacing: 0.5,
                }}>
                  ⚽ {selectedMatches.length} selected
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="page-fade">
          {step === 1 && (
            <MatchSelector
              onNext={() => setStep(2)}
              externalSearch={search}
              onSearchChange={setSearch}
            />
          )}
          {step === 2 && <TravelData    onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <AIItinerary   onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && <ExportPDF     onBack={() => setStep(3)} onReset={() => { reset(); setStep(1); }} />}
        </main>

        {/* FOOTER */}
        <footer style={{
          background: "#0d0d0d",
          borderTop: "2px solid #C8102E",
          padding: "14px 24px",
          textAlign: "center",
          marginTop: 48,
        }}>
          <p style={{
            fontSize: 10, color: "rgba(255,255,255,0.18)",
            letterSpacing: 3, textTransform: "uppercase",
            fontFamily: "'Barlow', Arial, sans-serif",
          }}>
            FIFA World Cup 2026 AI Travel Companion · Python · FastAPI · React · Llama 3 · SerpAPI
          </p>
        </footer>
      </div>
    </>
  );
}
