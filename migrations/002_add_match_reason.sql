-- 002_add_match_reason.sql
-- Persists the AI-generated reason text on each match pair.

ALTER TABLE matches ADD COLUMN reason TEXT;
