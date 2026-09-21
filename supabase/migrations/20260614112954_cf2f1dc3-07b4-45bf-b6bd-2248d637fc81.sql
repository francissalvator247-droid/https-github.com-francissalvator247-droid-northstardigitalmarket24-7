
-- 1) Prevent balance/bonus_balance mutation by users via UPDATE on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_balance_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.balance IS DISTINCT FROM OLD.balance
     OR NEW.bonus_balance IS DISTINCT FROM OLD.bonus_balance
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_balance_change ON public.profiles;
CREATE TRIGGER trg_prevent_profile_balance_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_balance_change();

-- Also narrow column-level UPDATE privilege as defense in depth
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, email, updated_at) ON public.profiles TO authenticated;

-- 2) Revoke EXECUTE on SECURITY DEFINER functions from anon and PUBLIC.
--    Keep authenticated grant only where intended; handle_new_user is a trigger function only.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.start_investment_plan(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_investment_plan(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.accrue_my_investments() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accrue_my_investments() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.request_withdrawal() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal() TO authenticated;
