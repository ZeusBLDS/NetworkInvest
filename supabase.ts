
import { createClient } from '@supabase/supabase-js';

// Configurações extraídas do seu print do Supabase
const supabaseUrl = 'https://ofeacqcqdggfrwpjunfr.supabase.co';
const supabaseAnonKey = 'sb_publishable_AObjtu25e6hhpPzoupMkSg_szdSNZuQ'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
