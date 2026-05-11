import { useState } from "react";
import { useTripStore } from "../store/tripStore";
import { exportPDF } from "../lib/api";

export default function ExportPDF({ onBack, onReset }) {
  const { selectedMatches, itinerary, reset } = useTripStore();
  const [name,        setName]        = useState("");
  const [downloading, setDownloading] = useState(false);
  const [done,        setDone]        = useState(false);

  async function download() {
    setDownloading(true);
    try {
      const blob = await exportPDF({ itinerary: itinerary || "No itinerary generated.", user_name: name || "World Cup Fan", matches: selectedMatches });
      const url  = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const a    = document.createElement("a");
      a.href = url; a.download = "WorldCup2026_Itinerary.pdf"; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch(e) { console.error(e); }
    finally { setDownloading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <button onClick={onBack} className="text-white/40 hover:text-white text-sm mb-8 flex items-center gap-1">← Back to itinerary</button>
      <p className="text-5xl mb-4">📄</p>
      <h2 className="text-2xl font-bold text-white mb-2">Export Your Itinerary</h2>
      <p className="text-white/50 text-sm mb-8">Download your complete World Cup 2026 travel plan as a PDF.</p>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500 mb-4 transition-colors" />
      <button onClick={download} disabled={downloading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {downloading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating PDF...</> : "⬇ Download PDF Itinerary"}
      </button>
      {done && (
        <>
          <p className="text-green-400 text-sm mt-4">✅ Downloaded successfully!</p>
          <button onClick={() => { reset(); onReset(); }} className="mt-4 text-sm text-white/30 hover:text-white transition-colors">
            Plan another trip →
          </button>
        </>
      )}
    </div>
  );
}
