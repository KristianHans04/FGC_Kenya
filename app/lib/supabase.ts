import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sunadggznzkqtetisdte.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to handle Supabase queries with error handling
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T | null> {
  try {
    const { data, error } = await queryFn()
    if (error) {
      console.error('Supabase query error:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}