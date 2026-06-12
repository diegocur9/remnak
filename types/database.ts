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
      disputes: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          order_id: string
          reason: string
          refund_amount: number | null
          reporter_id: string
          resolution: string | null
          resolved_at: string | null
          resolver_id: string | null
          sla_due_at: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          order_id: string
          reason: string
          refund_amount?: number | null
          reporter_id: string
          resolution?: string | null
          resolved_at?: string | null
          resolver_id?: string | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          order_id?: string
          reason?: string
          refund_amount?: number | null
          reporter_id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolver_id?: string | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolver_id_fkey"
            columns: ["resolver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freight_assignments: {
        Row: {
          carrier_id: string
          created_at: string | null
          delivered_at: string | null
          delivery_address: string | null
          id: string
          insurance_url: string | null
          order_id: string
          pickup_address: string | null
          pickup_at: string | null
          price_mxn: number
          sct_permit: string | null
          status: Database["public"]["Enums"]["freight_status"]
          stripe_transfer_id: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          carrier_id: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          id?: string
          insurance_url?: string | null
          order_id: string
          pickup_address?: string | null
          pickup_at?: string | null
          price_mxn: number
          sct_permit?: string | null
          status?: Database["public"]["Enums"]["freight_status"]
          stripe_transfer_id?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier_id?: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          id?: string
          insurance_url?: string | null
          order_id?: string
          pickup_address?: string | null
          pickup_at?: string | null
          price_mxn?: number
          sct_permit?: string | null
          status?: Database["public"]["Enums"]["freight_status"]
          stripe_transfer_id?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freight_assignments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freight_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          auction_end_at: string | null
          auction_min_bid: number | null
          brand: string | null
          category: Database["public"]["Enums"]["listing_category"]
          condition: Database["public"]["Enums"]["listing_condition"]
          cp: string | null
          created_at: string | null
          defect_certificate_url: string | null
          description: string | null
          direccion_detalle: string | null
          es_rcd: boolean | null
          estado: string | null
          featured_until: string | null
          flete_disponible: boolean | null
          flete_precio_mxn: number | null
          id: string
          is_featured: boolean | null
          lat: number | null
          lng: number | null
          manufacture_date: string | null
          model: string | null
          municipio: string | null
          photos: string[]
          pickup_disponible: boolean | null
          price_mxn: number
          price_type: Database["public"]["Enums"]["listing_price_type"]
          quantity: number
          saves_count: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["listing_status"]
          tags: string[] | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
          vida_util_meses: number | null
          video_url: string | null
          views_count: number | null
          volumen_m3: number | null
        }
        Insert: {
          auction_end_at?: string | null
          auction_min_bid?: number | null
          brand?: string | null
          category: Database["public"]["Enums"]["listing_category"]
          condition: Database["public"]["Enums"]["listing_condition"]
          cp?: string | null
          created_at?: string | null
          defect_certificate_url?: string | null
          description?: string | null
          direccion_detalle?: string | null
          es_rcd?: boolean | null
          estado?: string | null
          featured_until?: string | null
          flete_disponible?: boolean | null
          flete_precio_mxn?: number | null
          id?: string
          is_featured?: boolean | null
          lat?: number | null
          lng?: number | null
          manufacture_date?: string | null
          model?: string | null
          municipio?: string | null
          photos?: string[]
          pickup_disponible?: boolean | null
          price_mxn: number
          price_type?: Database["public"]["Enums"]["listing_price_type"]
          quantity?: number
          saves_count?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[] | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
          vida_util_meses?: number | null
          video_url?: string | null
          views_count?: number | null
          volumen_m3?: number | null
        }
        Update: {
          auction_end_at?: string | null
          auction_min_bid?: number | null
          brand?: string | null
          category?: Database["public"]["Enums"]["listing_category"]
          condition?: Database["public"]["Enums"]["listing_condition"]
          cp?: string | null
          created_at?: string | null
          defect_certificate_url?: string | null
          description?: string | null
          direccion_detalle?: string | null
          es_rcd?: boolean | null
          estado?: string | null
          featured_until?: string | null
          flete_disponible?: boolean | null
          flete_precio_mxn?: number | null
          id?: string
          is_featured?: boolean | null
          lat?: number | null
          lng?: number | null
          manufacture_date?: string | null
          model?: string | null
          municipio?: string | null
          photos?: string[]
          pickup_disponible?: boolean | null
          price_mxn?: number
          price_type?: Database["public"]["Enums"]["listing_price_type"]
          quantity?: number
          saves_count?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[] | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          vida_util_meses?: number | null
          video_url?: string | null
          views_count?: number | null
          volumen_m3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          blocked: boolean | null
          content: string
          content_clean: string | null
          created_at: string | null
          expires_at: string | null
          flag_detail: string | null
          flag_reason: Database["public"]["Enums"]["message_flag_reason"] | null
          flagged: boolean | null
          id: string
          order_id: string
          sender_id: string
        }
        Insert: {
          blocked?: boolean | null
          content: string
          content_clean?: string | null
          created_at?: string | null
          expires_at?: string | null
          flag_detail?: string | null
          flag_reason?:
            | Database["public"]["Enums"]["message_flag_reason"]
            | null
          flagged?: boolean | null
          id?: string
          order_id: string
          sender_id: string
        }
        Update: {
          blocked?: boolean | null
          content?: string
          content_clean?: string | null
          created_at?: string | null
          expires_at?: string | null
          flag_detail?: string | null
          flag_reason?:
            | Database["public"]["Enums"]["message_flag_reason"]
            | null
          flagged?: boolean | null
          id?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          buyer_notes: string | null
          cancellation_reason: string | null
          cfdi_issued_at: string | null
          cfdi_url: string | null
          cfdi_uuid: string | null
          cfdi_xml_url: string | null
          commission_mxn: number
          commission_pct: number | null
          created_at: string | null
          days_rented: number | null
          delivery_confirmed: boolean | null
          delivery_confirmed_at: string | null
          delivery_date: string | null
          escrow_release_due: string | null
          escrow_released: boolean | null
          escrow_released_at: string | null
          flete_mxn: number | null
          id: string
          iva_mxn: number
          listing_id: string
          paid_at: string | null
          payment_id: string | null
          payment_method: string | null
          payment_provider:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          payment_status: string | null
          pickup_date: string | null
          rental_end_date: string | null
          rental_start_date: string | null
          seller_id: string
          seller_notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_mxn: number
          total_mxn: number
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          buyer_notes?: string | null
          cancellation_reason?: string | null
          cfdi_issued_at?: string | null
          cfdi_url?: string | null
          cfdi_uuid?: string | null
          cfdi_xml_url?: string | null
          commission_mxn: number
          commission_pct?: number | null
          created_at?: string | null
          days_rented?: number | null
          delivery_confirmed?: boolean | null
          delivery_confirmed_at?: string | null
          delivery_date?: string | null
          escrow_release_due?: string | null
          escrow_released?: boolean | null
          escrow_released_at?: string | null
          flete_mxn?: number | null
          id?: string
          iva_mxn: number
          listing_id: string
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          payment_status?: string | null
          pickup_date?: string | null
          rental_end_date?: string | null
          rental_start_date?: string | null
          seller_id: string
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_mxn: number
          total_mxn: number
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_notes?: string | null
          cancellation_reason?: string | null
          cfdi_issued_at?: string | null
          cfdi_url?: string | null
          cfdi_uuid?: string | null
          cfdi_xml_url?: string | null
          commission_mxn?: number
          commission_pct?: number | null
          created_at?: string | null
          days_rented?: number | null
          delivery_confirmed?: boolean | null
          delivery_confirmed_at?: string | null
          delivery_date?: string | null
          escrow_release_due?: string | null
          escrow_released?: boolean | null
          escrow_released_at?: string | null
          flete_mxn?: number | null
          id?: string
          iva_mxn?: number
          listing_id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          payment_status?: string | null
          pickup_date?: string | null
          rental_end_date?: string | null
          rental_start_date?: string | null
          seller_id?: string
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_mxn?: number
          total_mxn?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cp: string | null
          created_at: string | null
          curp: string | null
          domicilio_url: string | null
          estado: string | null
          full_name: string | null
          id: string
          ine_back_url: string | null
          ine_front_url: string | null
          lat: number | null
          lng: number | null
          municipio: string | null
          phone: string | null
          rating_avg: number | null
          rating_count: number | null
          razon_social: string | null
          referral_code: string | null
          referral_credit_mxn: number | null
          referred_by: string | null
          regimen_fiscal: string | null
          rfc: string | null
          role: Database["public"]["Enums"]["user_role"]
          secondary_roles: Database["public"]["Enums"]["user_role"][] | null
          selfie_url: string | null
          total_purchases: number | null
          total_sales: number | null
          updated_at: string | null
          uso_cfdi: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          cp?: string | null
          created_at?: string | null
          curp?: string | null
          domicilio_url?: string | null
          estado?: string | null
          full_name?: string | null
          id: string
          ine_back_url?: string | null
          ine_front_url?: string | null
          lat?: number | null
          lng?: number | null
          municipio?: string | null
          phone?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          razon_social?: string | null
          referral_code?: string | null
          referral_credit_mxn?: number | null
          referred_by?: string | null
          regimen_fiscal?: string | null
          rfc?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          secondary_roles?: Database["public"]["Enums"]["user_role"][] | null
          selfie_url?: string | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          uso_cfdi?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          cp?: string | null
          created_at?: string | null
          curp?: string | null
          domicilio_url?: string | null
          estado?: string | null
          full_name?: string | null
          id?: string
          ine_back_url?: string | null
          ine_front_url?: string | null
          lat?: number | null
          lng?: number | null
          municipio?: string | null
          phone?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          razon_social?: string | null
          referral_code?: string | null
          referral_credit_mxn?: number | null
          referred_by?: string | null
          regimen_fiscal?: string | null
          rfc?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          secondary_roles?: Database["public"]["Enums"]["user_role"][] | null
          selfie_url?: string | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          uso_cfdi?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          accuracy: number | null
          comment: string | null
          created_at: string | null
          delivery_time: number | null
          id: string
          is_public: boolean | null
          order_id: string
          packaging: number | null
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          accuracy?: number | null
          comment?: string | null
          created_at?: string | null
          delivery_time?: number | null
          id?: string
          is_public?: boolean | null
          order_id: string
          packaging?: number | null
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          accuracy?: number | null
          comment?: string | null
          created_at?: string | null
          delivery_time?: number | null
          id?: string
          is_public?: boolean | null
          order_id?: string
          packaging?: number | null
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      dispute_status: "open" | "under_review" | "resolved" | "escalated"
      freight_status:
        | "pending"
        | "assigned"
        | "in_transit"
        | "delivered"
        | "cancelled"
      listing_category:
        | "maquinaria"
        | "materiales"
        | "herramientas"
        | "profesionales"
        | "logistica"
        | "liquidacion"
      listing_condition: "nuevo" | "sobrante" | "defectuoso"
      listing_price_type: "fijo" | "renta_diaria" | "subasta"
      listing_status: "draft" | "active" | "paused" | "sold" | "flagged"
      message_flag_reason:
        | "email"
        | "phone"
        | "whatsapp"
        | "external_url"
        | "address"
        | "other"
      order_status:
        | "pending"
        | "paid"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "completed"
        | "disputed"
        | "refunded"
        | "cancelled"
      payment_provider: "mercadopago" | "stripe"
      user_role: "cliente" | "proveedor" | "profesional" | "logistica" | "admin"
      verification_status: "pending" | "verified" | "rejected"
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
      dispute_status: ["open", "under_review", "resolved", "escalated"],
      freight_status: [
        "pending",
        "assigned",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      listing_category: [
        "maquinaria",
        "materiales",
        "herramientas",
        "profesionales",
        "logistica",
        "liquidacion",
      ],
      listing_condition: ["nuevo", "sobrante", "defectuoso"],
      listing_price_type: ["fijo", "renta_diaria", "subasta"],
      listing_status: ["draft", "active", "paused", "sold", "flagged"],
      message_flag_reason: [
        "email",
        "phone",
        "whatsapp",
        "external_url",
        "address",
        "other",
      ],
      order_status: [
        "pending",
        "paid",
        "confirmed",
        "in_transit",
        "delivered",
        "completed",
        "disputed",
        "refunded",
        "cancelled",
      ],
      payment_provider: ["mercadopago", "stripe"],
      user_role: ["cliente", "proveedor", "profesional", "logistica", "admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
