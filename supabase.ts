
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Configuração do Cliente Supabase.
 * As variáveis são obtidas do ambiente ou usam os fallbacks fornecidos por você.
 */

const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignora erros de referência ao process em ambiente de browser puro
  }
  return fallback;
};

// Suas credenciais fornecidas
const supabaseUrl = getEnv('SUPABASE_URL', 'https://ofeacqcqdggfrwpjunfr.supabase.co');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'sb_publishable_AObjtu25e6hhpPzoupMkSg_szdSNZuQ');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
