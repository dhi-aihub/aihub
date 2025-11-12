import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cleanAuthStorage } from "../lib/auth";
import { logout, selectLoggedIn, selectUser } from "../redux/authSlice";
import {
  AppBar,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Link,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LogoutIcon from "@mui/icons-material/Logout";
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

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate("/change-password");
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
          <>
            <Tooltip title="Account">
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                sx={{
                  textTransform: "none",
                  px: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" color="inherit">
                    {loggedInUser?.username}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>

            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                elevation: 4,
                sx: {
                  minWidth: 180,
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  borderRadius: 1,
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              <MenuItem onClick={handleChangePassword}>
                <ListItemIcon>
                  <VpnKeyIcon fontSize="small" />
                </ListItemIcon>
                Change Password
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleLogout();
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        )}

        <DarkModeSwitch checked={theme.palette.mode === "dark"} onChange={onSwitchChange} />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
