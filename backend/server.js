const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// configure CORS to allow multiple client origins (e.g. if you run front-end on 3000 or 3001)
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl)
    if (!origin) return callback(null, true);
    const allowed = [];
    if (process.env.CLIENT_URL) {
      allowed.push(process.env.CLIENT_URL);
    }
    // include localhost:3000 by default
    allowed.push("http://localhost:3000");
    // support alternate port used by create-react-app when starting multiple instances
    allowed.push("http://localhost:3001");
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    callback(new Error(msg), false);
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ═══════════════════════════════════════════════════
  🚀 Server running on port ${PORT}
  📝 Environment: ${process.env.NODE_ENV || "development"}
  🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}
  ═══════════════════════════════════════════════════
  `);
});