import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";

import authRoutes from "./routes/authRoutes.js";
import gymRoutes from "./routes/gymRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import iotGymRoutes from "./routes/iotGymRoutes.js";

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "https://pi-fatec-4semestre-2026.onrender.com",
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
  exposedHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.set("etag", false);

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(logger(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "GymRadar API",
    status: "running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/health",
      auth: "/auth",
      gyms: "/gyms",
      clients: "/clients",
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/auth", authRoutes);
app.use("/gyms", gymRoutes);
app.use("/clients", clientRoutes);
app.use("/iot", iotGymRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);

  const responseError = {
    error: err.message || "Internal server error",
  };

  if (process.env.NODE_ENV === "development") {
    responseError.stack = err.stack;
    responseError.details = err;
  }

  res.status(err.status || 500).json(responseError);
});

export default app;
