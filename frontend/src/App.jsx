import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./redux/authSlice";
import { Route, Routes } from "react-router-dom";
import SignIn from "./pages/signin";
import CoursePage from "./pages/courses";
import CourseDetail from "./pages/courseDetail";
import MuiBreadcrumbs from "./components/breadcrumbs";
import { selectIsDark, setDark, setLight } from "./redux/darkModeSlice";
import Home from "./pages/home";
import Submissions from "./pages/submissions";
import VerifyEmail from "./pages/verifyEmail";
import Signup from "./pages/signup";
import ResetPassword from "./pages/resetPassword";
import ResetPasswordConfirm from "./pages/resetPasswordConfirm";
import AdminPanel from "./pages/adminPanel";
import CourseAdminPanel from "./pages/courseAdminPanel";
import CreateCourse from "./pages/createCourse";
import CreateTask from "./pages/createTask";
import CreateGroupSet from "./pages/createGroupSet";
import TopBar from "./components/topBar";
import SideBar from "./components/sideBar";
import { ColorModeContext } from "./contexts/colorModeContext";
import { getItem } from "./lib/auth";
import userService from "./lib/api/userService";

const MyApp = () => {
  const dispatch = useDispatch();
  const [openDrawer, setOpenDrawer] = useState(false);
  useEffect(() => {
    const token = getItem("token");
    if (token !== null) {
      userService.get("/users/me/").then(resp => {
        const data = resp.data;
        if (data) {
          dispatch(login(data));
        }
      });
    }
  }, [dispatch]);

  return (
    <>
      <TopBar setOpenDrawer={setOpenDrawer} />
      <MuiBreadcrumbs />
      <SideBar openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset_password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/create_course" element={<CreateCourse />} />
        <Route path="/courses" element={<CoursePage />} />
        <Route path="/courses/:id/admin" element={<CourseAdminPanel />} />
        <Route path="/courses/:id/create_task" element={<CreateTask />} />
        <Route path="/courses/:id/create_group_set" element={<CreateGroupSet />} />
        <Route path="/courses/:id/:task_id" element={<Submissions />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
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
