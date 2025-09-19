/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { getJournalEntries } from '@/lib/database';
import { JournalEntryWithPlanets } from '@/types/database';
import { UserProfile } from '@/types/profile';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import ProfileSetup from '@/components/ProfileSetup';
import PlanetaryWidget from '@/components/PlanetaryWidget';
import { 
  PlusIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  MoonIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [recentEntries, setRecentEntries] = useState<JournalEntryWithPlanets[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent entries
        const entries = await getJournalEntries();
        setRecentEntries(entries.slice(0, 5));

        // Fetch user profile
        if (user && supabase) {
          const { data: profileData } = await (supabase as any)
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getMoonPhaseEmoji = (moonPosition: number) => {
    // Simplified moon phase calculation based on position
    if (moonPosition >= 0 && moonPosition < 90) return '🌑';
    if (moonPosition >= 90 && moonPosition < 180) return '🌓';
    if (moonPosition >= 180 && moonPosition < 270) return '🌕';
    return '🌗';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className={`text-3xl font-bold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
                  {t('dashboard.title')}
                </h1>
                <p className={`mt-2 text-gray-700 ${language === 'ta' ? 'font-tamil' : ''}`}>
                  {t('dashboard.welcome')}
                </p>
              </div>
              
              {/* Profile Setup Button */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowProfileSetup(true)}
                  className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium ${language === 'ta' ? 'font-tamil' : ''}`}
                >
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  {userProfile ? 
                    (language === 'ta' ? 'சுயவிவரம் திருத்து' : 'Edit Profile') :
                    (language === 'ta' ? 'சுயவிவரம் அமைக்க' : 'Setup Profile')
                  }
                </button>
              </div>
            </div>

            {/* Profile Setup Modal */}
            {showProfileSetup && (
              <ProfileSetup 
                existingProfile={userProfile}
                onComplete={() => {
                  setShowProfileSetup(false);
                  // Refresh profile data
                  if (user && supabase) {
                    (supabase as any)
                      .from('user_profiles')
                      .select('*')
                      .eq('user_id', user.id)
                      .single()
                      .then(({ data }: any) => setUserProfile(data));
                  }
                }}
              />
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
              <Link
                href="/journal/new"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                    <PlusIcon className="h-6 w-6" />
                  </span>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">New Entry</h3>
                    <p className="text-sm text-gray-500">Record today&apos;s experience</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/journal/history"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <BookOpenIcon className="h-6 w-6" />
                  </span>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Journal History</h3>
                    <p className="text-sm text-gray-500">View past entries</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/analytics"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <ChartBarIcon className="h-6 w-6" />
                  </span>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-500">Explore correlations</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Mobile: Planetary Positions First */}
            <div className="block lg:hidden mb-6">
              <PlanetaryWidget compact={true} />
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Recent Entries */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className={`text-lg leading-6 font-bold text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                      {t('dashboard.recentEntries')}
                    </h3>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : recentEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <MoonIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No entries yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by creating your first journal entry.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/journal/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        New Entry
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEntries.map((entry) => {
                      const moonPlanet = entry.planetary_data?.find(p => p.name === 'Moon');
                      return (
                        <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                                </span>
                                {moonPlanet && (
                                  <span className="text-lg">
                                    {getMoonPhaseEmoji(moonPlanet.longitude)}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                {entry.mood_score && (
                                  <span>Mood: {entry.mood_score}/10</span>
                                )}
                                {entry.sleep_duration && (
                                  <span>Sleep: {entry.sleep_duration}h</span>
                                )}
                                {entry.disturbances && (
                                  <span className="text-orange-600">Disturbances</span>
                                )}
                              </div>
                              {entry.notes && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                  {entry.notes}
                                </p>
                              )}
                            </div>
                            <div className="ml-4">
                              <Link
                                href={`/journal/history`}
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="text-center pt-4">
                      <Link
                        href="/journal/history"
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        View all entries →
                      </Link>
                    </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              {/* Planetary Positions Widget - Desktop Only */}
              <div className="hidden lg:block lg:col-span-1">
                <PlanetaryWidget compact={true} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
