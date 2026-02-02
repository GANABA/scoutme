import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Client API Axios configuré pour ScoutMe
 * - Base URL depuis les variables d'environnement
 * - Interceptors pour gestion des tokens JWT
 * - Gestion centralisée des erreurs
 */
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Pour les cookies (refresh token)
});

/**
 * Interceptor pour ajouter le token JWT aux requêtes
 */
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage ou autre
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor pour gérer les erreurs de réponse
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // TODO: Implémenter la logique de refresh token
        // const { data } = await axios.post(`${API_URL}/api/auth/refresh`);
        // localStorage.setItem("accessToken", data.accessToken);
        // return apiClient(originalRequest);
      } catch (refreshError) {
        // Rediriger vers login si refresh échoue
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
