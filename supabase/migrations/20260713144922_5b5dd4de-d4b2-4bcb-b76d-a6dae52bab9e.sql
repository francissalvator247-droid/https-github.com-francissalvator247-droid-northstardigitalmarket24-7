
-- Allow balance changes when made via a trusted SECURITY DEFINER routine
CREATE OR REPLACE FUNCTION public.prevent_profile_balance_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('app.allow_balance_change', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF NEW.balance IS DISTINCT FROM OLD.balance
     OR NEW.bonus_balance IS DISTINCT FROM OLD.bonus_balance
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_withdrawal(p_amount numeric, p_wallet text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_tx_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;
  IF p_wallet IS NULL OR length(btrim(p_wallet)) < 10 THEN
    RAISE EXCEPTION 'A valid wallet address is required';
  END IF;

  SELECT balance INTO v_balance FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  PERFORM set_config('app.allow_balance_change', 'on', true);
  UPDATE public.profiles SET balance = balance - p_amount, updated_at = now() WHERE id = v_uid;
  PERFORM set_config('app.allow_balance_change', 'off', true);

  INSERT INTO public.transactions (user_id, type, amount, status, note)
  VALUES (v_uid, 'withdrawal', p_amount, 'pending', 'Withdrawal to ' || p_wallet)
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_withdrawal(numeric, text) TO authenticated;
