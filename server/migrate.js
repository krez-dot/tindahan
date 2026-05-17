const pool = require("./db");

const createTables = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS barangays (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        center_lat FLOAT,
        center_lng FLOAT
      );

      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id),
        barangay_id UUID REFERENCES barangays(id),
        name VARCHAR(150) NOT NULL,
        description TEXT,
        address VARCHAR(255),
        lat FLOAT,
        lng FLOAT,
        phone VARCHAR(20),
        hours JSONB,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        body TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("✅ All tables created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
};

createTables();