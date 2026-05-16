// ExportPDF.js — FIFA World Cup 2026 — Unified Red Theme
// Sends chatHistory to backend so PDF includes the AI chat conversation
// Drop into: frontend/src/components/ExportPDF.js

import { useState } from "react";
import { useTripStore } from "../store/tripStore";
import { exportPDF } from "../lib/api";

export default function ExportPDF({ onBack, onReset }) {
  const { selectedMatches, itinerary, chatHistory, reset } = useTripStore();
  const [name,        setName]        = useState("");
  const [downloading, setDownloading] = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState("");

  // Build chat transcript — only assistant messages (refined tips, suggestions)
  // Filter out the generic opener
  const chatTranscript = chatHistory
    .filter(m => !(m.role === "assistant" && m.content.startsWith("Your itinerary is ready")))
    .map(m => `${m.role === "user" ? "You" : "AI Assistant"}: ${m.content}`)
    .join("\n\n");

  async function download() {
    setDownloading(true);
    setError("");
    try {
      const blob = await exportPDF({
        itinerary:       itinerary || "No itinerary generated.",
        user_name:       name || "World Cup Fan",
        matches:         selectedMatches,
        chat_transcript: chatTranscript || null,  // included if chat happened
      });
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const a   = document.createElement("a");
      a.href = url;
      a.download = `WorldCup2026_Itinerary${name ? "_" + name.replace(/\s+/g,"_") : ""}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch(e) {
      setError("PDF export failed. Make sure the backend is running.");
    } finally {
      setDownloading(false);
    }
  }

  const chatCount = chatHistory.filter(m => m.role === "user").length;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .pdf-input:focus { border-color:#C8102E !important; outline:none; }
        .pdf-input::placeholder { color:#bbb; }
        .pdf-dl:hover:not(:disabled) { background:#a00d23 !important; }
        .pdf-dl:disabled { background:#e0e0e0 !important; color:#aaa !important; cursor:not-allowed !important; }
        .pdf-back:hover  { color:#C8102E !important; }
        .pdf-reset:hover { color:#C8102E !important; border-color:#C8102E !important; }
      `}</style>

      <div style={{ maxWidth:620, margin:"0 auto", padding:"48px 20px 80px", textAlign:"center" }}>

        <button
          className="pdf-back"
          onClick={onBack}
          style={{ background:"none", border:"none", cursor:"pointer", color:"#999", fontSize:13, display:"flex", alignItems:"center", gap:4, marginBottom:36, fontFamily:"'Barlow',Arial,sans-serif", transition:"color 0.15s" }}
        >← Back to Itinerary</button>

        <span style={{ fontSize:60, display:"block", marginBottom:16 }}>📄</span>

        <div style={{ fontFamily:"'Bebas Neue','Arial Black',sans-serif", fontSize:30, letterSpacing:2, color:"#0d0d0d", marginBottom:8 }}>
          Export Your Itinerary
        </div>
        <p style={{ fontSize:14, color:"#888", fontFamily:"'Barlow',Arial,sans-serif", marginBottom:32, lineHeight:1.6 }}>
          Download your complete World Cup 2026 travel plan as a PDF.
          {selectedMatches?.length > 0 && ` Includes ${selectedMatches.length} match${selectedMatches.length !== 1 ? "es" : ""}.`}
        </p>

        <div style={{ background:"#fff", border:"1px solid #e5e5e5", borderRadius:14, padding:28, boxShadow:"0 1px 6px rgba(0,0,0,0.06)", textAlign:"left" }}>

          {/* What's included */}
          <div style={{ marginBottom:22 }}>
            <span style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Barlow Condensed',sans-serif", color:"#C8102E", marginBottom:12 }}>
              What's included
            </span>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:"✅", text:"AI-generated full itinerary", always: true },
                { icon:"⚽", text:`${selectedMatches?.length || 0} selected match${selectedMatches?.length !== 1 ? "es" : ""}`, always: true },
                { icon:"💬", text:`AI chat refinements (${chatCount} message${chatCount !== 1 ? "s" : ""})`, always: chatCount > 0 },
              ].filter(i => i.always).map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, fontFamily:"'Barlow',Arial,sans-serif", color:"#444" }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
              {chatCount > 0 && (
                <div style={{ fontSize:11, color:"#aaa", fontFamily:"'Barlow',Arial,sans-serif", marginTop:2, paddingLeft:22 }}>
                  Your chat conversation with the AI will appear as a "Refinements" section in the PDF.
                </div>
              )}
            </div>
          </div>

          {/* Match pills */}
          {selectedMatches?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {selectedMatches.slice(0, 5).map((m, i) => (
                  <span key={i} style={{
                    fontSize:11, padding:"4px 12px", borderRadius:20,
                    background:"#fff9f9", border:"1px solid rgba(200,16,46,0.2)",
                    color:"#C8102E", fontFamily:"'Barlow',Arial,sans-serif",
                  }}>
                    ⚽ {m.team_a || m.home_team} vs {m.team_b || m.away_team}
                  </span>
                ))}
                {selectedMatches.length > 5 && (
                  <span style={{ fontSize:11, padding:"4px 12px", borderRadius:20, background:"#f5f5f5", border:"1px solid #e5e5e5", color:"#888", fontFamily:"'Barlow',Arial,sans-serif" }}>
                    +{selectedMatches.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Name input */}
          <span style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Barlow Condensed',sans-serif", color:"#C8102E", marginBottom:8 }}>
            Your Name (optional)
          </span>
          <input
            className="pdf-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ahmed Khan"
            style={{
              width:"100%", border:"1.5px solid #e5e5e5", borderRadius:8,
              padding:"11px 14px", fontSize:14, color:"#1a1a1a",
              fontFamily:"'Barlow',Arial,sans-serif", background:"#fafafa",
              marginBottom:16, transition:"border-color 0.2s",
            }}
          />

          {error && (
            <div style={{ background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#b91c1c", marginBottom:14, fontFamily:"'Barlow',Arial,sans-serif" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="pdf-dl"
            onClick={download}
            disabled={downloading}
            style={{
              width:"100%", background:"#C8102E", color:"#fff", border:"none",
              borderRadius:10, padding:"13px 20px", fontSize:13, fontWeight:700,
              cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif",
              letterSpacing:1, textTransform:"uppercase",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"background 0.15s",
            }}
          >
            {downloading
              ? <><span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} /> Generating PDF…</>
              : "⬇ Download PDF Itinerary"}
          </button>

          {done && (
            <div style={{ background:"#f9fef5", border:"1px solid #c3e6a0", borderRadius:10, padding:"18px", marginTop:18, textAlign:"center" }}>
              <div style={{ color:"#3a7d0f", fontWeight:700, fontSize:14, fontFamily:"'Barlow',Arial,sans-serif", marginBottom:12 }}>
                ✅ Downloaded successfully!
              </div>
              <button
                className="pdf-reset"
                onClick={() => { reset(); onReset(); }}
                style={{ background:"none", border:"1px solid #ddd", borderRadius:8, padding:"8px 20px", fontSize:12, color:"#777", cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1, textTransform:"uppercase", transition:"all 0.15s" }}
              >
                ↺ Plan Another Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}