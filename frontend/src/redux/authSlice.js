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

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    loggedIn: sessionStorage.getItem("token") !== null,
    user: emptyUser,
  },
  reducers: {
    login: (state, user) => {
      state.loggedIn = true;
      state.user = fromJson(user.payload);
    },
    logout: state => {
      state.loggedIn = false;
      state.user = emptyUser;
    },
  },
});

export const { login, logout } = authSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const selectLoggedIn = state => state.auth.loggedIn;
export const selectUser = state => state.auth.user;

export default authSlice.reducer;
