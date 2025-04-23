
-- Fix the list_all_users function to ensure correct return types
CREATE OR REPLACE FUNCTION public.list_all_users()
 RETURNS TABLE(user_id uuid, email text, role text, created_at timestamptz, last_sign_in timestamptz)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
    BEGIN
        -- Only allow admins to execute this function
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Permission denied: Requires admin privileges.';
        END IF;

        RETURN QUERY
        SELECT
            u.id as user_id,
            u.email::text,  -- Explicitly cast to text
            COALESCE(u.raw_app_meta_data ->> 'role', 'client')::text as role,  -- Ensure role is text
            u.created_at,
            u.last_sign_in_at as last_sign_in
        FROM auth.users u
        ORDER BY u.email;
    END;
$$;

-- Note to user: You'll need to run this SQL in the Supabase dashboard SQL Editor
-- to fix the type mismatch error in the list_all_users function
