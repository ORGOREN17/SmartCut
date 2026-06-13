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
      ai_analyses: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          input_image_url: string | null
          result_json: Json | null
          selected_hairstyle_id: string | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: string
          input_image_url?: string | null
          result_json?: Json | null
          selected_hairstyle_id?: string | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          input_image_url?: string | null
          result_json?: Json | null
          selected_hairstyle_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      barber_profiles: {
        Row: {
          address: string | null
          business_name: string
          business_registration_number: string | null
          city: string | null
          created_at: string
          email: string | null
          google_reviews_link: string | null
          id: string
          instagram_link: string | null
          owner_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_name: string
          business_registration_number?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          google_reviews_link?: string | null
          id?: string
          instagram_link?: string | null
          owner_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_name?: string
          business_registration_number?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          google_reviews_link?: string | null
          id?: string
          instagram_link?: string | null
          owner_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_content_images: {
        Row: {
          aspect_ratio: string | null
          business_name: string | null
          caption: string | null
          created_at: string
          hashtags_json: Json | null
          id: string
          image_url: string | null
          prompt: string
          title: string | null
          user_id: string
        }
        Insert: {
          aspect_ratio?: string | null
          business_name?: string | null
          caption?: string | null
          created_at?: string
          hashtags_json?: Json | null
          id?: string
          image_url?: string | null
          prompt: string
          title?: string | null
          user_id: string
        }
        Update: {
          aspect_ratio?: string | null
          business_name?: string | null
          caption?: string | null
          created_at?: string
          hashtags_json?: Json | null
          id?: string
          image_url?: string | null
          prompt?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_videos: {
        Row: {
          business_name: string | null
          caption: string | null
          created_at: string
          hashtags_json: Json | null
          id: string
          prompt: string
          provider: string | null
          title: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          business_name?: string | null
          caption?: string | null
          created_at?: string
          hashtags_json?: Json | null
          id?: string
          prompt: string
          provider?: string | null
          title?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          business_name?: string | null
          caption?: string | null
          created_at?: string
          hashtags_json?: Json | null
          id?: string
          prompt?: string
          provider?: string | null
          title?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      comparison_results: {
        Row: {
          barber_feedback: string | null
          breakdown_json: Json | null
          created_at: string
          final_image_url: string | null
          id: string
          match_level: string | null
          match_score: number | null
          target_image_url: string | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          barber_feedback?: string | null
          breakdown_json?: Json | null
          created_at?: string
          final_image_url?: string | null
          id?: string
          match_level?: string | null
          match_score?: number | null
          target_image_url?: string | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          barber_feedback?: string | null
          breakdown_json?: Json | null
          created_at?: string
          final_image_url?: string | null
          id?: string
          match_level?: string | null
          match_score?: number | null
          target_image_url?: string | null
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          age: number | null
          beard_status: string | null
          created_at: string
          current_hair_length: string | null
          gender: string | null
          hair_density: string | null
          hair_type: string | null
          haircut_frequency: string | null
          hairline_status: string | null
          id: string
          maintenance_preference: string | null
          notes: string | null
          openness_to_change: string | null
          preferred_length: string | null
          preferred_style: string | null
          styling_routine: string | null
          updated_at: string
          user_id: string
          work_style: string | null
        }
        Insert: {
          age?: number | null
          beard_status?: string | null
          created_at?: string
          current_hair_length?: string | null
          gender?: string | null
          hair_density?: string | null
          hair_type?: string | null
          haircut_frequency?: string | null
          hairline_status?: string | null
          id?: string
          maintenance_preference?: string | null
          notes?: string | null
          openness_to_change?: string | null
          preferred_length?: string | null
          preferred_style?: string | null
          styling_routine?: string | null
          updated_at?: string
          user_id: string
          work_style?: string | null
        }
        Update: {
          age?: number | null
          beard_status?: string | null
          created_at?: string
          current_hair_length?: string | null
          gender?: string | null
          hair_density?: string | null
          hair_type?: string | null
          haircut_frequency?: string | null
          hairline_status?: string | null
          id?: string
          maintenance_preference?: string | null
          notes?: string | null
          openness_to_change?: string | null
          preferred_length?: string | null
          preferred_style?: string | null
          styling_routine?: string | null
          updated_at?: string
          user_id?: string
          work_style?: string | null
        }
        Relationships: []
      }
      hairstyle_results: {
        Row: {
          category: string | null
          created_at: string
          explanation: string | null
          id: string
          image_url: string | null
          match_score: number | null
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          match_score?: number | null
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          match_score?: number | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_limits: {
        Row: {
          ai_actions_used: number
          created_at: string
          daily_limit: number
          date: string
          id: string
          plan_type: string
          user_id: string
        }
        Insert: {
          ai_actions_used?: number
          created_at?: string
          daily_limit?: number
          date?: string
          id?: string
          plan_type?: string
          user_id: string
        }
        Update: {
          ai_actions_used?: number
          created_at?: string
          daily_limit?: number
          date?: string
          id?: string
          plan_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "barber" | "admin"
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
      app_role: ["customer", "barber", "admin"],
    },
  },
} as const
