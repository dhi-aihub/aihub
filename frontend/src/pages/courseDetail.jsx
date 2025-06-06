import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectLoggedIn } from "../redux/authSlice";
import axios from "axios";
import Cookie from "js-cookie";
import {
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  Snackbar,
  styled,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Alert } from "../components/alert";
import TaskCard from "../components/taskCard";
import catalogueService from "../lib/api/catalogueService";

class Task {
  id;
  courseId;
  name;
  description;
  dailySubmissionLimit;
  runtimeLimit;
  openedAt;
  closedAt;
  deadlineAt;
  hasTemplate;
  maxUploadSize;

  constructor(json) {
    this.id = json["id"];
    this.courseId = json["courseId"];
    this.name = json["name"];
    this.description = json["description"];
    this.dailySubmissionLimit = json["dailySubmissionLimit"];
    this.runtimeLimit = json["runtimeLimit"];
    this.openedAt = new Date(json["openedAt"]);
    this.closedAt = new Date(json["closedAt"]);
    this.deadlineAt = new Date(json["deadlineAt"]);
    this.hasTemplate = json["template"] !== null;
    this.maxUploadSize = json["maxUploadSize"];
  }

  getPropertiesAsString() {
    return [
      ["Opened At", this.openedAt.toString()],
      ["Closed At", this.closedAt.toString()],
      ["Deadline At", this.deadlineAt.toString()],
      ["Daily Submission Limit", this.dailySubmissionLimit.toString()],
      ["Max Upload Size (KiB)", this.maxUploadSize.toString()],
      ["Time Limit (s)", this.runtimeLimit.toString()],
    ];
  }
}

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

export const SubmitTaskSnackbarType = {
  Success: "success",
  DailyLimitExceeded: "daily_limit_exceeded",
  MaxUploadSizeExceeded: "max_upload_size_exceeded",
};

const getSnackbarText = snackbarType => {
  switch (snackbarType) {
    case SubmitTaskSnackbarType.Success:
      return "Success!";
    case SubmitTaskSnackbarType.DailyLimitExceeded:
      return "You have exceeded your daily submission limit.";
    case SubmitTaskSnackbarType.MaxUploadSizeExceeded:
      return "Your submission is too large.";
    default:
      return snackbarType;
  }
};

const CourseDetail = () => {
  const { id } = useParams();
  const isLoggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = /** @type [Task[], any] */ useState([]);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [openTaskSubmit, setOpenTaskSubmit] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [loading, setLoading] = useState([true, true]);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackBarType, setSnackBarType] = React.useState(SubmitTaskSnackbarType.Success);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };
  const { register, handleSubmit, reset } = useForm();
  const onCloseSubmitDialog = () => {
    setOpenTaskSubmit(false);
    reset();
  };
  const onSubmitForm = data => {
    const bodyForm = new FormData();
    const uploadFile = /** @type File */ data["file"][0];
    const taskId = data["task"];
    const maxUploadSize = tasks.filter(task => task.id === parseInt(taskId))[0].maxUploadSize;
    if (uploadFile.size > maxUploadSize * 1024) {
      // File.size is in bytes, max_upload_size is in KiB
      setSnackBarType(SubmitTaskSnackbarType.MaxUploadSizeExceeded);
      setOpenSnackBar(true);
      onCloseSubmitDialog();
      return;
    }
    bodyForm.append("task", taskId);
    bodyForm.append("file", uploadFile);
    bodyForm.append("description", data["description"]);
    axios({
      method: "post",
      url: "/api/v1/submissions/", // TODO
      data: bodyForm,
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
      .then(resp => {
        if (resp.status === 201) {
          setSnackBarType(SubmitTaskSnackbarType.Success);
          setOpenSnackBar(true);
        } else {
          setSnackBarType(resp.data);
          setOpenSnackBar(true);
        }
      })
      .catch(e => {
        if (e.response) {
          const detail = e.response.data.detail;
          if (detail === "You have exceeded your daily submission limit.") {
            setSnackBarType(SubmitTaskSnackbarType.DailyLimitExceeded);
          } else {
            setSnackBarType("Unknown error. Please see console output.");
            console.log(JSON.stringify(e.response));
          }
          setOpenSnackBar(true);
        }
      })
      .finally(() => {
        onCloseSubmitDialog();
      });
  };

  function fetchTasks() {
    catalogueService
      .get(`/courses/${id}/tasks/`)
      .then(resp => {
        const tasks = /** @type {Task[]} */ resp.data["data"].map(value => new Task(value));
        setTasks(tasks);
        setLoading(loading => [false, loading[1]]);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    catalogueService
      .get(`/courses/${id}/`)
      .then(resp => {
        const course = resp.data["data"];
        setCourse(course);
        setLoading(loading => [loading[0], false]);
      })
      .catch(e => {
        console.log(e);
      });
    fetchTasks();
  }, [id, isLoggedIn]);

  if (!isLoggedIn) {
    Cookie.remove("token");
    dispatch(logout());
    navigate("/signin");
    return null;
  }

  const isLoading = loading[0] || loading[1];

  return (
    <>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        {isLoading ? (
          <CircularProgress />
        ) : (
          tasks.map((task, index) => {
            return (
              <TaskCard
                key={`task_${index}`}
                course={course}
                task={task}
                index={index}
                setOpenTaskDetail={setOpenTaskDetail}
                setOpenTaskSubmit={setOpenTaskSubmit}
                setActiveTaskIndex={setActiveTaskIndex}
                refreshTasks={fetchTasks}
              />
            );
          })
        )}
      </Container>
      <Snackbar open={openSnackBar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackBarType === SubmitTaskSnackbarType.Success ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {getSnackbarText(snackBarType)}
        </Alert>
      </Snackbar>
      {openTaskDetail ? (
        <Dialog
          open={openTaskDetail}
          onClose={() => setOpenTaskDetail(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{tasks[activeTaskIndex].name}</DialogTitle>
          <DialogContent>
            <Table>
              <TableBody>
                {tasks[activeTaskIndex].getPropertiesAsString().map((value, index) => {
                  return (
                    <TableRow key={`task_detail_row_${index}`}>
                      <TableCell>{value[0]}</TableCell>
                      <TableCell>{value[1]}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTaskDetail(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      ) : null}
      {openTaskSubmit ? (
        <Dialog open={openTaskSubmit} maxWidth="md" fullWidth>
          <DialogTitle>New submission to: {tasks[activeTaskIndex].name}</DialogTitle>
          <DialogContent>
            <Form onSubmit={handleSubmit(onSubmitForm)}>
              <InputLabel>Agent File</InputLabel>
              <input
                {...register("file", { required: true })}
                type="file"
                name="file"
                accept="application/zip"
                required
              />
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                multiline
                {...register("description")}
                id="description"
                label="Description (optional)"
              />
              <input
                {...register("task", { required: true })}
                type="text"
                name="task"
                value={tasks[activeTaskIndex].id}
                hidden
              />
              <Button type={"submit"}>Submit</Button>
            </Form>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseSubmitDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
};

export default CourseDetail;
