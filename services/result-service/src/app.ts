import express from "express";
import cors from "cors";

import resultsRouter from "./routes/results.routes";
<<<<<<< HEAD
import studentSelectionRouter from "./routes/student-selection.routes";
=======
import trainingResultRouter from "./routes/trainingResult.routes";
>>>>>>> main

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/healthz", (_req, res) => res.json({ ok: true }));

// routes
app.use("/results", resultsRouter);
<<<<<<< HEAD
app.use("/selections", studentSelectionRouter);
=======
app.use("/training-results", trainingResultRouter);
>>>>>>> main

// 404 handler
app.use((req, res, next) => {
  const error: any = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

// Error handler
app.use((error: any, _req: any, res: any, _next: any) => {
  res.status(error.status || 500).json({ error: { message: error.message } });
});

export default app;
