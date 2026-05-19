const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// Auth middleware
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// GET /api/reviews/:businessId — get all reviews for a business
router.get("/:businessId", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.business_id = $1
       ORDER BY r.created_at DESC`,
            [req.params.businessId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/reviews/:businessId — post a review
router.post("/:businessId", auth, async (req, res) => {
    const { rating, body } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
        // Check if user already reviewed this business
        const existing = await pool.query(
            "SELECT * FROM reviews WHERE user_id = $1 AND business_id = $2",
            [req.user.id, req.params.businessId]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "You already reviewed this business" });
        }

        const result = await pool.query(
            `INSERT INTO reviews (user_id, business_id, rating, body)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, req.params.businessId, rating, body]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/reviews/user/mine
router.get("/user/mine", auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, b.name AS business_name
       FROM reviews r
       JOIN businesses b ON r.business_id = b.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;