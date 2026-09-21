
-- 1) PROFILES: restrict UPDATE to safe columns only
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- 2) INVESTMENTS: remove direct INSERT/UPDATE from users
REVOKE INSERT, UPDATE ON public.investments FROM authenticated;

-- 3) TRANSACTIONS: remove direct INSERT from users
REVOKE INSERT ON public.transactions FROM authenticated;

-- Drop now-unneeded policies (privileges already revoked, but keep schema tidy)
DROP POLICY IF EXISTS "own inv insert" ON public.investments;
DROP POLICY IF EXISTS "own inv update" ON public.investments;
DROP POLICY IF EXISTS "own tx insert" ON public.transactions;

-- 4) SECURITY DEFINER: start an investment plan (validates against known plans)
CREATE OR REPLACE FUNCTION public.start_investment_plan(p_plan_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_amount numeric;
  v_roi numeric;
  v_days int;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  CASE p_plan_name
    WHEN 'Starter'  THEN v_amount := 60000;  v_roi := 2.5; v_days := 30;
    WHEN 'Advanced' THEN v_amount := 100000; v_roi := 3.8; v_days := 45;
    WHEN 'Premium'  THEN v_amount := 200000; v_roi := 5.2; v_days := 60;
    ELSE RAISE EXCEPTION 'Unknown plan: %', p_plan_name;
  END CASE;

  INSERT INTO public.investments (user_id, plan_name, amount, daily_roi, duration_days, current_value, status, started_at)
  VALUES (v_uid, p_plan_name, v_amount, v_roi, v_days, v_amount, 'active', now())
  RETURNING id INTO v_id;

  INSERT INTO public.transactions (user_id, type, amount, status, note)
  VALUES (v_uid, 'investment', v_amount, 'active', p_plan_name || ' plan started');

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_investment_plan(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_investment_plan(text) TO authenticated;

-- 5) SECURITY DEFINER: request a withdrawal (always pending, amount 0)
CREATE OR REPLACE FUNCTION public.request_withdrawal()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.transactions (user_id, type, amount, status, note)
  VALUES (v_uid, 'withdrawal', 0, 'pending', 'Withdrawal requested');
END;
$$;

REVOKE ALL ON FUNCTION public.request_withdrawal() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_withdrawal() TO authenticated;

-- 6) SECURITY DEFINER: accrue current_value on caller's active investments
-- Computes value from elapsed time since started_at, capped at duration_days.
CREATE OR REPLACE FUNCTION public.accrue_my_investments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.investments
  SET current_value = amount * (
        1 + (daily_roi / 100.0) *
        LEAST(
          EXTRACT(EPOCH FROM (now() - started_at)) / 86400.0,
          duration_days::numeric
        )
      )
  WHERE user_id = v_uid
    AND status = 'active';
END;
$$;

REVOKE ALL ON FUNCTION public.accrue_my_investments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accrue_my_investments() TO authenticated;
