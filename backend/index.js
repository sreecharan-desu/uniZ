"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json({ limit: "10mb" })); // Increase limit to 10MB
app.use((0, cors_1.default)());
app.use("/api/v1/", routes_1.mainRoute);
app.get("/", (req, res) => {
    res.send("Hello from backend");
});
// Start the server
app.listen(PORT, () => {
    console.log(`Listening on Port number ${PORT}`);
});
