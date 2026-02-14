import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LanguageProvider } from "./context/LanguageContext";
import { PlotProvider } from "./context/PlotContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <PlotProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PlotProvider>
    </LanguageProvider>
  </React.StrictMode>
);
