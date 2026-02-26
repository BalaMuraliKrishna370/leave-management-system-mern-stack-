import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile")
};


export const leaveAPI = {
  applyLeave: (data) => api.post("/leave/apply", data),
  myLeaves: (page = 1, status = "") =>
    api.get(`/leave/myLeaves?page=${page}&status=${status}`),
  getBalance: () => api.get("/leave/balance"),
  getAllLeaves: (page = 1, status = "", keyword = "") =>
    api.get(`/leave/all?page=${page}&status=${status}&keyword=${keyword}`),
  updateStatus: (id, data) => api.put(`/leave/status/${id}`, data),
  getAnalytics: () => api.get("/leave/analytics")
};

export default api;
