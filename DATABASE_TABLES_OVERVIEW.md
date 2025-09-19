# 📊 **Database Tables & Data Storage Overview**

## 🗄️ **Tables Storing Your Research Data**

### **1. `auth.users` (Built-in Supabase Table)**
**Purpose**: User authentication and basic info
```sql
-- What's stored:
- id (UUID) - Unique user identifier
- email - User login email
- created_at - Registration timestamp
- last_sign_in_at - Last login time
- email_confirmed_at - Email verification status
```

### **2. `journal_entries` (Main Research Data)**
**Purpose**: Daily user experiences and observations
```sql
-- What's stored:
- id (UUID) - Unique entry identifier
- user_id (UUID) - Links to auth.users
- date (DATE) - Entry date
- mood_score (INTEGER) - 1-10 mood rating
- sleep_duration (DECIMAL) - Hours of sleep
- disturbances (BOOLEAN) - Sleep disturbances Y/N
- notes (TEXT) - User observations/notes
- created_at (TIMESTAMP) - When entry was created
- updated_at (TIMESTAMP) - Last modification
```

### **3. `user_profiles` (Birth Chart Data)**
**Purpose**: User's birth astrological details
```sql
-- What's stored:
- id (UUID) - Unique profile identifier
- user_id (UUID) - Links to auth.users
- birth_rasi (VARCHAR) - Birth zodiac sign
- birth_nakshatra (VARCHAR) - Birth star/constellation
- birth_date (DATE) - Birth date (optional)
- birth_time (TIME) - Birth time (optional)
- birth_place (VARCHAR) - Birth location (optional)
- created_at (TIMESTAMP) - Profile creation time
- updated_at (TIMESTAMP) - Last profile update
```

### **4. `daily_gochar` (Your Existing Planetary Data)**
**Purpose**: Daily planetary positions (your existing table)
```sql
-- What's stored:
- id (UUID) - Unique record identifier
- date (DATE) - Date of planetary positions
- planetary_data (JSONB) - Complete planetary positions array
- last_updated (TIMESTAMP) - When data was calculated
```

### **5. `daily_planets` (View of daily_gochar)**
**Purpose**: App-friendly view of your planetary data
```sql
-- This is a VIEW that points to your daily_gochar table
-- Allows app to read your existing planetary calculations
```

## 📈 **Research Views (Generated from Tables)**

### **6. `journal_entries_with_planets` (Research View)**
**Purpose**: Combined user entries with planetary data
```sql
-- Joins journal_entries + daily_planets
-- Shows user mood/sleep with corresponding planetary positions
```

### **7. `research_data_complete` (Master Research View)**
**Purpose**: Complete dataset for analysis
```sql
-- Combines ALL tables:
- User birth details (user_profiles)
- Daily experiences (journal_entries) 
- Planetary positions (daily_planets)
- Moon phase calculations
- Statistical correlations
```

### **8. `admin_user_overview` (Admin Dashboard)**
**Purpose**: User management and research metrics
```sql
-- Shows:
- User registration info
- Total journal entries per user
- Average mood/sleep scores
- Last activity dates
- Birth rasi/nakshatra data
```

## 🔍 **Data Flow & Relationships**

```
User Registration → auth.users
       ↓
Profile Setup → user_profiles (birth_rasi, birth_nakshatra)
       ↓
Daily Entry → journal_entries (mood, sleep, notes)
       ↓
Planetary Data ← daily_gochar (your existing calculations)
       ↓
Research Analysis ← Combined views for correlations
```

## 📊 **Sample Data Structure**

### **Example Journal Entry with Planetary Data:**
```json
{
  "user": {
    "email": "user@example.com",
    "birth_rasi": "Karka",
    "birth_nakshatra": "Pushya"
  },
  "entry": {
    "date": "2025-09-18",
    "mood_score": 8,
    "sleep_duration": 7.5,
    "disturbances": false,
    "notes": "Felt very positive today"
  },
  "planetary_data": {
    "moon_rasi": "Simha",
    "moon_degree": 13.1,
    "moon_phase": "First Quarter",
    "sun_rasi": "Kanya",
    "all_planets": [/* complete planetary array */]
  }
}
```

## 🎯 **Research Correlations Stored**

### **What Gets Analyzed:**
1. **Birth Rasi** (Karka) vs **Current Moon Rasi** (Simha) → **Mood Score** (8)
2. **Birth Nakshatra** (Pushya) vs **Moon Phase** (First Quarter) → **Sleep Quality** (7.5h, no disturbances)
3. **Date Patterns** → **Weekly/Monthly mood cycles**
4. **Planetary Combinations** → **Multi-factor analysis**

## 🔑 **Key Tables for Research:**

### **Primary Data Tables:**
- **`journal_entries`**: Your main research data
- **`user_profiles`**: Birth chart baselines
- **`daily_gochar`**: Your planetary calculations

### **Analysis Tables:**
- **`research_data_complete`**: Master research dataset
- **`moon_phase_analysis`**: Moon phase correlations
- **`birth_vs_transit_analysis`**: Birth vs current position effects

## 📋 **Quick Table Check Queries**

```sql
-- Check all your tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count records in each table
SELECT 'auth.users' as table_name, COUNT(*) as records FROM auth.users
UNION ALL
SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'daily_gochar', COUNT(*) FROM daily_gochar;

-- Sample research data
SELECT * FROM research_data_complete LIMIT 5;
```

## 🎉 **Your Research Database is Complete!**

**Total Tables**: 4 main tables + 5 research views  
**Data Types**: Quantitative (mood/sleep) + Qualitative (notes) + Astronomical (planetary)  
**Research Ready**: Yes! Perfect for academic studies  
**Scalable**: Can handle thousands of users and entries  

Your app creates a **comprehensive research database** that correlates human experiences with precise planetary positions! 🌟
