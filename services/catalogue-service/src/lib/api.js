import axios from "axios";

const USER_SERVICE_BASE_URL = "http://user-service:8000";
const FILE_SERVICE_BASE_URL = "http://file-service:3002";
const SCHEDULER_BASE_URL = "http://scheduler:8001";
const RESULT_SERVICE_BASE_URL = "http://result-service:3003";

export const userService = axios.create({
  baseURL: USER_SERVICE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fileService = axios.create({
  baseURL: FILE_SERVICE_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const schedulerService = axios.create({
  baseURL: SCHEDULER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const resultService = axios.create({
  baseURL: RESULT_SERVICE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
