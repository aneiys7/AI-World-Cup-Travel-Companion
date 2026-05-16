// AIItinerary.js — FIFA World Cup 2026 — Unified Red Theme
// ONE color: #C8102E for all buttons and interactions
// Drop into: frontend/src/components/AIItinerary.js

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTripStore } from "../store/tripStore";
import { generateItinerary, sendChat } from "../lib/api";

/* ── Markdown renderers — light background, dark text ── */
const mdComponents = {
  h1: ({node,...p}) => <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:1, color:"#0d0d0d", margin:"20px 0 6px" }} {...p} />,
  h2: ({node,...p}) => <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:"#C8102E", margin:"16px 0 4px", borderBottom:"1px solid #f0f0f0", paddingBottom:4 }} {...p} />,
  h3: ({node,...p}) => <h3 style={{ fontWeight:700, fontSize:14, color:"#1a1a1a", margin:"12px 0 4px" }} {...p} />,
  strong: ({node,...p}) => <strong style={{ color:"#0d0d0d", fontWeight:700 }} {...p} />,
  p:   ({node,...p}) => <p   style={{ marginBottom:9, color:"#444", lineHeight:1.7 }} {...p} />,
  ul: ({node,...p}) => <ul style={{ paddingLeft:18, marginBottom:9, color:"#555" }} {...p} />,
  ol: ({node,...p}) => <ol style={{ paddingLeft:18, marginBottom:9, color:"#555" }} {...p} />,
  li: ({node,...p}) => <li style={{ marginBottom:3 }} {...p} />,
  hr: ({node,...p}) => <hr style={{ border:"none", borderTop:"1px solid #f0f0f0", margin:"14px 0" }} {...p} />,
};

const chatMd = {
  p:      ({node,...p}) => <p      style={{ marginBottom:3, lineHeight:1.55 }} {...p} />,
  strong: ({node,...p}) => <strong style={{ fontWeight:700 }} {...p} />,
  ul:      ({node,...p}) => <ul     style={{ paddingLeft:16, margin:"3px 0" }} {...p} />,
  li:      ({node,...p}) => <li     style={{ marginBottom:2 }} {...p} />,
};

