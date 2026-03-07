export type UserRole = "buyer" | "admin" | "production" | "accounting";

export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "in_production"
  | "manufactured"
  | "packed"
  | "invoiced"
  | "paid"
  | "cancelled";

export type ProductionStatus = "pending" | "in_progress" | "completed";

export type InvoiceStatus = "draft" | "sent" | "paid";

export type StockMovementType = "purchase" | "production_use" | "adjustment";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          company_name: string | null;
          country: string | null;
          language: string;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          company_name?: string | null;
          country?: string | null;
          language?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          flavour: string | null;
          weight_per_unit_grams: number;
          dimensions_cm: string | null;
          units_per_masterbox: number;
          masterboxes_per_pallet: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          description?: string | null;
          flavour?: string | null;
          weight_per_unit_grams: number;
          dimensions_cm?: string | null;
          units_per_masterbox: number;
          masterboxes_per_pallet: number;
          image_url?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_translations: {
        Row: {
          id: string;
          product_id: string;
          language: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          language: string;
          name: string;
          description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_translations"]["Insert"]>;
      };
      customer_prices: {
        Row: {
          id: string;
          customer_id: string;
          product_id: string;
          price_per_unit: number;
          currency: string;
          valid_from: string;
          valid_until: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          product_id: string;
          price_per_unit: number;
          currency?: string;
          valid_from?: string;
          valid_until?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customer_prices"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          status: OrderStatus;
          total_amount: number | null;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id: string;
          status?: OrderStatus;
          total_amount?: number | null;
          currency?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity_masterboxes: number;
          unit_price: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity_masterboxes: number;
          unit_price: number;
          line_total: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      raw_materials: {
        Row: {
          id: string;
          name: string;
          unit: string;
          current_stock: number;
          min_stock_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          unit: string;
          current_stock?: number;
          min_stock_level?: number;
        };
        Update: Partial<Database["public"]["Tables"]["raw_materials"]["Insert"]>;
      };
      product_bom: {
        Row: {
          id: string;
          product_id: string;
          raw_material_id: string;
          quantity_per_unit: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          raw_material_id: string;
          quantity_per_unit: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_bom"]["Insert"]>;
      };
      stock_movements: {
        Row: {
          id: string;
          raw_material_id: string;
          quantity: number;
          type: StockMovementType;
          reference: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          raw_material_id: string;
          quantity: number;
          type: StockMovementType;
          reference?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["stock_movements"]["Insert"]>;
      };
      production_orders: {
        Row: {
          id: string;
          order_id: string;
          status: ProductionStatus;
          notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status?: ProductionStatus;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["production_orders"]["Insert"]>;
      };
      packing_lists: {
        Row: {
          id: string;
          order_id: string;
          pdf_url: string | null;
          total_weight_kg: number | null;
          total_pallets: number | null;
          total_masterboxes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          pdf_url?: string | null;
          total_weight_kg?: number | null;
          total_pallets?: number | null;
          total_masterboxes?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["packing_lists"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          order_id: string;
          invoice_number: string;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          currency: string;
          status: InvoiceStatus;
          pdf_url: string | null;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          invoice_number: string;
          subtotal: number;
          tax_rate?: number;
          tax_amount?: number;
          total: number;
          currency?: string;
          status?: InvoiceStatus;
          pdf_url?: string | null;
          due_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount: number;
          payment_method: string | null;
          reference: string | null;
          confirmed_by: string | null;
          confirmed_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount: number;
          payment_method?: string | null;
          reference?: string | null;
          confirmed_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          data: Record<string, unknown> | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          data?: Record<string, unknown> | null;
          read?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
  };
}
