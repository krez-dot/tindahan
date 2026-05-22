const pool = require("./db");

const createTables = async () => {
    try {
        // Base tables
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

      CREATE TABLE IF NOT EXISTS saved_businesses (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, business_id)
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        body TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS business_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // Incremental migrations — safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
        await pool.query(`
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS hours TEXT;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_requested BOOLEAN DEFAULT FALSE;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_rejection_reason TEXT;
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS business_categories (
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (business_id, category_id)
      );
    `);

        // Migrate existing single-category data into business_categories
        await pool.query(`
      INSERT INTO business_categories (business_id, category_id)
      SELECT id, category_id FROM businesses WHERE category_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    `);

        console.log("✅ All tables and migrations applied successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
};

createTables();
