import React from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { AccountBox, MenuBook } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectLoggedIn } from "../redux/authSlice";

const AdminButton = () => {
  return (
    <ListItemButton key={"admin"} component={RouterLink} to="/admin">
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary={"Admin Panel"} />
    </ListItemButton>
  );
};

const SideBar = ({ openDrawer, setOpenDrawer }) => {
  const loggedInUser = useSelector(selectUser);
  const loggedIn = useSelector(selectLoggedIn);
  const isAdmin = loggedInUser.isAdmin;

  return (
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
          {isAdmin && <AdminButton />}
        </List>
        <Divider />
        <List>
          {!loggedIn && (
            <ListItemButton key={"signup"} component={RouterLink} to="/signup">
              <ListItemIcon>
                <AccountBox />
              </ListItemIcon>
              <ListItemText primary={"Sign Up"} />
            </ListItemButton>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideBar;
