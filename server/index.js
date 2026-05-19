const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Tindahan API is running 🛖" });
});

// Routes (we'll add these as we build)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/businesses", require("./routes/businesses"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/announcements", require("./routes/announcements"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});