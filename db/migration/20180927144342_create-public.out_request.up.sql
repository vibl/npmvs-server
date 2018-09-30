BEGIN;

  CREATE TABLE public.out_request (
    id         SERIAL PRIMARY KEY,
    body       jsonb NOT NULL,
    search     tsvector,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
  );

  CREATE INDEX idx_public_out_request ON public.outreq USING GIN(body jsonb_path_ops);
  CREATE INDEX idx_search_public_out_request ON public.outreq USING GIN( search );

  CREATE OR REPLACE FUNCTION massive_document_inserted()
    RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY definer
  AS $$
  BEGIN
    NEW.search = to_tsvector(NEW.body::text);
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
    NEW.search = to_tsvector(NEW.body::text);
    RETURN NEW;
  END;
  $$;

  CREATE TRIGGER public_out_request_inserted
  BEFORE INSERT
  ON public.outreq
  FOR EACH ROW EXECUTE PROCEDURE massive_document_inserted();

  CREATE TRIGGER public_out_request_updated
  BEFORE UPDATE ON public.outreq
  FOR EACH ROW EXECUTE PROCEDURE massive_document_updated();

  COMMENT ON TABLE public.outreq
  IS 'A document table generated with Massive.js.';
  COMMENT ON COLUMN public.outreq.id
  IS 'The document primary key. Will be added to the body when retrieved using Massive document functions';
  COMMENT ON COLUMN public.outreq.body
  IS 'The document body, stored without primary key.';
  COMMENT ON COLUMN public.outreq.search
  IS 'Search vector for full-text search support.';
  COMMENT ON COLUMN public.outreq.sent
  IS 'Timestamp for document creation.';
  COMMENT ON COLUMN public.outreq.sent
  IS 'Timestamp for the record''s last modification.';

COMMIT;