import React from "react";
import { Button, Container, CssBaseline, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { API_BASE_URL } from "../constants";
import { styled } from "@mui/material/styles";

const AdminPanel = () => {
  const AdminButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
  }));

  return (
    <React.Fragment>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Typography variant="h4" gutterBottom>
          Links to admin pages
        </Typography>
        <Typography variant="body1" gutterBottom>
          Buttons below will open the admin pages.
        </Typography>
        <AdminButton variant={"outlined"} component={RouterLink} to="/admin/create_course">
          Create Course
        </AdminButton>
        <AdminButton
          variant={"outlined"}
          href={API_BASE_URL + "/api/v1/participations/?course="}
          target="_blank"
        >
          Manage Roles
        </AdminButton>
      </Container>
    </React.Fragment>
  );
};

export default AdminPanel;
