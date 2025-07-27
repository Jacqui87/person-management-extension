import "./App.css";
import theme from "./theme";
import MainPage from "./components/MainPage";
import { ThemeProvider } from "@mui/material";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "2rem" }}>
        <h1>Person Manager</h1>
        <MainPage />
      </div>
    </ThemeProvider>
  );
}

export default App;
