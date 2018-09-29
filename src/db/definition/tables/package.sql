BEGIN;

CREATE TABLE public.package (
  id SERIAL PRIMARY KEY,
  name text UNIQUE NOT NULL,
  data jsonb,
  updated timestamptz DEFAULT now()
);
CREATE INDEX package_name_index ON public.package(name);
CREATE INDEX package_updated_index ON public.package(updated);

CREATE TRIGGER package_updated
  BEFORE UPDATE ON public.package
  FOR EACH ROW EXECUTE PROCEDURE updated_now();

COMMIT;