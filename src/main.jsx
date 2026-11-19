import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PortfolioProvider } from "./context/PortfolioContext";

import App from "./App";
import { applyTheme } from "./theme";
import { setupPwa } from "./pwa";

import "./styles/variables.css";
import "./styles/globals.css";

// Apply the saved Light / Dark / Follow-device preference before first paint.
applyTheme();
setupPwa();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PortfolioProvider>
        <App />
      </PortfolioProvider>
    </BrowserRouter>
  </React.StrictMode>
);