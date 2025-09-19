/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { isUserAdmin } from '@/lib/security';
import { format } from 'date-fns';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

interface AdminUser {
  user_id: string;
  email: string;
  registered_at: string;
  last_sign_in_at: string;
  birth_rasi: string;
  birth_nakshatra: string;
  birth_date: string;
  total_entries: number;
  last_entry_date: string;
  avg_mood: number;
  avg_sleep: number;
}

interface RecentEntry {
  id: string;
  user_email: string;
  date: string;
  mood_score: number;
  sleep_duration: number;
  disturbances: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEntries: 0,
    activeUsersToday: 0,
    avgMoodOverall: 0
  });

  // Check if user is admin using secure admin check
  const isAdmin = isUserAdmin(user?.email);

  useEffect(() => {
    if (!isAdmin || !supabase) return;

    const fetchAdminData = async () => {
      try {
        // Fetch user overview
        const { data: usersData, error: usersError } = await (supabase as any)
          .from('admin_user_overview')
          .select('*')
          .order('registered_at', { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Fetch recent entries
        const { data: entriesData, error: entriesError } = await (supabase as any)
          .from('journal_entries')
          .select(`
            id,
            date,
            mood_score,
            sleep_duration,
            disturbances,
            created_at,
            user_id
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (entriesError) throw entriesError;

        // Get user emails for recent entries
        const userIds = [...new Set(entriesData?.map((entry: any) => entry.user_id) || [])];
        const { data: usersEmails } = await (supabase as any)
          .from('auth.users')
          .select('id, email')
          .in('id', userIds);

        const emailMap = usersEmails?.reduce((acc: any, user: any) => {
          acc[user.id] = user.email;
          return acc;
        }, {}) || {};

        const enrichedEntries = entriesData?.map((entry: any) => ({
          ...entry,
          user_email: emailMap[entry.user_id] || 'Unknown'
        })) || [];

        setRecentEntries(enrichedEntries);

        // Calculate stats
        const totalUsers = usersData?.length || 0;
        const totalEntries = usersData?.reduce((sum: number, user: AdminUser) => sum + user.total_entries, 0) || 0;
        const today = new Date().toISOString().split('T')[0];
        const activeUsersToday = entriesData?.filter((entry: any) => 
          entry.created_at.split('T')[0] === today
        ).length || 0;
        const avgMoodOverall = usersData?.length > 0 ? 
          usersData.reduce((sum: number, user: AdminUser) => sum + (user.avg_mood || 0), 0) / usersData.length : 0;

        setStats({
          totalUsers,
          totalEntries,
          activeUsersToday,
          avgMoodOverall
        });

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className={`text-2xl font-bold text-red-600 mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {language === 'ta' ? 'அணுகல் மறுக்கப்பட்டது' : 'Access Denied'}
          </h1>
          <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {language === 'ta' ? 'நீங்கள் நிர்வாகி அல்ல' : 'You are not an administrator'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className={`text-3xl font-bold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
            {language === 'ta' ? 'நிர்வாக பலகை' : 'Admin Dashboard'}
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium text-gray-500 truncate ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'மொத்த பயனர்கள்' : 'Total Users'}
                      </dt>
                      <dd className="text-lg font-medium text-black">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium text-gray-500 truncate ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'மொத்த பதிவுகள்' : 'Total Entries'}
                      </dt>
                      <dd className="text-lg font-medium text-black">
                        {stats.totalEntries}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium text-gray-500 truncate ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'இன்றைய செயல்பாடு' : 'Active Today'}
                      </dt>
                      <dd className="text-lg font-medium text-black">
                        {stats.activeUsersToday}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium text-gray-500 truncate ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'சராசரி மனநிலை' : 'Avg Mood'}
                      </dt>
                      <dd className="text-lg font-medium text-black">
                        {stats.avgMoodOverall.toFixed(1)}/10
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className={`text-lg leading-6 font-medium text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {language === 'ta' ? 'பயனர் கண்ணோட்டம்' : 'User Overview'}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'மின்னஞ்சல்' : 'Email'}
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'ராசி/நட்சத்திரம்' : 'Rasi/Nakshatra'}
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'பதிவுகள்' : 'Entries'}
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'கடைசி செயல்பாடு' : 'Last Activity'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {user.email}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
                          {user.birth_rasi} / {user.birth_nakshatra}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {user.total_entries}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {user.last_entry_date ? format(new Date(user.last_entry_date), 'MMM d, yyyy') : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className={`text-lg leading-6 font-medium text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {language === 'ta' ? 'சமீபத்திய பதிவுகள்' : 'Recent Entries'}
              </h3>
              <div className="space-y-3">
                {recentEntries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-black">{entry.user_email}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(entry.date), 'MMMM d, yyyy')} • 
                          Mood: {entry.mood_score}/10 • 
                          Sleep: {entry.sleep_duration}h
                          {entry.disturbances && ' • Disturbances'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
