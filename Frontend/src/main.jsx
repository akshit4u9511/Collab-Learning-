import React from "react";
import './index.css';
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";

// --- 1. Import AuthProvider, NOT UserContextProvider ---
import { AuthProvider } from "./context/AuthContext.jsx"; // Adjust path if needed

if (import.meta.env.DEV) {
  console.log("Running in development mode");
  axios.defaults.baseURL = import.meta.env.VITE_LOCALHOST;
} else {
  console.log("Running in production mode");
  axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
}
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    {/* --- 2. Use AuthProvider here --- */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
