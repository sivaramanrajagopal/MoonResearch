/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RASI_OPTIONS, NAKSHATRA_OPTIONS, UserProfile, ProfileInput } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSetupProps {
  onComplete: () => void;
  existingProfile?: UserProfile | null;
}

export default function ProfileSetup({ onComplete, existingProfile }: ProfileSetupProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileInput>({
    birth_rasi: existingProfile?.birth_rasi || '',
    birth_nakshatra: existingProfile?.birth_nakshatra || '',
    birth_date: existingProfile?.birth_date || '',
    birth_time: existingProfile?.birth_time || '',
    birth_place: existingProfile?.birth_place || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setLoading(true);
    try {
      // Clean up the profile data - convert empty strings to null for optional fields
      const cleanedProfile = {
        birth_rasi: profile.birth_rasi,
        birth_nakshatra: profile.birth_nakshatra,
        birth_date: profile.birth_date || null,
        birth_time: profile.birth_time || null,
        birth_place: profile.birth_place || null
      };

      if (existingProfile) {
        // Update existing profile
        const { error } = await (supabase as any)
          .from('user_profiles')
          .update(cleanedProfile)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await (supabase as any)
          .from('user_profiles')
          .insert({
            ...cleanedProfile,
            user_id: user.id
          });
        
        if (error) throw error;
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error saving profile: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className={`text-2xl font-bold text-black mb-6 text-center ${language === 'ta' ? 'font-tamil' : ''}`}>
          {existingProfile ? 
            (language === 'ta' ? 'சுயவிவரத்தை திருத்து' : 'Edit Profile') :
            (language === 'ta' ? 'உங்கள் ஜாதக விவரங்கள்' : 'Your Birth Details')
          }
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Birth Rasi */}
          <div>
            <label className={`block text-sm font-bold text-black mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 'பிறப்பு ராசி' : 'Birth Rasi'} *
            </label>
            <select
              value={profile.birth_rasi}
              onChange={(e) => setProfile({ ...profile, birth_rasi: e.target.value })}
              required
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black ${language === 'ta' ? 'font-tamil' : ''}`}
            >
              <option value="">
                {language === 'ta' ? 'ராசியை தேர்வு செய்யுங்கள்' : 'Select Rasi'}
              </option>
              {RASI_OPTIONS.map((rasi) => (
                <option key={rasi.value} value={rasi.value}>
                  {language === 'ta' ? rasi.tamil : rasi.label}
                </option>
              ))}
            </select>
          </div>

          {/* Birth Nakshatra */}
          <div>
            <label className={`block text-sm font-bold text-black mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 'பிறப்பு நட்சத்திரம்' : 'Birth Nakshatra'} *
            </label>
            <select
              value={profile.birth_nakshatra}
              onChange={(e) => setProfile({ ...profile, birth_nakshatra: e.target.value })}
              required
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black ${language === 'ta' ? 'font-tamil' : ''}`}
            >
              <option value="">
                {language === 'ta' ? 'நட்சத்திரத்தை தேர்வு செய்யுங்கள்' : 'Select Nakshatra'}
              </option>
              {NAKSHATRA_OPTIONS.map((nakshatra) => (
                <option key={nakshatra.value} value={nakshatra.value}>
                  {language === 'ta' ? nakshatra.tamil : nakshatra.label}
                </option>
              ))}
            </select>
          </div>

          {/* Birth Date (Optional) */}
          <div>
            <label className={`block text-sm font-bold text-black mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 'பிறப்பு தேதி' : 'Birth Date'} ({language === 'ta' ? 'விருப்பம்' : 'Optional'})
            </label>
            <input
              type="date"
              value={profile.birth_date}
              onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black ${language === 'ta' ? 'font-tamil' : ''}`}
            />
          </div>

          {/* Birth Time (Optional) */}
          <div>
            <label className={`block text-sm font-bold text-black mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 'பிறப்பு நேரம்' : 'Birth Time'} ({language === 'ta' ? 'விருப்பம்' : 'Optional'})
            </label>
            <input
              type="time"
              value={profile.birth_time}
              onChange={(e) => setProfile({ ...profile, birth_time: e.target.value })}
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black ${language === 'ta' ? 'font-tamil' : ''}`}
            />
          </div>

          {/* Birth Place (Optional) */}
          <div>
            <label className={`block text-sm font-bold text-black mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 'பிறப்பு இடம்' : 'Birth Place'} ({language === 'ta' ? 'விருப்பம்' : 'Optional'})
            </label>
            <input
              type="text"
              value={profile.birth_place}
              onChange={(e) => setProfile({ ...profile, birth_place: e.target.value })}
              placeholder={language === 'ta' ? 'நகரம், மாநிலம்' : 'City, State'}
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black ${language === 'ta' ? 'font-tamil' : ''}`}
            />
          </div>

          {/* Note about data integrity */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className={`text-sm text-yellow-800 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {language === 'ta' ? 
                '⚠️ குறிப்பு: இந்த விவரங்கள் ஆராய்ச்சி நோக்கங்களுக்காக அனைத்து நாட்களுக்கும் ஒரே மாதிரியாக இருக்கும்.' :
                '⚠️ Note: These details will remain consistent across all days for research integrity.'
              }
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            {existingProfile && (
              <button
                type="button"
                onClick={onComplete}
                className={`flex-1 py-3 px-4 border border-gray-300 rounded-md text-black font-medium hover:bg-gray-50 ${language === 'ta' ? 'font-tamil' : ''}`}
              >
                {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !profile.birth_rasi || !profile.birth_nakshatra}
              className={`flex-1 py-3 px-4 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${language === 'ta' ? 'font-tamil' : ''}`}
            >
              {loading ? 
                (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') :
                (existingProfile ? 
                  (language === 'ta' ? 'புதுப்பிக்கவும்' : 'Update') :
                  (language === 'ta' ? 'சேமிக்கவும்' : 'Save')
                )
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
