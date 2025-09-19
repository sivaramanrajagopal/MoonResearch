'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.newEntry': 'New Entry',
    'nav.history': 'History',
    'nav.analytics': 'Analytics',
    'nav.signOut': 'Sign out',
    
    // Authentication
    'auth.signIn': 'Sign in to your account',
    'auth.signUp': 'Create your account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.signInButton': 'Sign in',
    'auth.signUpButton': 'Sign up',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.subtitle': 'Track your daily experiences with planetary positions',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to your astrology research journal. Track your daily experiences and discover correlations with planetary positions.',
    'dashboard.newEntry': 'New Entry',
    'dashboard.newEntryDesc': 'Record today\'s experience',
    'dashboard.journalHistory': 'Journal History',
    'dashboard.journalHistoryDesc': 'View past entries',
    'dashboard.analytics': 'Analytics',
    'dashboard.analyticsDesc': 'Explore correlations',
    'dashboard.recentEntries': 'Recent Journal Entries',
    'dashboard.noEntries': 'No entries yet',
    'dashboard.noEntriesDesc': 'Start by creating your first journal entry.',
    'dashboard.totalEntries': 'Total Entries',
    'dashboard.averageMood': 'Average Mood',
    'dashboard.averageSleep': 'Average Sleep',
    
    // Journal Entry
    'journal.newEntry': 'New Journal Entry',
    'journal.subtitle': 'Record your daily experience and see how it correlates with planetary positions.',
    'journal.date': 'Date',
    'journal.sleepDuration': 'Sleep Duration (hours)',
    'journal.sleepPlaceholder': 'e.g., 7.5',
    'journal.moodScore': 'Mood Score (1-10)',
    'journal.veryLow': 'Very Low',
    'journal.veryHigh': 'Very High',
    'journal.disturbances': 'Sleep disturbances or unusual events',
    'journal.notes': 'Notes',
    'journal.notesPlaceholder': 'Any additional observations, dreams, feelings, or events...',
    'journal.cancel': 'Cancel',
    'journal.saveEntry': 'Save Entry',
    'journal.saving': 'Saving...',
    'journal.planetaryPositions': 'Planetary Positions',
    'journal.existingEntry': 'You already have an entry for this date. Creating a new entry will add another record.',
    'journal.noData': 'No planetary data available for this date',
    
    // Journal History
    'history.title': 'Journal History',
    'history.subtitle': 'Review your past entries and their planetary correlations.',
    'history.noEntries': 'No journal entries',
    'history.noEntriesDesc': 'Start tracking your daily experiences and their correlations with planetary positions.',
    'history.createFirst': 'Create your first entry',
    'history.mood': 'Mood:',
    'history.sleep': 'Sleep:',
    'history.disturbances': 'Sleep Disturbances',
    'history.planetaryPositions': 'Planetary Positions',
    'history.previous': 'Previous',
    'history.next': 'Next',
    'history.showing': 'Showing',
    'history.to': 'to',
    'history.of': 'of',
    'history.results': 'results',
    
    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.subtitle': 'Discover correlations between your experiences and planetary positions.',
    'analytics.last7days': 'Last 7 days',
    'analytics.last30days': 'Last 30 days',
    'analytics.last90days': 'Last 90 days',
    'analytics.thisMonth': 'This month',
    'analytics.allTime': 'All time',
    'analytics.noData': 'No data available',
    'analytics.noDataDesc': 'Create some journal entries to see analytics and correlations.',
    'analytics.moodSleepTime': 'Mood & Sleep Over Time',
    'analytics.moodByMoonPhase': 'Mood by Moon Phase',
    'analytics.moodByMoonRasi': 'Mood by Moon Rasi',
    'analytics.sleepMoodCorrelation': 'Sleep vs Mood Correlation',
    'analytics.keyInsights': 'Key Insights',
    'analytics.bestMoonPhase': 'Best Moon Phase for Mood:',
    'analytics.bestMoonRasi': 'Best Moon Rasi for Mood:',
    'analytics.sleepDisturbances': 'Sleep Disturbances:',
    'analytics.outOf': 'out of',
    'analytics.entries': 'entries',
    'analytics.ofDays': 'of your recorded days',
    
    // Planets
    'planet.Sun': 'Sun',
    'planet.Moon': 'Moon',
    'planet.Mercury': 'Mercury',
    'planet.Venus': 'Venus',
    'planet.Mars': 'Mars',
    'planet.Jupiter': 'Jupiter',
    'planet.Saturn': 'Saturn',
    'planet.Rahu': 'Rahu',
    'planet.Ketu': 'Ketu',
    'planet.Ascendant': 'Ascendant',
    
    // Rasi/Zodiac Signs
    'rasi.Mesha': 'Aries',
    'rasi.Vrishabha': 'Taurus',
    'rasi.Mithuna': 'Gemini',
    'rasi.Karka': 'Cancer',
    'rasi.Simha': 'Leo',
    'rasi.Kanya': 'Virgo',
    'rasi.Tula': 'Libra',
    'rasi.Vrischika': 'Scorpio',
    'rasi.Dhanus': 'Sagittarius',
    'rasi.Makara': 'Capricorn',
    'rasi.Kumbha': 'Aquarius',
    'rasi.Meena': 'Pisces',
    
    // Moon Phases
    'moonPhase.newMoon': 'New Moon',
    'moonPhase.firstQuarter': 'First Quarter',
    'moonPhase.fullMoon': 'Full Moon',
    'moonPhase.lastQuarter': 'Last Quarter',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.view': 'View',
    'common.viewAll': 'View all entries',
    'common.hours': 'h',
    'common.degree': '°',
  },
  ta: {
    // Navigation
    'nav.dashboard': 'முகப்பு',
    'nav.newEntry': 'புதிய பதிவு',
    'nav.history': 'வரலாறு',
    'nav.analytics': 'பகுப்பாய்வு',
    'nav.signOut': 'வெளியேறு',
    
    // Authentication
    'auth.signIn': 'உங்கள் கணக்கில் உள்நுழையவும்',
    'auth.signUp': 'உங்கள் கணக்கை உருவாக்கவும்',
    'auth.email': 'மின்னஞ்சல் முகவரி',
    'auth.password': 'கடவுச்சொல்',
    'auth.signInButton': 'உள்நுழைக',
    'auth.signUpButton': 'பதிவு செய்க',
    'auth.noAccount': 'கணக்கு இல்லையா?',
    'auth.hasAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'auth.subtitle': 'கிரக நிலைகளுடன் உங்கள் தினசரி அனுபவங்களை பதிவு செய்யுங்கள்',
    
    // Dashboard
    'dashboard.title': 'முகப்பு',
    'dashboard.welcome': 'உங்கள் ஜோதிட ஆராய்ச்சி பத்திரிகையில் வரவேற்கிறோம். உங்கள் தினசரி அனுபவங்களை பதிவு செய்து கிரக நிலைகளுடன் தொடர்புகளை கண்டறியுங்கள்.',
    'dashboard.newEntry': 'புதிய பதிவு',
    'dashboard.newEntryDesc': 'இன்றைய அனுபவத்தை பதிவு செய்க',
    'dashboard.journalHistory': 'பத்திரிகை வரலாறு',
    'dashboard.journalHistoryDesc': 'கடந்த பதிவுகளை பார்க்க',
    'dashboard.analytics': 'பகுப்பாய்வு',
    'dashboard.analyticsDesc': 'தொடர்புகளை ஆராய்க',
    'dashboard.recentEntries': 'சமீபத்திய பத்திரிகை பதிவுகள்',
    'dashboard.noEntries': 'இன்னும் பதிவுகள் இல்லை',
    'dashboard.noEntriesDesc': 'உங்கள் முதல் பத்திரிகை பதிவை உருவாக்குவதன் மூலம் தொடங்குங்கள்.',
    'dashboard.totalEntries': 'மொத்த பதிவுகள்',
    'dashboard.averageMood': 'சராசரி மனநிலை',
    'dashboard.averageSleep': 'சராசரி தூக்கம்',
    
    // Journal Entry
    'journal.newEntry': 'புதிய பத்திரிகை பதிவு',
    'journal.subtitle': 'உங்கள் தினசரி அனுபவத்தை பதிவு செய்து அது கிரக நிலைகளுடன் எவ்வாறு தொடர்புபடுகிறது என்பதை பாருங்கள்.',
    'journal.date': 'தேதி',
    'journal.sleepDuration': 'தூக்க நேரம் (மணிநேரங்கள்)',
    'journal.sleepPlaceholder': 'உதா., 7.5',
    'journal.moodScore': 'மனநிலை மதிப்பெண் (1-10)',
    'journal.veryLow': 'மிகவும் குறைவு',
    'journal.veryHigh': 'மிகவும் அதிகம்',
    'journal.disturbances': 'தூக்க இடையூறுகள் அல்லது அசாதாரண நிகழ்வுகள்',
    'journal.notes': 'குறிப்புகள்',
    'journal.notesPlaceholder': 'கூடுதல் அவதானிப்புகள், கனவுகள், உணர்வுகள் அல்லது நிகழ்வுகள்...',
    'journal.cancel': 'ரத்து செய்',
    'journal.saveEntry': 'பதிவை சேமி',
    'journal.saving': 'சேமிக்கிறது...',
    'journal.planetaryPositions': 'கிரக நிலைகள்',
    'journal.existingEntry': 'இந்த தேதிக்கு உங்களிடம் ஏற்கனவே ஒரு பதிவு உள்ளது. புதிய பதிவை உருவாக்குவது மற்றொரு பதிவை சேர்க்கும்.',
    'journal.noData': 'இந்த தேதிக்கு கிரக தரவு கிடைக்கவில்லை',
    
    // Journal History
    'history.title': 'பத்திரிகை வரலாறு',
    'history.subtitle': 'உங்கள் கடந்த பதிவுகள் மற்றும் அவற்றின் கிரக தொடர்புகளை மதிப்பாய்வு செய்யுங்கள்.',
    'history.noEntries': 'பத்திரிகை பதிவுகள் இல்லை',
    'history.noEntriesDesc': 'உங்கள் தினசரி அனுபவங்களையும் கிரக நிலைகளுடனான அவற்றின் தொடர்புகளையும் கண்காணிக்கத் தொடங்குங்கள்.',
    'history.createFirst': 'உங்கள் முதல் பதிவை உருவாக்குங்கள்',
    'history.mood': 'மனநிலை:',
    'history.sleep': 'தூக்கம்:',
    'history.disturbances': 'தூக்க இடையூறுகள்',
    'history.planetaryPositions': 'கிரக நிலைகள்',
    'history.previous': 'முந்தைய',
    'history.next': 'அடுத்த',
    'history.showing': 'காண்பித்தல்',
    'history.to': 'முதல்',
    'history.of': 'இல்',
    'history.results': 'முடிவுகள்',
    
    // Analytics
    'analytics.title': 'பகுப்பாய்வு பலகை',
    'analytics.subtitle': 'உங்கள் அனுபவங்களுக்கும் கிரக நிலைகளுக்கும் இடையிலான தொடர்புகளை கண்டறியுங்கள்.',
    'analytics.last7days': 'கடந்த 7 நாட்கள்',
    'analytics.last30days': 'கடந்த 30 நாட்கள்',
    'analytics.last90days': 'கடந்த 90 நாட்கள்',
    'analytics.thisMonth': 'இந்த மாதம்',
    'analytics.allTime': 'எல்லா நேரமும்',
    'analytics.noData': 'தரவு கிடைக்கவில்லை',
    'analytics.noDataDesc': 'பகுப்பாய்வு மற்றும் தொடர்புகளைப் பார்க்க சில பத்திரிகை பதிவுகளை உருவாக்குங்கள்.',
    'analytics.moodSleepTime': 'காலப்போக்கில் மனநிலை மற்றும் தூக்கம்',
    'analytics.moodByMoonPhase': 'சந்திர கட்டத்தின் அடிப்படையில் மனநிலை',
    'analytics.moodByMoonRasi': 'சந்திர ராசியின் அடிப்படையில் மனநிலை',
    'analytics.sleepMoodCorrelation': 'தூக்கம் மற்றும் மனநிலை தொடர்பு',
    'analytics.keyInsights': 'முக்கிய நுண்ணறிவுகள்',
    'analytics.bestMoonPhase': 'மனநிலைக்கு சிறந்த சந்திர கட்டம்:',
    'analytics.bestMoonRasi': 'மனநிலைக்கு சிறந்த சந்திர ராசி:',
    'analytics.sleepDisturbances': 'தூக்க இடையூறுகள்:',
    'analytics.outOf': 'இல்',
    'analytics.entries': 'பதிவுகள்',
    'analytics.ofDays': 'உங்கள் பதிவு செய்யப்பட்ட நாட்களில்',
    
    // Planets (Tamil names)
    'planet.Sun': 'சூரியன்',
    'planet.Moon': 'சந்திரன்',
    'planet.Mercury': 'புதன்',
    'planet.Venus': 'சுக்கிரன்',
    'planet.Mars': 'செவ்வாய்',
    'planet.Jupiter': 'குரு',
    'planet.Saturn': 'சனி',
    'planet.Rahu': 'ராகு',
    'planet.Ketu': 'கேது',
    'planet.Ascendant': 'லக்னம்',
    
    // Rasi/Zodiac Signs (Tamil names)
    'rasi.Mesha': 'மேஷம்',
    'rasi.Vrishabha': 'ரிஷபம்',
    'rasi.Mithuna': 'மிதுனம்',
    'rasi.Karka': 'கர்க்கடகம்',
    'rasi.Simha': 'சிம்மம்',
    'rasi.Kanya': 'கன்னி',
    'rasi.Tula': 'துலாம்',
    'rasi.Vrischika': 'விருச்சிகம்',
    'rasi.Dhanus': 'தனுசு',
    'rasi.Makara': 'மகரம்',
    'rasi.Kumbha': 'கும்பம்',
    'rasi.Meena': 'மீனம்',
    
    // Moon Phases (Tamil)
    'moonPhase.newMoon': 'அமாவாசை',
    'moonPhase.firstQuarter': 'முதல் கால்',
    'moonPhase.fullMoon': 'பௌர்ணமி',
    'moonPhase.lastQuarter': 'கடைசி கால்',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'ஒரு பிழை ஏற்பட்டது',
    'common.view': 'பார்க்க',
    'common.viewAll': 'அனைத்து பதிவுகளையும் பார்க்க',
    'common.hours': 'மணி',
    'common.degree': '°',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // Always default to English

  // Load saved language preference but force English on first load
  useEffect(() => {
    // Force English as default - clear any Tamil preference for now
    localStorage.setItem('language', 'en');
    setLanguage('en');
    
    // Uncomment below if you want to restore saved preferences later
    // const savedLanguage = localStorage.getItem('language') as Language;
    // if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ta')) {
    //   setLanguage(savedLanguage);
    // }
  }, []);

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
