'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { createJournalEntry, getJournalEntryByDate } from '@/lib/database';
import { JournalEntryInput } from '@/types/database';
import { format } from 'date-fns';
import { 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import PlanetaryWidget from '@/components/PlanetaryWidget';

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingEntry, setExistingEntry] = useState(false);
  const [formData, setFormData] = useState<JournalEntryInput>({
    date: format(new Date(), 'yyyy-MM-dd'),
    sleep_duration: null,
    mood_score: null,
    disturbances: false,
    notes: null,
  });

  useEffect(() => {
    const checkExistingEntry = async () => {
      try {
        const existingResponse = await getJournalEntryByDate(formData.date);
        setExistingEntry(!!existingResponse);
      } catch (error) {
        console.error('Error checking existing entry:', error);
      }
    };

    checkExistingEntry();
  }, [formData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createJournalEntry(formData);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating entry:', error);
      alert('Error creating entry: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof JournalEntryInput, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-4xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">New Journal Entry</h1>
              <p className="mt-2 text-gray-600">
                Record your daily experience and see how it correlates with planetary positions.
              </p>
            </div>

            {existingEntry && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You already have an entry for this date. Creating a new entry will add another record.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Planetary Positions - Mobile First */}
            <div className="mb-6">
              <PlanetaryWidget 
                date={formData.date}
                compact={true}
              />
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Journal Entry Form */}
              <div className="w-full">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Date */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-bold text-black mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black text-base"
                          required
                        />
                      </div>

                      {/* Sleep Duration */}
                      <div>
                        <label htmlFor="sleep_duration" className="block text-sm font-bold text-black mb-2">
                          Sleep Duration (hours)
                        </label>
                        <input
                          type="number"
                          id="sleep_duration"
                          step="0.5"
                          min="0"
                          max="24"
                          value={formData.sleep_duration || ''}
                          onChange={(e) => handleInputChange('sleep_duration', e.target.value ? parseFloat(e.target.value) : null)}
                          className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black text-base"
                          placeholder="e.g., 7.5"
                        />
                      </div>

                      {/* Mood Score */}
                      <div>
                        <label htmlFor="mood_score" className="block text-sm font-bold text-black mb-2">
                          Mood Score (1-10)
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <input
                            type="range"
                            id="mood_score"
                            min="1"
                            max="10"
                            value={formData.mood_score || 5}
                            onChange={(e) => handleInputChange('mood_score', parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-900 w-8">
                            {formData.mood_score || 5}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>Very Low</span>
                          <span>Very High</span>
                        </div>
                      </div>

                      {/* Disturbances */}
                      <div>
                        <div className="flex items-center">
                          <input
                            id="disturbances"
                            type="checkbox"
                            checked={formData.disturbances}
                            onChange={(e) => handleInputChange('disturbances', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                            <label htmlFor="disturbances" className="ml-2 block text-sm font-medium text-black">
                            Sleep disturbances or unusual events
                          </label>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-bold text-black mb-2">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          rows={4}
                          value={formData.notes || ''}
                          onChange={(e) => handleInputChange('notes', e.target.value || null)}
                          className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black text-base"
                          placeholder="Any additional observations, dreams, feelings, or events..."
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => router.back()}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
