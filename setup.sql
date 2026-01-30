
-- 1. TABELA DE PERFIS (Reforçada)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT DEFAULT 'Direto',
  balance DECIMAL(12,2) DEFAULT 0 CHECK (balance >= 0),
  wallet_address TEXT,
  active_plan_id TEXT DEFAULT NULL,
  plan_activated_at TIMESTAMPTZ DEFAULT NULL, -- COLUNA ADICIONADA PARA CONTROLE DE TEMPO
  role TEXT DEFAULT 'USER', 
  status TEXT DEFAULT 'ACTIVE',
  total_invested DECIMAL(12,2) DEFAULT 0,
  total_withdrawn DECIMAL(12,2) DEFAULT 0,
  network_earnings DECIMAL(12,2) DEFAULT 0,
  is_first_login BOOLEAN DEFAULT TRUE,
  check_in_streak INTEGER DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  last_wheel_spin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Se a tabela já existe, execute apenas este comando no SQL Editor do Supabase:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ DEFAULT NULL;

-- Índices para performance em buscas de rede
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- 2. TABELA DE TAREFAS
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward DECIMAL(12,2) DEFAULT 0,
  plan_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE DEPÓSITOS
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  amount DECIMAL(12,2),
  hash TEXT,
  plan_id TEXT,
  method TEXT DEFAULT 'USDT',
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE SAQUES
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  amount DECIMAL(12,2),
  wallet TEXT,
  method TEXT DEFAULT 'USDT',
  fee DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HABILITAR RLS (Segurança de Nível de Linha)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURANÇA REFORÇADAS

-- Funções auxiliares para checar Admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Users can update limited fields" ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND (
    (OLD.balance = NEW.balance) AND 
    (OLD.role = NEW.role) AND
    (OLD.referral_code = NEW.referral_code)
  )
);

-- POLÍTICAS PARA DEPÓSITOS
CREATE POLICY "Users view own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all deposits" ON public.deposits FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update deposits" ON public.deposits FOR UPDATE USING (public.is_admin());

-- POLÍTICAS PARA SAQUES
CREATE POLICY "Users view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all withdrawals" ON public.withdrawals FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update withdrawals" ON public.withdrawals FOR UPDATE USING (public.is_admin());

-- POLÍTICAS PARA TAREFAS
CREATE POLICY "Users view own tasks" ON public.user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
