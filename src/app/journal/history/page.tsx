'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { getJournalEntries } from '@/lib/database';
import { JournalEntryWithPlanets } from '@/types/database';
import { useLanguage } from '@/contexts/LanguageContext';
import { translatePlanetName, translateRasiName } from '@/utils/planetTranslations';
import { format } from 'date-fns';
import { 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function JournalHistoryPage() {
  const [entries, setEntries] = useState<JournalEntryWithPlanets[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await getJournalEntries();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const getMoodColor = (score: number) => {
    if (score <= 3) return 'text-red-600 bg-red-50';
    if (score <= 5) return 'text-orange-600 bg-orange-50';
    if (score <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getMoonPhaseEmoji = (moonPosition: number) => {
    if (moonPosition >= 0 && moonPosition < 90) return '🌑';
    if (moonPosition >= 90 && moonPosition < 180) return '🌓';
    if (moonPosition >= 180 && moonPosition < 270) return '🌕';
    return '🌗';
  };

  const getPlanetIcon = (planetName: string) => {
    const icons: Record<string, string> = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Rahu': '☊',
      'Ketu': '☋'
    };
    return icons[planetName] || '●';
  };

  // Pagination
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = entries.slice(startIndex, endIndex);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Journal History</h1>
                <p className="mt-2 text-gray-600">
                  Review your past entries and their planetary correlations.
                </p>
              </div>
              <Link
                href="/journal/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                New Entry
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No journal entries</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start tracking your daily experiences and their correlations with planetary positions.
                </p>
                <div className="mt-6">
                  <Link
                    href="/journal/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create your first entry
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Entries Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {currentEntries.map((entry) => {
                    const moonPlanet = entry.planetary_data?.find(p => p.name === 'Moon');
                    
                    return (
                      <div key={entry.id} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                          {/* Header with Date and Moon Phase */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {format(new Date(entry.date), 'MMMM d, yyyy')}
                              </h3>
                              {moonPlanet && (
                                <span className="text-xl">
                                  {getMoonPhaseEmoji(moonPlanet.longitude)}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {format(new Date(entry.created_at), 'h:mm a')}
                            </span>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {entry.mood_score && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Mood:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood_score)}`}>
                                  {entry.mood_score}/10
                                </span>
                              </div>
                            )}
                            
                            {entry.sleep_duration && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Sleep:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {entry.sleep_duration}h
                                </span>
                              </div>
                            )}
                            
                            {entry.disturbances && (
                              <div className="col-span-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Sleep Disturbances
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {entry.notes && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {entry.notes}
                              </p>
                            </div>
                          )}

                          {/* Planetary Information - All 9 Planets */}
                          {entry.planetary_data && (
                            <div className="border-t pt-4">
                              <h4 className={`text-sm font-bold text-black mb-3 ${language === 'ta' ? 'font-tamil' : ''}`}>
                                {t('journal.planetaryPositions')}
                              </h4>
                              <div className="grid grid-cols-3 gap-2">
                                {['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
                                  .map(planetName => entry.planetary_data?.find(p => p.name === planetName))
                                  .filter((planet): planet is NonNullable<typeof planet> => Boolean(planet))
                                  .map((planet) => (
                                    <div key={planet.id} className="text-center bg-gray-50 rounded p-2">
                                      <div className="text-sm text-indigo-600 mb-1">
                                        {getPlanetIcon(planet.name)}
                                      </div>
                                      <div className={`text-xs font-bold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
                                        {translatePlanetName(planet.name, language)}
                                        {planet.is_retrograde && <span className="text-red-600 ml-1">℞</span>}
                                      </div>
                                      <div className={`text-xs text-black font-semibold ${language === 'ta' ? 'font-tamil' : ''}`}>
                                        {translateRasiName(planet.rasi.name, language)}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{startIndex + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(endIndex, entries.length)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{entries.length}</span>
                          {' '}results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === currentPage
                                  ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
