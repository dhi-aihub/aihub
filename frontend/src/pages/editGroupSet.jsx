import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import { Box, Container, CssBaseline, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DownloadIcon from "@mui/icons-material/Download";

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
  const params = useParams();
  const id = params.id;
  const groupSetId = params.group_set_id;
  const { register, handleSubmit, reset } = useForm();
  const [csvData, setCsvData] = useState(null);
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing group set data
    catalogueService
      .get(`/groupSets/${groupSetId}`)
      .then(response => {
        const groupSet = response.data["data"];
        reset({
          name: groupSet.name,
          groupSize: groupSet.groupSize,
        });
      })
      .catch(error => {
        console.error("Error fetching group set data:", error);
      });
  }, [groupSetId, reset]);

  function handleFileUpload(data) {
    setCsvData(data);
  }

  function handleFileRemove() {
    setCsvData(null);
  }

  function handleDownloadGroupTemplate() {
    catalogueService
      .get("/groupParticipations/template", {
        responseType: "blob",
      })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "group_enrollment_template.csv");

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error downloading group template:", error);
        alert("Error downloading group template file");
      });
  }

  // Download individual group enrollment template
  function handleDownloadIndividualTemplate() {
    catalogueService
      .get("/groupParticipations/individual-template", {
        responseType: "blob",
      })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "individual_group_enrollment_template.csv");

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error downloading individual template:", error);
        alert("Error downloading individual template file");
      });
  }

  const onSubmit = async data => {
    setDisable(true);
    const groupSetData = {
      name: data.name,
      courseId: id,
      groupSize: data.groupSize,
    };

    try {
      await catalogueService.put(`/groupSets/${groupSetId}`, groupSetData);

      if (csvData) {
        // Process CSV data and add it to the group set
        catalogueService
          .put(`/groups/bulk/${groupSetId}`, { data: csvData["data"] })
          .then(() => {
            alert("Groups updated successfully");
            navigate(`/courses/${id}/groups`);
          })
          .catch(error => {
            console.error("Error creating groups:", error);
            alert("Error updating groups from CSV data");
          });
      } else {
        alert("Group set updated successfully");
        navigate(`/courses/${id}/groups`);
      }
    } catch (error) {
      console.error(error);
      alert("Error updating group set");
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
        InputLabelProps={{
          shrink: true,
        }}
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
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Bulk Upload Groups via CSV</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadGroupTemplate}
              size="small"
            >
              Download Group Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadIndividualTemplate}
              size="small"
            >
              Download Individual Template
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" gutterBottom>
          Upload a CSV file containing email addresses of users and group names to be added to the
          group set. Use one of the templates above for the correct format.
        </Typography>

        <CSVReader onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} />
      </Box>

      <SubmitButton type="submit" variant="contained" disabled={disable}>
        Submit
      </SubmitButton>
    </Form>
  );
};

const EditGroupSet = () => {
  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Edit Group Set
      </Typography>
      <GroupSetForm />
    </Container>
  );
};

export default EditGroupSet;
