// theme.ts
import { createTheme } from "@mui/material/styles";

export const getTheme = mode =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // Light mode
            primary: { main: "#4F46E5" },
            secondary: { main: "#06B6D4" },
            background: {
              default: "#F8FAFC",
              paper: "#FFFFFF",
            },
            text: {
              primary: "#111827",
              secondary: "#4B5563",
            },
          }
        : {
            // Dark mode
            primary: { main: "#6366F1" },
            secondary: { main: "#22D3EE" },
            background: {
              default: "#0F172A",
              paper: "#1E293B",
            },
            text: {
              primary: "#E2E8F0",
              secondary: "#94A3B8",
            },
          }),
    },
    typography: {
      fontFamily: "Roboto, Inter, sans-serif",
      h1: { fontWeight: 700, letterSpacing: "-0.5px" },
      h2: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
  });
