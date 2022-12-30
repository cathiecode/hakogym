source './.env.local'

supabase gen types typescript --linked > types/supabase.ts
