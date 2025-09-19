'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translatePlanetName, translateRasiName, translateMoonPhase } from '@/utils/planetTranslations';
import { format } from 'date-fns';

interface Planet {
  id: number;
  name: string;
  rasi: {
    id: number;
    name: string;
    lord: {
      id: number;
      name: string;
      vedic_name: string;
    };
  };
  degree: number;
  position: number;
  longitude: number;
  is_retrograde: boolean;
}

interface PlanetaryPositionsProps {
  date: string;
  planetaryData: Planet[] | null;
}

export default function PlanetaryPositions({ date, planetaryData }: PlanetaryPositionsProps) {
  const { t, language } = useLanguage();

  const getMoonPhaseInfo = (moonPlanet: Planet | null | undefined) => {
    if (!moonPlanet) return { phase: 'Unknown', emoji: '🌙' };
    
    const longitude = moonPlanet.longitude;
    if (longitude >= 0 && longitude < 90) return { phase: 'New Moon', emoji: '🌑' };
    if (longitude >= 90 && longitude < 180) return { phase: 'First Quarter', emoji: '🌓' };
    if (longitude >= 180 && longitude < 270) return { phase: 'Full Moon', emoji: '🌕' };
    return { phase: 'Last Quarter', emoji: '🌗' };
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

  if (!planetaryData) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
          {t('journal.planetaryPositions')}
        </h3>
        <p className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : ''}`}>
          {format(new Date(date), 'MMMM d, yyyy')}
        </p>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⭐</div>
          <p className={`text-sm text-gray-500 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {t('journal.noData')}
          </p>
        </div>
      </div>
    );
  }

  const moonPlanet = planetaryData.find(p => p.name === 'Moon');
  const moonPhaseInfo = getMoonPhaseInfo(moonPlanet);

  // Order planets for display: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
  const planetOrder = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
  const orderedPlanets = planetOrder.map(name => 
    planetaryData.find(p => p.name === name)
  ).filter(Boolean) as Planet[];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className={`text-lg font-semibold text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
        {t('journal.planetaryPositions')}
      </h3>
      
      {/* Date */}
      <p className={`text-sm text-gray-700 mb-6 font-medium ${language === 'ta' ? 'font-tamil' : ''}`}>
        {format(new Date(date), 'MMMM d, yyyy')}
      </p>

      {/* Moon Phase Highlight */}
      {moonPlanet && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-3xl">{moonPhaseInfo.emoji}</span>
            <div className="text-center">
              <p className={`font-semibold text-blue-900 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {translateMoonPhase(moonPhaseInfo.phase, language)}
              </p>
              <p className={`text-sm text-blue-700 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {translatePlanetName('Moon', language)} in {translateRasiName(moonPlanet.rasi.name, language)} ({moonPlanet.degree.toFixed(1)}°)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Planets Vertical List */}
      <div className="space-y-3">
        {orderedPlanets.map((planet) => (
          <div key={planet.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all hover:bg-white">
            <div className="flex items-center space-x-4">
              {/* Planet Icon */}
              <div className="text-2xl text-indigo-600 font-bold w-8 flex justify-center">
                {getPlanetIcon(planet.name)}
              </div>
              
              {/* Planet Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {/* Planet Name */}
                  <h4 className={`font-bold text-black text-sm ${language === 'ta' ? 'font-tamil planet-name-tamil' : 'text-black-important'}`}>
                    {translatePlanetName(planet.name, language)}
                  </h4>
                  
                  {/* Retrograde indicator */}
                  {planet.is_retrograde && (
                    <span className="text-red-600 text-sm font-bold">℞</span>
                  )}
                </div>
                
                {/* Rasi and Degree */}
                <div className="flex items-center space-x-3">
                  <p className={`text-sm text-black font-semibold ${language === 'ta' ? 'font-tamil text-dark-important' : 'text-dark-important'}`}>
                    {translateRasiName(planet.rasi.name, language)}
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    {planet.degree.toFixed(1)}°
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span className="text-red-500">℞</span>
            <span className={language === 'ta' ? 'font-tamil' : ''}>
              {language === 'ta' ? 'வக்ரம்' : 'Retrograde'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span>°</span>
            <span className={language === 'ta' ? 'font-tamil' : ''}>
              {language === 'ta' ? 'பாகை' : 'Degrees'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
