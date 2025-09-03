import React, { useState } from "react";
import {
  Box,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material";
import Button from "@mui/material/Button";

import { useParams, useNavigate } from "react-router-dom";

import CSVReader from "../components/CSVReader";
import catalogueService from "../lib/api/catalogueService";

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const AddUserContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const ManageParticipations = () => {
  const { id } = useParams();
  const [csvData, setCsvData] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();

  function handleFileUpload(data) {
    setCsvData(data);
  }

  function handleFileRemove() {
    setCsvData(null);
  }

  function handleAddUser() {
    if (userInput.trim() && !userList.includes(userInput.trim())) {
      setUserList([...userList, userInput.trim()]);
      setUserInput("");
    }
  }

  function handleRemoveUser(userToRemove) {
    setUserList(userList.filter(user => user !== userToRemove));
  }

  function handleUserInputKeyPress(event) {
    if (event.key === "Enter") {
      handleAddUser();
    }
  }

  function handleSubmitBulk() {
    setDisabled(true);
    catalogueService
      .post(`/courseParticipations/${id}/bulk/`, { data: csvData["data"] })
      .then(response => {
        alert("Participations submitted successfully");
        setCsvData(null);
        navigate(`/courses/${id}/admin`);
      })
      .catch(error => {
        alert("Error submitting participations");
      })
      .finally(() => {
        setDisabled(false);
      });
  }

  function handleSubmitIndividual() {
    setDisabled(true);

    try {
      const promises = userList.map(email =>
        catalogueService.post(`/courseParticipations/${id}/`, { email, role: "STU" }),
      );

      Promise.allSettled(promises)
        .then(results => {
          const successful = results.filter(r => r.status === "fulfilled").length;
          const failed = results.filter(r => r.status === "rejected").length;

          alert(`${successful} participations submitted successfully, ${failed} failed.`);
          setUserList([]);
          navigate(`/courses/${id}/admin`);
        })
        .catch(error => {
          alert("Error submitting participations.");
        })
        .finally(() => {
          setDisabled(false);
        });
    } catch (error) {
      alert("Error preparing participations:", error.message);
    }
  }

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Manage Participations
      </Typography>
      <Typography variant="body1" gutterBottom>
        Add participants to this course using bulk CSV upload or individual entries.
      </Typography>

      <SectionContainer>
        <Typography variant="h5" gutterBottom>
          Bulk Upload via CSV
        </Typography>
        <Typography variant="body2" gutterBottom>
          Upload a CSV file containing email addresses of users to add to this course.
        </Typography>
        <CSVReader onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} />
        <SubmitButton
          variant="contained"
          color="primary"
          onClick={handleSubmitBulk}
          disabled={disabled || !csvData}
        >
          Submit Bulk Participations
        </SubmitButton>
      </SectionContainer>

      <Divider sx={{ my: 4 }} />

      <SectionContainer>
        <Typography variant="h5" gutterBottom>
          Add Individual Users
        </Typography>
        <AddUserContainer>
          <TextField
            fullWidth
            label="Email or Username"
            variant="outlined"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={handleUserInputKeyPress}
            placeholder="Enter email address or username"
          />
          <IconButton
            color="primary"
            onClick={handleAddUser}
            disabled={!userInput.trim() || userList.includes(userInput.trim())}
          >
            <AddIcon />
          </IconButton>
        </AddUserContainer>

        {userList.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Users to Add ({userList.length})
            </Typography>
            <List>
              {userList.map((user, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveUser(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={user} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <SubmitButton
          variant="contained"
          color="primary"
          onClick={handleSubmitIndividual}
          disabled={disabled || userList.length === 0}
        >
          Submit Individual Participations
        </SubmitButton>
      </SectionContainer>
    </Container>
  );
};

export default ManageParticipations;
