'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import LanguageToggle from './LanguageToggle';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
            {mode === 'signin' ? 
              (language === 'ta' ? 'உங்கள் கணக்கில் உள்நுழையவும்' : 'Sign in to your account') : 
              (language === 'ta' ? 'உங்கள் கணக்கை உருவாக்கவும்' : 'Create your account')
            }
          </h2>
          <p className={`mt-2 text-center text-sm text-gray-700 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {language === 'ta' ? 
              'கிரக நிலைகளுடன் உங்கள் தினசரி அனுபவங்களை பதிவு செய்யுங்கள்' : 
              'Track your daily experiences with planetary positions'
            }
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-bold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
                {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email address'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${language === 'ta' ? 'font-tamil' : ''}`}
                placeholder={language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Enter your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-bold text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
                {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${language === 'ta' ? 'font-tamil' : ''}`}
                placeholder={language === 'ta' ? 'கடவுச்சொல்' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${language === 'ta' ? 'font-tamil' : ''}`}
            >
              {loading ? 
                (language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...') : 
                (mode === 'signin' ? 
                  (language === 'ta' ? 'உள்நுழைக' : 'Sign in') : 
                  (language === 'ta' ? 'பதிவு செய்க' : 'Sign up')
                )
              }
            </button>
          </div>

          <div className="text-center">
            <span className={`text-sm text-gray-700 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {mode === 'signin' ? 
                (language === 'ta' ? 'கணக்கு இல்லையா?' : "Don't have an account?") : 
                (language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?')
              }
            </span>
            <button
              type="button"
              onClick={() => router.push(mode === 'signin' ? '/signup' : '/signin')}
              className={`text-sm text-indigo-600 hover:text-indigo-500 font-medium ml-1 ${language === 'ta' ? 'font-tamil' : ''}`}
            >
              {mode === 'signin' ? 
                (language === 'ta' ? 'பதிவு செய்க' : 'Sign up') : 
                (language === 'ta' ? 'உள்நுழைக' : 'Sign in')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
