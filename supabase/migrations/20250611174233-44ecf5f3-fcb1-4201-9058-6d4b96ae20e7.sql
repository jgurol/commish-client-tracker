
-- Check if RLS is enabled on transactions table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'transactions';

-- Check existing RLS policies on transactions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'transactions';

-- Let's also check what transactions exist in the database
SELECT count(*) as total_transactions FROM public.transactions;

-- Check if there are any transactions for your user specifically
SELECT count(*) as user_transactions 
FROM public.transactions 
WHERE user_id = 'bb889dd4-db52-46bf-a56a-327f81dde51f';
