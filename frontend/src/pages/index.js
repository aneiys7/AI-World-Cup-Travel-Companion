import { useState } from "react";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import MatchSelector from "../components/MatchSelector";
import TravelData    from "../components/TravelData";
import AIItinerary   from "../components/AIItinerary";
import ExportPDF     from "../components/ExportPDF";


const STEPS = [
  { id: 1, label: "Pick Matches"   },
  { id: 2, label: "Hotels & Places"},
  { id: 3, label: "AI Itinerary"   },
  { id: 4, label: "Export PDF"     },
];

export default function Home() {
  const [step, setStep] = useState(1);

  return (
    <>
      <Head>
        <title>AI World Cup 2026 Travel Companion</title>
        <meta name="description" content="Plan your FIFA World Cup 2026 trip with AI" />
      </Head>
      <Toaster position="bottom-center" toastOptions={{
        style: { background: "#1a2e1a", color: "#bbf7d0", border: "1px solid rgba(34,197,94,0.2)", fontSize: "13px" },
      }} />

      <div className="min-h-screen bg-[#0a0f0a]">
        {/* Nav */}
        <header className="border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚽</span>
              <div>
                <h1 className="text-sm font-semibold text-white leading-none">World Cup 2026</h1>
                <p className="text-xs text-white/40 mt-0.5">AI Travel Companion</p>
              </div>
            </div>
            <span className="text-xs text-white/30 font-mono">AI Bootcamp · Cohort 16</span>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-2 py-3 border-t border-white/5">
            {STEPS.map((s, i) => {
              const active   = s.id === step;
              const complete = s.id < step;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${active ? "bg-green-600 text-white" : complete ? "text-green-400" : "text-white/20"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs
                      ${active ? "bg-white text-green-600 font-bold" : complete ? "bg-green-800 text-green-300" : "border border-white/15 text-white/20"}`}>
                      {complete ? "✓" : s.id}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-px w-6 ${complete ? "bg-green-800" : "bg-white/10"}`} />}
                </div>
              );
            })}
          </div>
        </header>

        <main>
          {step === 1 && <MatchSelector onNext={() => setStep(2)} />}
          {step === 2 && <TravelData    onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <AIItinerary   onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && <ExportPDF     onBack={() => setStep(3)} onReset={() => setStep(1)} />}
        </main>
      </div>
    </>
  );
}
