import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Button, Container, Paper, Typography, Divider, Grid } from "@mui/material";
import { selectUser } from "../redux/authSlice";

const formatDate = iso => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso || "—";
    return d.toLocaleString();
  } catch {
    return iso || "—";
  }
};

export default function ProfileView() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  console.log(user);

  if (!user) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography variant="h6">No user found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h5">{user.username}</Typography>
          {user.email && <Typography color="text.secondary">{user.email}</Typography>}

          <Divider sx={{ width: "100%", my: 2 }} />

          <Grid container spacing={1} sx={{ width: "100%" }}>
            <Grid item xs={5}>
              <Typography variant="subtitle2" color="text.secondary">
                First name
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography>{user.first_name || "—"}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="subtitle2" color="text.secondary">
                Last name
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography>{user.last_name || "—"}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography>{user.email || "—"}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography variant="subtitle2" color="text.secondary">
                Joined
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography>{formatDate(user.date_joined)}</Typography>
            </Grid>
          </Grid>

          <Box display="flex" gap={1} mt={3}>
            <Button variant="contained" onClick={() => navigate("/profile/edit")}>
              Edit Profile
            </Button>
            <Button variant="outlined" onClick={() => navigate("/profile/change_password")}>
              Change Password
            </Button>
            <Button variant="text" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
