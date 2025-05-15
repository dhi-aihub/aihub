import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./redux/authSlice";
import { Link as RouterLink, Route, Routes, Navigate } from "react-router-dom";
import Cookie from "js-cookie";
import SignIn from "./pages/signin";
import ApiTest from "./pages/api_test";
import CoursePage from "./pages/courses";
import CourseDetail from "./pages/course_detail";
import MuiBreadcrumbs from "./components/breadcrumbs";
import { selectIsDark, setDark, setLight } from "./redux/darkModeSlice";
import { AccountBox, DeveloperMode, MenuBook } from "@mui/icons-material";
import Home from "./pages/home";
import Submissions from "./pages/submissions";
import VerifyEmail from "./pages/verifyEmail";
import Signup from "./pages/signup";
import ResetPassword from "./pages/resetPassword";
import ResetPasswordConfirm from "./pages/resetPasswordConfirm";
import AdminPanel from "./pages/adminPanel";
import TopBar from "./components/topBar";
import SideBar from "./components/sideBar";

const MyApp = () => {
  const dispatch = useDispatch();
  const [openDrawer, setOpenDrawer] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const refresh = localStorage.getItem("refresh");
    const user_id = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");
    if (Cookie.get("remember") === "true" && token !== null) {
      dispatch(login(username));
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("refresh", refresh);
      sessionStorage.setItem("user_id", user_id);
      sessionStorage.setItem("username", username);
    }
  }, [dispatch]);

  return (
    <>
      <TopBar setOpenDrawer={setOpenDrawer} />
      <MuiBreadcrumbs />
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpenDrawer(false)}
          onKeyDown={() => setOpenDrawer(false)}
        >
          <List>
            <ListItemButton key={"course"} component={RouterLink} to="/courses">
              <ListItemIcon>
                <MenuBook />
              </ListItemIcon>
              <ListItemText primary={"Courses"} />
            </ListItemButton>
            <ListItemButton key={"api_tool"} component={RouterLink} to="/api_test">
              <ListItemIcon>
                <DeveloperMode />
              </ListItemIcon>
              <ListItemText primary={"API Test Tool"} />
            </ListItemButton>
          </List>
          <Divider />
          <List>
            <ListItemButton key={"signup"} component={RouterLink} to="/signup">
              <ListItemIcon>
                <AccountBox />
              </ListItemIcon>
              <ListItemText primary={"Sign Up"} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset_password" element={<ResetPassword />} />
        <Route path="/api_test" element={<ApiTest />} />
        <Route path="/course_admin/:id" element={<AdminPanel />} />
        <Route path="/course_admin" element={<Navigate to="/courses" />} />
        <Route path="/courses/:id/:task_id" element={<Submissions />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses" element={<CoursePage />} />
        <Route path="/account/verify_email" element={<VerifyEmail />} />
        <Route path="/account/reset_password_confirm" element={<ResetPasswordConfirm />} />
        <Route path="/" element={<Home />} />
      </Routes>
      {/*<footer>*/}
      {/*    <Container maxWidth="lg">*/}
      {/*      <Box textAlign="center" pt={{ xs: 5, sm: 10 }} pb={{ xs: 5, sm: 0 }}>*/}
      {/*        <Typography>*/}
      {/*          Tan Yuanhong &reg; {new Date().getFullYear()}*/}
      {/*        </Typography>*/}
      {/*      </Box>*/}
      {/*    </Container>*/}
      {/*</footer>*/}
    </>
  );
};

export const ColorModeContext = React.createContext({
  setColorMode: isDark => {},
});

export default function ToggleColorMode() {
  const isDark = useSelector(selectIsDark);
  const dispatch = useDispatch();
  const colorMode = React.useMemo(
    () => ({
      setColorMode: isDark => {
        if (isDark) dispatch(setDark());
        else dispatch(setLight());
      },
    }),
    [dispatch],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
        },
      }),
    [isDark],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <MyApp />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
