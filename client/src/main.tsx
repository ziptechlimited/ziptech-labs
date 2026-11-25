import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoadingProvider>
          <App />
          <LoadingOverlay />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#121616",
                color: "#f4f6f4",
                border: "1px solid rgb(255 255 255 / 0.1)",
                borderRadius: "14px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#a3e635", secondary: "#050606" } },
            }}
          />
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
