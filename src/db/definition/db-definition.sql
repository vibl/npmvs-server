BEGIN;

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION updated_now()
  RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
CREATE TABLE package (
  id      SERIAL PRIMARY KEY,
  name    TEXT UNIQUE NOT NULL,
  data    JSONB,
  updated TIMESTAMPTZ DEFAULT now(),
  dirty BOOLEAN DEFAULT TRUE
);
CREATE INDEX package_name_index
  ON package (name);
CREATE INDEX package_updated_index
  ON package (updated);
CREATE INDEX package_dirty_index
  ON package (dirty);

CREATE TRIGGER package_updated
  BEFORE UPDATE
  ON package
  FOR EACH ROW EXECUTE PROCEDURE updated_now();

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE source
(
  id         SERIAL PRIMARY KEY,
  full_name  TEXT,
  url        TEXT,
  short_name TEXT
);

CREATE INDEX source_full_name_index
  ON source (full_name);

CREATE INDEX source_url_index
  ON source (url);

CREATE INDEX source_short_name_index
  ON source (short_name);
--------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE TABLE package_input (
  package_id INTEGER REFERENCES package NOT NULL,
  source_id  INTEGER REFERENCES source  NOT NULL,
  outreq_id  INTEGER REFERENCES outreq  NOT NULL,
  data    JSONB                             NOT NULL,
  updated TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT package_input_pk PRIMARY KEY (package, source)
);

CREATE INDEX package_input_package_index
  ON package_input (package_id);
CREATE INDEX package_input_source_index
  ON package_input (source_id);
CREATE INDEX package_input_outreq_index
  ON package_input (outreq_id);
CREATE INDEX package_input_updated_index
  ON package_input (updated);

CREATE INDEX package_input_data_error_index
  ON package_input ((data ->> 'error'));

CREATE TRIGGER package_input_updated
  BEFORE UPDATE
  ON package_input
  FOR EACH ROW EXECUTE PROCEDURE updated_now();

--------------------------------------------------------------------------------------------------------------------------------------------------------------------
DROP VIEW IF EXISTS package_input_details;
CREATE OR REPLACE VIEW package_input_details AS
  SELECT
    package.name      AS package,
    source.short_name AS source,
    this.data,
    this.updated,
    this.package_id      AS package_id,
    this.source_id       AS source_id,
    outreq.error      AS error
  FROM package_input this
    INNER JOIN package ON package.id = this.package_id
    INNER JOIN source ON source.id = this.source_id
    INNER JOIN outreq ON outreq.id = this.outreq_id;
--------------------------------------------------------------------------------------------------------------------------------------------------------------------

--------------------------------------------------------------------------------------------------------------------------------------------------------------------

COMMIT;