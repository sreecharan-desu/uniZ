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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.json({ limit: "10mb" })); // Increase limit to 10MB
app.use(cors());
app.use(requestLogger); // Custom "super clean" request logger
app.use("/api/v1/", mainRoute);

app.get("/", (req, res) => {
  res.send("Hello from backend");
});




// Start the server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on ${chalk.yellow(`http://localhost:${PORT}`)}`);
    logger.info(`System Environment: ${chalk.green(process.env.NODE_ENV || 'development')}`);
});
