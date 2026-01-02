import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import { mainRoute } from "./routes";
import { updateAdminPassword } from "./routes/services/admin.service";
import { logger } from "./utils/logger";
import { requestLogger } from "./utils/requestLogger";
import chalk from "chalk";

dotenv.config();
import cronRouter from "./routes/cron/index";

import http from "http";
import { initWebSocket } from "./utils/websocket";

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(compression());
app.use(express.json({ limit: "10mb" })); // Increase limit to 10MB
app.use(cors());
app.use(requestLogger); // Custom "super clean" request logger
app.use("/api/v1/", mainRoute);
app.use("/api/cron", cronRouter);

app.get("/", (req, res) => {
  res.send("Hello from backend");
});

// Initialize WebSocket
initWebSocket(server);

// Start the server
server.listen(PORT, () => {
    logger.info(`🚀 Server running on ${chalk.yellow(`http://localhost:${PORT}`)}`);
    logger.info(`System Environment: ${chalk.green(process.env.NODE_ENV || 'development')}`);
});
