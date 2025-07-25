// src/theme.ts
import { createTheme } from "@mui/material/styles";

// Customize palette, typography, spacing, and overrides as needed
const theme = createTheme({
  palette: {
    primary: {
      main: "#334ACC", // example blue, change to your preferred colors
    },
    secondary: {
      main: "#F50057", // example pink
    },
  },
  typography: {
    fontFamily: '"Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
  },
  components: {
    // Optional: override styles of components globally
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
        },
      },
    },
    // Add other component overrides as needed
  },
});

export default theme;
