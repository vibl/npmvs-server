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