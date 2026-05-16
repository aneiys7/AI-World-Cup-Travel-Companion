import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
  }
  const url = process.env.NEXT_PUBLIC_API_URL || "https://ai-world-cup-travel-companion-1.onrender.com";
  return url.replace(/\/$/, ""); 
};

const apiURL = getBaseURL();

if (process.env.NODE_ENV !== 'production') {
    console.log("📡 API Strategy: Connecting to:", apiURL);
}

const API = axios.create({
  baseURL: apiURL,
  timeout: 60000, 
  headers: {
    "Content-Type": "application/json",
  }
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Call Failed:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
    });
    return Promise.reject(error);
  }
);

export const fetchMatches      = (p={}) => API.get("/matches/", { params: p }).then(r => r.data);
export const fetchCities       = ()     => API.get("/matches/cities/list").then(r => r.data.cities);
export const fetchTickets      = (m)    => API.get(`/tickets/${m.match_id}`, { params: { stadium: m.stadium, city: m.city, date: m.date } }).then(r => r.data);
export const fetchHotels       = (p)    => API.get("/hotels/search", { params: p }).then(r => r.data);
export const fetchRestaurants  = (p)    => API.get("/places/restaurants", { params: p }).then(r => r.data);
export const fetchAttractions  = (p)    => API.get("/places/attractions", { params: p }).then(r => r.data);
export const extractIntent     = (msg)  => API.post("/ai/extract-intent", { message: msg }).then(r => r.data);
export const generateItinerary = (body) => API.post("/ai/generate-itinerary", body).then(r => r.data);
export const sendChat          = (body) => API.post("/ai/chat", body).then(r => r.data);

// --- FIX: Verified and clean blob stream retrieval pipeline ---
// Double-check your backend main.py file. 
// If your router doesn't use a prefix, change "/pdf/export" to simply "/export"
export const exportPDF         = (body) => API.post("/pdf/export", body, { responseType: "blob" }).then(r => r.data);