import Cookie from "js-cookie";

export const setItem = (key, value) => {
  sessionStorage.setItem(key, value);
  if (Cookie.get("remember") === "true") {
    localStorage.setItem(key, value);
  }
}

export const getItem = (key) => {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
}

export const cleanAuthStorage = () => {
  Cookie.remove("loggedIn");
  sessionStorage.removeItem("user_id");
  sessionStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("token");
}
