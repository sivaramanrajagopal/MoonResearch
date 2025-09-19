# 🌙 Astrology Research Journal

A comprehensive web application for tracking daily experiences and correlating them with planetary positions. Built with Next.js, Supabase, and TailwindCSS.

## Features

- **Daily Journal Entries**: Record sleep duration, mood scores, disturbances, and personal notes
- **Planetary Data Integration**: Automatically fetch planetary positions for any date from your Supabase database
- **Visual Analytics**: Interactive charts showing correlations between your experiences and planetary positions
- **Moon Phase Tracking**: Visual representation of moon phases and their impact on your mood and sleep
- **Rasi Analysis**: Analyze how different moon positions (Rasi) affect your wellbeing
- **Secure Authentication**: User-specific data with Supabase Auth
- **Mobile-First Design**: Responsive design optimized for all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Charts**: Recharts
- **UI Components**: Headless UI, Heroicons
- **Deployment**: Vercel

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **npm**: Package manager

## Database Setup

### 1. Run the Database Schema

Execute the SQL commands in `database-schema.sql` in your Supabase SQL editor:

```sql
-- This will create:
-- - journal_entries table
-- - Row Level Security policies
-- - Indexes for performance
-- - A view for joining journal entries with planetary data
```

### 2. Ensure your existing daily_planets table matches this structure:

```sql
-- Your existing table should have:
CREATE TABLE daily_planets (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    planetary_data JSONB NOT NULL, -- Array of planet objects
    last_updated TIMESTAMP WITH TIME ZONE
);
```

## Installation

### 1. Clone and Install Dependencies

```bash
cd moon-research-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Authentication
- Sign up for a new account or sign in with existing credentials
- Each user has their own private journal entries

### 2. Creating Entries
- Navigate to "New Entry" to record your daily experience
- Fill in sleep duration, mood score (1-10), disturbances, and notes
- The app automatically fetches planetary data for the selected date

### 3. Viewing History
- Access "History" to see all your past entries in a timeline format
- Each entry shows your data alongside the planetary positions for that day

### 4. Analytics Dashboard
- Visit "Analytics" to see correlations between your experiences and planetary positions
- View charts showing:
  - Mood and sleep trends over time
  - Average mood by moon phase
  - Mood distribution by moon Rasi (zodiac sign)
  - Sleep vs mood correlation scatter plots

## Data Structure

### Journal Entries
```typescript
{
  id: string;
  user_id: string;
  date: string;
  sleep_duration: number | null; // Hours
  mood_score: number | null;     // 1-10 scale
  disturbances: boolean;         // Sleep disturbances
  notes: string | null;          // Free-form text
  created_at: string;
  updated_at: string;
}
```

### Planetary Data
```typescript
{
  id: string;
  date: string;
  planetary_data: Planet[];     // Array of planet positions
  last_updated: string;
}

interface Planet {
  id: number;
  name: string;                 // Sun, Moon, Mercury, etc.
  rasi: {
    id: number;
    name: string;               // Aries, Taurus, etc.
    lord: {
      id: number;
      name: string;
      vedic_name: string;
    };
  };
  degree: number;               // Position within the rasi
  position: number;             // House position
  longitude: number;            // Absolute longitude
  is_retrograde: boolean;
}
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will be automatically deployed and available at your Vercel URL.

## Research Applications

This app is designed for astrology research and can be used to:

- **Collect Personal Data**: Track individual experiences over time
- **Multi-User Studies**: Deploy for multiple participants to collect research data
- **Correlation Analysis**: Identify patterns between planetary positions and human experiences
- **Statistical Research**: Export data for advanced statistical analysis
- **Longitudinal Studies**: Track changes over months or years

## API Endpoints

The app uses Supabase's auto-generated APIs:

- `GET /rest/v1/journal_entries` - Fetch user's entries
- `POST /rest/v1/journal_entries` - Create new entry
- `GET /rest/v1/daily_planets` - Fetch planetary data
- `GET /rest/v1/journal_entries_with_planets` - Joined view

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
1. Check the GitHub issues
2. Review the Supabase documentation
3. Check Next.js documentation for frontend issues

---

Built with ❤️ for astrology research and self-discovery.