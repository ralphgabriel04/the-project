-- ============================================
-- Migration: Create function to get user ID by email
-- Needed for athlete invitation system
-- ============================================

-- Function to find user by email (SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id
  FROM auth.users au
  WHERE LOWER(au.email) = LOWER(user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_id_by_email TO authenticated;








