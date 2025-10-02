import { useState, useEffect, useRef } from "react";
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
import InputFileUpload from "../components/inputFileUpload";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const TaskForm = () => {
  const { id } = useParams();
  const [groupSets, setGroupSets] = useState([]);
  const { register, handleSubmit, control } = useForm();
  const [disable, setDisable] = useState(false);

  const graderRef = useRef();
  const templateRef = useRef();
  const trainerRef = useRef();
  const trainingTemplateRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    catalogueService
      .get(`/courses/${id}/groupSets/`)
      .then(resp => {
        const data = resp.data["data"];
        setGroupSets(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [id]);

  const onSubmit = data => {
    setDisable(true);
    const taskData = {
      courseId: id,
      name: data.name,
      description: data.description,
      deadlineAt: data.deadline,
      dailySubmissionLimit: data.dailySubmissionLimit,
      maxUploadSize: data.maxUploadSize,
      runtimeLimit: data.runtimeLimit,
      ramLimit: data.ramLimit,
      vramLimit: data.vramLimit,
      groupSetId: data.groupSetId,
    };

    if (
      !graderRef.current ||
      !templateRef.current ||
      !trainerRef.current ||
      !trainingTemplateRef.current
    ) {
      alert("Please upload grader, template, trainer, and training template files");
      setDisable(false);
      return;
    }

    const formData = new FormData();
    formData.append("taskData", JSON.stringify(taskData));
    formData.append("graderFile", graderRef.current);
    formData.append("templateFile", templateRef.current);
    formData.append("trainerFile", trainerRef.current);
    formData.append("trainingTemplateFile", trainingTemplateRef.current);

    catalogueService
      .post(`/tasks/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(resp => {
        const data = resp.data;
        if (data) {
          alert("Task created successfully");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error creating task");
      })
      .finally(() => {
        navigate(`/courses/${id}`);
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
        multiline
        rows={4}
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
      <TextField
        {...register("maxUploadSize", { required: true })}
        id="maxUploadSize"
        label="Max Upload Size (MB)"
        type="number"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
      />
      <TextField
        {...register("runtimeLimit", { required: true })}
        id="runtimeLimit"
        label="Runtime Limit (seconds)"
        type="number"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
      />
      <TextField
        {...register("ramLimit", { required: true })}
        id="ramLimit"
        label="RAM Limit (MB)"
        type="number"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
      />
      <TextField
        {...register("vramLimit", { required: true })}
        id="vramLimit"
        label="VRAM Limit (MB)"
        type="number"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
      />
      <FormControl fullWidth variant="outlined" margin="normal" required>
        <InputLabel id="groupSetId-label">Group Set</InputLabel>
        <Controller
          name="groupSetId"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <Select {...field} labelId="groupSetId-label" id="groupSetId" label="Group Set">
              {groupSets.map(groupSet => (
                <MenuItem key={groupSet.id} value={groupSet.id}>
                  {groupSet.name}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        <TextField
          type="file"
          label="Grader File (.zip)"
          variant="outlined"
          fullWidth
          required
          inputProps={{ accept: ".zip" }}
          InputLabelProps={{ shrink: true }}
          onChange={event => {
            const files = event.target.files;
            if (files.length > 0) {
              graderRef.current = files[0];
            }
          }}
        />
        <TextField
          type="file"
          label="Template File"
          variant="outlined"
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          onChange={event => {
            const files = event.target.files;
            if (files.length > 0) {
              templateRef.current = files[0];
            }
          }}
        />
        <TextField
          type="file"
          label="Trainer File (.zip)"
          variant="outlined"
          fullWidth
          required
          inputProps={{ accept: ".zip" }}
          InputLabelProps={{ shrink: true }}
          onChange={event => {
            const files = event.target.files;
            if (files.length > 0) {
              trainerRef.current = files[0];
            }
          }}
        />
        <TextField
          type="file"
          label="Training Template File"
          variant="outlined"
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          onChange={event => {
            const files = event.target.files;
            if (files.length > 0) {
              trainingTemplateRef.current = files[0];
            }
          }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <SubmitButton type="submit" variant="contained" disabled={disable}>
          Create
        </SubmitButton>
      </div>
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
