import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, CssBaseline, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();

  const onSubmit = data => {
    setDisable(true);
    const groupSetData = {
      name: data.name,
      courseId: id,
      groupSize: data.groupSize,
    };

    catalogueService
      .post("/groupSets/", groupSetData)
      .then(resp => {
        const data = resp.data;
        if (data) {
          alert("Group set created successfully");
          navigate("/courses"); // TODO: redirect to groups page
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error creating group set");
      })
      .finally(() => {
        setDisable(false);
      });
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
      <SubmitButton type="submit" variant="contained" disabled={disable}>
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
