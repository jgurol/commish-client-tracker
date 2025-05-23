
-- Creates a secure function to get a user's profile without RLS conflicts
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
  role text,
  is_associated boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.role::text,
    p.is_associated
  FROM profiles p
  WHERE p.id = user_id;
END;
$$;
