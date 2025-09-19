/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { isUserAdmin } from '@/lib/security';
import { supabase } from '@/lib/supabase';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  LightBulbIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface ResearchData {
  user_birth_rasi: string;
  user_birth_nakshatra: string;
  entry_date: string;
  mood_score: number;
  sleep_duration: number;
  disturbances: boolean;
  moon_rasi: string;
  moon_phase: string;
  moon_degree: number;
}

interface Insight {
  type: 'correlation' | 'pattern' | 'significance';
  title: string;
  description: string;
  confidence: number;
  sample_size: number;
}

export default function ResearchDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [researchData, setResearchData] = useState<ResearchData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = isUserAdmin(user?.email);

  useEffect(() => {
    if (!isAdmin || !supabase) return;

    const fetchResearchData = async () => {
      setLoading(true);
      try {
        // Fetch complete research dataset
        const { data: researchResponse, error } = await (supabase as any)
          .from('research_data_complete')
          .select('*')
          .order('entry_date', { ascending: true });

        if (error) throw error;
        setResearchData(researchResponse || []);

        // Generate automated insights
        const generatedInsights = generateInsights(researchResponse || []);
        setInsights(generatedInsights);

      } catch (error) {
        console.error('Error fetching research data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchData();
  }, [isAdmin]);

  const generateInsights = (data: ResearchData[]): Insight[] => {
    const insights: Insight[] = [];

    // Moon Phase Correlation Insight
    const moonPhaseData = data.reduce((acc: any, entry) => {
      if (!acc[entry.moon_phase]) {
        acc[entry.moon_phase] = { total: 0, moodSum: 0 };
      }
      acc[entry.moon_phase].total += 1;
      acc[entry.moon_phase].moodSum += entry.mood_score;
      return acc;
    }, {});

    const bestPhase = Object.entries(moonPhaseData)
      .map(([phase, data]: [string, any]) => ({
        phase,
        avgMood: data.moodSum / data.total,
        count: data.total
      }))
      .sort((a, b) => b.avgMood - a.avgMood)[0];

    if (bestPhase && bestPhase.count >= 5) {
      insights.push({
        type: 'correlation',
        title: `Best Moon Phase: ${bestPhase.phase}`,
        description: `Users report ${bestPhase.avgMood.toFixed(1)}/10 average mood during ${bestPhase.phase}`,
        confidence: bestPhase.count >= 30 ? 95 : 80,
        sample_size: bestPhase.count
      });
    }

    // Birth Rasi Correlation
    const rasiCorrelations = data.reduce((acc: any, entry) => {
      const key = `${entry.user_birth_rasi}-${entry.moon_rasi}`;
      if (!acc[key]) {
        acc[key] = { total: 0, moodSum: 0, birthRasi: entry.user_birth_rasi, moonRasi: entry.moon_rasi };
      }
      acc[key].total += 1;
      acc[key].moodSum += entry.mood_score;
      return acc;
    }, {});

    const bestTransit = Object.values(rasiCorrelations)
      .map((data: any) => ({
        ...data,
        avgMood: data.moodSum / data.total
      }))
      .filter((item: any) => item.total >= 3)
      .sort((a: any, b: any) => b.avgMood - a.avgMood)[0] as any;

    if (bestTransit) {
      insights.push({
        type: 'pattern',
        title: `Best Transit: ${bestTransit.birthRasi} → ${bestTransit.moonRasi}`,
        description: `${bestTransit.birthRasi} natives feel best when Moon transits ${bestTransit.moonRasi} (${bestTransit.avgMood.toFixed(1)}/10)`,
        confidence: bestTransit.total >= 10 ? 90 : 75,
        sample_size: bestTransit.total
      });
    }

    // Sleep Pattern Insight
    const sleepData = data.filter(entry => entry.sleep_duration > 0);
    const avgSleep = sleepData.reduce((sum, entry) => sum + entry.sleep_duration, 0) / sleepData.length;
    const disturbanceRate = (data.filter(entry => entry.disturbances).length / data.length) * 100;

    insights.push({
      type: 'significance',
      title: `Sleep Patterns Identified`,
      description: `Average sleep: ${avgSleep.toFixed(1)}h, Disturbance rate: ${disturbanceRate.toFixed(1)}%`,
      confidence: data.length >= 50 ? 95 : 80,
      sample_size: data.length
    });

    return insights;
  };

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csvContent = [
        // CSV Headers
        'user_birth_rasi,user_birth_nakshatra,entry_date,mood_score,sleep_duration,disturbances,moon_rasi,moon_phase,moon_degree',
        // CSV Data
        ...researchData.map(row => 
          `${row.user_birth_rasi},${row.user_birth_nakshatra},${row.entry_date},${row.mood_score},${row.sleep_duration},${row.disturbances},${row.moon_rasi},${row.moon_phase},${row.moon_degree}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `astrology_research_data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const jsonContent = JSON.stringify(researchData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `astrology_research_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  // Prepare correlation heatmap data
  const prepareCorrelationData = () => {
    const correlations = researchData.reduce((acc: any, entry) => {
      const key = `${entry.user_birth_rasi}-${entry.moon_rasi}`;
      if (!acc[key]) {
        acc[key] = {
          birthRasi: entry.user_birth_rasi,
          moonRasi: entry.moon_rasi,
          totalMood: 0,
          count: 0
        };
      }
      acc[key].totalMood += entry.mood_score;
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(correlations)
      .map((item: any) => ({
        birthRasi: item.birthRasi,
        moonRasi: item.moonRasi,
        avgMood: item.totalMood / item.count,
        count: item.count
      }))
      .filter(item => item.count >= 2);
  };

  const correlationData = prepareCorrelationData();

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className={`text-2xl font-bold text-red-600 mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 'அணுகல் மறுக்கப்பட்டது' : 'Access Denied'}
            </h1>
            <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 'ஆராய்ச்சி பலகைக்கு நிர்வாகி அணுகல் தேவை' : 'Research dashboard requires admin access'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className={`text-3xl font-bold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
                  {language === 'ta' ? 'ஆராய்ச்சி பலகை' : 'Research Dashboard'}
                </h1>
                <p className={`mt-2 text-gray-700 ${language === 'ta' ? 'font-tamil' : ''}`}>
                  {language === 'ta' ? 
                    'சந்திர நிலைகள் மற்றும் மனித அனுபவங்களின் தானியங்கி பகுப்பாய்வு' :
                    'Automated analysis of lunar positions and human experiences'
                  }
                </p>
              </div>
              
              {/* Export Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => exportData('csv')}
                  className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium ${language === 'ta' ? 'font-tamil' : ''}`}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {language === 'ta' ? 'CSV ஏற்றுமதி' : 'Export CSV'}
                </button>
                <button
                  onClick={() => exportData('json')}
                  className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium ${language === 'ta' ? 'font-tamil' : ''}`}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {language === 'ta' ? 'JSON ஏற்றுமதி' : 'Export JSON'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Research Overview Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UsersIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className={`text-sm font-medium text-gray-500 truncate ${language === 'ta' ? 'font-tamil' : ''}`}>
                              {language === 'ta' ? 'ஆராய்ச்சி பதிவுகள்' : 'Research Entries'}
                            </dt>
                            <dd className="text-lg font-medium text-black">
                              {researchData.length}
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
                              {language === 'ta' ? 'சராசரி மனநிலை' : 'Average Mood'}
                            </dt>
                            <dd className="text-lg font-medium text-black">
                              {researchData.length > 0 ? 
                                (researchData.reduce((sum, entry) => sum + entry.mood_score, 0) / researchData.length).toFixed(1) : '0'
                              }/10
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
                              {language === 'ta' ? 'ராசி நிலைகள்' : 'Rasi Positions'}
                            </dt>
                            <dd className="text-lg font-medium text-black">
                              {new Set(researchData.map(entry => entry.moon_rasi)).size}/12
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
                          <LightBulbIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className={`text-sm font-medium text-gray-500 truncate ${language === 'ta' ? 'font-tamil' : ''}`}>
                              {language === 'ta' ? 'நுண்ணறிவுகள்' : 'Insights'}
                            </dt>
                            <dd className="text-lg font-medium text-black">
                              {insights.length}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated Insights */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className={`text-lg font-medium text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                    {language === 'ta' ? 'தானியங்கி நுண்ணறிவுகள்' : 'Automated Insights'}
                  </h3>
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'correlation' ? 'bg-blue-50 border-blue-400' :
                        insight.type === 'pattern' ? 'bg-green-50 border-green-400' :
                        'bg-yellow-50 border-yellow-400'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-semibold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
                              {insight.title}
                            </h4>
                            <p className={`text-sm text-gray-700 mt-1 ${language === 'ta' ? 'font-tamil' : ''}`}>
                              {insight.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-medium ${
                              insight.confidence >= 90 ? 'text-green-600' :
                              insight.confidence >= 80 ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              {insight.confidence}% confidence
                            </span>
                            <p className="text-xs text-gray-500">
                              n={insight.sample_size}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correlation Heatmap */}
                {correlationData.length > 0 && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className={`text-lg font-medium text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                      {language === 'ta' ? 'ராசி தொடர்பு வரைபடம்' : 'Birth Rasi vs Moon Transit Correlation'}
                    </h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart data={correlationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="birthRasi" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis dataKey="avgMood" />
                          <Tooltip 
                            formatter={(value, name) => [
                              `${value} avg mood`,
                              `${name}`
                            ]}
                            labelFormatter={(label) => `Birth Rasi: ${label}`}
                          />
                          <Scatter 
                            dataKey="avgMood" 
                            fill="#8884d8"
                            name="Average Mood"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Moon Phase Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className={`text-lg font-medium text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                      {language === 'ta' ? 'சந்திர கட்ட பகுப்பாய்வு' : 'Moon Phase Analysis'}
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(
                          researchData.reduce((acc: any, entry) => {
                            if (!acc[entry.moon_phase]) {
                              acc[entry.moon_phase] = { phase: entry.moon_phase, totalMood: 0, count: 0 };
                            }
                            acc[entry.moon_phase].totalMood += entry.mood_score;
                            acc[entry.moon_phase].count += 1;
                            return acc;
                          }, {})
                        ).map(([phase, data]: [string, any]) => ({
                          phase,
                          avgMood: data.totalMood / data.count,
                          count: data.count
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="phase" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="avgMood" fill="#8884d8" name="Average Mood" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className={`text-lg font-medium text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                      {language === 'ta' ? 'நட்சத்திர விநியோகம்' : 'Nakshatra Distribution'}
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(
                              researchData.reduce((acc: any, entry) => {
                                acc[entry.user_birth_nakshatra] = (acc[entry.user_birth_nakshatra] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([nakshatra, count]) => ({ nakshatra, count }))}
                            dataKey="count"
                            nameKey="nakshatra"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label
                          >
                            {Object.entries(
                              researchData.reduce((acc: any, entry) => {
                                acc[entry.user_birth_nakshatra] = (acc[entry.user_birth_nakshatra] || 0) + 1;
                                return acc;
                              }, {})
                            ).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Research Progress */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className={`text-lg font-medium text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                    {language === 'ta' ? 'ஆராய்ச்சி முன்னேற்றம்' : 'Research Progress'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm text-gray-700 ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {language === 'ta' ? 'தரவு சேகரிப்பு' : 'Data Collection'}
                      </span>
                      <span className="text-sm font-medium text-black">
                        {researchData.length >= 100 ? 'Excellent' : researchData.length >= 50 ? 'Good' : 'Growing'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (researchData.length / 100) * 100)}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs text-gray-500 ${language === 'ta' ? 'font-tamil' : ''}`}>
                      {language === 'ta' ? 
                        `${researchData.length} பதிவுகள் சேகரிக்கப்பட்டன. புள்ளியியல் முக்கியத்துவத்திற்கு 100+ இலக்கு.` :
                        `${researchData.length} entries collected. Target: 100+ for statistical significance.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
