
-- 1. LIMPEZA TOTAL (CUIDADO: APAGA DADOS EXISTENTES)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.deposits CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABELA DE PERFIS (ESTRUTURA COMPLETA)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT DEFAULT 'Direto', -- Armazena o CÓDIGO de quem indicou
  balance DECIMAL(12,2) DEFAULT 0,
  wallet_address TEXT,
  active_plan_id TEXT DEFAULT 'vip0',
  role TEXT DEFAULT 'USER', 
  status TEXT DEFAULT 'ACTIVE',
  total_invested DECIMAL(12,2) DEFAULT 0,
  total_withdrawn DECIMAL(12,2) DEFAULT 0,
  network_earnings DECIMAL(12,2) DEFAULT 0, -- Total ganho com indicações
  is_first_login BOOLEAN DEFAULT TRUE,
  check_in_streak INTEGER DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  last_wheel_spin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE DEPÓSITOS E CONTRATOS
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

-- 4. TABELA DE SAQUES
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

-- 5. AUTOMAÇÃO: CRIAR PERFIL AO REGISTRAR
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

-- 6. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis visíveis para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil ou admin" ON public.profiles FOR UPDATE USING (auth.uid() = id OR (SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Acesso total depósitos (Dono/Admin)" ON public.deposits FOR ALL USING (auth.uid() = user_id OR (SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Acesso total saques (Dono/Admin)" ON public.withdrawals FOR ALL USING (auth.uid() = user_id OR (SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid()));
