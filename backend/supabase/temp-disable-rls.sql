-- Temporarily disable RLS for testing
-- Run this in Supabase SQL Editor

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts DISABLE ROW LEVEL SECURITY;

-- After running the test, re-enable with:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
