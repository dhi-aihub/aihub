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
  const isAdmin = course.participation === "ADM";
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
        {task.hasTemplate ? <Button>Template</Button> : null}
        {isAdmin ? (
          <Button onClick={() => navigate(`/courses/${course.id}/edit_task/${task.id}`)}>
            Edit
          </Button>
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
        <Button onClick={() => navigate(`/courses/${id}/${task.id}`)}>Submissions</Button>
        <Button onClick={() => {
          setActiveTaskIndex(index);
          setOpenTaskTrainingSubmit(true);
        }}
        >
          Train
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

export default TaskCard;
