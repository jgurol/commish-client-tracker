
-- First, let's disable RLS temporarily to check if there's any data
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- Check if there are any transactions in the table
SELECT id, amount, description, client_id, user_id, created_at 
FROM public.transactions 
LIMIT 5;

-- If no data exists, let's create some test transactions for you
-- First, create a test agent with a proper UUID
INSERT INTO public.agents (id, first_name, last_name, email, commission_rate, company_name, user_id)
VALUES (
  gen_random_uuid(),
  'Test',
  'Agent',
  'test@example.com',
  10.0,
  'Test Company',
  'bb889dd4-db52-46bf-a56a-327f81dde51f'
) ON CONFLICT (id) DO NOTHING;

-- Get the agent ID we just created (or an existing one)
DO $$
DECLARE
    agent_uuid UUID;
BEGIN
    -- Get any agent ID from the agents table, or create one if none exists
    SELECT id INTO agent_uuid FROM public.agents LIMIT 1;
    
    IF agent_uuid IS NULL THEN
        agent_uuid := gen_random_uuid();
        INSERT INTO public.agents (id, first_name, last_name, email, commission_rate, company_name, user_id)
        VALUES (agent_uuid, 'Test', 'Agent', 'test@example.com', 10.0, 'Test Company', 'bb889dd4-db52-46bf-a56a-327f81dde51f');
    END IF;
    
    -- Create some test transactions using the agent ID
    INSERT INTO public.transactions (
      amount,
      client_id,
      user_id,
      date,
      description,
      commission,
      is_paid,
      is_approved
    ) VALUES 
    (1000.00, agent_uuid, 'bb889dd4-db52-46bf-a56a-327f81dde51f', CURRENT_DATE, 'Test Transaction 1', 100.00, true, true),
    (2000.00, agent_uuid, 'bb889dd4-db52-46bf-a56a-327f81dde51f', CURRENT_DATE, 'Test Transaction 2', 200.00, false, false),
    (1500.00, agent_uuid, 'bb889dd4-db52-46bf-a56a-327f81dde51f', CURRENT_DATE, 'Test Transaction 3', 150.00, true, false)
    ON CONFLICT DO NOTHING;
END $$;

-- Now set up proper RLS policies that allow admins to see all data
-- Re-enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;

-- Create a policy for admins to see all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Create a policy for agents to see only their own transactions
CREATE POLICY "Agents can view their own transactions" ON public.transactions
FOR SELECT USING (
  user_id = auth.uid() OR 
  client_id IN (
    SELECT associated_agent_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Allow admins to insert transactions
CREATE POLICY "Admins can insert transactions" ON public.transactions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Allow admins to update transactions
CREATE POLICY "Admins can update transactions" ON public.transactions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Allow admins to delete transactions
CREATE POLICY "Admins can delete transactions" ON public.transactions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);
