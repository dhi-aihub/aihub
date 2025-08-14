import express from "express";
import cors from "cors";
import submissionRoutes from "./routes/submission.routes";
// import graderRoutes from "./routes/grader.routes";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use("/submission", submissionRoutes);
// app.use("/api/v1", graderRoutes);

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
