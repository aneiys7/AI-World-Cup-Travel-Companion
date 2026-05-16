import { create } from "zustand";

export const useTripStore = create((set, get) => ({
  selectedMatches: [],
  ticketsByMatch: {},
  hotels: [],
  restaurants: [],
  attractions: [],

  itinerary: null,
  structuredItinerary: null,
  chatHistory: [],

  isChatProcessing: false,

  selectMatch: (m) => {
    const cur = get().selectedMatches;

    if (cur.find((x) => x.match_id === m.match_id)) {
      return;
    }

    set({
      selectedMatches: [...cur, m],
    });
  },

  removeMatch: (id) =>
    set({
      selectedMatches: get().selectedMatches.filter(
        (m) => m.match_id !== id
      ),
    }),

  setTickets: (id, d) =>
    set({
      ticketsByMatch: {
        ...get().ticketsByMatch,
        [id]: d,
      },
    }),

  setHotels: (h) => set({ hotels: h }),
  setRestaurants: (r) => set({ restaurants: r }),
  setAttractions: (a) => set({ attractions: a }),

  setItinerary: (i) => set({ itinerary: i }),

  setStructuredItinerary: (s) =>
    set({
      structuredItinerary: s,
    }),

  setChatHistory: (h) => set({ chatHistory: h }),

  setIsChatProcessing: (v) =>
    set({
      isChatProcessing: v,
    }),

  appendChatMessage: (msg) =>
    set({
      chatHistory: [...get().chatHistory, msg],
    }),

  reset: () =>
    set({
      selectedMatches: [],
      ticketsByMatch: {},
      hotels: [],
      restaurants: [],
      attractions: [],
      itinerary: null,
      structuredItinerary: null,
      chatHistory: [],
      isChatProcessing: false,
    }),
}));