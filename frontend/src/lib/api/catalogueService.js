import axios from "axios";
import { CATALOG_SERVICE_BASE_URL } from "../../constants";
import { getItem } from "../auth";
import { tokenExpiredErrorHandler } from "./userService";

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
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      return tokenExpiredErrorHandler(error);
    }
    // If the error is not related to token expiration, reject the promise
    return Promise.reject(error);
  },
);

export default api;
