import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (payload) => api.post("/api/auth/register", payload);
export const login = (payload) => api.post("/api/auth/login", payload);
export const fetchAuthSuccess = () => api.get("/api/auth/success");

export const fetchAllItems = () => api.get("/api/items");
export const fetchItemsByCategory = (category) =>
  api.get(`/api/items?category=${encodeURIComponent(category)}`);
export const adminAddItem = (payload) => api.post("/api/admin/items", payload);
export const adminDeleteItem = (id) => api.delete(`/api/admin/items/${id}`);

export const placeOrder = (payload) => api.post("/api/orders", payload);
export const fetchOrders = () => api.get("/api/orders");
export const fetchOrderById = (orderId) => api.get(`/api/orders/${orderId}`);
export const fetchOrderSuccess = () => api.get("/api/orders/success");

export default api;