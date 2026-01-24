
import { createClient } from '@supabase/supabase-js';

// Novas credenciais do projeto resetado
const supabaseUrl = 'https://znrcifjhelqzavrbluff.supabase.co';
const supabaseAnonKey = 'sb_publishable_Rz9GQfdq3ApZZRLxlmadEw_Kjn1nGfT'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
