-- Revert npmvs:appschema from pg

BEGIN;

DROP SCHEMA npmvs;

COMMIT;
