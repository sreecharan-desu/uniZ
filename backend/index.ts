import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mainRoute } from "./routes";
import { updateAdminPassword } from "./routes/services/admin.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "10mb" })); // Increase limit to 10MB
app.use(cors());
app.use("/api/v1/", mainRoute);

app.get("/", (req, res) => {
  res.send("Hello from backend");
});




// Start the server
app.listen(PORT, () => {
  console.log(`Listening on Port number ${PORT}`);
});
