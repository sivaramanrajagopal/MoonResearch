/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';
import { validateJournalEntry, sanitizeInput } from './security';
import type { 
  JournalEntry, 
  JournalEntryInput, 
  JournalEntryWithPlanets, 
  DailyPlanets 
} from '@/types/database';

// Journal Entry Functions
export const createJournalEntry = async (entry: JournalEntryInput): Promise<JournalEntry | null> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate input data
  const validation = validateJournalEntry({
    mood_score: entry.mood_score,
    sleep_duration: entry.sleep_duration,
    notes: entry.notes
  });

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Sanitize notes input
  const sanitizedNotes = entry.notes ? sanitizeInput(entry.notes) : null;

  const { data, error } = await (supabase as any)
    .from('journal_entries')
    .insert({
      user_id: user.id,
      date: entry.date,
      sleep_duration: entry.sleep_duration,
      mood_score: entry.mood_score,
      disturbances: entry.disturbances,
      notes: sanitizedNotes
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }

  return data;
};

export const getJournalEntries = async (): Promise<JournalEntryWithPlanets[]> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await (supabase as any)
    .from('journal_entries_with_planets')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }

  return data || [];
};

export const getJournalEntryByDate = async (date: string): Promise<JournalEntryWithPlanets | null> => {
  if (!supabase) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await (supabase as any)
    .from('journal_entries_with_planets')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error fetching journal entry:', error);
    throw error;
  }

  return data || null;
};

export const updateJournalEntry = async (id: string, updates: Partial<JournalEntryInput>): Promise<JournalEntry | null> => {
  if (!supabase) return null;
  
  const { data, error } = await (supabase as any)
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }

  return data;
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  if (!supabase) return;
  
  const { error } = await (supabase as any)
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Planetary Data Functions
export const getPlanetaryDataByDate = async (date: string): Promise<DailyPlanets | null> => {
  if (!supabase) return null;
  
  const { data, error } = await (supabase as any)
    .from('daily_planets')
    .select('*')
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching planetary data:', error);
    throw error;
  }

  return data || null;
};

export const getPlanetaryDataRange = async (startDate: string, endDate: string): Promise<DailyPlanets[]> => {
  if (!supabase) return [];
  
  const { data, error } = await (supabase as any)
    .from('daily_planets')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching planetary data range:', error);
    throw error;
  }

  return data || [];
};

// Analytics Functions
export const getJournalEntriesForAnalytics = async (startDate?: string, endDate?: string): Promise<JournalEntryWithPlanets[]> => {
  if (!supabase) return [];
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('journal_entries_with_planets')
    .select('*')
    .eq('user_id', user.id)
    .not('mood_score', 'is', null)
    .not('sleep_duration', 'is', null)
    .order('date', { ascending: true });

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }

  return data || [];
};
