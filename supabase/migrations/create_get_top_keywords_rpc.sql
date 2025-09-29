CREATE OR REPLACE FUNCTION get_top_keywords(limit_count INT)
RETURNS TABLE(keyword TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    LOWER(jsonb_array_elements_text(d.analysis -> 'keywords')) AS keyword,
    COUNT(*) AS count
  FROM dreams d
  WHERE d.analysis -> 'keywords' IS NOT NULL
  GROUP BY keyword
  ORDER BY count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
