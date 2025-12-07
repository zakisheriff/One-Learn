-- Test if tables exist in Supabase
-- Run this in Supabase SQL Editor to verify schema is imported

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- If the above returns empty or missing tables, run the full schema below:
-- Copy everything from backend/database/schema.sql and run it
