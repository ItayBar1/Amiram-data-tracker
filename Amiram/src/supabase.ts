import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwvqtllplbuznfcnbcyd.supabase.co';
const supabaseAnonKey = 'sb_publishable_fCrs588J99ZVH7gDTDMQeQ_6v0p_gjJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);