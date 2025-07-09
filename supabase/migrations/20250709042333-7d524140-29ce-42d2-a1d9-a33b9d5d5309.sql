-- Fix infinite recursion in profiles RLS policies by creating a security definer function

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view approved profiles" ON public.profiles;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policy using the security definer function
CREATE POLICY "Users can view approved profiles" 
ON public.profiles 
FOR SELECT 
USING (
  approved = true 
  OR auth.uid() = user_id 
  OR public.get_current_user_role() = 'admin'
);