-- Verify npmvs:appschema on pg

BEGIN;

SELECT pg_catalog.has_schema_privilege('npmvs', 'usage');

ROLLBACK;
