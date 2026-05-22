CREATE TABLE IF NOT EXISTS business_categories (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, category_id)
);

-- Migrate existing single-category data
INSERT INTO business_categories (business_id, category_id)
SELECT id, category_id FROM businesses WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;
