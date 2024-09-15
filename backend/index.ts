import express from "express";
import cors from "cors";
import { mainRoute } from "./routes";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import { PrismaClient } from "@prisma/client";
import { addAdmin } from "./routes/helper-functions";
// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/v1/", mainRoute);

app.get('/',(req,res) =>{
  res.send("Hello from backed");
})


// Define port with a fallback to 3000



// Start the server
app.listen(3000, () => {
  console.log(`Listening on Port number ${3000}`);
});
