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