import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const TaskForm = () => {
  const { id } = useParams();
  const { register, handleSubmit } = useForm();
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();

  const onSubmit = data => {
    setDisable(true);
    const taskData = {
      courseId: id,
      name: data.name,
      description: data.description,
      deadlineAt: data.deadline,
      dailySubmissionLimit: data.dailySubmissionLimit,
    };

    catalogueService
      .post(`/tasks/${id}/`, taskData)
      .then(resp => {
        const data = resp.data;
        if (data) {
          alert("Task created successfully");
          navigate(`/courses/${id}`);
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error creating task");
      })
      .finally(() => {
        setDisable(false);
      });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("name", { required: true })}
        id="name"
        label="Task Name"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
        autoFocus
      />
      <TextField
        {...register("description")}
        id="description"
        label="Task Description"
        variant="outlined"
        margin="normal"
        fullWidth
        autoComplete="off"
      />
      <TextField
        {...register("deadline", { required: true })}
        id="deadline"
        label="Task Deadline"
        type="date"
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
        {...register("dailySubmissionLimit", { required: true })}
        id="dailySubmissionLimit"
        label="Daily Submission Limit"
        type="number"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
      />
      <SubmitButton type="submit" variant="contained" disabled={disable}>
        Create Task
      </SubmitButton>
    </Form>
  );
};

const CreateTask = () => {
  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography component="h1" variant="h5">
        Create Task
      </Typography>
      <TaskForm />
    </Container>
  );
};

export default CreateTask;
