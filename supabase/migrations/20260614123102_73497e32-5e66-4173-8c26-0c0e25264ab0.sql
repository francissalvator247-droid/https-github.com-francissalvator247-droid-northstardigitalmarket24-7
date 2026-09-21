CREATE OR REPLACE FUNCTION public.start_investment_plan(p_plan_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    WHEN 'Micro'    THEN v_amount := 5000;    v_roi := 1.2; v_days := 14;
    WHEN 'Basic'    THEN v_amount := 15000;   v_roi := 1.8; v_days := 21;
    WHEN 'Standard' THEN v_amount := 30000;   v_roi := 2.1; v_days := 28;
    WHEN 'Starter'  THEN v_amount := 60000;   v_roi := 2.5; v_days := 30;
    WHEN 'Advanced' THEN v_amount := 100000;  v_roi := 3.8; v_days := 45;
    WHEN 'Premium'  THEN v_amount := 200000;  v_roi := 5.2; v_days := 60;
    WHEN 'Elite'    THEN v_amount := 500000;  v_roi := 6.5; v_days := 90;
    WHEN 'VIP'      THEN v_amount := 1000000; v_roi := 8.0; v_days := 120;
    ELSE RAISE EXCEPTION 'Unknown plan: %', p_plan_name;
  END CASE;

  INSERT INTO public.investments (user_id, plan_name, amount, daily_roi, duration_days, current_value, status, started_at)
  VALUES (v_uid, p_plan_name, v_amount, v_roi, v_days, v_amount, 'active', now())
  RETURNING id INTO v_id;

  INSERT INTO public.transactions (user_id, type, amount, status, note)
  VALUES (v_uid, 'investment', v_amount, 'active', p_plan_name || ' plan started');

  RETURN v_id;
END;
$function$;