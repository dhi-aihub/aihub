import React, {useContext, useEffect, useState} from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from "@mui/material";
import {createTheme, ThemeProvider, useTheme} from "@mui/material/styles";
import {useDispatch, useSelector} from "react-redux";
import {login, logout, selectLoggedIn, selectUsername} from "./redux/authSlice";
import {Link as RouterLink, Route, Routes, useNavigate, Navigate} from "react-router-dom";
import Cookie from "js-cookie";
import MenuIcon from "@mui/icons-material/Menu";
import SignIn from "./pages/signin";
import ApiTest from "./pages/api_test";
import {DarkModeSwitch} from "./components/darkModeSwitch";
import CoursePage from "./pages/courses";
import CourseDetail from "./pages/course_detail";
import MuiBreadcrumbs from "./components/breadcrumbs";
import {selectIsDark, setDark, setLight} from "./redux/darkModeSlice";
import {AccountBox, DeveloperMode, MenuBook} from "@mui/icons-material";
import Home from "./pages/home";
import Submissions from "./pages/submissions";
import {cleanAuthStorage} from "./lib/auth";
import VerifyEmail from "./pages/verifyEmail";
import Signup from "./pages/signup";
import ResetPassword from "./pages/resetPassword";
import ResetPasswordConfirm from "./pages/resetPasswordConfirm";
import AdminPanel from "./pages/adminPanel";

const MyApp = () => {
  const isLoggedIn = useSelector(selectLoggedIn);
  const loggedInUsername = useSelector(selectUsername);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    cleanAuthStorage();
    dispatch(logout());
    navigate("/signin");
  }
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const onSwitchChange = (event) => {
    colorMode.setColorMode(event.target.checked);
    sessionStorage.setItem("mode", event.target.checked ? "dark" : "light");
  };
  const [openDrawer, setOpenDrawer] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");
    if (Cookie.get("remember") === "true" && token !== null && user_id !== null) {
      dispatch(login());
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user_id", user_id);
    }
  }, [dispatch]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" size="large" sx={{marginRight: 2}}
                      onClick={() => setOpenDrawer(true)}>
            <MenuIcon/>
          </IconButton>
          <Typography variant="h6" sx={{flexGrow: 1, textAlign: "left"}}>
            <Link color="inherit" underline={"none"} component={RouterLink} to="/">AiRENA</Link>
          </Typography>
          {
            !isLoggedIn
              ? <Button color="inherit" component={RouterLink} to="/signin">Login</Button>
              : <Button color="inherit" onClick={handleLogout}>{loggedInUsername}</Button>
          }
          <DarkModeSwitch checked={theme.palette.mode === "dark"} onChange={onSwitchChange}/>
        </Toolbar>
      </AppBar>
      <MuiBreadcrumbs/>
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box sx={{width: 250}} role="presentation" onClick={() => setOpenDrawer(false)}
             onKeyDown={() => setOpenDrawer(false)}>
          <List>
            <ListItemButton key={"course"} component={RouterLink} to="/courses">
              <ListItemIcon><MenuBook/></ListItemIcon>
              <ListItemText primary={"Courses"}/>
            </ListItemButton>
            <ListItemButton key={"api_tool"} component={RouterLink} to="/api_test">
              <ListItemIcon><DeveloperMode/></ListItemIcon>
              <ListItemText primary={"API Test Tool"}/>
            </ListItemButton>
          </List>
          <Divider/>
          <List>
            <ListItemButton key={"signup"} component={RouterLink} to="/signup">
              <ListItemIcon><AccountBox/></ListItemIcon>
              <ListItemText primary={"Sign Up"}/>
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Routes>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/reset_password" element={<ResetPassword/>}/>
        <Route path="/api_test" element={<ApiTest/>}/>
        <Route path="/course_admin/:id" element={<AdminPanel/>}/>
        <Route path="/course_admin" element={<Navigate to="/courses"/>}/>
        <Route path="/courses/:id/:task_id" element={<Submissions/>}/>
        <Route path="/courses/:id" element={<CourseDetail/>}/>
        <Route path="/courses" element={<CoursePage/>}/>
        <Route path="/account/verify_email" element={<VerifyEmail/>}/>
        <Route path="/account/reset_password_confirm" element={<ResetPasswordConfirm/>}/>
        <Route path="/" element={<Home/>}/>
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
}

const ColorModeContext = React.createContext({
  setColorMode: (isDark) => {
  }
});

export default function ToggleColorMode() {
  const isDark = useSelector(selectIsDark);
  const dispatch = useDispatch();
  const colorMode = React.useMemo(
    () => ({
      setColorMode: (isDark) => {
        if (isDark) dispatch(setDark());
        else dispatch(setLight());
      }
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
        <MyApp/>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
