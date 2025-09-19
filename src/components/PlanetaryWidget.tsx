'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translatePlanetName, translateRasiName } from '@/utils/planetTranslations';
import { getPlanetaryDataByDate } from '@/lib/database';
import { format } from 'date-fns';

interface Planet {
  id: number;
  name: string;
  rasi: {
    name: string;
  };
  degree: number;
  is_retrograde: boolean;
}

interface PlanetaryWidgetProps {
  date?: string;
  compact?: boolean;
}

export default function PlanetaryWidget({ date, compact = true }: PlanetaryWidgetProps) {
  const { t, language } = useLanguage();
  const [planetaryData, setPlanetaryData] = useState<Planet[] | null>(null);
  const currentDate = date || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchPlanetaryData = async () => {
      try {
        const data = await getPlanetaryDataByDate(currentDate);
        if (data?.planetary_data) {
          setPlanetaryData(data.planetary_data);
        }
      } catch (error) {
        console.error('Error fetching planetary data:', error);
      }
    };

    fetchPlanetaryData();
  }, [currentDate]);

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
      <div className="bg-white shadow rounded-lg p-4">
        <h4 className={`font-bold text-black text-sm mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
          {t('journal.planetaryPositions')}
        </h4>
        <p className={`text-xs text-gray-600 ${language === 'ta' ? 'font-tamil' : ''}`}>
          {t('journal.noData')}
        </p>
      </div>
    );
  }

  // Order planets
  const planetOrder = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
  const orderedPlanets = planetOrder.map(name => 
    planetaryData.find(p => p.name === name)
  ).filter(Boolean) as Planet[];

  if (compact) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h4 className={`font-bold text-black text-base mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
          {t('journal.planetaryPositions')}
        </h4>
        <div className="text-sm text-black font-medium mb-3">
          {format(new Date(currentDate), 'MMMM d, yyyy')}
        </div>
        
        {/* Mobile-First: 3x3 Grid for all screen sizes */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {orderedPlanets.map((planet) => (
            <div key={planet.id} className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all">
              <div className="text-xl text-indigo-600 mb-2 font-bold">
                {getPlanetIcon(planet.name)}
              </div>
              <div className={`text-xs font-bold text-black leading-tight mb-1 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {translatePlanetName(planet.name, language)}
                {planet.is_retrograde && <span className="text-red-600 ml-1 text-xs">℞</span>}
              </div>
              <div className={`text-xs text-black font-semibold ${language === 'ta' ? 'font-tamil' : ''}`}>
                {translateRasiName(planet.rasi.name, language)}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">
                {planet.degree.toFixed(1)}°
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-4 text-xs text-gray-600 pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <span className="text-red-600">℞</span>
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
    );
  }

  // Full version (same as PlanetaryPositions component)
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className={`text-lg font-semibold text-black mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
        {t('journal.planetaryPositions')}
      </h3>
      
      <p className={`text-sm text-gray-700 mb-6 font-medium ${language === 'ta' ? 'font-tamil' : ''}`}>
        {format(new Date(currentDate), 'MMMM d, yyyy')}
      </p>

      <div className="space-y-3">
        {orderedPlanets.map((planet) => (
          <div key={planet.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all hover:bg-white">
            <div className="flex items-center space-x-4">
              <div className="text-2xl text-indigo-600 font-bold w-8 flex justify-center">
                {getPlanetIcon(planet.name)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-bold text-black text-sm ${language === 'ta' ? 'font-tamil' : ''}`}>
                    {translatePlanetName(planet.name, language)}
                  </h4>
                  
                  {planet.is_retrograde && (
                    <span className="text-red-600 text-sm font-bold">℞</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <p className={`text-sm text-black font-semibold ${language === 'ta' ? 'font-tamil' : ''}`}>
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
    </div>
  );
}
