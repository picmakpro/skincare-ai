import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const supabase = createClientComponentClient()

export const getServerSupabase = () => {
  return createServerComponentClient({ cookies })
}

// Types TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          skin_concerns: string[] | null
          preferences: any
          created_at: string
          updated_at: string
        }
      }
      scans: {
        Row: {
          id: string
          user_id: string | null
          questionnaire_data: any
          analysis_result: any | null
          confidence_score: number | null
          quality_flags: any
          created_at: string
        }
      }
    }
  }
}