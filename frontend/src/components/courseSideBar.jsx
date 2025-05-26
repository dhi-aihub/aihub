import React from "react";
import { Box, Divider, Paper, List, ListItemButton, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROLE_ADMIN, ROLE_LECTURER } from "../constants";

const WIDTH = 200;

const CourseSideBar = ({ course }) => {
  const id = course.id;
  const isAdmin = course.participation === ROLE_ADMIN || course.role === ROLE_LECTURER;

  return (
    <Paper elevation={0} sx={{ width: WIDTH, minHeight: "100%", p: 0 }}>
      <Box sx={{ width: WIDTH }} role="presentation">
        <List>
          <ListItemButton component={RouterLink} to={`/courses/${id}`}>
            <ListItemText primary="Tasks" />
          </ListItemButton>
          <ListItemButton component={RouterLink} to={`/courses/${id}/groups`}>
            <ListItemText primary="Groups" />
          </ListItemButton>
        </List>
        <Divider />
        {isAdmin && (
          <List>
            <ListItemButton component={RouterLink} to={`/courses/${id}/admin`}>
              <ListItemText primary="Admin Panel" />
            </ListItemButton>
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default CourseSideBar;
