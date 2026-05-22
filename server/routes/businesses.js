const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/mailer");

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

// GET /api/businesses — get businesses with optional pagination (?page=1&limit=12)
router.get("/", async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    try {
        const [dataResult, countResult] = await Promise.all([
            pool.query(
                `SELECT b.*, u.name AS owner_name,
                 (SELECT string_agg(c.name, ',' ORDER BY c.id) FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id) AS categories,
                 (SELECT c.name FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id ORDER BY c.id LIMIT 1) AS category,
                 (SELECT string_agg(bc.category_id::text, ',' ORDER BY bc.category_id) FROM business_categories bc WHERE bc.business_id = b.id) AS category_ids_str,
                 (SELECT url FROM business_photos WHERE business_id = b.id ORDER BY id ASC LIMIT 1) AS cover_photo,
                 (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE business_id = b.id) AS avg_rating,
                 (SELECT COUNT(*) FROM reviews WHERE business_id = b.id) AS review_count
                 FROM businesses b
                 JOIN users u ON b.owner_id = u.id
                 ORDER BY b.created_at DESC
                 LIMIT $1 OFFSET $2`,
                [limit, offset]
            ),
            pool.query("SELECT COUNT(*) FROM businesses"),
        ]);

        const total = parseInt(countResult.rows[0].count);
        res.json({
            businesses: dataResult.rows,
            total,
            page,
            limit,
            hasMore: offset + dataResult.rows.length < total,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin-only middleware
const adminAuth = (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
    next();
};

// GET /api/businesses/admin/verification-requests — admin only
// NOTE: must come BEFORE /:id
router.get("/admin/verification-requests", auth, adminAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.name AS owner_name,
             (SELECT string_agg(c.name, ',' ORDER BY c.id) FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id) AS categories,
             (SELECT c.name FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id ORDER BY c.id LIMIT 1) AS category,
             (SELECT url FROM business_photos WHERE business_id = b.id ORDER BY id ASC LIMIT 1) AS cover_photo
             FROM businesses b
             JOIN users u ON b.owner_id = u.id
             WHERE b.verification_requested = true
             ORDER BY b.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/businesses/saved/all — get all saved businesses for user
// NOTE: this must come BEFORE /:id so Express doesn't treat "saved" as an id
router.get("/saved/all", auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.name AS owner_name,
             (SELECT string_agg(c.name, ',' ORDER BY c.id) FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id) AS categories,
             (SELECT c.name FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id ORDER BY c.id LIMIT 1) AS category
             FROM saved_businesses s
             JOIN businesses b ON s.business_id = b.id
             JOIN users u ON b.owner_id = u.id
             WHERE s.user_id = $1
             ORDER BY s.saved_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/businesses/search/ai?q=query — AI-powered search
// NOTE: must come BEFORE /:id
router.get("/search/ai", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "No query provided" });

    try {
        const aiRes = await fetch(`${process.env.AI_SERVICE_URL || "http://localhost:5001"}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: q }),
        });
        const aiData = await aiRes.json();

        let query = `
            SELECT b.*, u.name AS owner_name, c.name AS category
            FROM businesses b
            JOIN users u ON b.owner_id = u.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        // Filter by detected categories
        if (aiData.detected_categories?.length > 0) {
            const catPlaceholders = aiData.detected_categories.map(() => `$${paramCount++}`);
            aiData.detected_categories.forEach(cat => params.push(cat));
            query += ` AND c.name ILIKE ANY(ARRAY[${catPlaceholders.join(",")}])`;
        }

        // Filter by search terms
        if (aiData.search_terms?.length > 0) {
            const termConditions = aiData.search_terms.map((term) => {
                params.push(`%${term}%`);
                const idx = paramCount++;
                return `(b.name ILIKE $${idx} OR b.description ILIKE $${idx} OR b.address ILIKE $${idx})`;
            });
            query += ` AND (${termConditions.join(" OR ")})`;
        }

        query += ` ORDER BY b.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({ results: result.rows, ai_interpretation: aiData });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Search failed" });
    }
});

// GET /api/businesses/:id — get single business
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, u.name AS owner_name,
             (SELECT string_agg(c.name, ',' ORDER BY c.id) FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id) AS categories,
             (SELECT c.name FROM business_categories bc JOIN categories c ON bc.category_id = c.id WHERE bc.business_id = b.id ORDER BY c.id LIMIT 1) AS category,
             (SELECT string_agg(bc.category_id::text, ',' ORDER BY bc.category_id) FROM business_categories bc WHERE bc.business_id = b.id) AS category_ids_str,
             (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE business_id = b.id) AS avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE business_id = b.id) AS review_count
             FROM businesses b
             JOIN users u ON b.owner_id = u.id
             WHERE b.id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Business not found" });
        // Increment view count async — don't await so it doesn't slow the response
        pool.query("UPDATE businesses SET view_count = view_count + 1 WHERE id = $1", [req.params.id]).catch(() => {});
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
    const { name, description, address, lat, lng, phone, category_ids, barangay_id } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Business name is required" });
    }
    if (name.length > 200) {
        return res.status(400).json({ error: "Business name must be under 200 characters" });
    }
    if (description && description.length > 5000) {
        return res.status(400).json({ error: "Description must be under 5000 characters" });
    }
    try {
        const result = await pool.query(
            `INSERT INTO businesses (owner_id, name, description, address, lat, lng, phone, barangay_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [req.user.id, name, description, address, lat, lng, phone, barangay_id]
        );
        const businessId = result.rows[0].id;
        if (Array.isArray(category_ids) && category_ids.length > 0) {
            for (const catId of category_ids) {
                await pool.query(
                    "INSERT INTO business_categories (business_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [businessId, catId]
                );
            }
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/businesses/:id — update a business (owner only)
router.put("/:id", auth, async (req, res) => {
    const { name, description, address, lat, lng, phone, hours, category_ids } = req.body;
    try {
        const existing = await pool.query("SELECT * FROM businesses WHERE id = $1", [req.params.id]);
        if (existing.rows.length === 0) return res.status(404).json({ error: "Business not found" });
        if (existing.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: "Not authorized" });

        const result = await pool.query(
            `UPDATE businesses SET name=$1, description=$2, address=$3, lat=$4, lng=$5, phone=$6, hours=$7
             WHERE id=$8 RETURNING *`,
            [name, description, address, lat, lng, phone, hours || null, req.params.id]
        );
        if (Array.isArray(category_ids)) {
            await pool.query("DELETE FROM business_categories WHERE business_id = $1", [req.params.id]);
            for (const catId of category_ids) {
                await pool.query(
                    "INSERT INTO business_categories (business_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [req.params.id, catId]
                );
            }
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/businesses/:id — delete a business (owner only)
router.delete("/:id", auth, async (req, res) => {
    try {
        const existing = await pool.query("SELECT * FROM businesses WHERE id = $1", [req.params.id]);
        if (existing.rows.length === 0) return res.status(404).json({ error: "Business not found" });
        if (existing.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: "Not authorized" });

        await pool.query("DELETE FROM businesses WHERE id = $1", [req.params.id]);
        res.json({ message: "Business deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/businesses/:id/save — toggle save
router.post("/:id/save", auth, async (req, res) => {
    try {
        const existing = await pool.query(
            "SELECT * FROM saved_businesses WHERE user_id = $1 AND business_id = $2",
            [req.user.id, req.params.id]
        );
        if (existing.rows.length > 0) {
            await pool.query("DELETE FROM saved_businesses WHERE user_id = $1 AND business_id = $2",
                [req.user.id, req.params.id]);
            return res.json({ saved: false });
        }
        await pool.query("INSERT INTO saved_businesses (user_id, business_id) VALUES ($1, $2)",
            [req.user.id, req.params.id]);
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
            [req.user.id, req.params.id]
        );
        res.json({ saved: result.rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/businesses/:id/analytics — owner only
router.get("/:id/analytics", auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
               b.view_count,
               (SELECT COUNT(*) FROM saved_businesses WHERE business_id = b.id) AS save_count,
               (SELECT COUNT(*) FROM reviews WHERE business_id = b.id) AS review_count,
               (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE business_id = b.id) AS avg_rating
             FROM businesses b WHERE b.id = $1 AND b.owner_id = $2`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/businesses/:id/request-verification — owner requests verification
router.post("/:id/request-verification", auth, async (req, res) => {
    try {
        const existing = await pool.query("SELECT * FROM businesses WHERE id = $1", [req.params.id]);
        if (existing.rows.length === 0) return res.status(404).json({ error: "Business not found" });
        if (existing.rows[0].owner_id !== req.user.id) return res.status(403).json({ error: "Not authorized" });
        if (existing.rows[0].is_verified) return res.status(400).json({ error: "Business is already verified" });

        await pool.query(
            "UPDATE businesses SET verification_requested = true, verification_rejection_reason = NULL WHERE id = $1",
            [req.params.id]
        );
        res.json({ message: "Verification requested successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/businesses/:id/verify — admin approves verification
router.put("/:id/verify", auth, adminAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE businesses SET is_verified = true, verification_requested = false WHERE id = $1
             RETURNING name, owner_id`,
            [req.params.id]
        );
        if (result.rows.length > 0) {
            const { name, owner_id } = result.rows[0];
            const ownerRes = await pool.query("SELECT email FROM users WHERE id = $1", [owner_id]);
            if (ownerRes.rows.length > 0) {
                sendMail({
                    to: ownerRes.rows[0].email,
                    subject: `✅ "${name}" is now verified on Tindahan!`,
                    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
                        <h2 style="color:#e8601c">Your business is verified! 🎉</h2>
                        <p>Congratulations! <strong>${name}</strong> has been verified on Tindahan.</p>
                        <p>A verified badge will now appear on your listing, helping customers trust your business.</p>
                        <a href="${process.env.APP_URL || "http://localhost:5173"}" style="display:inline-block;margin-top:12px;padding:10px 22px;background:#e8601c;color:white;border-radius:8px;text-decoration:none;font-weight:700">Visit Tindahan</a>
                        <p style="margin-top:24px;font-size:13px;color:#aaa">Tindahan — Discover Local Businesses</p>
                    </div>`,
                });
            }
        }
        res.json({ message: "Business verified" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/businesses/:id/reject-verification — admin rejects with optional reason
router.put("/:id/reject-verification", auth, adminAuth, async (req, res) => {
    const { reason } = req.body;
    const trimmedReason = reason?.trim() || null;
    try {
        const result = await pool.query(
            `UPDATE businesses SET verification_requested = false, verification_rejection_reason = $1 WHERE id = $2
             RETURNING name, owner_id`,
            [trimmedReason, req.params.id]
        );
        if (result.rows.length > 0) {
            const { name, owner_id } = result.rows[0];
            const ownerRes = await pool.query("SELECT email FROM users WHERE id = $1", [owner_id]);
            if (ownerRes.rows.length > 0) {
                sendMail({
                    to: ownerRes.rows[0].email,
                    subject: `Your verification request for "${name}" was not approved`,
                    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
                        <h2 style="color:#cc3300">Verification not approved</h2>
                        <p>Your verification request for <strong>${name}</strong> was reviewed but not approved at this time.</p>
                        ${trimmedReason ? `<p><strong>Reason:</strong> ${trimmedReason}</p>` : ""}
                        <p>You can update your listing and submit a new verification request from your dashboard.</p>
                        <a href="${process.env.APP_URL || "http://localhost:5173"}/dashboard" style="display:inline-block;margin-top:12px;padding:10px 22px;background:#e8601c;color:white;border-radius:8px;text-decoration:none;font-weight:700">Go to Dashboard</a>
                        <p style="margin-top:24px;font-size:13px;color:#aaa">Tindahan — Discover Local Businesses</p>
                    </div>`,
                });
            }
        }
        res.json({ message: "Verification request rejected" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;