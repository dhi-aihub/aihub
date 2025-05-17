import React from "react";
import { Button, Container, CssBaseline, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../constants";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import catalogueService from "../lib/api/catalogueService";

const AdminButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const DeleteCourseButton = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDeleteCourse = () => {
    catalogueService
      .delete(`/courses/${id}/`)
      .then(resp => {
        const data = resp.data;
        if (data) {
          alert("Course deleted successfully");
        }
        navigate("/courses");
      })
      .catch(err => {
        console.error(err);
        alert("Error deleting course");
      });
  };

  return (
    <AdminButton variant={"outlined"} onClick={handleDeleteCourse}>
      Delete Course
    </AdminButton>
  );
};

const CourseAdminPanel = () => {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const isAdmin = user.isAdmin;

  return (
    <React.Fragment>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Typography variant="h4" gutterBottom>
          Links to course admin pages
        </Typography>
        <Typography variant="body1" gutterBottom>
          Buttons below will open course admin pages.
        </Typography>
        <AdminButton
          variant={"outlined"}
          href={API_BASE_URL + "/api/v1/tasks/?course=" + id}
          target="_blank"
        >
          Manage Tasks
        </AdminButton>
        <AdminButton
          variant={"outlined"}
          href={API_BASE_URL + "/api/v1/participations/?course=" + id}
          target="_blank"
        >
          Manage Participations
        </AdminButton>
        <AdminButton
          variant={"outlined"}
          href={API_BASE_URL + "/api/v1/invitations/?course=" + id}
          target="_blank"
        >
          Manage Invitations
        </AdminButton>
        <AdminButton
          variant={"outlined"}
          href={API_BASE_URL + "/api/v1/submissions/"}
          target="_blank"
        >
          View Submissions
        </AdminButton>
        <AdminButton variant={"outlined"} href={API_BASE_URL + "/api/v1/jobs/"} target="_blank">
          View Jobs
        </AdminButton>
        {isAdmin && <DeleteCourseButton />}
      </Container>
    </React.Fragment>
  );
};

export default CourseAdminPanel;
