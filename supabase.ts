import { createClient } from '@supabase/supabase-js';

// URL e Chave Pública do seu projeto Supabase
const supabaseUrl = 'https://ofeacqcqdggfrwpjunfr.supabase.co';
const supabaseAnonKey = 'sb_publishable_AObjtu25e6hhpPzoupMkSg_szdSNZuQ';

// Inicializa o cliente de forma direta e segura para o browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey);