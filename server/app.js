const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const seniorRoutes = require("./routes/seniorRoutes");
const toolRoutes = require("./routes/toolRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

// ✅ ADD YOUR FRONTEND URL HERE (IMPORTANT)
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,http://localhost:5174,https://openclaw-hackathon-hackindia-codingzam-kanchan-kapri.onrender.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "ExplainX.ai backend is running." });
});

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/seniors", seniorRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/activity", activityRoutes);

module.exports = app;