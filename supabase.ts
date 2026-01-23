
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Configuração do Cliente Supabase.
 * As variáveis são obtidas do ambiente (Netlify/Vercel) ou usam os fallbacks fornecidos.
 * O erro "Invalid supabaseUrl" ocorria devido a lixo no final do arquivo e acesso direto a 'process'
 * em ambientes onde ele não está definido globalmente.
 */

const getEnv = (key: string, fallback: string): string => {
  try {
    // Tenta obter de process.env (Node/Bundlers)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignora erros de referência
  }
  return fallback;
};

const supabaseUrl = getEnv('SUPABASE_URL', 'https://ofeacqcqdggfrwpjunfr.supabase.co');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'sb_publishable_AObjtu25e6hhpPzoupMkSg_szdSNZuQ');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
