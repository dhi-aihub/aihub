import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Button,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import catalogueService from "../lib/api/catalogueService";
import { ROLE_ADMIN, ROLE_LECTURER } from "../constants";

const DeleteButton = ({ courseId, taskId, refreshTasks }) => {
  function handleDelete() {
    catalogueService
      .delete(`/tasks/${courseId}/${taskId}`)
      .then(response => {
        alert("Task deleted successfully", response);
        refreshTasks();
      })
      .catch(error => {
        alert("Error deleting task:", error);
      });
  }

  return (
    <Button color="error" onClick={handleDelete}>
      Delete
    </Button>
  );
};

const handleDownloadTemplate = async taskId => {
  try {
    const response = await catalogueService.get(`/tasks/${taskId}/download-template`, {
      responseType: "blob",
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Try to get filename from Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = `template_${taskId}.py`; // Default to .py extension since that's what's uploaded

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading template:", error);
    alert("Error downloading template file");
  }
};

const handleDownloadTrainingTemplate = async taskId => {
  try {
    const response = await catalogueService.get(`/tasks/${taskId}/download-training-template`, {
      responseType: "blob",
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Try to get filename from Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = `training_template_${taskId}.py`; // Default to .py extension

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading training template:", error);
    alert("Error downloading training template file");
  }
};

const TaskCard = ({
  course,
  task,
  index,
  setOpenTaskDetail,
  setOpenTaskSubmit,
  setOpenTaskTrainingSubmit,
  setActiveTaskIndex,
  refreshTasks,
}) => {
  const isAdmin = course.participation === ROLE_ADMIN || course.participation === ROLE_LECTURER;
  const navigate = useNavigate();

  return (
    <Accordion key={`task_${index}`}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction={"column"} spacing={1} sx={{ width: "auto", display: "block" }}>
          <Typography variant={"h5"}>{task.name}</Typography>
          <Typography>Deadline: {task.deadlineAt.toLocaleString()}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography sx={{ color: "text.secondary" }}>{task.description}</Typography>
      </AccordionDetails>
      <Divider />
      <AccordionActions>
        <Button
          onClick={() => {
            setActiveTaskIndex(index);
            setOpenTaskDetail(true);
          }}
        >
          Details
        </Button>
        {task.hasTemplate ? (
          <Button onClick={() => handleDownloadTemplate(task.id)}>Template</Button>
        ) : null}
        {task.hasTrainingTemplate ? (
          <Button onClick={() => handleDownloadTrainingTemplate(task.id)}>Training Template</Button>
        ) : null}
        {isAdmin ? (
          <Button onClick={() => navigate(`/courses/${course.id}/${task.id}/edit`)}>Edit</Button>
        ) : null}
        {isAdmin ? (
          <DeleteButton courseId={course.id} taskId={task.id} refreshTasks={refreshTasks} />
        ) : null}
        <div style={{ flexGrow: 1 }} />
        <Button
          onClick={() => {
            setActiveTaskIndex(index);
            setOpenTaskSubmit(true);
          }}
        >
          Submit
        </Button>
        <Button onClick={() => navigate(`/courses/${course.id}/${task.id}/submissions`)}>
          Submissions
        </Button>
        <Button
          onClick={() => {
            setActiveTaskIndex(index);
            setOpenTaskTrainingSubmit(true);
          }}
        >
          Train
        </Button>
        <Button onClick={() => navigate(`/courses/${course.id}/${task.id}/training_results`)}>
          Training Results
        </Button>
        <Button onClick={() => navigate(`/courses/${course.id}/${task.id}/leaderboard`)}>
          Leaderboard
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

export default TaskCard;
