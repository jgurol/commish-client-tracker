
-- Add last_login column to profiles table to track when users last logged in
ALTER TABLE public.profiles 
ADD COLUMN last_login timestamp with time zone;

-- Create a function to update last login timestamp
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update the last_login timestamp when a user signs in
  UPDATE public.profiles 
  SET last_login = now() 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create a trigger to automatically update last_login on auth events
-- Note: This trigger will be on auth.users, but we'll update our public.profiles table
CREATE OR REPLACE FUNCTION public.handle_auth_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update last_login in profiles table when user data is updated in auth.users
  -- This happens on login events
  UPDATE public.profiles 
  SET last_login = now() 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- We'll handle login tracking in the application code instead of triggers
-- since auth.users table triggers can be complex to manage
