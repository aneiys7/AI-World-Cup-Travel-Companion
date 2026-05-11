import { useTripStore } from "../store/tripStore";

export default function TripSummary({ onBack, onNext }) {
  const { selectedMatches, ticketsByMatch } = useTripStore();

  const cities = [...new Set(selectedMatches.map((m) => m.city))];
  const dateRange = selectedMatches.length > 0
    ? {
        start: selectedMatches.reduce((a, b) => a.date < b.date ? a : b).date,
        end:   selectedMatches.reduce((a, b) => a.date > b.date ? a : b).date,
      }
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back to matches
      </button>

      <h2 className="text-2xl font-bold text-white mb-2">Your Match Selection</h2>
      <p className="text-white/50 text-sm mb-6">
        Review your picks before we search flights, hotels, and activities.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Matches", value: selectedMatches.length },
          { label: "Cities",  value: cities.length },
          { label: "Days",    value: dateRange ? Math.max(1, Math.round((new Date(dateRange.end) - new Date(dateRange.start)) / 86400000) + 1) : 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{value}</div>
            <div className="text-xs text-white/50 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-3 mb-8">
        {selectedMatches.map((match, i) => {
          const ticketData = ticketsByMatch[match.match_id];
          const lowestPrice = ticketData?.tickets?.[0]?.price_ranges?.[0]?.min;

          return (
            <div
              key={match.match_id}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="text-white/30 text-sm font-mono w-6 text-center">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">
                  {match.team_a} vs {match.team_b}
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  {match.city} · {match.stadium} ·{" "}
                  {new Date(match.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short", day: "numeric",
                  })}
                </div>
              </div>
              {lowestPrice && (
                <div className="text-xs text-green-400 shrink-0">
                  from ${lowestPrice.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cities covered */}
      <div className="mb-8">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Cities covered</p>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <span key={city} className="text-sm bg-green-900/30 border border-green-700/30 text-green-300 px-3 py-1 rounded-full">
              {city}
            </span>
          ))}
        </div>
      </div>

      {/* Continue */}
      <button
        onClick={onNext}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6
                   rounded-xl text-sm transition-all flex items-center justify-center gap-2"
      >
        Search Flights, Hotels & Activities →
      </button>
      <p className="text-xs text-white/30 text-center mt-3">
        Next: Day 2 — Amadeus + Google Places APIs
      </p>
    </div>
  );
}
