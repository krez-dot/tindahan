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

// GET /api/announcements — get all active announcements
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, b.name AS business_name, b.id AS business_id
       FROM announcements a
       JOIN businesses b ON a.business_id = b.id
       WHERE a.expires_at IS NULL OR a.expires_at > NOW()
       ORDER BY a.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/announcements/:businessId — get announcements for a business
router.get("/:businessId", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM announcements
       WHERE business_id = $1
       AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC`,
            [req.params.businessId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/announcements — create announcement (owner only)
router.post("/", auth, async (req, res) => {
    if (req.user.role !== "owner") {
        return res.status(403).json({ error: "Only owners can post announcements" });
    }

    const { business_id, title, body, expires_at } = req.body;

    try {
        // Verify ownership
        const business = await pool.query(
            "SELECT * FROM businesses WHERE id = $1 AND owner_id = $2",
            [business_id, req.user.id]
        );
        if (business.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const result = await pool.query(
            `INSERT INTO announcements (business_id, title, body, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [business_id, title, body, expires_at || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/announcements/:id — delete announcement (owner only)
router.delete("/:id", auth, async (req, res) => {
    try {
        await pool.query("DELETE FROM announcements WHERE id = $1", [req.params.id]);
        res.json({ message: "Announcement deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;