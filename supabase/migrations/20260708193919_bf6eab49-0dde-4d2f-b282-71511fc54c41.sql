
ALTER TABLE public.profiles DISABLE TRIGGER USER;
UPDATE public.profiles SET balance = 100000, updated_at = now() WHERE id = 'bdf58ad4-4157-4484-901c-fb88534554be';
ALTER TABLE public.profiles ENABLE TRIGGER USER;

INSERT INTO public.investments (user_id, plan_name, amount, daily_roi, duration_days, current_value, status, started_at)
VALUES ('bdf58ad4-4157-4484-901c-fb88534554be', 'Advanced', 100000, 3.8, 45, 100000, 'active', now());

INSERT INTO public.transactions (user_id, type, amount, status, note)
VALUES 
  ('bdf58ad4-4157-4484-901c-fb88534554be', 'deposit', 100000, 'completed', 'BTC deposit confirmed'),
  ('bdf58ad4-4157-4484-901c-fb88534554be', 'investment', 100000, 'active', 'Advanced plan started - AI trading activated');
