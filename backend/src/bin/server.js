import dotenv from "dotenv";
dotenv.config({ path: new URL("../../.env", import.meta.url) });

import app from "../app.js";

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const server = app.listen(PORT, HOST, () => {
  console.log("====================================");
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`URL: http://${HOST}:${PORT}`);
  console.log("====================================");
});

const shutdown = (signal) => {
  console.log(`\n${signal} received.  Closing server gracefully...`);

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcing server shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default server;