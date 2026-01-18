-- Manual migration: add 'not_made' to promise status
-- Run if "Mark as Not Made" fails with a check constraint error and backend restart didn't apply it.
--
-- psql $DATABASE_URL -f scripts/migrate-add-not-made-status.sql
-- or: psql -h localhost -U postgres -d promise_tracker -f scripts/migrate-add-not-made-status.sql

-- Drop existing status check (name may vary)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'promises' AND c.contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE promises DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE promises DROP CONSTRAINT IF EXISTS promises_status_check;

ALTER TABLE promises ADD CONSTRAINT promises_status_check
  CHECK (status IN ('ongoing', 'completed', 'overdue', 'declined', 'not_made'));
