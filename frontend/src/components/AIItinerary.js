import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTripStore } from "../store/tripStore";
import { generateItinerary, sendChat } from "../lib/api";

const mdComponents = {
  h1: ({node, ...props}) => <h1 className="text-green-400 text-lg font-bold mb-2 mt-4" {...props} />,
  h2: ({node, ...props}) => <h2 className="text-green-400 text-base font-bold mb-1 mt-4 border-b border-green-900/40 pb-1" {...props} />,
  h3: ({node, ...props}) => <h3 className="text-white font-semibold text-sm mt-3 mb-1" {...props} />,
  strong: ({node, ...props}) => <strong className="text-green-300 font-semibold" {...props} />,
  p: ({node, ...props}) => <p className="mb-2 text-white/80 leading-relaxed" {...props} />,
  ul: ({node, ...props}) => <ul className="ml-4 list-disc text-white/70 mb-2" {...props} />,
  ol: ({node, ...props}) => <ol className="ml-4 list-decimal text-white/70 mb-2" {...props} />,
  li: ({node, ...props}) => <li className="mb-1" {...props} />,
};

const chatMdComponents = {
  p: ({node, ...props}) => <p className="mb-1 leading-relaxed" {...props} />,
  strong: ({node, ...props}) => <strong className="text-green-300 font-semibold" {...props} />,
  ul: ({node, ...props}) => <ul className="ml-3 list-disc mt-1 space-y-0.5" {...props} />,
  ol: ({node, ...props}) => <ol className="ml-3 list-decimal mt-1 space-y-0.5" {...props} />,
  li: ({node, ...props}) => <li className="text-white/80" {...props} />,
  h3: ({node, ...props}) => <h3 className="text-green-400 font-semibold mt-2 mb-1" {...props} />,
};

export default function AIItinerary({ onBack, onNext }) {
  const { selectedMatches, hotels, restaurants, attractions, itinerary, setItinerary, chatHistory, setChatHistory } = useTripStore();
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [chatInput,   setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  async function generate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await generateItinerary({
        user_message: input,
        matches:      selectedMatches,
        hotels,
        restaurants,
        attractions,
      });
      setItinerary(res.itinerary);
      setChatHistory([{ role: "assistant", content: "Your itinerary is ready! Ask me to refine anything — change hotels, add restaurants, adjust schedule, or ask for city tips." }]);
    } catch(e) {
      console.error(e);
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
    const updated = [...chatHistory, { role: "user", content: msg }];
    setChatHistory(updated);
    try {
      const res = await sendChat({ history: updated, message: msg });
      setChatHistory(res.history);
    } catch(e) {
      setChatHistory([...updated, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setChatLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-1">← Back</button>
      <h2 className="text-2xl font-bold text-white mb-1">🤖 AI Itinerary Generator</h2>
      <p className="text-white/50 text-sm mb-6">Describe your trip and AI builds your personalised World Cup travel plan.</p>

      {!itinerary && (
        <div className="mb-6">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={4}
            placeholder="e.g. Flying from London with my friend, budget $3000 each, we love local food and want to explore the city between matches..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500 resize-none transition-colors"
          />

          {error && (
            <div className="mt-3 bg-red-900/30 border border-red-500/40 rounded-xl p-3 text-sm text-red-300">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="mt-3 w-full bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              : "✨ Generate My Itinerary"}
          </button>
        </div>
      )}

      {itinerary && (
        <div className="mb-6 space-y-4">

          {/* Itinerary */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-400 font-medium uppercase tracking-wider">Your AI Itinerary</span>
              <button
                onClick={() => { setItinerary(null); setChatHistory([]); setError(""); }}
                className="text-xs text-white/30 hover:text-white transition-colors">
                Regenerate
              </button>
            </div>
            <div className="text-sm leading-relaxed">
              <ReactMarkdown components={mdComponents}>{itinerary}</ReactMarkdown>
            </div>
          </div>

          {/* Chatbot */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Refine with AI Chat</p>

            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
              {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    m.role === "user"
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-white/10 text-white/80 rounded-bl-sm"
                  }`}>
                    {m.role === "user"
                      ? m.content
                      : <ReactMarkdown components={chatMdComponents}>{m.content}</ReactMarkdown>
                    }
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-xl rounded-bl-sm flex gap-1 items-center">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && chat()}
                placeholder="e.g. Suggest cheaper hotels, add more restaurants..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                onClick={chat}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                Send
              </button>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            Download PDF Itinerary →
          </button>
        </div>
      )}
    </div>
  );
}