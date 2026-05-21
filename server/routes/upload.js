const express = require("express");
const router = express.Router();
const { upload } = require("../cloudinary");
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

// POST /api/upload/:businessId — upload a photo
router.post("/:businessId", auth, upload.single("photo"), async (req, res) => {
    try {
        const { businessId } = req.params;

        const business = await pool.query(
            "SELECT * FROM businesses WHERE id = $1",
            [businessId]
        );
        if (business.rows.length === 0) {
            return res.status(404).json({ error: "Business not found" });
        }
        if (business.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const result = await pool.query(
            `INSERT INTO business_photos (business_id, url)
       VALUES ($1, $2) RETURNING *`,
            [businessId, req.file.path]
        );

        res.status(201).json({ url: req.file.path, photo: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Upload failed" });
    }
});

// GET /api/upload/:businessId — get all photos
router.get("/:businessId", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM business_photos WHERE business_id = $1 ORDER BY id DESC",
            [req.params.businessId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/upload/:photoId — delete a photo (owner only)
router.delete("/:photoId", auth, async (req, res) => {
    try {
        const photo = await pool.query(
            `SELECT bp.*, b.owner_id FROM business_photos bp
             JOIN businesses b ON bp.business_id = b.id
             WHERE bp.id = $1`,
            [req.params.photoId]
        );
        if (photo.rows.length === 0) return res.status(404).json({ error: "Photo not found" });
        if (photo.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: "Not authorized" });

        await pool.query("DELETE FROM business_photos WHERE id = $1", [req.params.photoId]);
        res.json({ message: "Photo deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;