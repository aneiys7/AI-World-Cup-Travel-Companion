// SplashScreen.js — Microsoft Office-style opening animation with real WC 2026 logo
// Drop into: frontend/src/components/SplashScreen.js

import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("enter"); // enter → show → bar → out
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("show"),  500);
    const t2 = setTimeout(() => setPhase("bar"),  1100);
    const t3 = setTimeout(() => setPhase("out"),  2600);
    const t4 = setTimeout(() => onComplete?.(),   3100);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "bar") return;
    let v = 0;
    const id = setInterval(() => {
      v += 3;
      setProgress(Math.min(v, 100));
      if (v >= 100) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [phase]);

  const isOut = phase === "out";
  const isEnter = phase === "enter";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #1a0505 0%, #0d0d0d 50%, #0a1a05 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: isOut ? 0 : 1,
      transition: "opacity 0.5s ease",
      pointerEvents: isOut ? "none" : "all",
      overflow: "hidden",
    }}>

      {/* Background decorative stripes — WC 2026 style */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", opacity: 0.04,
      }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${i * 14 - 5}%`, top: 0, bottom: 0,
            width: "6%",
            background: i % 2 === 0 ? "#C8102E" : "#6DC135",
            transform: "skewX(-8deg)",
          }} />
        ))}
      </div>

      {/* Radial glow */}
      <div style={{
        position: "absolute",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo — springs in */}
      <div style={{
        transform: isEnter ? "scale(0.5) translateY(30px)" : "scale(1) translateY(0)",
        opacity: isEnter ? 0 : 1,
        transition: "transform 0.6s cubic-bezier(0.34,1.4,0.64,1), opacity 0.45s ease",
        marginBottom: 28,
        position: "relative",
      }}>
        <img
          src="/wc_logo.png"
          alt="FIFA World Cup 2026"
          style={{
            width: 180, height: 180,
            objectFit: "contain",
            filter: "drop-shadow(0 8px 32px rgba(200,16,46,0.4)) drop-shadow(0 0 60px rgba(109,193,53,0.2))",
          }}
        />
      </div>

      {/* Text */}
      <div style={{
        opacity: isEnter ? 0 : 1,
        transform: isEnter ? "translateY(12px)" : "translateY(0)",
        transition: "opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s",
        textAlign: "center", marginBottom: 40,
      }}>
        <div style={{
          fontSize: 26,
          fontFamily: "'Arial Black', Impact, sans-serif",
          fontWeight: 900,
          color: "#fff",
          letterSpacing: 2,
          textTransform: "uppercase",
          lineHeight: 1,
          marginBottom: 6,
        }}>
          FIFA World Cup 2026™
        </div>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.4)",
          letterSpacing: 6, textTransform: "uppercase",
          fontFamily: "Arial, sans-serif",
        }}>
          AI Travel Companion
        </div>
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", marginTop: 14,
        }}>
          {["🇺🇸 USA", "🇨🇦 Canada", "🇲🇽 Mexico"].map(c => (
            <span key={c} style={{
              fontSize: 10, color: "rgba(255,255,255,0.3)",
              fontFamily: "Arial, sans-serif",
            }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 220, height: 2,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 2, overflow: "hidden",
        opacity: phase === "bar" || phase === "out" ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: "#C8102E",
          borderRadius: 2,
          transition: "width 0.05s linear",
        }} />
      </div>

      <div style={{
        marginTop: 10, fontSize: 9, color: "rgba(255,255,255,0.2)",
        letterSpacing: 3, textTransform: "uppercase",
        fontFamily: "Arial, sans-serif",
        opacity: phase === "bar" || phase === "out" ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        Loading…
      </div>
    </div>
  );
}
