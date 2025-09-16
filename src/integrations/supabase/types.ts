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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          delivery_instructions: string | null
          id: string
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          postal_code: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postal_code: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          permissions: Json
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string
          driver_id: string | null
          id: string
          last_message_at: string | null
          order_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          id?: string
          last_message_at?: string | null
          order_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          id?: string
          last_message_at?: string | null
          order_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      driver_applications: {
        Row: {
          admin_notes: string | null
          created_at: string
          driver_license_photo: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          license_plate: string | null
          passport_photo: string | null
          phone: string
          status: string
          updated_at: string
          user_id: string
          vehicle_registration_photo: string | null
          vehicle_type: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          driver_license_photo?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          license_plate?: string | null
          passport_photo?: string | null
          phone: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_registration_photo?: string | null
          vehicle_type: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          driver_license_photo?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          license_plate?: string | null
          passport_photo?: string | null
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_registration_photo?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          current_location: Json | null
          email: string
          first_name: string
          id: string
          is_active: boolean
          is_verified: boolean
          last_name: string
          license_plate: string | null
          phone: string
          rating: number | null
          status: string
          total_deliveries: number | null
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          current_location?: Json | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_name: string
          license_plate?: string | null
          phone: string
          rating?: number | null
          status?: string
          total_deliveries?: number | null
          updated_at?: string
          user_id: string
          vehicle_type?: string
        }
        Update: {
          created_at?: string
          current_location?: Json | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_name?: string
          license_plate?: string | null
          phone?: string
          rating?: number | null
          status?: string
          total_deliveries?: number | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          category: string | null
          created_at: string
          id: string
          item_data: Json
          item_id: string
          item_type: string
          notes: string | null
          priority: number | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          item_data: Json
          item_id: string
          item_type: string
          notes?: string | null
          priority?: number | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          item_data?: Json
          item_id?: string
          item_type?: string
          notes?: string | null
          priority?: number | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      loyalty_program: {
        Row: {
          created_at: string
          id: string
          points: number
          tier: string
          total_orders: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          tier?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          tier?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          restaurant_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          restaurant_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          menu_item_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          menu_item_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          menu_item_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_images_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string
          created_at: string
          description: string | null
          discount_percent: number | null
          id: string
          ingredients: string[] | null
          is_available: boolean | null
          is_popular: boolean | null
          name: string
          nutritional_info: Json | null
          original_price: number | null
          preparation_time: number | null
          price: number
          restaurant_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          category_id: string
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          ingredients?: string[] | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name: string
          nutritional_info?: Json | null
          original_price?: number | null
          preparation_time?: number | null
          price: number
          restaurant_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          category_id?: string
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          ingredients?: string[] | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name?: string
          nutritional_info?: Json | null
          original_price?: number | null
          preparation_time?: number | null
          price?: number
          restaurant_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message_type: string
          read_at: string | null
          sender_id: string
          sender_type: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id: string
          sender_type: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          driver_updates: boolean
          id: string
          marketing: boolean
          order_updates: boolean
          promotions: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sound_enabled: boolean
          updated_at: string
          user_id: string
          vibration_enabled: boolean
        }
        Insert: {
          created_at?: string
          driver_updates?: boolean
          id?: string
          marketing?: boolean
          order_updates?: boolean
          promotions?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean
          updated_at?: string
          user_id: string
          vibration_enabled?: boolean
        }
        Update: {
          created_at?: string
          driver_updates?: boolean
          id?: string
          marketing?: boolean
          order_updates?: boolean
          promotions?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean
          updated_at?: string
          user_id?: string
          vibration_enabled?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          order_id: string | null
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          read?: boolean
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_info: Json
          delivered_at: string | null
          delivery_address: Json
          delivery_started_at: string | null
          driver_id: string | null
          estimated_delivery_time: string | null
          id: string
          items: Json
          order_number: string
          payment_method: string
          payment_status: string
          pickup_time: string | null
          restaurant_id: string | null
          special_instructions: string | null
          status: string
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_info: Json
          delivered_at?: string | null
          delivery_address: Json
          delivery_started_at?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          items: Json
          order_number: string
          payment_method?: string
          payment_status?: string
          pickup_time?: string | null
          restaurant_id?: string | null
          special_instructions?: string | null
          status?: string
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_info?: Json
          delivered_at?: string | null
          delivery_address?: Json
          delivery_started_at?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string
          payment_status?: string
          pickup_time?: string | null
          restaurant_id?: string | null
          special_instructions?: string | null
          status?: string
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          notification_type: string
          read_at: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          item_id: string
          metadata: Json | null
          reasoning: string | null
          recommendation_type: string
          relevance_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          item_id: string
          metadata?: Json | null
          reasoning?: string | null
          recommendation_type: string
          relevance_score: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          item_id?: string
          metadata?: Json | null
          reasoning?: string | null
          recommendation_type?: string
          relevance_score?: number
          user_id?: string
        }
        Relationships: []
      }
      restaurant_documents: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          restaurant_id: string
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          restaurant_id: string
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          restaurant_id?: string
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_documents_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_hours_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_notification_settings: {
        Row: {
          created_at: string
          customer_messages: boolean | null
          email_notifications: boolean | null
          id: string
          marketing: boolean | null
          new_orders: boolean | null
          order_updates: boolean | null
          push_notifications: boolean | null
          restaurant_id: string
          sound_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_messages?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing?: boolean | null
          new_orders?: boolean | null
          order_updates?: boolean | null
          push_notifications?: boolean | null
          restaurant_id: string
          sound_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_messages?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing?: boolean | null
          new_orders?: boolean | null
          order_updates?: boolean | null
          push_notifications?: boolean | null
          restaurant_id?: string
          sound_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_notification_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          admin_notes: string | null
          business_name: string
          business_type: string
          created_at: string
          delivery_radius: number | null
          description: string | null
          email: string
          id: string
          is_active: boolean | null
          is_open: boolean | null
          phone: string
          rating: number | null
          registration_status: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          business_name: string
          business_type: string
          created_at?: string
          delivery_radius?: number | null
          description?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_open?: boolean | null
          phone: string
          rating?: number | null
          registration_status?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          business_name?: string
          business_type?: string
          created_at?: string
          delivery_radius?: number | null
          description?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_open?: boolean | null
          phone?: string
          rating?: number | null
          registration_status?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          order_id: string
          photos: string[] | null
          rating: number
          restaurant_id: string
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          photos?: string[] | null
          rating: number
          restaurant_id: string
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          photos?: string[] | null
          rating?: number
          restaurant_id?: string
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          consent_type: string
          created_at: string | null
          expires_at: string | null
          granted: boolean
          id: string
          ip_address: unknown | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          expires_at?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
          version?: string
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          expires_at?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          dietary_restrictions: string[] | null
          favorite_cuisines: string[] | null
          id: string
          notification_settings: Json
          preferences: Json
          privacy_settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          id?: string
          notification_settings?: Json
          preferences?: Json
          privacy_settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          id?: string
          notification_settings?: Json
          preferences?: Json
          privacy_settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: string
          item_data: Json
          item_id: string
          item_type: string
          notes: string | null
          priority: number | null
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          item_data: Json
          item_id: string
          item_type: string
          notes?: string | null
          priority?: number | null
          wishlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          item_data?: Json
          item_id?: string
          item_type?: string
          notes?: string | null
          priority?: number | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
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
      admin_get_driver_document: {
        Args: { document_type: string; driver_user_id: string }
        Returns: {
          content_type: string
          created_at: string
          file_name: string
          file_path: string
          size: number
        }[]
      }
      audit_data_access: {
        Args: {
          action_name: string
          additional_details?: Json
          resource_identifier?: string
          resource_name: string
        }
        Returns: undefined
      }
      can_access_driver_document: {
        Args: { document_path: string; driver_user_id: string }
        Returns: boolean
      }
      check_admin_permission: {
        Args: { permission_key: string; user_uuid?: string }
        Returns: boolean
      }
      check_is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      create_system_notification: {
        Args: {
          action_url_param?: string
          notification_message: string
          notification_title: string
          notification_type?: string
          related_order_id?: string
          target_user_id: string
        }
        Returns: string
      }
      get_driver_info_for_user_order: {
        Args: { order_id_param: string }
        Returns: {
          driver_id: string
          first_name: string
          last_name_initial: string
          rating: number
          status: string
          total_deliveries: number
          vehicle_type: string
        }[]
      }
      get_restaurant_by_user: {
        Args: { user_uuid?: string }
        Returns: {
          address: string
          business_name: string
          business_type: string
          delivery_radius: number
          description: string
          email: string
          id: string
          is_active: boolean
          is_open: boolean
          phone: string
          rating: number
          registration_status: string
          website: string
        }[]
      }
      get_restaurant_reviews: {
        Args: { restaurant_id_param: string }
        Returns: {
          anonymous_user_id: string
          created_at: string
          id: string
          photos: string[]
          rating: number
          restaurant_id: string
          review_text: string
          updated_at: string
        }[]
      }
      get_safe_driver_info_for_order: {
        Args: { order_id_param: string }
        Returns: {
          driver_id: string
          first_name: string
          last_name_initial: string
          rating: number
          status: string
          vehicle_type: string
        }[]
      }
      has_admin_permission: {
        Args: { permission_key: string; user_uuid?: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_driver: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      log_suspicious_activity: {
        Args: {
          activity_type: string
          description_text?: string
          metadata_json?: Json
          severity_level?: string
          title_text?: string
        }
        Returns: string
      }
      user_can_view_driver_for_order: {
        Args: { driver_user_id: string }
        Returns: boolean
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
