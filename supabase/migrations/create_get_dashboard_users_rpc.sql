CREATE OR REPLACE FUNCTION get_dashboard_users(
  page_number INT,
  page_limit INT,
  search_query TEXT,
  status_filter TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  user_metadata JSONB,
  role TEXT,
  is_active BOOLEAN,
  banned_until TIMESTAMPTZ,
  ban_reason TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_users AS (
    SELECT 
      u.id,
      u.email,
      u.created_at,
      u.last_sign_in_at,
      u.email_confirmed_at,
      u.raw_user_meta_data AS user_metadata,
      p.role,
      p.is_active,
      u.banned_until,
      p.ban_reason
    FROM auth.users u
    LEFT JOIN public.user_profiles p ON u.id = p.user_id
    WHERE
      (search_query IS NULL OR u.email ILIKE '%' || search_query || '%')
      AND
      (
        status_filter = 'all' OR
        (status_filter = 'active' AND p.is_active = TRUE AND u.banned_until IS NULL) OR
        (status_filter = 'inactive' AND p.is_active = FALSE) OR
        (status_filter = 'banned' AND u.banned_until IS NOT NULL)
      )
  )
  SELECT
    *,
    (SELECT COUNT(*) FROM filtered_users) AS total_count
  FROM filtered_users
  ORDER BY created_at DESC
  LIMIT page_limit
  OFFSET (page_number - 1) * page_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
