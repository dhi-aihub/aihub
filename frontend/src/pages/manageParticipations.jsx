import React, { useState } from "react";
import { Container, CssBaseline, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material";
import Button from "@mui/material/Button";
import CSVReader from "../components/CSVReader";
import catalogueService from "../lib/api/catalogueService";

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const ManageParticipations = () => {
  const { id } = useParams();
  const [csvData, setCsvData] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();

  function handleFileUpload(data) {
    setCsvData(data);
  }

  function handleFileRemove() {
    setCsvData(null);
  }

  function handleSubmit() {
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

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Manage Participations
      </Typography>
      <Typography variant="body1" gutterBottom>
        Upload a CSV file containing email addresses of users in this course.
      </Typography>
      <CSVReader onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} />
      <SubmitButton
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={disabled || !csvData}
      >
        Submit Participations
      </SubmitButton>
    </Container>
  );
};

export default ManageParticipations;
