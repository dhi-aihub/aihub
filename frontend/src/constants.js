export const USER_SERVICE_BASE_URL = "http://127.0.0.1:8000";
export const CATALOG_SERVICE_BASE_URL = "http://127.0.1:3001";
export const API_BASE_URL = "http://127.0.1:8000";

export const ROLE_ADMIN = "ADM";
export const ROLE_GUEST = "GUE";
export const ROLE_STUDENT = "STU";
export const ROLE_LECTURER = "LEC";
export const ROLE_TEACHING_ASSISTANT = "TA";

export const JobStatusMap = {
  C: "Received",
  Q: "Queued",
  R: "Running",
  E: "Error",
  D: "Done",
};

export const JobErrorMap = {
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  VLE: "VRAM Limit Exceeded",
  RE: "Runtime Error",
};
