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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});