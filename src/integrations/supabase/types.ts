export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      orders: {
        Row: {
          address: string
          completed_at: string | null
          county: string
          created_at: string
          customer_name: string
          email: string
          id: string
          installation_date: string
          installation_slot: Database["public"]["Enums"]["installation_slot"]
          notes: string
          order_code: string
          product_id: string
          product_name: string
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          technician_id: string | null
          technician_name: string | null
          total_kes: number
          unit_price_kes: number
          whatsapp: string
        }
        Insert: {
          address: string
          completed_at?: string | null
          county: string
          created_at?: string
          customer_name: string
          email: string
          id?: string
          installation_date: string
          installation_slot: Database["public"]["Enums"]["installation_slot"]
          notes?: string
          order_code: string
          product_id: string
          product_name: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          technician_id?: string | null
          technician_name?: string | null
          total_kes: number
          unit_price_kes: number
          whatsapp: string
        }
        Update: {
          address?: string
          completed_at?: string | null
          county?: string
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          installation_date?: string
          installation_slot?: Database["public"]["Enums"]["installation_slot"]
          notes?: string
          order_code?: string
          product_id?: string
          product_name?: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          technician_id?: string | null
          technician_name?: string | null
          total_kes?: number
          unit_price_kes?: number
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string
          is_available: boolean
          name: string
          price_kes: number
          stock_count: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_available?: boolean
          name: string
          price_kes?: number
          stock_count?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_available?: boolean
          name?: string
          price_kes?: number
          stock_count?: number
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["receipt_kind"]
          order_id: string
          payload: Json
          receipt_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["receipt_kind"]
          order_id: string
          payload?: Json
          receipt_code: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["receipt_kind"]
          order_id?: string
          payload?: Json
          receipt_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          name?: string
          phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_code: { Args: never; Returns: string }
      generate_receipt_code: { Args: never; Returns: string }
    }
    Enums: {
      installation_slot: "morning" | "afternoon" | "evening"
      order_status:
        | "pending"
        | "confirmed"
        | "assigned"
        | "completed"
        | "cancelled"
      receipt_kind: "order" | "completion"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      installation_slot: ["morning", "afternoon", "evening"],
      order_status: [
        "pending",
        "confirmed",
        "assigned",
        "completed",
        "cancelled",
      ],
      receipt_kind: ["order", "completion"],
    },
  },
} as const
