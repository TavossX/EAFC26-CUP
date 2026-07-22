import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://SEU_PROJETO.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA_CHAVE_PUBLICA_ANON';

export const supabase = createClient(supabaseUrl, supabaseKey);
