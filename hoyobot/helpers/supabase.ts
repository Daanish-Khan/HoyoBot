import { createClient } from '@supabase/supabase-js';
import { secrets } from '../secrets';

export const supabase = createClient(secrets.DB_URL, secrets.DB_SECRET);
