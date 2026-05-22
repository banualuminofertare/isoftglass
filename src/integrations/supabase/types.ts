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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accessory_kit_items: {
        Row: {
          created_at: string
          id: string
          kit_id: string
          material_code: string
          material_name: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          kit_id: string
          material_code: string
          material_name: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          kit_id?: string
          material_code?: string
          material_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "accessory_kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "accessory_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      accessory_kits: {
        Row: {
          catalog_source: string | null
          code: string
          color: string | null
          company_id: string | null
          created_at: string
          description: string | null
          door_height_deduction: number
          fixed_panel_height_deduction: number
          glass_deductions: Json
          id: string
          image_url: string | null
          is_active: boolean
          model: string | null
          name: string
          price: number
          processing_types: Json
          product_types: string[]
          updated_at: string
          user_id: string
          width_overlap: number
        }
        Insert: {
          catalog_source?: string | null
          code: string
          color?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          door_height_deduction?: number
          fixed_panel_height_deduction?: number
          glass_deductions?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          model?: string | null
          name: string
          price?: number
          processing_types?: Json
          product_types?: string[]
          updated_at?: string
          user_id: string
          width_overlap?: number
        }
        Update: {
          catalog_source?: string | null
          code?: string
          color?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          door_height_deduction?: number
          fixed_panel_height_deduction?: number
          glass_deductions?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          model?: string | null
          name?: string
          price?: number
          processing_types?: Json
          product_types?: string[]
          updated_at?: string
          user_id?: string
          width_overlap?: number
        }
        Relationships: [
          {
            foreignKeyName: "accessory_kits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_access_requests: {
        Row: {
          created_at: string
          id: string
          requester_id: string
          responded_at: string | null
          status: string
          target_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          requester_id: string
          responded_at?: string | null
          status?: string
          target_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
          target_user_id?: string
        }
        Relationships: []
      }
      admin_active_impersonation: {
        Row: {
          admin_user_id: string
          started_at: string
          target_company_id: string
          target_user_id: string | null
        }
        Insert: {
          admin_user_id: string
          started_at?: string
          target_company_id: string
          target_user_id?: string | null
        }
        Update: {
          admin_user_id?: string
          started_at?: string
          target_company_id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_alert_settings: {
        Row: {
          admin_user_id: string
          churn_threshold: number
          created_at: string
          email_enabled: boolean
          inactivity_days: number
          last_sent_at: string | null
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          churn_threshold?: number
          created_at?: string
          email_enabled?: boolean
          inactivity_days?: number
          last_sent_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          churn_threshold?: number
          created_at?: string
          email_enabled?: boolean
          inactivity_days?: number
          last_sent_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_announcements: {
        Row: {
          category: Database["public"]["Enums"]["announcement_category"]
          content: string
          content_translations: Json
          created_at: string
          created_by: string
          id: string
          is_pinned: boolean
          is_published: boolean
          title: string
          title_translations: Json
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["announcement_category"]
          content: string
          content_translations?: Json
          created_at?: string
          created_by: string
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          title: string
          title_translations?: Json
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["announcement_category"]
          content?: string
          content_translations?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          title?: string
          title_translations?: Json
          updated_at?: string
        }
        Relationships: []
      }
      admin_catalog_items: {
        Row: {
          catalog_id: string
          created_at: string
          id: string
          item_type: string
          source_data: Json
        }
        Insert: {
          catalog_id: string
          created_at?: string
          id?: string
          item_type?: string
          source_data?: Json
        }
        Update: {
          catalog_id?: string
          created_at?: string
          id?: string
          item_type?: string
          source_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_catalog_items_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "admin_catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_catalogs: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "admin_announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          catalog_id: string
          id: string
          notes: string | null
          target_user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          catalog_id: string
          id?: string
          notes?: string | null
          target_user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          catalog_id?: string
          id?: string
          notes?: string | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_assignments_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "admin_catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          position: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          position?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_error_logs: {
        Row: {
          component_stack: string | null
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          metadata: Json | null
          url: string
          user_agent: string
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          url?: string
          user_agent?: string
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          url?: string
          user_agent?: string
          user_id?: string | null
        }
        Relationships: []
      }
      client_type_pricing: {
        Row: {
          client_type: Database["public"]["Enums"]["client_type"]
          company_id: string | null
          created_at: string
          id: string
          markup_percent: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_type: Database["public"]["Enums"]["client_type"]
          company_id?: string | null
          created_at?: string
          id?: string
          markup_percent?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_type?: Database["public"]["Enums"]["client_type"]
          company_id?: string | null
          created_at?: string
          id?: string
          markup_percent?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_type_pricing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          codice_destinatario: string | null
          company_id: string | null
          company_name: string | null
          country: string | null
          country_code: string | null
          county: string | null
          created_at: string
          created_by: string | null
          credit_limit: number | null
          cui: string | null
          discount_percent: number | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_term_days: number | null
          phone: string | null
          postal_code: string | null
          reg_com: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          codice_destinatario?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          country_code?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          cui?: string | null
          discount_percent?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_term_days?: number | null
          phone?: string | null
          postal_code?: string | null
          reg_com?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          codice_destinatario?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          country_code?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          cui?: string | null
          discount_percent?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_term_days?: number | null
          phone?: string | null
          postal_code?: string | null
          reg_com?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          bank_account: string | null
          bic: string | null
          caen_code: string | null
          city: string | null
          codice_fiscale: string | null
          country_code: string | null
          county: string | null
          created_at: string
          cui: string | null
          email: string | null
          hide_global_pricing: boolean
          iban: string | null
          id: string
          leitweg_id: string | null
          logo_url: string | null
          max_members: number
          name: string
          owner_id: string
          pdf_logo_position: string
          pdf_logo_size: string
          peppol_id: string | null
          phone: string | null
          postal_code: string | null
          presentation_text: string | null
          primary_color: string | null
          quote_footer_text: string | null
          regime_fiscale: string | null
          secondary_color: string | null
          share_capital: number | null
          siret: string | null
          trade_register: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bic?: string | null
          caen_code?: string | null
          city?: string | null
          codice_fiscale?: string | null
          country_code?: string | null
          county?: string | null
          created_at?: string
          cui?: string | null
          email?: string | null
          hide_global_pricing?: boolean
          iban?: string | null
          id?: string
          leitweg_id?: string | null
          logo_url?: string | null
          max_members?: number
          name: string
          owner_id: string
          pdf_logo_position?: string
          pdf_logo_size?: string
          peppol_id?: string | null
          phone?: string | null
          postal_code?: string | null
          presentation_text?: string | null
          primary_color?: string | null
          quote_footer_text?: string | null
          regime_fiscale?: string | null
          secondary_color?: string | null
          share_capital?: number | null
          siret?: string | null
          trade_register?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bic?: string | null
          caen_code?: string | null
          city?: string | null
          codice_fiscale?: string | null
          country_code?: string | null
          county?: string | null
          created_at?: string
          cui?: string | null
          email?: string | null
          hide_global_pricing?: boolean
          iban?: string | null
          id?: string
          leitweg_id?: string | null
          logo_url?: string | null
          max_members?: number
          name?: string
          owner_id?: string
          pdf_logo_position?: string
          pdf_logo_size?: string
          peppol_id?: string | null
          phone?: string | null
          postal_code?: string | null
          presentation_text?: string | null
          primary_color?: string | null
          quote_footer_text?: string | null
          regime_fiscale?: string | null
          secondary_color?: string | null
          share_capital?: number | null
          siret?: string | null
          trade_register?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: []
      }
      company_invitations: {
        Row: {
          company_id: string
          created_at: string
          email: string
          has_calculator_access: boolean
          has_operational_access: boolean
          has_processing_access: boolean
          id: string
          invited_by: string
          responded_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          has_calculator_access?: boolean
          has_operational_access?: boolean
          has_processing_access?: boolean
          id?: string
          invited_by: string
          responded_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          has_calculator_access?: boolean
          has_operational_access?: boolean
          has_processing_access?: boolean
          id?: string
          invited_by?: string
          responded_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          bank_account: string | null
          created_at: string
          cui: string | null
          email: string | null
          euro_rate: number
          id: string
          logo_url: string | null
          name: string
          pdf_logo_position: string
          pdf_logo_size: string
          phone: string | null
          presentation_text: string | null
          primary_color: string | null
          quote_footer_text: string | null
          secondary_color: string | null
          tva_percent: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          created_at?: string
          cui?: string | null
          email?: string | null
          euro_rate?: number
          id?: string
          logo_url?: string | null
          name?: string
          pdf_logo_position?: string
          pdf_logo_size?: string
          phone?: string | null
          presentation_text?: string | null
          primary_color?: string | null
          quote_footer_text?: string | null
          secondary_color?: string | null
          tva_percent?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          created_at?: string
          cui?: string | null
          email?: string | null
          euro_rate?: number
          id?: string
          logo_url?: string | null
          name?: string
          pdf_logo_position?: string
          pdf_logo_size?: string
          phone?: string | null
          presentation_text?: string | null
          primary_color?: string | null
          quote_footer_text?: string | null
          secondary_color?: string | null
          tva_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      crm_lead_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          lead_id: string
        }
        Insert: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          lead_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          actual_revenue: number | null
          assigned_to: string | null
          city: string | null
          company_name: string | null
          contacted_at: string | null
          converted_user_id: string | null
          county: string | null
          created_at: string
          demo_started_at: string | null
          email: string | null
          estimated_value: number | null
          full_name: string
          id: string
          lost_reason: string | null
          next_follow_up: string | null
          notes: string | null
          paused_at: string | null
          phone: string | null
          source: Database["public"]["Enums"]["lead_source"]
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
        }
        Insert: {
          actual_revenue?: number | null
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          contacted_at?: string | null
          converted_user_id?: string | null
          county?: string | null
          created_at?: string
          demo_started_at?: string | null
          email?: string | null
          estimated_value?: number | null
          full_name: string
          id?: string
          lost_reason?: string | null
          next_follow_up?: string | null
          notes?: string | null
          paused_at?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Update: {
          actual_revenue?: number | null
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          contacted_at?: string | null
          converted_user_id?: string | null
          county?: string | null
          created_at?: string
          demo_started_at?: string | null
          email?: string | null
          estimated_value?: number | null
          full_name?: string
          id?: string
          lost_reason?: string | null
          next_follow_up?: string | null
          notes?: string | null
          paused_at?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Relationships: []
      }
      glass_sheets: {
        Row: {
          company_id: string | null
          created_at: string
          height: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
          width: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          height: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
          width: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          height?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "glass_sheets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_checklist_templates: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          items: Json
          name: string
          product_type: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          items?: Json
          name: string
          product_type?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          items?: Json
          name?: string
          product_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installation_checklist_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_jobs: {
        Row: {
          address: string | null
          checklist: Json
          city: string | null
          client_code: string | null
          client_name: string | null
          client_phone: string | null
          client_signature_url: string | null
          company_id: string | null
          completed_at: string | null
          completion_notes: string | null
          completion_photos: string[] | null
          created_at: string
          created_by: string | null
          estimated_duration: string | null
          id: string
          notes: string | null
          order_id: string | null
          postal_code: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: Database["public"]["Enums"]["installation_status"]
          team_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          checklist?: Json
          city?: string | null
          client_code?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_signature_url?: string | null
          company_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_photos?: string[] | null
          created_at?: string
          created_by?: string | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          postal_code?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["installation_status"]
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          checklist?: Json
          city?: string | null
          client_code?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_signature_url?: string | null
          company_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_photos?: string[] | null
          created_at?: string
          created_by?: string | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          postal_code?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["installation_status"]
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installation_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "installation_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_teams: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          members: Json
          name: string
          updated_at: string
          vehicle: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          members?: Json
          name: string
          updated_at?: string
          vehicle?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          members?: Json
          name?: string
          updated_at?: string
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_vehicles: {
        Row: {
          brand: string | null
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          itp_expiry: string | null
          model: string | null
          notes: string | null
          plate_number: string
          rca_expiry: string | null
          revision_date: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          team_id: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          brand?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          itp_expiry?: string | null
          model?: string | null
          notes?: string | null
          plate_number: string
          rca_expiry?: string | null
          revision_date?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          team_id?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          brand?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          itp_expiry?: string | null
          model?: string | null
          notes?: string | null
          plate_number?: string
          rca_expiry?: string | null
          revision_date?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          team_id?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_vehicles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "installation_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          product_type: string | null
          quantity: number
          sort_order: number
          source_product_id: string | null
          subtotal: number
          tax_percent: number
          total: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          product_type?: string | null
          quantity?: number
          sort_order?: number
          source_product_id?: string | null
          subtotal?: number
          tax_percent?: number
          total?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          product_type?: string | null
          quantity?: number
          sort_order?: number
          source_product_id?: string | null
          subtotal?: number
          tax_percent?: number
          total?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_series: {
        Row: {
          company_id: string
          created_at: string
          current_number: number
          id: string
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          is_active: boolean
          is_default: boolean
          padding_length: number
          prefix: string
          series_name: string
          start_number: number
          updated_at: string
          year_in_format: boolean
        }
        Insert: {
          company_id: string
          created_at?: string
          current_number?: number
          id?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          is_active?: boolean
          is_default?: boolean
          padding_length?: number
          prefix?: string
          series_name: string
          start_number?: number
          updated_at?: string
          year_in_format?: boolean
        }
        Update: {
          company_id?: string
          created_at?: string
          current_number?: number
          id?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          is_active?: boolean
          is_default?: boolean
          padding_length?: number
          prefix?: string
          series_name?: string
          start_number?: number
          updated_at?: string
          year_in_format?: boolean
        }
        Relationships: []
      }
      invoices: {
        Row: {
          base_currency: string
          client_id: string | null
          client_snapshot: Json
          company_id: string
          company_snapshot: Json
          created_at: string
          created_by: string | null
          currency: string
          discount_amount: number
          due_date: string | null
          einvoice_country: string | null
          einvoice_status: Database["public"]["Enums"]["einvoice_status"]
          einvoice_xml_path: string | null
          exchange_rate: number
          id: string
          internal_notes: string | null
          invoice_number: string | null
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          issue_date: string
          issued_at: string | null
          notes: string | null
          order_id: string | null
          paid_amount: number
          parent_invoice_id: string | null
          pdf_url: string | null
          series_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          tax_percent: number
          total: number
          updated_at: string
        }
        Insert: {
          base_currency?: string
          client_id?: string | null
          client_snapshot?: Json
          company_id: string
          company_snapshot?: Json
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          due_date?: string | null
          einvoice_country?: string | null
          einvoice_status?: Database["public"]["Enums"]["einvoice_status"]
          einvoice_xml_path?: string | null
          exchange_rate?: number
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          issue_date?: string
          issued_at?: string | null
          notes?: string | null
          order_id?: string | null
          paid_amount?: number
          parent_invoice_id?: string | null
          pdf_url?: string | null
          series_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_percent?: number
          total?: number
          updated_at?: string
        }
        Update: {
          base_currency?: string
          client_id?: string | null
          client_snapshot?: Json
          company_id?: string
          company_snapshot?: Json
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_amount?: number
          due_date?: string | null
          einvoice_country?: string | null
          einvoice_status?: Database["public"]["Enums"]["einvoice_status"]
          einvoice_xml_path?: string | null
          exchange_rate?: number
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          issue_date?: string
          issued_at?: string | null
          notes?: string | null
          order_id?: string | null
          paid_amount?: number
          parent_invoice_id?: string | null
          pdf_url?: string | null
          series_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_percent?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "invoice_series"
            referencedColumns: ["id"]
          },
        ]
      }
      material_variants: {
        Row: {
          color_hex: string | null
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          material_id: string
          user_id: string | null
          variant_code: string
          variant_name: string
        }
        Insert: {
          color_hex?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_id: string
          user_id?: string | null
          variant_code: string
          variant_name: string
        }
        Update: {
          color_hex?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_id?: string
          user_id?: string | null
          variant_code?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_variants_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          code: string
          color_hex: string | null
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string | null
          material_type: Database["public"]["Enums"]["material_type"]
          min_stock_level: number | null
          name: string
          processing_price: number | null
          stock_quantity: number | null
          supplier: string | null
          tags: string[] | null
          unit: Database["public"]["Enums"]["unit_type"]
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          code: string
          color_hex?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          material_type: Database["public"]["Enums"]["material_type"]
          min_stock_level?: number | null
          name: string
          processing_price?: number | null
          stock_quantity?: number | null
          supplier?: string | null
          tags?: string[] | null
          unit?: Database["public"]["Enums"]["unit_type"]
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          color_hex?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          material_type?: Database["public"]["Enums"]["material_type"]
          min_stock_level?: number | null
          name?: string
          processing_price?: number | null
          stock_quantity?: number | null
          supplier?: string | null
          tags?: string[] | null
          unit?: Database["public"]["Enums"]["unit_type"]
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      order_documents: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          name: string
          order_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          order_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          order_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          notes: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          notes?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          notes?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          company_id: string | null
          configuration: Json
          created_at: string
          id: string
          notes: string | null
          product_type: string
          quantity: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          configuration: Json
          created_at?: string
          id?: string
          notes?: string | null
          product_type: string
          quantity?: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          configuration?: Json
          created_at?: string
          id?: string
          notes?: string | null
          product_type?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_id: string
          payment_date: string
          payment_method: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          payment_date?: string
          payment_method: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          payment_date?: string
          payment_method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_products: {
        Row: {
          configuration: Json
          created_at: string
          full_config: Json | null
          id: string
          notes: string | null
          order_id: string
          product_type: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          configuration: Json
          created_at?: string
          full_config?: Json | null
          id?: string
          notes?: string | null
          order_id: string
          product_type: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          configuration?: Json
          created_at?: string
          full_config?: Json | null
          id?: string
          notes?: string | null
          order_id?: string
          product_type?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          company_id: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: string
          paid_amount: number | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number | null
          tax_percent: number | null
          total: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number: string
          paid_amount?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          paid_amount?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_config: {
        Row: {
          catalog_source: string | null
          category: Database["public"]["Enums"]["price_category"]
          code: string
          color_hex: string | null
          company_id: string | null
          created_at: string
          description: string | null
          door_height_deduction: number
          fixed_panel_height_deduction: number
          glass_deduction: number
          glass_deductions: Json
          id: string
          image_url: string | null
          is_active: boolean
          is_multiplier: boolean
          name: string
          price: number
          processing_types: Json
          product_types: string[]
          sort_order: number
          unit: string
          updated_at: string
          user_id: string | null
          width_overlap: number
        }
        Insert: {
          catalog_source?: string | null
          category: Database["public"]["Enums"]["price_category"]
          code: string
          color_hex?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          door_height_deduction?: number
          fixed_panel_height_deduction?: number
          glass_deduction?: number
          glass_deductions?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_multiplier?: boolean
          name: string
          price?: number
          processing_types?: Json
          product_types?: string[]
          sort_order?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
          width_overlap?: number
        }
        Update: {
          catalog_source?: string | null
          category?: Database["public"]["Enums"]["price_category"]
          code?: string
          color_hex?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          door_height_deduction?: number
          fixed_panel_height_deduction?: number
          glass_deduction?: number
          glass_deductions?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_multiplier?: boolean
          name?: string
          price?: number
          processing_types?: Json
          product_types?: string[]
          sort_order?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
          width_overlap?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_templates: {
        Row: {
          company_id: string | null
          created_at: string
          dimensions: Json
          drawing_url: string | null
          id: string
          material_code_prefix: string
          name: string
          notes: string | null
          template_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          dimensions?: Json
          drawing_url?: string | null
          id?: string
          material_code_prefix: string
          name: string
          notes?: string | null
          template_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          dimensions?: Json
          drawing_url?: string | null
          id?: string
          material_code_prefix?: string
          name?: string
          notes?: string | null
          template_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      production_issues: {
        Row: {
          created_at: string
          description: string
          id: string
          is_resolved: boolean | null
          issue_type: string
          job_id: string
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          stage: Database["public"]["Enums"]["production_stage"]
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean | null
          issue_type: string
          job_id: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stage: Database["public"]["Enums"]["production_stage"]
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean | null
          issue_type?: string
          job_id?: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stage?: Database["public"]["Enums"]["production_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "production_issues_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "production_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      production_jobs: {
        Row: {
          assigned_to: string | null
          client_name: string | null
          completed_at: string | null
          created_at: string
          current_stage: Database["public"]["Enums"]["production_stage"]
          due_date: string | null
          id: string
          job_number: string
          notes: string | null
          order_id: string
          order_product_id: string | null
          priority: number | null
          started_at: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string
          current_stage?: Database["public"]["Enums"]["production_stage"]
          due_date?: string | null
          id?: string
          job_number: string
          notes?: string | null
          order_id: string
          order_product_id?: string | null
          priority?: number | null
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string
          current_stage?: Database["public"]["Enums"]["production_stage"]
          due_date?: string | null
          id?: string
          job_number?: string
          notes?: string | null
          order_id?: string
          order_product_id?: string | null
          priority?: number | null
          started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_jobs_order_product_id_fkey"
            columns: ["order_product_id"]
            isOneToOne: false
            referencedRelation: "order_products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          job_id: string
          notes: string | null
          operator_id: string | null
          operator_name: string | null
          stage: Database["public"]["Enums"]["production_stage"]
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_id: string
          notes?: string | null
          operator_id?: string | null
          operator_name?: string | null
          stage: Database["public"]["Enums"]["production_stage"]
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_id?: string
          notes?: string | null
          operator_id?: string | null
          operator_name?: string | null
          stage?: Database["public"]["Enums"]["production_stage"]
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_stages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "production_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          avatar_url: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          has_calculator_access: boolean
          has_operational_access: boolean
          has_processing_access: boolean
          has_team_access: boolean
          id: string
          is_approved: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          has_calculator_access?: boolean
          has_operational_access?: boolean
          has_processing_access?: boolean
          has_team_access?: boolean
          id?: string
          is_approved?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          has_calculator_access?: boolean
          has_operational_access?: boolean
          has_processing_access?: boolean
          has_team_access?: boolean
          id?: string
          is_approved?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          company_id: string | null
          config_details: Json
          created_at: string
          created_by: string
          id: string
          markup_percent: number | null
          price_breakdown: Json
          product_label: string
          product_type: string
          ref_number: string
          status: string
          total_price: number
          tva_percent: number
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string | null
          config_details?: Json
          created_at?: string
          created_by: string
          id?: string
          markup_percent?: number | null
          price_breakdown?: Json
          product_label: string
          product_type: string
          ref_number: string
          status?: string
          total_price?: number
          tva_percent?: number
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string | null
          config_details?: Json
          created_at?: string
          created_by?: string
          id?: string
          markup_percent?: number | null
          price_breakdown?: Json
          product_label?: string
          product_type?: string
          ref_number?: string
          status?: string
          total_price?: number
          tva_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_interventions: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          duration_minutes: number | null
          estimated_cost: number | null
          id: string
          materials_used: string | null
          notes: string | null
          result: Database["public"]["Enums"]["intervention_result"] | null
          scheduled_date: string | null
          ticket_id: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          duration_minutes?: number | null
          estimated_cost?: number | null
          id?: string
          materials_used?: string | null
          notes?: string | null
          result?: Database["public"]["Enums"]["intervention_result"] | null
          scheduled_date?: string | null
          ticket_id: string
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          duration_minutes?: number | null
          estimated_cost?: number | null
          id?: string
          materials_used?: string | null
          notes?: string | null
          result?: Database["public"]["Enums"]["intervention_result"] | null
          scheduled_date?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_interventions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_photos: {
        Row: {
          created_at: string
          file_url: string
          id: string
          intervention_id: string | null
          photo_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          intervention_id?: string | null
          photo_type?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          intervention_id?: string | null
          photo_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_photos_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "service_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_photos_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          intervention_address: string | null
          order_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolution_deadline: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          intervention_address?: string | null
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution_deadline?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          intervention_address?: string | null
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution_deadline?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sliding_mechanisms: {
        Row: {
          code: string
          company_id: string | null
          created_at: string
          door_height_deduction: number
          fixed_panel_height_deduction: number
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
          width_overlap: number
        }
        Insert: {
          code?: string
          company_id?: string | null
          created_at?: string
          door_height_deduction?: number
          fixed_panel_height_deduction?: number
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
          width_overlap?: number
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string
          door_height_deduction?: number
          fixed_panel_height_deduction?: number
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
          width_overlap?: number
        }
        Relationships: [
          {
            foreignKeyName: "sliding_mechanisms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          id: string
          material_id: string
          movement_type: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          material_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          material_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_reservations: {
        Row: {
          created_at: string
          fulfilled_at: string | null
          id: string
          is_fulfilled: boolean | null
          material_id: string
          order_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          is_fulfilled?: boolean | null
          material_id: string
          order_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          is_fulfilled?: boolean | null
          material_id?: string
          order_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          duration_months: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          duration_months: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          duration_months?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_accessory_presets: {
        Row: {
          category: string
          company_id: string | null
          created_at: string
          id: string
          material_code: string
          material_name: string
          product_type: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          category: string
          company_id?: string | null
          created_at?: string
          id?: string
          material_code: string
          material_name: string
          product_type: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          category?: string
          company_id?: string | null
          created_at?: string
          id?: string
          material_code?: string
          material_name?: string
          product_type?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_accessory_presets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_events: {
        Row: {
          active_seconds: number
          bucket_start: string
          company_id: string | null
          country_code: string | null
          created_at: string
          id: string
          module: string
          route: string
          user_id: string
        }
        Insert: {
          active_seconds?: number
          bucket_start?: string
          company_id?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          module?: string
          route?: string
          user_id: string
        }
        Update: {
          active_seconds?: number
          bucket_start?: string
          company_id?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          module?: string
          route?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_sessions: {
        Row: {
          active_seconds: number
          company_id: string | null
          country_code: string | null
          id: string
          last_seen_at: string
          started_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active_seconds?: number
          company_id?: string | null
          country_code?: string | null
          id?: string
          last_seen_at?: string
          started_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active_seconds?: number
          company_id?: string | null
          country_code?: string | null
          id?: string
          last_seen_at?: string
          started_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_deactivated_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quote_settings: {
        Row: {
          created_at: string
          euro_rate: number
          id: string
          preferred_currency: string
          tva_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          euro_rate?: number
          id?: string
          preferred_currency?: string
          tva_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          euro_rate?: number
          id?: string
          preferred_currency?: string
          tva_percent?: number
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
      user_stock: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          location: string | null
          material_id: string
          min_stock_level: number
          stock_quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          material_id: string
          min_stock_level?: number
          stock_quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          material_id?: string
          min_stock_level?: number
          stock_quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stock_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stock_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          activated_by: string | null
          created_at: string
          deactivated_at: string | null
          expires_at: string
          id: string
          notes: string | null
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_by?: string | null
          created_at?: string
          deactivated_at?: string | null
          expires_at: string
          id?: string
          notes?: string | null
          plan_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_by?: string | null
          created_at?: string
          deactivated_at?: string | null
          expires_at?: string
          id?: string
          notes?: string | null
          plan_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_admin_test_activity: { Args: never; Returns: Json }
      clear_impersonation_target: { Args: never; Returns: undefined }
      delete_client_everywhere: { Args: { p_client_id: string }; Returns: Json }
      generate_job_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      get_admin_activity_heatmap: {
        Args: { _from: string; _to: string }
        Returns: Json
      }
      get_admin_activity_trend: {
        Args: { _from: string; _to: string }
        Returns: Json
      }
      get_admin_all_subscribers: { Args: never; Returns: Json }
      get_admin_analytics: {
        Args: { _from: string; _to: string }
        Returns: Json
      }
      get_admin_churn_alert_targets: {
        Args: { _churn_threshold?: number; _inactivity_days?: number }
        Returns: Json
      }
      get_admin_churn_risk: { Args: never; Returns: Json }
      get_admin_churn_risk_for_service: { Args: never; Returns: Json }
      get_admin_cohort_retention: { Args: { _months?: number }; Returns: Json }
      get_admin_feature_funnel: {
        Args: { _from: string; _to: string }
        Returns: Json
      }
      get_admin_live_users: { Args: never; Returns: Json }
      get_admin_power_users: {
        Args: { _from: string; _to: string }
        Returns: Json
      }
      get_admin_top_modules: {
        Args: { _from: string; _to: string }
        Returns: Json
      }
      get_admin_user_analytics: {
        Args: { _from: string; _to: string; _user_id: string }
        Returns: Json
      }
      get_admin_user_drilldown:
        | { Args: { _user_id: string }; Returns: Json }
        | {
            Args: { _from?: string; _to?: string; _user_id: string }
            Returns: Json
          }
      get_auth_email: { Args: never; Returns: string }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_accepted_access_to_company: {
        Args: { _company_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_actively_impersonating: {
        Args: { _company_id: string }
        Returns: boolean
      }
      is_approved_user: { Args: never; Returns: boolean }
      is_company_owner: { Args: { _user_id: string }; Returns: boolean }
      is_same_company: { Args: { _user_id: string }; Returns: boolean }
      issue_invoice: { Args: { _invoice_id: string }; Returns: string }
      seed_admin_test_activity: { Args: { _days?: number }; Returns: Json }
      set_impersonation_target: {
        Args: { _target_user_id: string }
        Returns: undefined
      }
      user_belongs_to_company: {
        Args: { _company_id: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_category: "update" | "news" | "feature" | "general"
      app_role: "admin" | "production_manager" | "sales" | "operator"
      client_type: "person" | "company" | "distributor"
      einvoice_status:
        | "not_generated"
        | "generated"
        | "sent_external"
        | "acknowledged"
        | "rejected"
      installation_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "postponed"
        | "cancelled"
      intervention_result: "rezolvat" | "partial" | "necesita_revenire"
      invoice_status:
        | "draft"
        | "issued"
        | "partially_paid"
        | "paid"
        | "cancelled"
        | "storno"
      invoice_type: "proforma" | "fiscal" | "storno"
      lead_source:
        | "website"
        | "referral"
        | "social_media"
        | "cold_call"
        | "email"
        | "event"
        | "other"
      lead_stage:
        | "nou"
        | "contactat"
        | "interesat"
        | "demo"
        | "negociere"
        | "castigat"
        | "pierdut"
        | "pauza"
      material_type: "glass" | "hardware" | "consumable"
      order_status:
        | "quote"
        | "confirmed"
        | "in_production"
        | "completed"
        | "delivered"
        | "cancelled"
      price_category:
        | "glass"
        | "processing"
        | "accessories"
        | "labor"
        | "finishing"
        | "balustrade"
      production_stage:
        | "cutting"
        | "processing"
        | "tempering"
        | "coating"
        | "assembly"
        | "quality_control"
        | "shipping"
      subscription_status: "active" | "expired" | "cancelled"
      ticket_priority: "scazuta" | "medie" | "urgenta" | "critica"
      ticket_status:
        | "deschis"
        | "in_evaluare"
        | "programat"
        | "in_lucru"
        | "rezolvat"
        | "inchis"
      ticket_type:
        | "defect_productie"
        | "defect_montaj"
        | "deteriorare_transport"
        | "reclamatie_client"
      unit_type: "sqm" | "lm" | "pcs" | "kg" | "l"
      vehicle_status: "available" | "in_service" | "occupied"
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
      announcement_category: ["update", "news", "feature", "general"],
      app_role: ["admin", "production_manager", "sales", "operator"],
      client_type: ["person", "company", "distributor"],
      einvoice_status: [
        "not_generated",
        "generated",
        "sent_external",
        "acknowledged",
        "rejected",
      ],
      installation_status: [
        "scheduled",
        "in_progress",
        "completed",
        "postponed",
        "cancelled",
      ],
      intervention_result: ["rezolvat", "partial", "necesita_revenire"],
      invoice_status: [
        "draft",
        "issued",
        "partially_paid",
        "paid",
        "cancelled",
        "storno",
      ],
      invoice_type: ["proforma", "fiscal", "storno"],
      lead_source: [
        "website",
        "referral",
        "social_media",
        "cold_call",
        "email",
        "event",
        "other",
      ],
      lead_stage: [
        "nou",
        "contactat",
        "interesat",
        "demo",
        "negociere",
        "castigat",
        "pierdut",
        "pauza",
      ],
      material_type: ["glass", "hardware", "consumable"],
      order_status: [
        "quote",
        "confirmed",
        "in_production",
        "completed",
        "delivered",
        "cancelled",
      ],
      price_category: [
        "glass",
        "processing",
        "accessories",
        "labor",
        "finishing",
        "balustrade",
      ],
      production_stage: [
        "cutting",
        "processing",
        "tempering",
        "coating",
        "assembly",
        "quality_control",
        "shipping",
      ],
      subscription_status: ["active", "expired", "cancelled"],
      ticket_priority: ["scazuta", "medie", "urgenta", "critica"],
      ticket_status: [
        "deschis",
        "in_evaluare",
        "programat",
        "in_lucru",
        "rezolvat",
        "inchis",
      ],
      ticket_type: [
        "defect_productie",
        "defect_montaj",
        "deteriorare_transport",
        "reclamatie_client",
      ],
      unit_type: ["sqm", "lm", "pcs", "kg", "l"],
      vehicle_status: ["available", "in_service", "occupied"],
    },
  },
} as const
