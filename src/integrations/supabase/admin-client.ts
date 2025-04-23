
// This file contains the service role client for admin operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dvaefyxptjnflbfviwre.supabase.co";

// Create a service role client for bypassing RLS
// Only to be used by authenticated admin/employee users in admin functions
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YWVmeXhwdGpuZmxiZnZpd3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MTUwODA5OCwiZXhwIjoxOTk3MDg0MDk4fQ.XJ6c1g8mCvfIXbbzpTNVf7_ufXKevqgjL8ogLbfFXts";

// Important: This client bypasses Row Level Security
// Only use for authenticated admin operations where RLS might be too restrictive
export const adminSupabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);
