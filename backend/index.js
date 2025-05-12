"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/", routes_1.mainRoute);
app.get('/', (req, res) => {
    res.send("Hello from backed");
});
// Start the server
app.listen(3000, () => {
    console.log(`Listening on Port number ${3000}`);
});
