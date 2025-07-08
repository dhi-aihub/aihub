import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, CssBaseline, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import catalogueService from "../lib/api/catalogueService";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const TaskForm = () => {
  const params = useParams();
  const id = params.id;
  const taskId = params.task_id;
  const [task, setTask] = useState(null);
  const [groupSets, setGroupSets] = useState([]);
  const { register, handleSubmit, control, reset } = useForm();
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    catalogueService
      .get(`/courses/${id}/groupSets/`)
      .then(resp => {
        const data = resp.data["data"];
        setGroupSets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
      });
  }, [id]);

  useEffect(() => {
    catalogueService
      .get(`/tasks/${taskId}/`)
      .then(resp => {
        const data = resp.data["data"];
        setTask(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [taskId]);

  // Reset form values when task is loaded
  useEffect(() => {
    if (task) {
      reset({
        name: task.name || "",
        description: task.description || "",
        deadline: task.deadlineAt ? task.deadlineAt.split("T")[0] : "",
        dailySubmissionLimit: task.dailySubmissionLimit || "",
        groupSetId: task.groupSetId || "",
      });
    }
  }, [task, reset]);

  const onSubmit = data => {
    setDisable(true);
    const taskData = {
      courseId: id,
      name: data.name,
      description: data.description,
      deadlineAt: data.deadline,
      dailySubmissionLimit: data.dailySubmissionLimit,
      groupSetId: data.groupSetId,
    };

    catalogueService
      .put(`/tasks/${id}/${taskId}`, taskData)
      .then(resp => {
        const data = resp.data;
        if (data) {
          alert("Task updated successfully");
          navigate(`/courses/${id}`);
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error updating task");
      })
      .finally(() => {
        setDisable(false);
      });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

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
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        {...register("description")}
        id="description"
        label="Task Description"
        variant="outlined"
        margin="normal"
        fullWidth
        autoComplete="off"
        multiline
        rows={4}
        InputLabelProps={{
          shrink: true,
        }}
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
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControl fullWidth variant="outlined" margin="normal" required>
        <InputLabel id="groupSetId-label">Group Set</InputLabel>
        <Controller
          name="groupSetId"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              {...field}
              labelId="groupSetId-label"
              id="groupSetId"
              label="Group Set"
            >
              {groupSets.map(groupSet => (
                <MenuItem key={groupSet.id} value={groupSet.id}>
                  {groupSet.name}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
      <SubmitButton type="submit" variant="contained" disabled={disable}>
        Edit Task
      </SubmitButton>
    </Form>
  );
};

const EditTask = () => {
  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography component="h1" variant="h5">
        Edit Task
      </Typography>
      <TaskForm />
    </Container>
  );
};

export default EditTask;
