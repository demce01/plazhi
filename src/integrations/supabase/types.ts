export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      beaches: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          id: string
          loyalty_points: number | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          loyalty_points?: number | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          loyalty_points?: number | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reservation_sets: {
        Row: {
          created_at: string | null
          id: string
          price: number
          reservation_id: string
          set_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          reservation_id: string
          set_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          reservation_id?: string
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_sets_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_sets_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          beach_id: string
          checked_in: boolean | null
          client_id: string | null
          confirmation_sent: boolean | null
          created_at: string | null
          created_by: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          payment_amount: number
          payment_status: string | null
          reservation_date: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          beach_id: string
          checked_in?: boolean | null
          client_id?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          created_by?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          payment_amount: number
          payment_status?: string | null
          reservation_date: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          beach_id?: string
          checked_in?: boolean | null
          client_id?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          created_by?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          payment_amount?: number
          payment_status?: string | null
          reservation_date?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_beach_id_fkey"
            columns: ["beach_id"]
            isOneToOne: false
            referencedRelation: "beaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          beach_id: string
          created_at: string | null
          id: string
          name: string
          position: number | null
          price: number
          row_number: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          beach_id: string
          created_at?: string | null
          id?: string
          name: string
          position?: number | null
          price: number
          row_number?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          beach_id?: string
          created_at?: string | null
          id?: string
          name?: string
          position?: number | null
          price?: number
          row_number?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sets_beach_id_fkey"
            columns: ["beach_id"]
            isOneToOne: false
            referencedRelation: "beaches"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          beach_id: string
          created_at: string | null
          id: string
          name: string
          price: number
          rows: number
          spots_per_row: number
          updated_at: string | null
        }
        Insert: {
          beach_id: string
          created_at?: string | null
          id?: string
          name: string
          price: number
          rows: number
          spots_per_row: number
          updated_at?: string | null
        }
        Update: {
          beach_id?: string
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          rows?: number
          spots_per_row?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_beach_id_fkey"
            columns: ["beach_id"]
            isOneToOne: false
            referencedRelation: "beaches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_new_user: {
        Args: {
          user_email: string
          user_password: string
          user_role?: string
          first_name?: string
          last_name?: string
          phone_number?: string
        }
        Returns: string
      }
      get_available_sets: {
        Args: { target_beach_id: string; target_date: string }
        Returns: {
          beach_id: string
          created_at: string | null
          id: string
          name: string
          position: number | null
          price: number
          row_number: number | null
          status: string | null
          updated_at: string | null
        }[]
      }
      get_claims: {
        Args: { uid: string; claims: Json }
        Returns: Json
      }
      get_current_auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_sets_with_status: {
        Args: { target_beach_id: string; target_date: string }
        Returns: {
          id: string
          beach_id: string
          name: string
          price: number
          row_number: number
          position: number
          created_at: string
          updated_at: string
          status: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_employee: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          role: string
          created_at: string
          last_sign_in: string
        }[]
      }
      set_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
