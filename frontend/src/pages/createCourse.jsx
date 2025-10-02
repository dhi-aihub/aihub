import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { register, handleSubmit } = useForm();
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();

  const onSubmit = data => {
    setDisable(true);
    const courseData = {
      code: data.code,
      academicYear: data.academicYear,
      semester: data.semester,
    };

    catalogueService
      .post("/courses/", courseData)
      .then(resp => {
        const data = resp.data;
        if (data) {
          alert("Course created successfully");
          navigate("/courses");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error creating course");
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
      />
      <SubmitButton type="submit" disabled={disable} variant="contained" color="primary">
        Submit
      </SubmitButton>
    </Form>
  );
};

const CreateCourse = () => {
  return (
    <React.Fragment>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Typography variant="h4" gutterBottom>
          Create Course
        </Typography>
        <Typography variant="body1" gutterBottom>
          Create a new course by filling out the form below.
        </Typography>
        <CourseForm />
      </Container>
    </React.Fragment>
  );
};

export default CreateCourse;
