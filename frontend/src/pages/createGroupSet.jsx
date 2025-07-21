import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, CssBaseline, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CSVReader from "../components/CSVReader";
import catalogueService from "../lib/api/catalogueService";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const GroupSetForm = () => {
  const { id } = useParams();
  const { register, handleSubmit } = useForm();
  const [csvData, setCsvData] = useState(null);
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();

  function handleFileUpload(data) {
    setCsvData(data);
  }

  function handleFileRemove() {
    setCsvData(null);
  }

  const onSubmit = async data => {
    setDisable(true);
    const groupSetData = {
      name: data.name,
      courseId: id,
      groupSize: data.groupSize,
    };

    try {
      const response = await catalogueService.post("/groupSets/", groupSetData);
      const groupSet = response.data["data"];
      // Process CSV data and add it to the group set
      catalogueService
        .post(`/groups/bulk/${groupSet.id}`, { data: csvData["data"] })
        .then(() => {
          alert("Group set created successfully");
          navigate(`/courses/${id}/groups`);
        })
        .catch(error => {
          console.error("Error creating groups:", error);
          alert("Error creating groups from CSV data");
        });
    } catch (error) {
      console.error(error);
      alert("Error creating group set");
    }
    setDisable(false);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("name", { required: true })}
        id="name"
        label="Group Set Name"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
        autoFocus
      />
      <TextField
        {...register("groupSize", { required: true })}
        id="groupSize"
        label="Group Size"
        type="number"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        autoComplete="off"
      />
      <Typography variant="body1" gutterBottom style={{ marginTop: "16px" }}>
        Upload a CSV file containing email addresses of users and group names to be added to the
        group set.
      </Typography>
      <CSVReader onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} />
      <SubmitButton type="submit" variant="contained" disabled={disable || !csvData}>
        Create Group Set
      </SubmitButton>
    </Form>
  );
};

const CreateGroupSet = () => {
  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Create Group Set
      </Typography>
      <GroupSetForm />
    </Container>
  );
};

export default CreateGroupSet;
