import { create } from "zustand";

export const useTripStore = create((set, get) => ({
  selectedMatches: [],
  ticketsByMatch:  {},
  hotels:          [],
  restaurants:     [],
  attractions:     [],
  itinerary:       null,
  chatHistory:     [],

  selectMatch:   (m)  => {
    const cur = get().selectedMatches;
    if (cur.find(x => x.match_id === m.match_id) || cur.length >= 5) return;
    set({ selectedMatches: [...cur, m] });
  },
  removeMatch:   (id) => set({ selectedMatches: get().selectedMatches.filter(m => m.match_id !== id) }),
  setTickets:    (id, d) => set({ ticketsByMatch: { ...get().ticketsByMatch, [id]: d } }),
  setHotels:     (h)  => set({ hotels: h }),
  setRestaurants:(r)  => set({ restaurants: r }),
  setAttractions:(a)  => set({ attractions: a }),
  setItinerary:  (i)  => set({ itinerary: i }),
  setChatHistory:(h)  => set({ chatHistory: h }),
  reset:         ()   => set({ selectedMatches: [], ticketsByMatch: {}, hotels: [], restaurants: [], attractions: [], itinerary: null, chatHistory: [] }),
}));
