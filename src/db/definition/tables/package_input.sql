BEGIN;

CREATE TABLE public.package_input (
  package INTEGER REFERENCES public.package NOT NULL,
  source INTEGER REFERENCES public.source NOT NULL,
  outreq INTEGER REFERENCES public.outreq NOT NULL,
  data jsonb NOT NULL,
  updated timestamptz DEFAULT now()
);
CREATE INDEX package_input_package_index ON public.package_input(package);
CREATE INDEX package_input_source_index ON public.package_input(source);
CREATE INDEX package_input_outreq_index ON public.package_input(outreq);
CREATE INDEX package_input_updated_index ON public.package_input(updated);

CREATE INDEX package_input_data_error_index ON public.package_input ((data->>'error'));

CREATE TRIGGER package_input_updated
  BEFORE UPDATE ON public.package_input
  FOR EACH ROW EXECUTE PROCEDURE updated_now();

COMMIT;