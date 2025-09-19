// User profile types

export interface UserProfile {
  id: string;
  user_id: string;
  birth_rasi: string;
  birth_nakshatra: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileInput {
  birth_rasi: string;
  birth_nakshatra: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
}

// Rasi options
export const RASI_OPTIONS = [
  { value: 'Mesha', label: 'Mesha', tamil: 'மேஷம்' },
  { value: 'Vrishabha', label: 'Vrishabha', tamil: 'ரிஷபம்' },
  { value: 'Mithuna', label: 'Mithuna', tamil: 'மிதுனம்' },
  { value: 'Karka', label: 'Karka', tamil: 'கர்க்கடகம்' },
  { value: 'Simha', label: 'Simha', tamil: 'சிம்மம்' },
  { value: 'Kanya', label: 'Kanya', tamil: 'கன்னி' },
  { value: 'Tula', label: 'Tula', tamil: 'துலாம்' },
  { value: 'Vrischika', label: 'Vrischika', tamil: 'விருச்சிகம்' },
  { value: 'Dhanus', label: 'Dhanus', tamil: 'தனுசு' },
  { value: 'Makara', label: 'Makara', tamil: 'மகரம்' },
  { value: 'Kumbha', label: 'Kumbha', tamil: 'கும்பம்' },
  { value: 'Meena', label: 'Meena', tamil: 'மீனம்' }
];

// Nakshatra options
export const NAKSHATRA_OPTIONS = [
  { value: 'Ashwini', label: 'Ashwini', tamil: 'அசுவினி' },
  { value: 'Bharani', label: 'Bharani', tamil: 'பரணி' },
  { value: 'Krittika', label: 'Krittika', tamil: 'கிருத்திகை' },
  { value: 'Rohini', label: 'Rohini', tamil: 'ரோகிணி' },
  { value: 'Mrigashirsha', label: 'Mrigashirsha', tamil: 'மிருகசீர்ஷம்' },
  { value: 'Ardra', label: 'Ardra', tamil: 'ஆர்த்ரா' },
  { value: 'Punarvasu', label: 'Punarvasu', tamil: 'புனர்வசு' },
  { value: 'Pushya', label: 'Pushya', tamil: 'பூசம்' },
  { value: 'Ashlesha', label: 'Ashlesha', tamil: 'ஆயில்யம்' },
  { value: 'Magha', label: 'Magha', tamil: 'மகம்' },
  { value: 'Purva Phalguni', label: 'Purva Phalguni', tamil: 'பூரம்' },
  { value: 'Uttara Phalguni', label: 'Uttara Phalguni', tamil: 'உத்திரம்' },
  { value: 'Hasta', label: 'Hasta', tamil: 'ஹஸ்தம்' },
  { value: 'Chitra', label: 'Chitra', tamil: 'சித்திரை' },
  { value: 'Swati', label: 'Swati', tamil: 'சுவாதி' },
  { value: 'Vishakha', label: 'Vishakha', tamil: 'விசாகம்' },
  { value: 'Anuradha', label: 'Anuradha', tamil: 'அனுஷம்' },
  { value: 'Jyeshtha', label: 'Jyeshtha', tamil: 'கேட்டை' },
  { value: 'Mula', label: 'Mula', tamil: 'மூலம்' },
  { value: 'Purva Ashadha', label: 'Purva Ashadha', tamil: 'பூராடம்' },
  { value: 'Uttara Ashadha', label: 'Uttara Ashadha', tamil: 'உத்திராடம்' },
  { value: 'Shravana', label: 'Shravana', tamil: 'திருவோணம்' },
  { value: 'Dhanishta', label: 'Dhanishta', tamil: 'அவிட்டம்' },
  { value: 'Shatabhisha', label: 'Shatabhisha', tamil: 'சதயம்' },
  { value: 'Purva Bhadrapada', label: 'Purva Bhadrapada', tamil: 'பூரட்டாதி' },
  { value: 'Uttara Bhadrapada', label: 'Uttara Bhadrapada', tamil: 'உத்திரட்டாதி' },
  { value: 'Revati', label: 'Revati', tamil: 'ரேவதி' }
];
