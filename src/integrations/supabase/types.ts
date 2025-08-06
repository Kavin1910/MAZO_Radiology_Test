export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business_plan_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          organization: string
          phone: string | null
          status: string
          updated_at: string
          use_case: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          organization: string
          phone?: string | null
          status?: string
          updated_at?: string
          use_case: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization?: string
          phone?: string | null
          status?: string
          updated_at?: string
          use_case?: string
          user_id?: string
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_featured: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      medical_cases: {
        Row: {
          assigned_radiologist: string | null
          body_part: string
          comment: string | null
          completion_date: string | null
          confidence_score: number | null
          created_at: string
          findings: string | null
          id: string
          image_data: string
          image_name: string
          institution_name: string | null
          modality: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string | null
          priority: string | null
          processed_at: string
          radiologist_notes: string | null
          recommendations: string | null
          severity_rating: number
          source: string | null
          status: string
          storage_path: string | null
          study_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_radiologist?: string | null
          body_part: string
          comment?: string | null
          completion_date?: string | null
          confidence_score?: number | null
          created_at?: string
          findings?: string | null
          id?: string
          image_data: string
          image_name: string
          institution_name?: string | null
          modality?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string | null
          priority?: string | null
          processed_at?: string
          radiologist_notes?: string | null
          recommendations?: string | null
          severity_rating: number
          source?: string | null
          status?: string
          storage_path?: string | null
          study_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_radiologist?: string | null
          body_part?: string
          comment?: string | null
          completion_date?: string | null
          confidence_score?: number | null
          created_at?: string
          findings?: string | null
          id?: string
          image_data?: string
          image_name?: string
          institution_name?: string | null
          modality?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string | null
          priority?: string | null
          processed_at?: string
          radiologist_notes?: string | null
          recommendations?: string | null
          severity_rating?: number
          source?: string | null
          status?: string
          storage_path?: string | null
          study_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          institution: string | null
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          institution?: string | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          institution?: string | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          display_preferences: Json | null
          id: string
          notification_preferences: Json | null
          updated_at: string
          user_id: string
          workflow_preferences: Json | null
        }
        Insert: {
          created_at?: string
          display_preferences?: Json | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          user_id: string
          workflow_preferences?: Json | null
        }
        Update: {
          created_at?: string
          display_preferences?: Json | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          user_id?: string
          workflow_preferences?: Json | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          business_approved_date: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_end_date: string
          trial_start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_approved_date?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_approved_date?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status:
        | "trial_active"
        | "trial_expired"
        | "business_approved"
        | "business_pending"
        | "business_rejected"
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
      subscription_status: [
        "trial_active",
        "trial_expired",
        "business_approved",
        "business_pending",
        "business_rejected",
      ],
    },
  },
} as const
