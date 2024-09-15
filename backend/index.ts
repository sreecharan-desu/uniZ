import express from "express";
import cors from "cors";
import { mainRoute } from "./routes";
import dotenv from "dotenv";
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/v1/", mainRoute);


app.get('/',(req,res) =>{
  res.send("Hello from backed");
})


// Define port with a fallback to 3000
const port = process.env.PORT || 3000;



// Start the server
app.listen(port, () => {
  console.log(`Listening on Port number ${port}`);
});
