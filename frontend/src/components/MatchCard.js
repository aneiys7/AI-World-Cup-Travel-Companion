import { useState } from "react";
import { fetchTickets } from "../lib/api";
import { useTripStore } from "../store/tripStore";
import toast from "react-hot-toast";

const FLAG_MAP = {
  USA:     "🇺🇸",
  Mexico:  "🇲🇽",
  Canada:  "🇨🇦",
  Brazil:  "🇧🇷",
  Argentina: "🇦🇷",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France:  "🇫🇷",
  Germany: "🇩🇪",
  Spain:   "🇪🇸",
  Portugal:"🇵🇹",
  TBD:     "🏳️",
};

const COUNTRY_FLAG = { USA: "🇺🇸", Mexico: "🇲🇽", Canada: "🇨🇦" };

function teamFlag(name) {
  return FLAG_MAP[name] || "🏳️";
}

export default function MatchCard({ match }) {
  const [tickets, setTickets]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { selectedMatches, selectMatch, removeMatch, setTickets: storeTickets } = useTripStore();
  const isSelected = selectedMatches.some((m) => m.match_id === match.match_id);

  const stageColor = {
    Final:     "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    Semifinal: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  };
  const stageBadge =
    stageColor[match.stage] ||
    "bg-green-900/40 text-green-400 border-green-700/40";

  async function handleViewTickets() {
    if (tickets) { setExpanded(!expanded); return; }
    setLoading(true);
    try {
      const data = await fetchTickets(match);
      setTickets(data);
      storeTickets(match.match_id, data);
      setExpanded(true);
    } catch {
      toast.error("Could not load ticket info");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect() {
    if (isSelected) {
      removeMatch(match.match_id);
      toast("Match removed from your trip", { icon: "🗑️" });
    } else {
      if (selectedMatches.length >= 5) {
        toast.error("You can only select up to 5 matches");
        return;
      }
      selectMatch(match);
      toast.success("Match added to your trip!");
    }
  }

  const lowestPrice = tickets?.tickets?.[0]?.price_ranges?.[0]?.min;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 card-hover overflow-hidden
        ${isSelected
          ? "border-green-500 bg-green-950/60 glow-green"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
        }`}
    >
      {/* Top section */}
      <div className="p-4">
        {/* Stage + Date row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${stageBadge}`}>
            {match.stage}
          </span>
          <span className="text-xs text-white/50">
            {new Date(match.date + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric",
            })} · {match.time}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">{teamFlag(match.team_a)}</div>
            <div className="text-sm font-semibold text-white">{match.team_a}</div>
          </div>
          <div className="text-white/30 font-bold text-lg px-3">VS</div>
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">{teamFlag(match.team_b)}</div>
            <div className="text-sm font-semibold text-white">{match.team_b}</div>
          </div>
        </div>

        {/* Venue info */}
        <div className="text-xs text-white/50 space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <span>🏟️</span>
            <span>{match.stadium}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{COUNTRY_FLAG[match.country] || "📍"}</span>
            <span>{match.city}, {match.country}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>👥</span>
            <span>{match.capacity.toLocaleString()} capacity</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSelect}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${isSelected
                ? "bg-green-600 text-white hover:bg-red-600"
                : "bg-green-900/50 text-green-400 border border-green-700/50 hover:bg-green-800/60"
              }`}
          >
            {isSelected ? "✓ Added — Remove" : "+ Add to Trip"}
          </button>

          <button
            onClick={handleViewTickets}
            disabled={loading}
            className="py-2 px-3 rounded-lg text-sm font-medium border border-white/10 text-white/60 hover:bg-white/10 transition-all"
          >
            {loading ? "..." : expanded ? "Hide" : lowestPrice ? `From $${lowestPrice}` : "Tickets"}
          </button>
        </div>
      </div>

      {/* Expanded ticket info */}
      {expanded && tickets && (
        <div className="border-t border-white/10 bg-black/30 p-4">
          {tickets.source === "mock_demo" && (
            <p className="text-xs text-yellow-400/70 mb-3 flex items-center gap-1">
              ⚠️ Demo data — add TICKETMASTER_API_KEY for live prices
            </p>
          )}
          <div className="space-y-2">
            {tickets.tickets?.[0]?.price_ranges?.map((tier, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-white/50 capitalize">{tier.type}</span>
                <span className="text-sm font-medium text-white">
                  ${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} {tier.currency}
                </span>
              </div>
            ))}
          </div>
          <a
            href={tickets.tickets?.[0]?.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-xs text-green-400 hover:text-green-300 underline"
          >
            View on Ticketmaster →
          </a>
        </div>
      )}
    </div>
  );
}
