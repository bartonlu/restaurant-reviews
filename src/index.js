import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // If we need routing in our entire app, we must wrap our higher component with BrowserRouter. This is
  // what we are doing here right now
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
