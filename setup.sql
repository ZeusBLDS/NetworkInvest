
-- ==========================================
-- 1. LIMPEZA E RESET
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP TABLE IF EXISTS public.deposits CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==========================================
-- 2. TABELA DE PERFIS (PROFILES)
-- ==========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT DEFAULT 'Direto',
  balance DECIMAL(12,2) DEFAULT 0,
  wallet_address TEXT,
  active_plan_id TEXT DEFAULT 'vip0',
  role TEXT DEFAULT 'USER', 
  status TEXT DEFAULT 'ACTIVE',
  total_invested DECIMAL(12,2) DEFAULT 0,
  total_withdrawn DECIMAL(12,2) DEFAULT 0,
  is_first_login BOOLEAN DEFAULT TRUE,
  check_in_streak INTEGER DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  last_wheel_spin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. TABELAS FINANCEIRAS
-- ==========================================
CREATE TABLE public.deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  amount DECIMAL(12,2) NOT NULL,
  hash TEXT NOT NULL,
  plan_id TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  amount DECIMAL(12,2) NOT NULL,
  wallet TEXT NOT NULL,
  fee DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. FUNÇÕES DE AUTOMAÇÃO (SECURITY DEFINER)
-- ==========================================

-- Cria o perfil automaticamente quando alguém se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, referred_by, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'referred_by', 'Direto'),
    upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função simplificada de Admin para evitar erros de loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seu próprio perfil e admins veem tudo
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id OR role = 'ADMIN');

-- Regras para Depósitos e Saques
CREATE POLICY "deposits_access" ON public.deposits FOR ALL USING (auth.uid() = user_id OR (SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "withdrawals_access" ON public.withdrawals FOR ALL USING (auth.uid() = user_id OR (SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid()));
