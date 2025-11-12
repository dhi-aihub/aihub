import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import userService from "../lib/api/userService";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return false;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        old_password: currentPassword,
        new_password: newPassword,
      };
      await userService.post("/auth/change-password/", payload);

      setSuccessOpen(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.old_password?.[0] ||
        err?.response?.data?.new_password?.[0] ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        "Failed to change password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Change Password
        </Typography>

        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
            helperText="Minimum 8 characters"
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />

          <Box display="flex" gap={1} justifyContent="flex-end" mt={1}>
            <Button variant="text" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={successOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Password changed successfully
        </Alert>
      </Snackbar>
    </Container>
  );
}
