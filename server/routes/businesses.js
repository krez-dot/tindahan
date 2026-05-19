const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// Middleware to verify token
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

// GET /api/businesses — get all businesses
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.name AS owner_name
       FROM businesses b
       JOIN users u ON b.owner_id = u.id
       ORDER BY b.created_at DESC`,
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/businesses/:id — get single business
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.name AS owner_name
       FROM businesses b
       JOIN users u ON b.owner_id = u.id
       WHERE b.id = $1`,
            [req.params.id],
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Business not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/businesses — create a business (owner only)
router.post("/", auth, async (req, res) => {
    if (req.user.role !== "owner") {
        return res.status(403).json({ error: "Only owners can create listings" });
    }

    const {
        name,
        description,
        address,
        lat,
        lng,
        phone,
        category_id,
        barangay_id,
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO businesses (owner_id, name, description, address, lat, lng, phone, category_id, barangay_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                req.user.id,
                name,
                description,
                address,
                lat,
                lng,
                phone,
                category_id,
                barangay_id,
            ],
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/businesses/:id — update a business (owner only)
router.put("/:id", auth, async (req, res) => {
    const { name, description, address, lat, lng, phone } = req.body;

    try {
        const existing = await pool.query(
            "SELECT * FROM businesses WHERE id = $1",
            [req.params.id],
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Business not found" });
        }
        if (existing.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const result = await pool.query(
            `UPDATE businesses
       SET name=$1, description=$2, address=$3, lat=$4, lng=$5, phone=$6
       WHERE id=$7 RETURNING *`,
            [name, description, address, lat, lng, phone, req.params.id],
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/businesses/:id — delete a business (owner only)
router.delete("/:id", auth, async (req, res) => {
    try {
        const existing = await pool.query(
            "SELECT * FROM businesses WHERE id = $1",
            [req.params.id],
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Business not found" });
        }
        if (existing.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        await pool.query("DELETE FROM businesses WHERE id = $1", [req.params.id]);
        res.json({ message: "Business deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/businesses/:id/save — save a business
router.post("/:id/save", auth, async (req, res) => {
    try {
        const existing = await pool.query(
            "SELECT * FROM saved_businesses WHERE user_id = $1 AND business_id = $2",
            [req.user.id, req.params.id],
        );

        if (existing.rows.length > 0) {
            // Already saved — unsave it
            await pool.query(
                "DELETE FROM saved_businesses WHERE user_id = $1 AND business_id = $2",
                [req.user.id, req.params.id],
            );
            return res.json({ saved: false });
        }

        // Save it
        await pool.query(
            "INSERT INTO saved_businesses (user_id, business_id) VALUES ($1, $2)",
            [req.user.id, req.params.id],
        );
        res.json({ saved: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/businesses/:id/saved — check if saved
router.get("/:id/saved", auth, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM saved_businesses WHERE user_id = $1 AND business_id = $2",
            [req.user.id, req.params.id],
        );
        res.json({ saved: result.rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/businesses/saved/all — get all saved businesses for user
router.get("/saved/all", auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.name AS owner_name
       FROM saved_businesses s
       JOIN businesses b ON s.business_id = b.id
       JOIN users u ON b.owner_id = u.id
       WHERE s.user_id = $1
       ORDER BY s.saved_at DESC`,
            [req.user.id],
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
