import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { attachAuth } from "./middleware/auth.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = String(env.frontendOrigin || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(attachAuth);

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
