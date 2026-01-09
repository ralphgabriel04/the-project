/**
 * THE PROJECT - Database Types
 * These types match the Supabase schema
 */

// ============================================
// ENUMS
// ============================================

export type UserRole = "coach" | "athlete";

export type InvitationStatus = "pending" | "accepted" | "rejected";

export type ProgramStatus = "draft" | "active" | "archived";

export type ExerciseType = "strength" | "cardio" | "flexibility";

export type IntensityLevel = "easy" | "moderate" | "hard" | "very_hard";

// ============================================
// BASE TYPES (matching DB columns)
// ============================================

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CoachAthlete {
  id: string;
  coach_id: string;
  athlete_id: string;
  status: InvitationStatus;
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Program {
  id: string;
  coach_id: string | null; // Nullable for athlete-created programs
  created_by: string | null; // Creator ID (coach or athlete)
  name: string;
  description: string | null;
  status: ProgramStatus;
  duration_weeks: number | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ProgramAssignment {
  id: string;
  program_id: string;
  athlete_id: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Session {
  id: string;
  program_id: string;
  name: string;
  description: string | null;
  day_of_week: number | null; // 1-7 (Monday-Sunday)
  week_number: number;
  order_index: number;
  estimated_duration_minutes: number | null;
  session_type: ExerciseType;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Exercise {
  id: string;
  session_id: string;
  name: string;
  description: string | null;
  sets: number | null;
  reps: string | null; // Can be "8-12" or "AMRAP"
  rest_seconds: number | null;
  tempo: string | null; // e.g., "3-1-2-0"
  notes: string | null;
  video_url: string | null;
  order_index: number;
  // Cardio/Flexibility fields
  exercise_type: ExerciseType;
  target_distance_km: number | null;
  target_duration_minutes: number | null;
  target_heart_rate: number | null;
  intensity: IntensityLevel | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface SessionLog {
  id: string;
  session_id: string;
  athlete_id: string;
  completed_at: string;
  duration_minutes: number | null;
  overall_rpe: number | null; // 1-10
  athlete_notes: string | null;
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ExerciseLog {
  id: string;
  session_log_id: string;
  exercise_id: string;
  athlete_id: string;
  set_number: number;
  // Strength fields
  weight_kg: number | null;
  reps_completed: number | null;
  rpe: number | null; // 1-10
  // Cardio fields
  distance_km: number | null;
  duration_minutes: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  pace_per_km_seconds: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface SessionImage {
  id: string;
  session_log_id: string;
  athlete_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  is_deleted: boolean;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  is_deleted: boolean;
}

// ============================================
// MOTIVATIONAL QUOTES & COACH MESSAGES
// ============================================

export interface MotivationalQuote {
  id: string;
  content: string;
  author: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface CoachMessage {
  id: string;
  coach_id: string;
  athlete_id: string;
  content: string;
  display_date: string;
  expires_at: string | null;
  is_read: boolean;
  created_at: string;
  is_deleted: boolean;
}

// ============================================
// READINESS LOGS
// ============================================

export interface ReadinessLog {
  id: string;
  athlete_id: string;
  log_date: string;
  sleep_quality: number | null;
  energy_level: number | null;
  muscle_soreness: number | null;
  stress_level: number | null;
  overall_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// ============================================
// INSERT TYPES (for creating new records)
// ============================================

export type ProfileInsert = {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  bio?: string | null;
};

export type CoachAthleteInsert = Pick<CoachAthlete, "coach_id" | "athlete_id">;

export type ProgramInsert = Pick<Program, "name"> &
  Partial<Pick<Program, "coach_id" | "created_by" | "description" | "status" | "duration_weeks">>;

export type ProgramAssignmentInsert = Pick<
  ProgramAssignment,
  "program_id" | "athlete_id"
> &
  Partial<Pick<ProgramAssignment, "start_date" | "end_date">>;

export type SessionInsert = Pick<Session, "program_id" | "name"> &
  Partial<
    Pick<
      Session,
      | "description"
      | "day_of_week"
      | "week_number"
      | "order_index"
      | "estimated_duration_minutes"
      | "session_type"
    >
  >;

export type ExerciseInsert = Pick<Exercise, "session_id" | "name"> &
  Partial<
    Pick<
      Exercise,
      | "description"
      | "sets"
      | "reps"
      | "rest_seconds"
      | "tempo"
      | "notes"
      | "video_url"
      | "order_index"
      | "exercise_type"
      | "target_distance_km"
      | "target_duration_minutes"
      | "target_heart_rate"
      | "intensity"
    >
  >;

export type SessionLogInsert = Pick<SessionLog, "session_id" | "athlete_id"> &
  Partial<
    Pick<
      SessionLog,
      | "completed_at"
      | "duration_minutes"
      | "overall_rpe"
      | "athlete_notes"
      | "coach_notes"
    >
  >;

export type ExerciseLogInsert = Pick<
  ExerciseLog,
  "session_log_id" | "exercise_id" | "athlete_id" | "set_number"
> &
  Partial<
    Pick<
      ExerciseLog,
      | "weight_kg"
      | "reps_completed"
      | "rpe"
      | "notes"
      | "distance_km"
      | "duration_minutes"
      | "heart_rate_avg"
      | "heart_rate_max"
      | "pace_per_km_seconds"
    >
  >;

export type SessionImageInsert = Pick<
  SessionImage,
  "session_log_id" | "athlete_id" | "image_url"
> &
  Partial<Pick<SessionImage, "caption">>;

export type ConversationInsert = Pick<Conversation, "participant_1" | "participant_2">;

export type MessageInsert = Pick<Message, "conversation_id" | "sender_id" | "content">;

export type CoachMessageInsert = Pick<CoachMessage, "coach_id" | "athlete_id" | "content"> &
  Partial<Pick<CoachMessage, "display_date" | "expires_at">>;

export type ReadinessLogInsert = Pick<ReadinessLog, "athlete_id"> &
  Partial<
    Pick<
      ReadinessLog,
      | "log_date"
      | "sleep_quality"
      | "energy_level"
      | "muscle_soreness"
      | "stress_level"
      | "overall_score"
      | "notes"
    >
  >;

// ============================================
// UPDATE TYPES
// ============================================

export type ProfileUpdate = Partial<
  Pick<Profile, "first_name" | "last_name" | "avatar_url" | "bio">
>;

export type ProgramUpdate = Partial<
  Pick<Program, "name" | "description" | "status" | "duration_weeks">
>;

export type SessionUpdate = Partial<
  Pick<
    Session,
    | "name"
    | "description"
    | "day_of_week"
    | "week_number"
    | "order_index"
    | "estimated_duration_minutes"
    | "session_type"
  >
>;

export type ExerciseUpdate = Partial<
  Pick<
    Exercise,
    | "name"
    | "description"
    | "sets"
    | "reps"
    | "rest_seconds"
    | "tempo"
    | "notes"
    | "video_url"
    | "order_index"
    | "exercise_type"
    | "target_distance_km"
    | "target_duration_minutes"
    | "target_heart_rate"
    | "intensity"
  >
>;

// ============================================
// JOINED/EXTENDED TYPES (for UI)
// ============================================

export interface ProfileWithRelations extends Profile {
  // For coaches: list of their athletes
  athletes?: Profile[];
  // For athletes: list of their coaches
  coaches?: Profile[];
}

export interface ProgramWithSessions extends Program {
  sessions: SessionWithExercises[];
}

export interface SessionWithExercises extends Session {
  exercises: Exercise[];
}

export interface SessionLogWithDetails extends SessionLog {
  session: Session;
  exercise_logs: ExerciseLogWithExercise[];
  images: SessionImage[];
}

export interface ExerciseLogWithExercise extends ExerciseLog {
  exercise: Exercise;
}

export interface ConversationWithParticipant extends Conversation {
  other_participant: Profile;
  last_message?: Message;
  unread_count: number;
}

export interface MessageWithSender extends Message {
  sender: Profile;
}

export interface CoachMessageWithCoach extends CoachMessage {
  coach: Pick<Profile, "id" | "first_name" | "last_name" | "avatar_url">;
}

// ============================================
// SUPABASE DATABASE TYPE (for client)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      coach_athletes: {
        Row: CoachAthlete;
        Insert: CoachAthleteInsert;
        Update: Partial<CoachAthlete>;
        Relationships: [];
      };
      programs: {
        Row: Program;
        Insert: ProgramInsert;
        Update: ProgramUpdate;
        Relationships: [];
      };
      program_assignments: {
        Row: ProgramAssignment;
        Insert: ProgramAssignmentInsert;
        Update: Partial<ProgramAssignment>;
        Relationships: [];
      };
      sessions: {
        Row: Session;
        Insert: SessionInsert;
        Update: SessionUpdate;
        Relationships: [];
      };
      exercises: {
        Row: Exercise;
        Insert: ExerciseInsert;
        Update: ExerciseUpdate;
        Relationships: [];
      };
      session_logs: {
        Row: SessionLog;
        Insert: SessionLogInsert;
        Update: Partial<SessionLog>;
        Relationships: [];
      };
      exercise_logs: {
        Row: ExerciseLog;
        Insert: ExerciseLogInsert;
        Update: Partial<ExerciseLog>;
        Relationships: [];
      };
      session_images: {
        Row: SessionImage;
        Insert: SessionImageInsert;
        Update: Partial<SessionImage>;
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: ConversationInsert;
        Update: Partial<Conversation>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: Partial<Message>;
        Relationships: [];
      };
      motivational_quotes: {
        Row: MotivationalQuote;
        Insert: Omit<MotivationalQuote, "id" | "created_at">;
        Update: Partial<Omit<MotivationalQuote, "id" | "created_at">>;
        Relationships: [];
      };
      coach_messages: {
        Row: CoachMessage;
        Insert: CoachMessageInsert;
        Update: Partial<CoachMessage>;
        Relationships: [];
      };
      readiness_logs: {
        Row: ReadinessLog;
        Insert: ReadinessLogInsert;
        Update: Partial<ReadinessLog>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      invitation_status: InvitationStatus;
      program_status: ProgramStatus;
      exercise_type: ExerciseType;
      intensity_level: IntensityLevel;
    };
    CompositeTypes: Record<string, never>;
  };
}

