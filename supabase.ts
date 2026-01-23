
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Estas variáveis devem ser configuradas no seu ambiente (Netlify/GitHub Secrets)
const supabaseUrl = (window as any).env?.SUPABASE_URL || 'SUA_URL_DO_SUPABASE';
const supabaseAnonKey = (window as any).env?.SUPABASE_ANON_KEY || 'SUA_ANON_KEY_DO_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
