import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocjtfywfoxfhifjkkjcg.supabase.co/rest/v1/'; // 본인의 URL
const supabaseKey = 'sb_publishable_MP_bC-dCGZcTHHbc2pENiw_V25NHLIi'; // 본인의 Key

export const supabase = createClient(supabaseUrl, supabaseKey);