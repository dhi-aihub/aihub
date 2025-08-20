import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";

const TaskDetail = ({ openTaskDetail, setOpenTaskDetail, task }) => {
  return (
    <Dialog open={openTaskDetail} onClose={() => setOpenTaskDetail(false)} maxWidth="md" fullWidth>
      <DialogTitle>{task.name}</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            {task.getPropertiesAsString().map((value, index) => {
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
  );
};

export default TaskDetail;
