import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
let currentToken: string | null = null;

export const setAuthToken = (token?: string) => {
  currentToken = token ?? null;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const getAuthToken = () => currentToken;

export const getSessionIdFromToken = (): number | null => {
  if (!currentToken) return null;
  try {
    const payload = JSON.parse(atob(currentToken.split(".")[1]));
    return payload?.session_id ?? null;
  } catch (err) {
    console.error("Erro ao decodificar token", err);
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.response?.statusText || error?.message || "Erro ao chamar a API";
    const err = new Error(message) as Error & { status?: number };
    err.status = error?.response?.status;
    return Promise.reject(err);
  },
);

export const api = {
  get: <T>(url: string, config?: Parameters<typeof apiClient.get>[1]) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.post>[2]) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.put>[2]) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  patch: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.patch>[2]) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: Parameters<typeof apiClient.delete>[1]) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

//
export const productApi = {
  create: (data: unknown) => api.post("/products", data),
  get: (id: string) => api.get(`/products/${id}`),
  list: () => api.get("/products"),
  update: (id: string, data: unknown) => api.patch(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
};

export const authApi = {
  login: (phone_nmr: string) => api.post<{ access_token: string }>("/auth/login", { phone_nmr }),
};

export const userApi = {
  create: (data: unknown) => api.post("/users", data),
  get: (id: string) => api.get(`/users/${id}`),
  list: () => api.get("/users"),
  remove: (id: string) => api.delete(`/users/${id}`),
};

export const collectionApi = {
  create: (data: unknown) => api.post("/collections", data),
  get: (id: string) => api.get(`/collections/${id}`),
  list: () => api.get("/collections"),
  update: (id: string, data: unknown) => api.patch(`/collections/${id}`, data),
  remove: (id: string) => api.delete(`/collections/${id}`),
};

export const interactionApi = {
  create: (data: unknown) => api.post("/interactions", data),
  get: (userId: string | number, productId: string | number, sessionId: string | number) =>
    api.get(`/interactions/${userId}/${productId}/${sessionId}`),
  update: (userId: string | number, productId: string | number, sessionId: string | number, data: unknown) =>
    api.patch(`/interactions/${userId}/${productId}/${sessionId}`, data),
};

export const recommendationApi = {
  list: (productId?: string | number) =>
    api.get("/recommendations", {
      params: productId ? { product_id: productId } : undefined,
    }),
};
