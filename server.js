const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");


dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use("/api/projects", projectRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Trello Lite API Running");
});

// Auth Routes
app.use("/api/auth", authRoutes);
// for task
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);


// Protected Route
app.get("/api/profile", protect, (req, res) => {
  res.json({
    message: "Protected Route",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});