const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// ==============================
// Middleware
// ==============================

app.use(cors());
app.use(express.json());

// Serve Uploaded Files

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ==============================
// Routes
// ==============================

const notificationRoutes = require(
  "./routes/notificationRoutes"
);

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/projects",
  require("./routes/projectRoutes")
);

app.use(
  "/api/tasks",
  require("./routes/taskRoutes")
);

app.use(
  "/api/dashboard",
  require("./routes/dashboardRoutes")
);

app.use(
  "/api/activity",
  require("./routes/activityRoutes")
);

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

app.use(
  "/api/notifications",
  notificationRoutes
);

// ==============================
// Home Route
// ==============================

app.get("/", (req, res) => {
  res.send("Trello Lite API Running...");
});

// ==============================
// MongoDB Connection
// ==============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(
      process.env.PORT || 5000,
      () => {
        console.log(
          `Server running on port ${
            process.env.PORT || 5000
          }`
        );
      }
    );
  })
  .catch((error) => {
    console.log(error);
  });