BEGIN;

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION updated_now()
  RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  NEW.updated = now();
  RETURN NEW;
END;
$$;

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE outreq
(
  id       SERIAL PRIMARY KEY,
  sent     TIMESTAMPTZ DEFAULT now(),
  received TIMESTAMPTZ,
  error    INTEGER
);

CREATE INDEX outreq_error_index
  ON outreq (error);
CREATE INDEX outreq_received_index
  ON outreq (received);

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE public.package (
  id      SERIAL PRIMARY KEY,
  name    TEXT UNIQUE NOT NULL,
  data    JSONB,
  updated TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX package_name_index
  ON public.package (name);
CREATE INDEX package_updated_index
  ON public.package (updated);

CREATE TRIGGER package_updated
  BEFORE UPDATE
  ON public.package
  FOR EACH ROW EXECUTE PROCEDURE updated_now();

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE public.package_input (
  package INTEGER REFERENCES public.package NOT NULL,
  source  INTEGER REFERENCES public.source  NOT NULL,
  outreq  INTEGER REFERENCES public.outreq  NOT NULL,
  data    JSONB                             NOT NULL,
  updated TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX package_input_package_index
  ON public.package_input (package);
CREATE INDEX package_input_source_index
  ON public.package_input (source);
CREATE INDEX package_input_outreq_index
  ON public.package_input (outreq);
CREATE INDEX package_input_updated_index
  ON public.package_input (updated);

CREATE INDEX package_input_data_error_index
  ON public.package_input ((data ->> 'error'));

CREATE TRIGGER package_input_updated
  BEFORE UPDATE
  ON public.package_input
  FOR EACH ROW EXECUTE PROCEDURE updated_now();
--------------------------------------------------------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS package_input_details;
CREATE OR REPLACE VIEW package_input_details AS
  SELECT
    package.name AS package,
    source.short_name AS source,
    this.data,
    this.updated,
    this.package AS package_id,
    this.source  AS source_id
  FROM package_input this
    INNER JOIN package ON package.id = this.package
    INNER JOIN source ON source.id = this.source;
--------------------------------------------------------------------------------------------------------------------------------------------------------------------

--------------------------------------------------------------------------------------------------------------------------------------------------------------------

COMMIT;