import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cleanAuthStorage } from "../lib/auth";
import { logout, selectLoggedIn, selectUser } from "../redux/authSlice";
import { AppBar, Button, IconButton, Toolbar, Typography, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { DarkModeSwitch } from "./darkModeSwitch";
import { ColorModeContext } from "../contexts/colorModeContext";

const TopBar = ({ setOpenDrawer }) => {
  const isLoggedIn = useSelector(selectLoggedIn);
  const loggedInUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    cleanAuthStorage();
    dispatch(logout());
    navigate("/signin");
  };
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const onSwitchChange = event => {
    colorMode.setColorMode(event.target.checked);
    sessionStorage.setItem("mode", event.target.checked ? "dark" : "light");
  };
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          size="large"
          sx={{ marginRight: 2 }}
          onClick={() => setOpenDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "left" }}>
          <Link color="inherit" underline={"none"} component={RouterLink} to="/">
            AiHub
          </Link>
        </Typography>
        {!isLoggedIn ? (
          <Button color="inherit" component={RouterLink} to="/signin">
            Login
          </Button>
        ) : (
          <Button color="inherit" onClick={handleLogout}>
            {loggedInUser.username}
          </Button>
        )}
        <DarkModeSwitch checked={theme.palette.mode === "dark"} onChange={onSwitchChange} />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
