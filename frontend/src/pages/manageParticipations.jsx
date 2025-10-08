import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
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
  const [currentParticipants, setCurrentParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const navigate = useNavigate();

  // Fetching of the current participants
  useEffect(() => {
    fetchCurrentParticipants();
  }, [id]);

  function fetchCurrentParticipants() {
    setLoadingParticipants(true);
    catalogueService
      .get(`/courseParticipations/${id}`)
      .then(response => {
        setCurrentParticipants(response.data.data || []);
      })
      .catch(error => {
        console.error("Error fetching participants:", error);
        setCurrentParticipants([]);
      })
      .finally(() => {
        setLoadingParticipants(false);
      });
  }

  // Upload of files to add users
  function handleFileUpload(data) {
    setCsvData(data);
  }

  function handleFileRemove() {
    setCsvData(null);
  }

  // Addition of individual users
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

  function handleRemoveParticipant(userId) {
    if (window.confirm("Are you sure you want to remove this participant from the course?")) {
      catalogueService
        .delete(`/courseParticipations/${userId}/${id}`)
        .then(() => {
          alert("Participant removed successfully");
          fetchCurrentParticipants();
        })
        .catch(error => {
          if (error.response && error.response.status === 403) {
            alert("You do not have permission to remove this user.");
          } else {
            alert("Error removing participant");
            console.error("Error removing participant:", error.message);
          }
        });
    }
  }

  function handleSubmitBulk() {
    setDisabled(true);

    catalogueService
      .post(`/courseParticipations/${id}/bulk/`, { data: csvData["data"] })
      .then(() => {
        alert("Participations submitted successfully");
        setCsvData(null);
        navigate(`/courses/${id}/admin`);
      })
      .catch(error => {
        alert("Error submitting participations");
        console.error("Error submitting participations:", error.message);
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
          console.error("Error submitting participations:", error.message);
        })
        .finally(() => {
          setDisabled(false);
        });
    } catch (error) {
      alert("Error preparing participations:", error.message);
    }
  }

  function handleDownloadTemplate() {
    catalogueService
      .get("/courseParticipations/template", {
        responseType: "blob",
      })
      .then(response => {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "course_enrollment_template.csv");

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error downloading template:", error);
        alert("Error downloading template file");
      });
  }

  // Handle role display
  function getRoleDisplayName(role) {
    const roleMap = {
      STU: "Student",
      INST: "Instructor",
      TA: "Teaching Assistant",
      ADMIN: "Administrator",
    };
    return roleMap[role] || role;
  }

  function getRoleColor(role) {
    const colorMap = {
      STU: "primary",
      INST: "secondary",
      TA: "warning",
      ADMIN: "error",
    };
    return colorMap[role] || "default";
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
          Current Participants
        </Typography>
        {loadingParticipants ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      color: "primary.contrastText",
                    }}
                  >
                    User Email
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      color: "primary.contrastText",
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      color: "primary.contrastText",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No participants found for this course
                    </TableCell>
                  </TableRow>
                ) : (
                  currentParticipants.map(participant => (
                    <TableRow key={`${participant.userId}-${participant.courseId}`}>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleDisplayName(participant.role)}
                          color={getRoleColor(participant.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveParticipant(participant.userId)}
                          aria-label="remove participant"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionContainer>

      <Divider sx={{ my: 4 }} />

      <SectionContainer>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Bulk Upload via CSV</Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            size="small"
          >
            Download Template
          </Button>
        </Box>
        <Typography variant="body2" gutterBottom>
          Upload a CSV file containing email addresses and roles of users to add to this course. Use
          the template above for the correct format.
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold" }}>
            Allowed Roles:
          </Typography>
          <Table size="small" sx={{ maxWidth: 400 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", py: 1 }}>Role Code</TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 1 }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>ADM</TableCell>
                <TableCell sx={{ py: 0.5 }}>Administrator</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>LEC</TableCell>
                <TableCell sx={{ py: 0.5 }}>Lecturer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>TA</TableCell>
                <TableCell sx={{ py: 0.5 }}>Teaching Assistant</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>STU</TableCell>
                <TableCell sx={{ py: 0.5 }}>Student</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>GUE</TableCell>
                <TableCell sx={{ py: 0.5 }}>Guest</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <CSVReader onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} />
        <SubmitButton
          variant="contained"
          color="primary"
          onClick={handleSubmitBulk}
          disabled={disabled || !csvData}
        >
          Submit
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
          Submit
        </SubmitButton>
      </SectionContainer>
    </Container>
  );
};

export default ManageParticipations;
