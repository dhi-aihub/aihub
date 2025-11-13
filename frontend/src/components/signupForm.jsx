import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, styled, TextField, Typography } from "@mui/material";
import { useYupValidationResolver } from "../lib/yupValidationResolver";
import { SignUpSnackbarType } from "../pages/signup";
import userService from "../lib/api/userService";

const Form = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SignupForm = props => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string().required("Email is required").email("Email is invalid"),
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), null], "Confirm Password does not match"),
  });
  const resolver = useYupValidationResolver(validationSchema);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ resolver: resolver });
  const [disable, setDisable] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const onSubmit = data => {
    const bodyForm = new FormData();
    bodyForm.append("username", data.username);
    bodyForm.append("password", data.password);
    bodyForm.append("email", data.email);
    setDisable(true);

    userService
      .post("/auth/register/", bodyForm, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(resp => {
        if (resp.status === 201) {
          props.setSnackBarType(SignUpSnackbarType.Success);
          props.setOpenSnackBar(true);

          setTimeout(() => navigate("/signin"), 1500);
        } else {
          props.setSnackBarType(resp.data);
          props.setOpenSnackBar(true);
        }
      })
      .catch(e => {
        if (e.response) {
          const data = e.response.data;
          if (data.email && data.username) {
            props.setSnackBarType(SignUpSnackbarType.ExistingBoth);
          } else if (data.email) {
            props.setSnackBarType(SignUpSnackbarType.ExistingEmail);
          } else if (data.username) {
            props.setSnackBarType(SignUpSnackbarType.ExistingUsername);
          } else {
            props.setSnackBarType(data.error || "An error occurred.");
            console.log(data);
            console.log(e.response);
          }
          props.setOpenSnackBar(true);
        }
      })
      .finally(() => {
        setDisable(false);
      });
  };
  if (showForm) {
    return (
      <>
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            id="username"
            name="username"
            label="Username"
            fullWidth
            required
            margin="normal"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            id="email"
            name="email"
            label="Email"
            fullWidth
            required
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            id="password"
            name="password"
            label="Password"
            fullWidth
            required
            margin="normal"
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            fullWidth
            required
            margin="normal"
            type="password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ marginTop: 3, marginBottom: 2 }}
            disabled={disable}
          >
            Sign Up
          </Button>
        </Form>
      </>
    );
  } else {
    return (
      <>
        <Typography sx={{ marginTop: 2 }}>
          A verification email has been sent to your email address.
        </Typography>
      </>
    );
  }
};

export default SignupForm;
