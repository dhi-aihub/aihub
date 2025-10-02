import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, CssBaseline, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import catalogueService from "../lib/api/catalogueService";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const CourseForm = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    catalogueService
      .get(`/courses/${id}/`)
      .then(resp => {
        const data = resp.data["data"];
        setCourse(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [id]);

  // Reset form values when course is loaded
  useEffect(() => {
    if (course) {
      reset({
        code: course.code,
        academicYear: course.academicYear,
        semester: course.semester,
      });
    }
  }, [course, reset]);

  const onSubmit = data => {
    setDisable(true);
    const courseData = {
      code: data.code,
      academicYear: data.academicYear,
      semester: data.semester,
    };

    catalogueService
      .put(`/courses/${id}/`, courseData)
      .then(resp => {
        const data = resp.data;
        if (data) {
          alert("Course updated successfully");
          navigate("/courses");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error updating course");
      })
      .finally(() => {
        setDisable(false);
      });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("code", { required: true })}
        id="code"
        label="Course Code"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
        autoFocus
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        {...register("academicYear", { required: true })}
        id="academicYear"
        label="Academic Year"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        {...register("semester", { required: true })}
        id="semester"
        label="Semester"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <SubmitButton type="submit" disabled={disable} variant="contained" color="primary">
        Submit
      </SubmitButton>
    </Form>
  );
};

const EditCourse = () => {
  return (
    <React.Fragment>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Typography variant="h4" gutterBottom>
          Edit Course
        </Typography>
        <CourseForm />
      </Container>
    </React.Fragment>
  );
};

export default EditCourse;
