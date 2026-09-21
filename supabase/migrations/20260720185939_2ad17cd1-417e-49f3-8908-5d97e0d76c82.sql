REVOKE EXECUTE ON FUNCTION public.accrue_my_investments() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.request_withdrawal() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_withdrawal(numeric, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_investment_plan(text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.accrue_my_investments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_withdrawal() TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_withdrawal(numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_investment_plan(text) TO authenticated;