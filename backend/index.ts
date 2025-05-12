import express from "express";
import cors from "cors";
import { mainRoute } from "./routes";
const app = express();
// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/v1/", mainRoute);

app.get('/',(req,res) =>{
  res.send("Hello from backed");
})
// Start the server
app.listen(3000, () => {
  console.log(`Listening on Port number ${3000}`);
});
