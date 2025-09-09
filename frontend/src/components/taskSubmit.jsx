import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  TextField,
  styled,
} from "@mui/material";
import { useForm } from "react-hook-form";
import catalogueService from "../lib/api/catalogueService";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const TaskSubmit = ({
  openTaskSubmit,
  setOpenTaskSubmit,
  task,
  setOpenSnackBar,
  setSnackBarType,
}) => {
  // submit form
  const { register, handleSubmit, reset } = useForm();
  const onCloseSubmitDialog = () => {
    setOpenTaskSubmit(false);
    reset();
  };
  const onSubmitForm = data => {
    const bodyForm = new FormData();
    const uploadFile = /** @type File */ data["file"][0];
    const maxUploadSize = task.maxUploadSize;
    if (uploadFile.size > maxUploadSize * 1024) {
      // File.size is in bytes, max_upload_size is in KiB
      setSnackBarType(SubmitTaskSnackbarType.MaxUploadSizeExceeded);
      setOpenSnackBar(true);
      onCloseSubmitDialog();
      return;
    }
    bodyForm.append("file", uploadFile);
    bodyForm.append("description", data["description"]);
    catalogueService
      .post(`/tasks/${task.id}/submit/`, bodyForm, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(resp => {
        if (resp.status === 201) {
          alert("Submission created successfully!");
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

  return (
    <Dialog open={openTaskSubmit} maxWidth="md" fullWidth>
      <DialogTitle>New submission to: {task.name}</DialogTitle>
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
          <Button type={"submit"}>Submit</Button>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseSubmitDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskSubmit;
