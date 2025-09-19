'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      title={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
    >
      <GlobeAltIcon className="h-4 w-4" />
      <span className="font-tamil">
        {language === 'en' ? 'தமிழ்' : 'English'}
      </span>
    </button>
  );
}
