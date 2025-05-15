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
import { AccountBox, DeveloperMode, MenuBook } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const sideBar = ({ openDrawer, setOpenDrawer }) => {
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
  );
};

export default sideBar;
