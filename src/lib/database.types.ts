export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      product_files: {
        Row: {
          id: string
          name: string
          type: 'excel' | 'raw'
          data: Json
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          type: 'excel' | 'raw'
          data: Json
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'excel' | 'raw'
          data?: Json
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      file_versions: {
        Row: {
          id: string
          file_id: string
          version_number: number
          data: Json
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          file_id: string
          version_number: number
          data: Json
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          file_id?: string
          version_number?: number
          data?: Json
          created_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}