import "./App.css";
import theme from "./theme";
import React, { Suspense } from "react";
import { ThemeProvider } from "@mui/material";
import { useTranslation } from "react-i18next";

const LazyComponent = React.lazy(() => import("./components/MainPage"));

function App() {
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "2rem" }}>
        <h1>{t("nav_bar.person_manager")}</h1>
        <Suspense fallback={<div>{t("common.loading")}...</div>}>
          <LazyComponent />
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;
