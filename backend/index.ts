import express from "express";
import cors from "cors";
import { mainRoute } from "./routes";
const app = express();
// Middleware
app.use(express.json({ limit: "10mb" })); // Increase limit to 10MB
app.use(cors());
app.use("/api/v1/", mainRoute);

app.get('/',(req,res) =>{
  res.send("Hello from backend");
})

// Start the server
app.listen(3000, () => {
  console.log(`Listening on Port number ${3000}`);
});
