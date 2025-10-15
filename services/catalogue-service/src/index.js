import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course-routes.js";
import taskRoutes from "./routes/task-routes.js";
import groupSetRoutes from "./routes/groupSet-routes.js";
import groupRoutes from "./routes/group-routes.js";
import groupParticipationRoutes from "./routes/groupParticipation-routes.js";
import courseParticipationRoutes from "./routes/courseParticipation-routes.js";
import submissionRoutes from "./routes/submission-routes.js";
import trainingRoutes from "./routes/training-routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger/swagger.json" with { type: "json" };

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// To handle CORS Errors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }

  // Continue Route Processing
  next();
});

// Routes
app.use("/courses", courseRoutes);
app.use("/tasks", taskRoutes);
app.use("/groupSets", groupSetRoutes);
app.use("/groups", groupRoutes);
app.use("/groupParticipations", groupParticipationRoutes);
app.use("/courseParticipations", courseParticipationRoutes);
app.use("/submissions", submissionRoutes);
app.use("/training", trainingRoutes);

// add route for swagger document API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Default Route
app.get("/", (req, res, next) => {
  console.log("Sending Greetings!");
  res.json({
    message: "Hello World from catalogue-service",
  });
});

// Handle When No Route Match Is Found
app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

// Handle All Errors
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

export default app;
