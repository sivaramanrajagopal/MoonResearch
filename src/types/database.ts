// Database types for the Astrology Research App

export interface Planet {
  id: number;
  name: string;
  rasi: {
    id: number;
    lord: {
      id: number;
      name: string;
      vedic_name: string;
    };
    name: string;
  };
  degree: number;
  position: number;
  longitude: number;
  is_retrograde: boolean;
}

export interface DailyPlanets {
  id: string;
  date: string;
  planetary_data: Planet[];
  last_updated: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  sleep_duration: number | null;
  mood_score: number | null;
  disturbances: boolean;
  notes: string | null;
  planetary_data_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryWithPlanets extends JournalEntry {
  planetary_data: Planet[] | null;
  planetary_data_updated: string | null;
}

export interface JournalEntryInput {
  date: string;
  sleep_duration: number | null;
  mood_score: number | null;
  disturbances: boolean;
  notes: string | null;
}

// Supabase Database type definitions
export interface Database {
  public: {
    Tables: {
      daily_planets: {
        Row: DailyPlanets;
        Insert: Omit<DailyPlanets, 'id' | 'last_updated'>;
        Update: Partial<Omit<DailyPlanets, 'id'>>;
      };
      journal_entries: {
        Row: JournalEntry;
        Insert: {
          user_id: string;
          date: string;
          sleep_duration?: number | null;
          mood_score?: number | null;
          disturbances?: boolean;
          notes?: string | null;
          planetary_data_id?: string | null;
        };
        Update: {
          date?: string;
          sleep_duration?: number | null;
          mood_score?: number | null;
          disturbances?: boolean;
          notes?: string | null;
          planetary_data_id?: string | null;
        };
      };
    };
    Views: {
      journal_entries_with_planets: {
        Row: JournalEntryWithPlanets;
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Analytics types for correlations
export interface MoodCorrelation {
  date: string;
  mood_score: number;
  moon_phase: string;
  nakshatra: string;
  rasi: string;
}

export interface SleepCorrelation {
  date: string;
  sleep_duration: number;
  disturbances: boolean;
  planetary_positions: {
    planet: string;
    rasi: string;
    degree: number;
  }[];
}

// Chart data types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  metadata?: unknown;
}
