const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ── CORS — only allow your frontend origin ──────────────────────
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

app.use(express.json());

// ── Rate limiting ───────────────────────────────────────────────

// General API limit — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limit for auth routes — 50 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many login attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general limiter to all routes
app.use("/api", generalLimiter);

// Apply strict limiter to auth routes
app.use("/api/auth", authLimiter);

// ── Test route ──────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "Tindahan API is running 🛖" });
});

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/businesses", require("./routes/businesses"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/categories", require("./routes/categories"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});