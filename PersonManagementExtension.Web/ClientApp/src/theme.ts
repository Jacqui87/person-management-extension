import createTheme from "@mui/material/styles/createTheme";

const theme = createTheme({
  palette: {
    primary: {
      main: "#373151", // UK Parliament Dark Purple
      light: "#5a577d", // lighter shade for hover etc.
      dark: "#2a2940", // darker shade for active etc.
      contrastText: "#ebe9e8", // Westminster White for text on primary
    },
    secondary: {
      main: "#A3D4B6", // Mint color for secondary actions
      light: "#c5e7d2", // lighter tint
      dark: "#6ea988", // darker tint
      contrastText: "#373151", // use Dark Purple for text on this secondary
    },
    info: {
      main: "#6B4BB1", // Bright Purple accent (optional)
      contrastText: "#ebe9e8",
    },
    background: {
      default: "#ebe9e8", // Westminster White as app background
      paper: "#fff", // White for cards, sheets, etc.
    },
    text: {
      primary: "#373151", // dark purple for main text
      secondary: "#5a577d", // lighter purple for secondary text
    },
  },
  typography: {
    fontFamily: '"National", "Arial", sans-serif', // Use 'National' as per UK Parliament guidelines, fallback to Arial
    h5: {
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
