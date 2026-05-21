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

// GET /api/reviews/user/mine — must be before /:businessId to avoid param collision
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
    if (!body || body.trim().length === 0) {
        return res.status(400).json({ error: "Review body is required" });
    }
    if (body.length > 2000) {
        return res.status(400).json({ error: "Review must be under 2000 characters" });
    }

    try {
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
            [req.user.id, req.params.businessId, rating, body.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/reviews/:id/reply — owner replies to a review
router.post("/:id/reply", auth, async (req, res) => {
    const { reply } = req.body;

    if (!reply || reply.trim().length === 0) {
        return res.status(400).json({ error: "Reply is required" });
    }
    if (reply.length > 1000) {
        return res.status(400).json({ error: "Reply must be under 1000 characters" });
    }

    try {
        const review = await pool.query(
            `SELECT r.*, b.owner_id FROM reviews r
       JOIN businesses b ON r.business_id = b.id
       WHERE r.id = $1`,
            [req.params.id]
        );
        if (review.rows.length === 0) {
            return res.status(404).json({ error: "Review not found" });
        }
        if (review.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }
        const result = await pool.query(
            `UPDATE reviews SET owner_reply = $1, replied_at = NOW()
       WHERE id = $2 RETURNING *`,
            [reply.trim(), req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
