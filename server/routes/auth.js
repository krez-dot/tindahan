const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const allowedRoles = ["customer", "owner"]; // admin can only be set directly in the DB
    const safeRole = allowedRoles.includes(role) ? role : "customer";

    try {
        // Check if email already exists
        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
            [name, email, password_hash, safeRole]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ token, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/auth/me (protected)
router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [decoded.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// PUT /api/auth/me — update name and/or password
router.put("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, currentPassword, newPassword } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Name is required" });
        }

        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
        const user = userResult.rows[0];

        let password_hash = user.password_hash;

        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({ error: "New password must be at least 8 characters" });
            }
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password is required to set a new password" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            password_hash = await bcrypt.hash(newPassword, 10);
        }

        const result = await pool.query(
            "UPDATE users SET name = $1, password_hash = $2 WHERE id = $3 RETURNING id, name, email, role",
            [name.trim(), password_hash, decoded.id]
        );

        res.json({ user: result.rows[0] });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;