
-- 1. TABELA DE PERFIS (GARANTIR ESTRUTURA)
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

-- 2. HABILITAR RLS E CRIAR POLÍTICAS DE BACKUP
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permitir que o usuário insira seu próprio perfil (Caso o trigger falhe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 3. FUNÇÃO DE TRIGGER MELHORADA
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RE-VINCULAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
