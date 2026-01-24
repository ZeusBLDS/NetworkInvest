
-- GARANTINDO COLUNAS DE REDE (Caso já existam tabelas)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='network_earnings') THEN
        ALTER TABLE public.profiles ADD COLUMN network_earnings DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- 1. LIMPEZA TOTAL (OPCIONAL - USAR APENAS SE QUISER RESETAR TUDO)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
-- DROP TABLE IF EXISTS public.deposits CASCADE;
-- DROP TABLE IF EXISTS public.withdrawals CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CRIAÇÃO DA TABELA DE PERFIS (ESTRUTURA COMPLETA)
CREATE TABLE IF NOT EXISTS public.profiles (
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
  network_earnings DECIMAL(12,2) DEFAULT 0,
  is_first_login BOOLEAN DEFAULT TRUE,
  check_in_streak INTEGER DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  last_wheel_spin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE DEPÓSITOS
CREATE TABLE IF NOT EXISTS public.deposits (
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
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  amount DECIMAL(12,2) NOT NULL,
  wallet TEXT NOT NULL,
  fee DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRIGGER DE CRIAÇÃO AUTOMÁTICA DE PERFIL
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
