import axios from "axios";
import { USER_SERVICE_BASE_URL, CATALOG_SERVICE_BASE_URL } from "../../constants";
import { getItem, setItem, cleanAuthStorage } from "../auth";

const api = axios.create({
  baseURL: CATALOG_SERVICE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// requests interceptor to append authorization header
api.interceptors.request.use(
  config => {
    const token = getItem("token");
    if (token) {
      console.log("Request interceptor: ", config.headers.Authorization);
    }
    return config;
  },
  error => Promise.reject(error),
);

// response interceptor to refresh token on receiving 401 status
api.interceptors.response.use(
  response => {
    // modify the response data
    // console.log("Response interceptor: ", response.data);
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getItem("refresh");
        const response = await axios.post(USER_SERVICE_BASE_URL + "/auth/refresh-token/", {
          refresh: refreshToken,
        });
        const { token } = response.data;
        setItem("token", token);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (error) {
        // Handle refresh token error or redirect to login
        console.log("Refresh token error: ", error);
        cleanAuthStorage();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
