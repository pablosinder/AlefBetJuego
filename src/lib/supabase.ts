import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HebrewLetter {
  id: string;
  letter: string;
  letter_name: string;
  letter_name_hebrew: string;
  object_name: string;
  object_name_hebrew: string;
  audio_url: string;
  order_index: number;
  image_url: string;
  created_at: string;
}
