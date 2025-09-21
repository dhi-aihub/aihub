import { createSlice } from "@reduxjs/toolkit";

function fromJson(json) {
  return {
    id: json.id,
    username: json.username,
    isAdmin: json.is_staff,
  };
}

const emptyUser = {
  id: null,
  username: null,
  isAdmin: false,
};

// Load auth state from localStorage
function loadAuthState() {
  try {
    const stored = localStorage.getItem("authState");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        loggedIn: parsed.loggedIn,
        user: parsed.user,
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    loggedIn: false,
    user: emptyUser,
  };
}

export const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),
  reducers: {
    login: (state, user) => {
      state.loggedIn = true;
      state.user = fromJson(user.payload);
      // Persist to localStorage
      localStorage.setItem(
        "authState",
        JSON.stringify({ loggedIn: true, user: state.user })
      );
    },
    logout: state => {
      state.loggedIn = false;
      state.user = emptyUser;
      // Remove from localStorage
      localStorage.removeItem("authState");
    },
  },
});

export const { login, logout } = authSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const selectLoggedIn = state => state.auth.loggedIn;
export const selectUser = state => state.auth.user;

export default authSlice.reducer;
