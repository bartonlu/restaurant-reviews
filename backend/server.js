import express from "express";
import cors from "cors";
import restaurants from "./api/restaurants.route.js";

// Create express app
const app = express();

// Apply express middleware
app.use(cors()); // Use cors module
// Older versions used to use something called a body parser, this is now included
// Means our server can now accept json in the body of a request
app.use(express.json());

// Specify the initial url
app.use("/api/v1/restaurants", restaurants); // main url that people go to

// Specify what to do if user goes to url that doesn't exist
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

export default app;
// We'll import this into index.js, the file that accesses the database, and
// this file will be the file that you actually run to get the server running
// We are separating server code from database code
