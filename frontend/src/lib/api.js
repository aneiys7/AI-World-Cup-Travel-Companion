import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Use localhost only if we are physically on a dev machine
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
  }
 
  return process.env.NEXT_PUBLIC_API_URL || "https://ai-world-cup-travel-companion-1.onrender.com";
};

const apiURL = getBaseURL();
console.log("Connect to Backend at:", apiURL); // Helps you debug in the browser console

const API = axios.create({
  baseURL: apiURL,
  timeout: 60000, 
});

// Response interceptor to help catch errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Details:", error.response || error.message);
    return Promise.reject(error);
  }
);

export const fetchMatches     = (p={}) => API.get("/matches/", { params: p }).then(r => r.data);
export const fetchCities      = ()     => API.get("/matches/cities/list").then(r => r.data.cities);
export const fetchTickets     = (m)    => API.get(`/tickets/${m.match_id}`, { params: { stadium: m.stadium, city: m.city, date: m.date } }).then(r => r.data);
export const fetchHotels      = (p)    => API.get("/hotels/search", { params: p }).then(r => r.data);
export const fetchRestaurants = (p)    => API.get("/places/restaurants", { params: p }).then(r => r.data);
export const fetchAttractions = (p)    => API.get("/places/attractions", { params: p }).then(r => r.data);
export const extractIntent    = (msg)  => API.post("/ai/extract-intent", { message: msg }).then(r => r.data);
export const generateItinerary = (body) => API.post("/ai/generate-itinerary", body).then(r => r.data);
export const sendChat         = (body) => API.post("/ai/chat", body).then(r => r.data);
export const exportPDF        = (body) => API.post("/pdf/export", body, { responseType: "blob" }).then(r => r.data);