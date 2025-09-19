// Utility functions for translating planet and rasi names

export const translatePlanetName = (planetName: string, language: 'en' | 'ta'): string => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      'Sun': 'Sun',
      'Moon': 'Moon', 
      'Mercury': 'Mercury',
      'Venus': 'Venus',
      'Mars': 'Mars',
      'Jupiter': 'Jupiter',
      'Saturn': 'Saturn',
      'Rahu': 'Rahu',
      'Ketu': 'Ketu',
      'Ascendant': 'Ascendant'
    },
    ta: {
      'Sun': 'சூரியன்',
      'Moon': 'சந்திரன்',
      'Mercury': 'புதன்',
      'Venus': 'சுக்கிரன்',
      'Mars': 'செவ்வாய்',
      'Jupiter': 'குரு',
      'Saturn': 'சனி',
      'Rahu': 'ராகு',
      'Ketu': 'கேது',
      'Ascendant': 'லக்னம்'
    }
  };

  return translations[language][planetName] || planetName;
};

export const translateRasiName = (rasiName: string, language: 'en' | 'ta'): string => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      'Mesha': 'Aries',
      'Vrishabha': 'Taurus', 
      'Mithuna': 'Gemini',
      'Karka': 'Cancer',
      'Simha': 'Leo',
      'Kanya': 'Virgo',
      'Tula': 'Libra',
      'Vrischika': 'Scorpio',
      'Dhanus': 'Sagittarius',
      'Makara': 'Capricorn',
      'Kumbha': 'Aquarius',
      'Meena': 'Pisces'
    },
    ta: {
      'Mesha': 'மேஷம்',
      'Vrishabha': 'ரிஷபம்',
      'Mithuna': 'மிதுனம்',
      'Karka': 'கர்க்கடகம்',
      'Simha': 'சிம்மம்',
      'Kanya': 'கன்னி',
      'Tula': 'துலாம்',
      'Vrischika': 'விருச்சிகம்',
      'Dhanus': 'தனுசு',
      'Makara': 'மகரம்',
      'Kumbha': 'கும்பம்',
      'Meena': 'மீனம்'
    }
  };

  return translations[language][rasiName] || rasiName;
};

export const translateMoonPhase = (phase: string, language: 'en' | 'ta'): string => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      'New Moon': 'New Moon',
      'First Quarter': 'First Quarter',
      'Full Moon': 'Full Moon',
      'Last Quarter': 'Last Quarter'
    },
    ta: {
      'New Moon': 'அமாவாசை',
      'First Quarter': 'முதல் கால்',
      'Full Moon': 'பௌர்ணமி', 
      'Last Quarter': 'கடைசி கால்'
    }
  };

  return translations[language][phase] || phase;
};
