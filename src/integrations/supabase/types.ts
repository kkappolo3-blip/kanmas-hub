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
      laporan_bulanan: {
        Row: {
          bulan: number
          catatan: string | null
          created_at: string
          id: string
          ringkasan: string | null
          tahun: number
          total_kegiatan: number | null
        }
        Insert: {
          bulan: number
          catatan?: string | null
          created_at?: string
          id?: string
          ringkasan?: string | null
          tahun: number
          total_kegiatan?: number | null
        }
        Update: {
          bulan?: number
          catatan?: string | null
          created_at?: string
          id?: string
          ringkasan?: string | null
          tahun?: number
          total_kegiatan?: number | null
        }
        Relationships: []
      }
      personil: {
        Row: {
          created_at: string
          desa_binaan: string | null
          drive_folder: string | null
          id: string
          jabatan: string | null
          nama: string
          no_hp: string | null
          nrp: string | null
          pangkat: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          desa_binaan?: string | null
          drive_folder?: string | null
          id?: string
          jabatan?: string | null
          nama: string
          no_hp?: string | null
          nrp?: string | null
          pangkat?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          desa_binaan?: string | null
          drive_folder?: string | null
          id?: string
          jabatan?: string | null
          nama?: string
          no_hp?: string | null
          nrp?: string | null
          pangkat?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ranmor: {
        Row: {
          catatan: string | null
          created_at: string
          foto_belakang: string | null
          foto_depan: string | null
          foto_kanan: string | null
          foto_kiri: string | null
          foto_no_mesin: string | null
          foto_no_rangka: string | null
          id: string
          jenis: string | null
          kondisi: string | null
          merk: string | null
          no_mesin: string | null
          no_polisi: string | null
          no_rangka: string | null
          personil_id: string | null
          tahun: number | null
          tipe: string | null
          updated_at: string
          warna: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          foto_belakang?: string | null
          foto_depan?: string | null
          foto_kanan?: string | null
          foto_kiri?: string | null
          foto_no_mesin?: string | null
          foto_no_rangka?: string | null
          id?: string
          jenis?: string | null
          kondisi?: string | null
          merk?: string | null
          no_mesin?: string | null
          no_polisi?: string | null
          no_rangka?: string | null
          personil_id?: string | null
          tahun?: number | null
          tipe?: string | null
          updated_at?: string
          warna?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string
          foto_belakang?: string | null
          foto_depan?: string | null
          foto_kanan?: string | null
          foto_kiri?: string | null
          foto_no_mesin?: string | null
          foto_no_rangka?: string | null
          id?: string
          jenis?: string | null
          kondisi?: string | null
          merk?: string | null
          no_mesin?: string | null
          no_polisi?: string | null
          no_rangka?: string | null
          personil_id?: string | null
          tahun?: number | null
          tipe?: string | null
          updated_at?: string
          warna?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ranmor_personil_id_fkey"
            columns: ["personil_id"]
            isOneToOne: false
            referencedRelation: "personil"
            referencedColumns: ["id"]
          },
        ]
      }
      rencana_kegiatan: {
        Row: {
          created_at: string
          id: string
          jenis_giat: string
          lokasi: string | null
          personil_id: string | null
          sasaran: string | null
          status: string | null
          tanggal: string
          updated_at: string
          uraian: string | null
          waktu_mulai: string | null
          waktu_selesai: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_giat: string
          lokasi?: string | null
          personil_id?: string | null
          sasaran?: string | null
          status?: string | null
          tanggal: string
          updated_at?: string
          uraian?: string | null
          waktu_mulai?: string | null
          waktu_selesai?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          jenis_giat?: string
          lokasi?: string | null
          personil_id?: string | null
          sasaran?: string | null
          status?: string | null
          tanggal?: string
          updated_at?: string
          uraian?: string | null
          waktu_mulai?: string | null
          waktu_selesai?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rencana_kegiatan_personil_id_fkey"
            columns: ["personil_id"]
            isOneToOne: false
            referencedRelation: "personil"
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
