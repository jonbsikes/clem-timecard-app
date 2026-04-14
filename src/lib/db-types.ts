// Minimal hand-written types. Regenerate with:
//   npx supabase gen types typescript --project-id bocwkfaldyibtlkhajzy > src/lib/db-types.ts
export type UserRole = "employee" | "admin";
export type ProjectStatus = "active" | "complete" | "archived";
export type JobStatus = "in_progress" | "complete";
export type FileType = "site_plan" | "construction_doc" | "photo" | "other";

export interface Database {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow> & { id: string; email: string }; Update: Partial<UserRow>; };
      projects: { Row: ProjectRow; Insert: Partial<ProjectRow> & { name: string }; Update: Partial<ProjectRow>; };
      equipment: { Row: EquipmentRow; Insert: Partial<EquipmentRow> & { name: string }; Update: Partial<EquipmentRow>; };
      work_types: { Row: WorkTypeRow; Insert: Partial<WorkTypeRow> & { name: string }; Update: Partial<WorkTypeRow>; };
      time_cards: { Row: TimeCardRow; Insert: Partial<TimeCardRow> & { user_id: string; project_id: string }; Update: Partial<TimeCardRow>; };
      time_card_entries: { Row: EntryRow; Insert: Partial<EntryRow> & { time_card_id: string; hours: number; work_type_id: string }; Update: Partial<EntryRow>; };
      entry_photos: { Row: EntryPhotoRow; Insert: Partial<EntryPhotoRow> & { time_card_entry_id: string; file_url: string }; Update: Partial<EntryPhotoRow>; };
      project_documents: { Row: DocRow; Insert: Partial<DocRow> & { project_id: string; file_url: string; file_name: string }; Update: Partial<DocRow>; };
      app_settings: { Row: SettingsRow; Insert: Partial<SettingsRow>; Update: Partial<SettingsRow>; };
    };
    Views: Record<string, never>;
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface UserRow { id: string; email: string; full_name: string; phone: string | null; role: UserRole; active: boolean; created_at: string; }
export interface ProjectRow { id: string; name: string; client_name: string | null; address: string | null; lot_block: string | null; status: ProjectStatus; notes: string | null; created_by: string | null; created_at: string; }
export interface EquipmentRow { id: string; name: string; category: string | null; internal_id: string | null; active: boolean; created_at: string; }
export interface WorkTypeRow { id: string; name: string; active: boolean; created_at: string; }
export interface TimeCardRow { id: string; user_id: string; project_id: string; work_date: string; submitted_at: string; gps_lat: number | null; gps_lng: number | null; locked: boolean; }
export interface EntryRow { id: string; time_card_id: string; hours: number; work_type_id: string; equipment_id: string | null; job_status: JobStatus; notes: string | null; created_at: string; }
export interface EntryPhotoRow { id: string; time_card_entry_id: string; file_url: string; storage_path: string | null; uploaded_at: string; }
export interface DocRow { id: string; project_id: string; file_url: string; storage_path: string | null; file_name: string; file_type: FileType; uploaded_by: string | null; uploaded_at: string; }
export interface SettingsRow { id: number; summary_recipient_email: string | null; summary_send_hour: number; timezone: string; updated_at: string; }
