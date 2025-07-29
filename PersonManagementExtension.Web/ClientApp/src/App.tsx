import "./App.css";
import theme from "./theme";
import React, { Suspense } from "react";
import { ThemeProvider } from "@mui/material";

const LazyComponent = React.lazy(() => import("./components/MainPage"));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "2rem" }}>
        <h1>Person Manager</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;
