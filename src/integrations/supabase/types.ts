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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_settings: {
        Row: {
          alert_high_intent: boolean
          auto_reply_emails: boolean
          created_at: string
          id: string
          personality: string | null
          post_lead_grades: boolean
          slack_channel_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_high_intent?: boolean
          auto_reply_emails?: boolean
          created_at?: string
          id?: string
          personality?: string | null
          post_lead_grades?: boolean
          slack_channel_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_high_intent?: boolean
          auto_reply_emails?: boolean
          created_at?: string
          id?: string
          personality?: string | null
          post_lead_grades?: boolean
          slack_channel_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_connections: {
        Row: {
          api_key: string | null
          created_at: string
          email_address: string
          id: string
          is_active: boolean
          mailbox_id: string | null
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          email_address: string
          id?: string
          is_active?: boolean
          mailbox_id?: string | null
          provider?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          email_address?: string
          id?: string
          is_active?: boolean
          mailbox_id?: string | null
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fathom_connections: {
        Row: {
          access_token: string
          created_at: string
          id: string
          refresh_token: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          attendees: Json | null
          created_at: string
          id: string
          lead_name: string | null
          lead_quality: string | null
          meeting_date: string | null
          meeting_id: string | null
          meeting_title: string | null
          notes: string | null
          objection_handling: string | null
          objections: string | null
          offer: string | null
          status: string | null
          suggested_followups: string | null
          summary: string | null
          transcript: string | null
          updated_at: string
        }
        Insert: {
          attendees?: Json | null
          created_at?: string
          id?: string
          lead_name?: string | null
          lead_quality?: string | null
          meeting_date?: string | null
          meeting_id?: string | null
          meeting_title?: string | null
          notes?: string | null
          objection_handling?: string | null
          objections?: string | null
          offer?: string | null
          status?: string | null
          suggested_followups?: string | null
          summary?: string | null
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          attendees?: Json | null
          created_at?: string
          id?: string
          lead_name?: string | null
          lead_quality?: string | null
          meeting_date?: string | null
          meeting_id?: string | null
          meeting_title?: string | null
          notes?: string | null
          objection_handling?: string | null
          objections?: string | null
          offer?: string | null
          status?: string | null
          suggested_followups?: string | null
          summary?: string | null
          transcript?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          channel_type: string
          created_at: string
          direction: string
          email_message_id: string | null
          id: string
          is_read: boolean
          lead_id: string | null
          metadata: Json | null
          recipient: string | null
          sender: string | null
          slack_channel_id: string | null
          slack_ts: string | null
          subject: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          body: string
          channel_type: string
          created_at?: string
          direction?: string
          email_message_id?: string | null
          id?: string
          is_read?: boolean
          lead_id?: string | null
          metadata?: Json | null
          recipient?: string | null
          sender?: string | null
          slack_channel_id?: string | null
          slack_ts?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          body?: string
          channel_type?: string
          created_at?: string
          direction?: string
          email_message_id?: string | null
          id?: string
          is_read?: boolean
          lead_id?: string | null
          metadata?: Json | null
          recipient?: string | null
          sender?: string | null
          slack_channel_id?: string | null
          slack_ts?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_connections: {
        Row: {
          bot_access_token: string
          bot_user_id: string | null
          channel_id: string | null
          created_at: string
          id: string
          scope: string | null
          team_id: string
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_access_token: string
          bot_user_id?: string | null
          channel_id?: string | null
          created_at?: string
          id?: string
          scope?: string | null
          team_id: string
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_access_token?: string
          bot_user_id?: string | null
          channel_id?: string | null
          created_at?: string
          id?: string
          scope?: string | null
          team_id?: string
          team_name?: string | null
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
    Enums: {},
  },
} as const
