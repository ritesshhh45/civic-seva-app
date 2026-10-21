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
      admin_accounts: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          accent_color: string
          admin_phone: string
          app_icon_url: string
          app_name: string
          header_photo_url: string | null
          id: string
          office_address_en: string
          office_address_mr: string
          office_map_url: string
          party_logo_url: string
          party_name_en: string
          party_name_mr: string
          phone: string
          photo_url: string
          rep_name_en: string
          rep_name_mr: string
          slogan_en: string
          slogan_mr: string
          splash_photo_url: string | null
          tagline_en: string
          tagline_mr: string
          updated_at: string
          ward_en: string
          ward_mr: string
          welcome_audio_url: string
          whatsapp: string
        }
        Insert: {
          accent_color?: string
          admin_phone?: string
          app_icon_url?: string
          app_name?: string
          header_photo_url?: string | null
          id?: string
          office_address_en?: string
          office_address_mr?: string
          office_map_url?: string
          party_logo_url?: string
          party_name_en?: string
          party_name_mr?: string
          phone?: string
          photo_url?: string
          rep_name_en?: string
          rep_name_mr?: string
          slogan_en?: string
          slogan_mr?: string
          splash_photo_url?: string | null
          tagline_en?: string
          tagline_mr?: string
          updated_at?: string
          ward_en?: string
          ward_mr?: string
          welcome_audio_url?: string
          whatsapp?: string
        }
        Update: {
          accent_color?: string
          admin_phone?: string
          app_icon_url?: string
          app_name?: string
          header_photo_url?: string | null
          id?: string
          office_address_en?: string
          office_address_mr?: string
          office_map_url?: string
          party_logo_url?: string
          party_name_en?: string
          party_name_mr?: string
          phone?: string
          photo_url?: string
          rep_name_en?: string
          rep_name_mr?: string
          slogan_en?: string
          slogan_mr?: string
          splash_photo_url?: string | null
          tagline_en?: string
          tagline_mr?: string
          updated_at?: string
          ward_en?: string
          ward_mr?: string
          welcome_audio_url?: string
          whatsapp?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          device_id: string
          id: string
          mobile: string
          name: string
          platform: string
          push_token: string | null
          push_updated_at: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          mobile: string
          name: string
          platform?: string
          push_token?: string | null
          push_updated_at?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          mobile?: string
          name?: string
          platform?: string
          push_token?: string | null
          push_updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean
          message_en: string
          message_mr: string
          name_en: string
          name_mr: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          message_en: string
          message_mr: string
          name_en: string
          name_mr: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          message_en?: string
          message_mr?: string
          name_en?: string
          name_mr?: string
          sort_order?: number
        }
        Relationships: []
      }
      complaint_taps: {
        Row: {
          category_id: string | null
          category_name: string
          created_at: string
          description: string
          device_id: string
          id: string
          mobile: string
          photo_url: string
          status: string
          updated_at: string
          user_name: string
        }
        Insert: {
          category_id?: string | null
          category_name: string
          created_at?: string
          description?: string
          device_id: string
          id?: string
          mobile: string
          photo_url?: string
          status?: string
          updated_at?: string
          user_name: string
        }
        Update: {
          category_id?: string | null
          category_name?: string
          created_at?: string
          description?: string
          device_id?: string
          id?: string
          mobile?: string
          photo_url?: string
          status?: string
          updated_at?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_taps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          created_at: string
          id: string
          image_url: string
          media_type: string
          sort_order: number
          title_en: string
          title_mr: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          media_type?: string
          sort_order?: number
          title_en?: string
          title_mr?: string
          video_url?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          media_type?: string
          sort_order?: number
          title_en?: string
          title_mr?: string
          video_url?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          content_type: string
          created_at: string
          data: string
          filename: string
          id: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          data: string
          filename?: string
          id?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          data?: string
          filename?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body_en: string
          body_mr: string
          created_at: string
          id: string
          title_en: string
          title_mr: string
        }
        Insert: {
          body_en?: string
          body_mr: string
          created_at?: string
          id?: string
          title_en?: string
          title_mr: string
        }
        Update: {
          body_en?: string
          body_mr?: string
          created_at?: string
          id?: string
          title_en?: string
          title_mr?: string
        }
        Relationships: []
      }
      push_log: {
        Row: {
          body: string
          created_at: string
          failed: number
          id: string
          kind: string
          sent: number
          source_id: string
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          failed?: number
          id?: string
          kind: string
          sent?: number
          source_id: string
          title?: string
        }
        Update: {
          body?: string
          created_at?: string
          failed?: number
          id?: string
          kind?: string
          sent?: number
          source_id?: string
          title?: string
        }
        Relationships: []
      }
      schemes: {
        Row: {
          banner_url: string
          benefits_en: string
          benefits_mr: string
          category_en: string
          category_mr: string
          created_at: string
          desc_en: string
          desc_mr: string
          documents_en: string
          documents_mr: string
          eligibility_en: string
          eligibility_mr: string
          helpline: string
          id: string
          is_active: boolean
          is_featured: boolean
          is_new: boolean
          last_date: string
          logo_url: string
          name_en: string
          name_mr: string
          sort_order: number
          updated_at: string
          website_url: string
        }
        Insert: {
          banner_url?: string
          benefits_en?: string
          benefits_mr?: string
          category_en?: string
          category_mr?: string
          created_at?: string
          desc_en?: string
          desc_mr?: string
          documents_en?: string
          documents_mr?: string
          eligibility_en?: string
          eligibility_mr?: string
          helpline?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          last_date?: string
          logo_url?: string
          name_en?: string
          name_mr?: string
          sort_order?: number
          updated_at?: string
          website_url?: string
        }
        Update: {
          banner_url?: string
          benefits_en?: string
          benefits_mr?: string
          category_en?: string
          category_mr?: string
          created_at?: string
          desc_en?: string
          desc_mr?: string
          documents_en?: string
          documents_mr?: string
          eligibility_en?: string
          eligibility_mr?: string
          helpline?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          last_date?: string
          logo_url?: string
          name_en?: string
          name_mr?: string
          sort_order?: number
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      updates: {
        Row: {
          body_en: string
          body_mr: string
          category_en: string
          category_mr: string
          created_at: string
          id: string
          image_url: string
          is_archived: boolean
          is_important: boolean
          is_pinned: boolean
          publish_at: string
          title_en: string
          title_mr: string
          updated_at: string
        }
        Insert: {
          body_en?: string
          body_mr?: string
          category_en?: string
          category_mr?: string
          created_at?: string
          id?: string
          image_url?: string
          is_archived?: boolean
          is_important?: boolean
          is_pinned?: boolean
          publish_at?: string
          title_en?: string
          title_mr?: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_mr?: string
          category_en?: string
          category_mr?: string
          created_at?: string
          id?: string
          image_url?: string
          is_archived?: boolean
          is_important?: boolean
          is_pinned?: boolean
          publish_at?: string
          title_en?: string
          title_mr?: string
          updated_at?: string
        }
        Relationships: []
      }
      works: {
        Row: {
          created_at: string
          desc_en: string
          desc_mr: string
          icon: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          status_en: string
          status_mr: string
          title_en: string
          title_mr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          desc_en?: string
          desc_mr?: string
          icon?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          status_en?: string
          status_mr?: string
          title_en?: string
          title_mr?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          desc_en?: string
          desc_mr?: string
          icon?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          status_en?: string
          status_mr?: string
          title_en?: string
          title_mr?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_image: { Args: { _id: string }; Returns: Json }
      admin_delete_row: { Args: { _id: string; _table: string }; Returns: Json }
      admin_email: { Args: never; Returns: string }
      admin_list_admins: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "admin_accounts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_images: {
        Args: never
        Returns: {
          content_type: string
          created_at: string
          filename: string
          id: string
        }[]
      }
      admin_list_taps: {
        Args: never
        Returns: {
          category_id: string | null
          category_name: string
          created_at: string
          description: string
          device_id: string
          id: string
          mobile: string
          photo_url: string
          status: string
          updated_at: string
          user_name: string
        }[]
        SetofOptions: {
          from: "*"
          to: "complaint_taps"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_me: { Args: never; Returns: Json }
      admin_save_row: { Args: { _row: Json; _table: string }; Returns: Json }
      admin_set_admin_status: {
        Args: { _id: string; _name?: string; _status: string }
        Returns: Json
      }
      admin_set_tap_status: {
        Args: { _id: string; _status: string }
        Returns: Json
      }
      admin_update_config: { Args: { _patch: Json }; Returns: Json }
      admin_upload_image: {
        Args: { _content_type: string; _data: string; _filename: string }
        Returns: Json
      }
      citizen_history: {
        Args: { _device_id: string }
        Returns: {
          category_name: string
          created_at: string
          id: string
        }[]
      }
      citizen_log_tap:
        | {
            Args: {
              _category_id: string
              _category_name: string
              _device_id: string
              _mobile: string
              _name: string
            }
            Returns: Json
          }
        | {
            Args: {
              _category_id: string
              _category_name: string
              _description: string
              _device_id: string
              _mobile: string
              _name: string
            }
            Returns: Json
          }
      citizen_register: {
        Args: { _device_id: string; _mobile: string; _name: string }
        Returns: Json
      }
      citizen_save_push_token: {
        Args: { _device_id: string; _platform: string; _token: string }
        Returns: Json
      }
      current_admin_role: { Args: never; Returns: string }
      norm_mobile: { Args: { _v: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
<<<<<<< HEAD
  TableName extends DefaultSchemaTableNameOrOptions extends {
=======
  TableName extends (DefaultSchemaTableNameOrOptions extends {
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
<<<<<<< HEAD
    : never = never,
=======
    : never) = never,
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51
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
<<<<<<< HEAD
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
=======
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51
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
<<<<<<< HEAD
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
=======
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51
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
<<<<<<< HEAD
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
=======
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51
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
<<<<<<< HEAD
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
=======
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
