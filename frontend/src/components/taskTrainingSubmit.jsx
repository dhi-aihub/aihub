import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  styled,
} from "@mui/material";
import { useForm } from "react-hook-form";
import catalogueService from "../lib/api/catalogueService";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const TaskTrainingSubmit = ({
  openTaskTrainingSubmit,
  setOpenTaskTrainingSubmit,
  task,
}) => {
  // submit form
  const { register, handleSubmit, reset } = useForm();
  const onCloseSubmitDialog = () => {
    setOpenTaskTrainingSubmit(false);
    reset();
  };
  const onSubmitForm = data => {
    const bodyForm = new FormData();
    const uploadFile = /** @type File */ data["file"][0];
    const maxUploadSize = task.maxUploadSize;
    if (uploadFile.size > maxUploadSize * 1024) {
      // File.size is in bytes, max_upload_size is in KiB
      alert(`File size exceeds the maximum upload size of ${maxUploadSize} KiB.`);
      onCloseSubmitDialog();
      return;
    }
    bodyForm.append("file", uploadFile);
    catalogueService
      .post(`/tasks/${task.id}/submit-training/`, bodyForm, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(resp => {
        if (resp.status === 201) {
          alert("Training submission created successfully!");
        } 
      })
      .catch(e => {
        console.error(e);
      })
      .finally(() => {
        onCloseSubmitDialog();
      });
  };

  return (
    <Dialog open={openTaskTrainingSubmit} maxWidth="md" fullWidth>
      <DialogTitle>New training submission to: {task.name}</DialogTitle>
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
          <Button type={"submit"}>Submit</Button>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseSubmitDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskTrainingSubmit;
