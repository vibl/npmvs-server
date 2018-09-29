BEGIN;

  ALTER TABLE package_old
      ADD COLUMN out_request INTEGER REFERENCES public.outreq NOT NULL;

COMMIT;