export default function AIItinerary({ onBack, onNext }) {
  const {
    selectedMatches, hotels, restaurants, attractions,
    itinerary, setItinerary,
    chatHistory, setChatHistory,
  } = useTripStore();

  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [chatInput,   setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  async function generate() {
    if (!input.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await generateItinerary({
        user_message: input,
        matches: selectedMatches,
        hotels, restaurants, attractions,
      });
      setItinerary(res.itinerary);
      setChatHistory([{
        role: "assistant",
        content: "Your itinerary is ready! Ask me anything — change hotels, add restaurants, adjust the schedule, or ask for city tips.",
      }]);
    } catch(e) {
      setError("Could not generate itinerary. Make sure backend is running and GROQ_API_KEY is set in .env");
    } finally {
      setLoading(false);
    }
  }

  async function chat() {
    if (!chatInput.trim()) return;
    
    const msg = chatInput;
    setChatInput("");
    setChatLoading(true);
    
    // Instantly show the user's message in the chat screen
    const updatedWithUser = [...chatHistory, { role: "user", content: msg }];
    setChatHistory(updatedWithUser);
    
    try {
      // Send the current chat history along with the new message
      const res = await sendChat({ history: chatHistory, message: msg });
      
      // Append the clean, standalone string response to the chat window
      setChatHistory([...updatedWithUser, { role: "assistant", content: res.reply }]);
    } catch {
      setChatHistory([...updatedWithUser, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes bounce3 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        .ai-ta:focus     { border-color: #C8102E !important; }
        .ai-cinput:focus { border-color: #C8102E !important; }
        .ai-gen:hover:not(:disabled) { background:#a00d23 !important; }
        .ai-gen:disabled { background:#e0e0e0 !important; color:#aaa !important; cursor:not-allowed !important; }
        .ai-send:hover:not(:disabled) { background:#a00d23 !important; }
        .ai-next:hover { background:#a00d23 !important; }
        .ai-regen:hover { color:#C8102E !important; border-color:#C8102E !important; }
      `}</style>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 20px 80px" }}>

        <button
          onClick={onBack}
          style={{ background:"none", border:"none", cursor:"pointer", color:"#999", fontSize:13, display:"flex", alignItems:"center", gap:4, marginBottom:28, fontFamily:"'Barlow',Arial,sans-serif" }}
        >← Back</button>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontFamily:"'Bebas Neue','Arial Black',sans-serif", fontSize:30, color:"#0d0d0d", letterSpacing:2, marginBottom:4 }}>
            🤖 AI Itinerary Generator
          </div>
          <div style={{ fontSize:14, color:"#888", fontFamily:"'Barlow',Arial,sans-serif" }}>
            Describe your trip and AI builds your personalised World Cup 2026 travel plan.
          </div>
        </div>

        {/* Trip summary tip */}
        {(selectedMatches?.length > 0 || hotels?.length > 0) && (
          <div style={{
            background:"#fff9f9", border:"1px solid rgba(200,16,46,0.2)",
            borderRadius:10, padding:"10px 14px", fontSize:12,
            color:"#C8102E", fontFamily:"'Barlow',Arial,sans-serif", marginBottom:20,
          }}>
            ✅ <strong>{selectedMatches?.length || 0} match{selectedMatches?.length !== 1 ? "es" : ""}</strong>
            {hotels?.length > 0 && <> · <strong>{hotels.length} hotel{hotels.length !== 1 ? "s" : ""}</strong></>}
            {restaurants?.length > 0 && <> · <strong>{restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""}</strong></>}
            {" "}— all included in your itinerary.
          </div>
        )}

        {/* ── INPUT STATE ── */}
        {!itinerary && (
          <div style={{ background:"#fff", border:"1px solid #e5e5e5", borderRadius:14, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <span style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Barlow Condensed',sans-serif", color:"#C8102E", marginBottom:12 }}>
              Tell AI About Your Trip
            </span>
            <textarea
              className="ai-ta"
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={5}
              placeholder="e.g. Flying from London with my friend, budget $3000 each, love local food, want to explore the city between matches, prefer mid-range hotels near stadiums…"
              style={{
                width:"100%", border:"1.5px solid #e5e5e5", borderRadius:10,
                padding:"12px 14px", fontSize:14, color:"#1a1a1a",
                fontFamily:"'Barlow',Arial,sans-serif", resize:"none",
                outline:"none", background:"#fafafa", lineHeight:1.6,
                transition:"border-color 0.2s",
              }}
            />
            {error && (
              <div style={{ background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#b91c1c", marginTop:10, fontFamily:"'Barlow',Arial,sans-serif" }}>
                ⚠️ {error}
              </div>
            )}
            <button
              className="ai-gen"
              onClick={generate}
              disabled={loading || !input.trim()}
              style={{
                width:"100%", background:"#C8102E", color:"#fff", border:"none",
                borderRadius:10, padding:"13px 20px", fontSize:13, fontWeight:700,
                cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif",
                letterSpacing:1, textTransform:"uppercase", marginTop:14,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"background 0.15s",
              }}
            >
              {loading
                ? <><span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} /> Generating…</>
                : "✨ Generate My Itinerary"}
            </button>
          </div>
        )}

        {/* ── RESULT STATE ── */}
        {itinerary && (
          <>
            {/* Itinerary card */}
            <div style={{ background:"#fff", border:"1px solid #e5e5e5", borderRadius:14, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.06)", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Barlow Condensed',sans-serif", color:"#C8102E" }}>
                  Your AI Itinerary
                </span>
                <button
                  className="ai-regen"
                  onClick={() => { setItinerary(null); setChatHistory([]); setError(""); }}
                  style={{ background:"none", border:"1px solid #ddd", borderRadius:6, padding:"4px 12px", fontSize:11, color:"#999", cursor:"pointer", fontFamily:"'Barlow',sans-serif", transition:"all 0.15s" }}
                >
                  ↺ Regenerate
                </button>
              </div>
              <div style={{ fontFamily:"'Barlow',Arial,sans-serif", fontSize:14, lineHeight:1.7, color:"#1a1a1a" }}>
                <ReactMarkdown components="{mdComponents}">{itinerary}</ReactMarkdown>
              </div>
            </div>

            {/* Chat refinement card */}
            <div style={{ background:"#fff", border:"1px solid #e5e5e5", borderRadius:14, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.06)", marginBottom:18 }}>
              <span style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Barlow Condensed',sans-serif", color:"#C8102E", marginBottom:14 }}>
                Refine with AI Chat
              </span>
              <p style={{ fontSize:11, color:"#aaa", fontFamily:"'Barlow',Arial,sans-serif", marginBottom:12 }}>
                Your chat conversation will be included in the exported PDF.
              </p>

              <div style={{ maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:14, paddingRight:4 }}>
                {chatHistory.map((m, i) => (
                  <div key={i} style={{ display:"flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth:"78%", padding:"10px 14px", fontSize:13,
                      fontFamily:"'Barlow',Arial,sans-serif", lineHeight:1.55,
                      borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: m.role === "user" ? "#C8102E" : "#f4f4f4",
                      color: m.role === "user" ? "#fff" : "#1a1a1a",
                    }}>
                      {m.role === "user"
                        ? m.content
                        : <ReactMarkdown components="{chatMd}">{m.content}</ReactMarkdown>}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display:"flex", justifyContent:"flex-start" }}>
                    <div style={{ background:"#f4f4f4", borderRadius:"12px 12px 12px 2px", padding:"12px 16px", display:"flex", gap:4, alignItems:"center" }}>
                      {[0,150,300].map(d => (
                        <span key={d} style={{
                          width:6, height:6, borderRadius:"50%", background:"#bbb",
                          display:"inline-block", animation:"bounce3 1.2s ease infinite",
                          animationDelay:`${d}ms`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <input
                  className="ai-cinput"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && chat()}
                  placeholder="e.g. Suggest cheaper hotels, add a day trip to Teotihuacan…"
                  style={{
                    flex:1, border:"1.5px solid #e5e5e5", borderRadius:8,
                    padding:"10px 14px", fontSize:13, color:"#1a1a1a",
                    fontFamily:"'Barlow',Arial,sans-serif", outline:"none",
                    background:"#fafafa", transition:"border-color 0.2s",
                  }}
                />
                <button
                  className="ai-send"
                  onClick={chat}
                  disabled={chatLoading || !chatInput.trim()}
                  style={{
                    background:"#C8102E", color:"#fff", border:"none", borderRadius:8,
                    padding:"10px 20px", fontSize:13, fontWeight:700,
                    cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif",
                    letterSpacing:0.5, transition:"background 0.15s",
                  }}
                >
                  Send
                </button>
              </div>
            </div>

            <button
              className="ai-next"
              onClick={onNext}
              style={{
                width:"100%", background:"#C8102E", color:"#fff", border:"none",
                borderRadius:10, padding:"14px 20px", fontSize:13, fontWeight:700,
                cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif",
                letterSpacing:1, textTransform:"uppercase",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"background 0.15s",
              }}
            >
              ⬇ Export PDF Itinerary →
            </button>
          </>
        )}
      </div>
    </>
  );
}