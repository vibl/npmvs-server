BEGIN;
  CREATE TABLE public.package_rawdata (
    id         SERIAL PRIMARY KEY,
    body       jsonb NOT NULL,
    search     tsvector,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
  );

  CREATE INDEX idx_public_package_rawdata ON public.package_old USING GIN(data jsonb_path_ops);
  CREATE INDEX idx_search_public_package_rawdata ON public.package_old USING GIN( search );

  CREATE OR REPLACE FUNCTION massive_document_inserted()
    RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY definer
  AS $$
  BEGIN
    NEW.search = to_tsvector(NEW.data::text);
    RETURN NEW;
  END;
  $$;

  CREATE OR REPLACE FUNCTION massive_document_updated()
    RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY definer
  AS $$
  BEGIN
    NEW.updated_at = now();
    NEW.search = to_tsvector(NEW.data::text);
    RETURN NEW;
  END;
  $$;

  CREATE TRIGGER public_package_rawdata_inserted
  BEFORE INSERT
  ON public.package_old
  FOR EACH ROW EXECUTE PROCEDURE massive_document_inserted();

  CREATE TRIGGER public_package_rawdata_updated
  BEFORE UPDATE ON public.package_old
  FOR EACH ROW EXECUTE PROCEDURE massive_document_updated();

  COMMENT ON TABLE public.package_old
  IS 'A document table generated with Massive.js.';
  COMMENT ON COLUMN public.package_old.id
  IS 'The document primary key. Will be added to the body when retrieved using Massive document functions';
  COMMENT ON COLUMN public.package_old.data
  IS 'The document body, stored without primary key.';
  COMMENT ON COLUMN public.package_old.search
  IS 'Search vector for full-text search support.';
  COMMENT ON COLUMN public.package_old.created_at
  IS 'Timestamp for document creation.';
  COMMENT ON COLUMN public.package_old.created_at
  IS 'Timestamp for the record''s last modification.';

COMMIT;