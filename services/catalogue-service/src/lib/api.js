import axios from "axios";

const USER_SERVICE_BASE_URL = "http://user-service:8000";

export const userService = axios.create({
  baseURL: USER_SERVICE_BASE_URL,
  timeout: 1000,
});
