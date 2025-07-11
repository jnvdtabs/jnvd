-- Fix trigger for admin notifications to ensure it works correctly
-- Drop and recreate the trigger with proper error handling

DROP TRIGGER IF EXISTS notify_admin_on_new_user ON public.profiles;

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify for non-admin users
  IF NEW.role != 'admin' THEN
    -- Insert into pending_approvals table for admin review
    INSERT INTO public.pending_approvals (profile_id, user_email, full_name, role, requested_at)
    VALUES (NEW.id, 
            (SELECT email FROM auth.users WHERE id = NEW.user_id),
            NEW.full_name, 
            NEW.role, 
            NOW());
            
    -- Log for debugging
    RAISE NOTICE 'Admin notification trigger fired for user: % (role: %)', NEW.full_name, NEW.role;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER notify_admin_on_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user();

-- Also fix the issue where admin users created via trigger don't get approved by default
-- Update the handle_new_user function to auto-approve admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, approved)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
    -- Auto-approve admin users
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'teacher') = 'admin' THEN true 
      ELSE false 
    END
  );
  RETURN new;
END;
$$;