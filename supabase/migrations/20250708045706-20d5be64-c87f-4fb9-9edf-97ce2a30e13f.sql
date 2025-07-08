-- Add approval status to profiles table
ALTER TABLE public.profiles ADD COLUMN approved BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN quiz_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN class_teacher_class TEXT;
ALTER TABLE public.profiles ADD COLUMN class_teacher_section TEXT;
ALTER TABLE public.profiles ADD COLUMN class_strength INTEGER;

-- Update existing profiles to be approved (for admin accounts)
UPDATE public.profiles SET approved = true WHERE role = 'admin';

-- Create a function to handle new user approval notifications
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify for non-admin users
  IF NEW.role != 'admin' THEN
    -- This will be handled by an edge function to send email
    INSERT INTO public.pending_approvals (profile_id, user_email, full_name, role, requested_at)
    VALUES (NEW.id, 
            (SELECT email FROM auth.users WHERE id = NEW.user_id),
            NEW.full_name, 
            NEW.role, 
            NOW());
  END IF;
  RETURN NEW;
END;
$$;

-- Create table for pending approvals
CREATE TABLE public.pending_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

-- Enable RLS on pending_approvals
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all pending approvals
CREATE POLICY "Admins can view all pending approvals"
ON public.pending_approvals
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Create policy for admins to update pending approvals
CREATE POLICY "Admins can update pending approvals"
ON public.pending_approvals
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Create trigger for new profile notifications
CREATE TRIGGER notify_admin_on_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user();

-- Update RLS policies for profiles to consider approval status
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view approved profiles"
ON public.profiles
FOR SELECT
USING (approved = true OR auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));