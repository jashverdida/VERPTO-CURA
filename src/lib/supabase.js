import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://wyytiwqcllupfqmaahuq.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eXRpd3FjbGx1cGZxbWFhaHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTkwNTYsImV4cCI6MjA5MzczNTA1Nn0.hric6dhPu5o4lJyuTdG3xJoJXj12sDbAtq04dHrcZ8Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
