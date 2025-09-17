import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Container, CssBaseline, Snackbar } from "@mui/material";
import { Alert } from "../components/alert";
import TaskCard from "../components/taskCard";
import TaskDetail from "../components/taskDetail";
import TaskSubmit from "../components/taskSubmit";
import TaskTrainingSubmit from "../components/taskTrainingSubmit";
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
  hasTrainingTemplate;
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
    this.hasTrainingTemplate = json["trainingTemplate"] !== null;
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
  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = /** @type [Task[], any] */ useState([]);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [openTaskSubmit, setOpenTaskSubmit] = useState(false);
  const [openTaskTrainingSubmit, setOpenTaskTrainingSubmit] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [loading, setLoading] = useState([true, true]);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarType, setSnackBarType] = useState(SubmitTaskSnackbarType.Success);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
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
  }, [id]);

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
                setOpenTaskTrainingSubmit={setOpenTaskTrainingSubmit}
                setActiveTaskIndex={setActiveTaskIndex}
                refreshTasks={fetchTasks}
              />
            );
          })
        )}
      </Container>
      {/* BUG: Snackbar does not show up */}
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
        <TaskDetail
          openTaskDetail={openTaskDetail}
          setOpenTaskDetail={setOpenTaskDetail}
          task={tasks[activeTaskIndex]}
        />
      ) : null}
      {openTaskSubmit ? (
        <TaskSubmit
          openTaskSubmit={openTaskSubmit}
          setOpenTaskSubmit={setOpenTaskSubmit}
          task={tasks[activeTaskIndex]}
          setOpenSnackBar={setOpenSnackBar}
          setSnackBarType={setSnackBarType}
        />
      ) : null}
      {openTaskTrainingSubmit ? (
        <TaskTrainingSubmit
          openTaskTrainingSubmit={openTaskTrainingSubmit}
          setOpenTaskTrainingSubmit={setOpenTaskTrainingSubmit}
          task={tasks[activeTaskIndex]}
        />
      ) : null}
    </>
  );
};

export default CourseDetail;
