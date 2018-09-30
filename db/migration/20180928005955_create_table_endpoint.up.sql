BEGIN;
CREATE TABLE endpoint (
  id         SERIAL PRIMARY KEY,
  name       TEXT,
  url        TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
COMMIT;

CREATE INDEX idx_endpoint_name ON source(full_name);
CREATE INDEX idx_endpoint_url ON source(url);



