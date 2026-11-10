require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const runsRouter = require("./routes/runs");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "dsa-visualizer-backend" });
});

app.use("/api/runs", runsRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
