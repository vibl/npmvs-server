-- auto-generated definition
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

