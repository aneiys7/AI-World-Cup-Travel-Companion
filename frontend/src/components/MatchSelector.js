import { useState, useEffect } from "react";
import { fetchMatches } from "../lib/api";
import MatchCard from "./MatchCard";
import { useTripStore } from "../store/tripStore";
import toast from "react-hot-toast";

const STAGES = ["All", "Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H", "Semifinal", "Final"];
const COUNTRIES = ["All", "USA", "Mexico", "Canada"];

export default function MatchSelector({ onNext }) {
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [searchTeam, setSearchTeam]       = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const { selectedMatches } = useTripStore();

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMatches();
      setMatches(data.matches);
    } catch (err) {
      setError("Could not connect to backend. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering on top of server data
  const filtered = matches.filter((m) => {
    const teamMatch =
      !searchTeam ||
      m.team_a.toLowerCase().includes(searchTeam.toLowerCase()) ||
      m.team_b.toLowerCase().includes(searchTeam.toLowerCase()) ||
      m.city.toLowerCase().includes(searchTeam.toLowerCase()) ||
      m.stadium.toLowerCase().includes(searchTeam.toLowerCase());

    const stageMatch = selectedStage === "All" || m.stage === selectedStage;
    const countryMatch = selectedCountry === "All" || m.country === selectedCountry;

    return teamMatch && stageMatch && countryMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          ⚽ Select Your Matches
        </h1>
        <p className="text-white/50 text-sm">
          Pick up to 5 matches you want to attend. We'll build your complete trip around them.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search box */}
        <input
          type="text"
          placeholder="Search team, city, or stadium..."
          value={searchTeam}
          onChange={(e) => setSearchTeam(e.target.value)}
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-4 py-2
                     text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500
                     transition-colors"
        />

        {/* Stage filter */}
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                     focus:outline-none focus:border-green-500 cursor-pointer"
        >
          {STAGES.map((s) => (
            <option key={s} value={s} className="bg-gray-900">{s}</option>
          ))}
        </select>

        {/* Country filter */}
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                     focus:outline-none focus:border-green-500 cursor-pointer"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c} className="bg-gray-900">{c}</option>
          ))}
        </select>

        <button
          onClick={loadMatches}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60
                     hover:bg-white/10 transition-all"
          title="Refresh matches"
        >
          ↻
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/40">
          {loading ? "Loading..." : `${filtered.length} matches`}
        </p>
        {selectedMatches.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-400">
              {selectedMatches.length}/5 selected
            </span>
            <div className="flex gap-1">
              {selectedMatches.map((m) => (
                <span key={m.match_id} className="text-xs bg-green-900/40 border border-green-700/40
                  text-green-300 px-2 py-0.5 rounded-full">
                  {m.city.split("/")[0].trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 mb-6 text-sm text-red-300">
          <p className="font-medium mb-1">⚠️ Backend not reachable</p>
          <p className="text-red-400/70">{error}</p>
          <p className="text-red-400/70 mt-2 font-mono text-xs">
            Run: <code>cd backend && uvicorn main:app --reload</code>
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Match grid */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <p className="text-4xl mb-3">🔍</p>
              <p>No matches found. Try clearing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((match) => (
                <MatchCard key={match.match_id} match={match} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Continue button */}
      {selectedMatches.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={onNext}
            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3
                       rounded-full shadow-lg shadow-green-900/50 text-sm transition-all
                       flex items-center gap-2"
          >
            Continue with {selectedMatches.length} match{selectedMatches.length > 1 ? "es" : ""}
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
