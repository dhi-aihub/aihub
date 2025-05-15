import Cookie from "js-cookie";

export const setItem = (key, value) => {
  sessionStorage.setItem(key, value);
  if (Cookie.get("remember") === "true") {
    localStorage.setItem(key, value);
  }
};

export const getItem = key => {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

export const cleanAuthStorage = () => {
  Cookie.remove("loggedIn");
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  sessionStorage.removeItem("refresh");
  localStorage.removeItem("refresh");
};
