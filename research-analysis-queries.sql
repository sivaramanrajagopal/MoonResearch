-- 🌙 ASTROLOGY RESEARCH ANALYSIS QUERIES CHEATSHEET
-- Copy and run these in your Supabase SQL Editor for powerful insights

-- =============================================================================
-- CORE RESEARCH VIEWS
-- =============================================================================

-- 1. COMPREHENSIVE RESEARCH VIEW
CREATE OR REPLACE VIEW research_data_complete AS
SELECT 
    je.id as entry_id,
    je.user_id,
    u.email as user_email,
    up.birth_rasi as user_birth_rasi,
    up.birth_nakshatra as user_birth_nakshatra,
    je.date as entry_date,
    je.mood_score,
    je.sleep_duration,
    je.disturbances,
    je.notes,
    je.created_at,
    
    -- Moon data
    (dp.planetary_data->1->>'name') as moon_name,
    (dp.planetary_data->1->'rasi'->>'name') as moon_rasi,
    (dp.planetary_data->1->>'degree')::numeric as moon_degree,
    (dp.planetary_data->1->>'longitude')::numeric as moon_longitude,
    (dp.planetary_data->1->>'is_retrograde')::boolean as moon_retrograde,
    
    -- Sun data  
    (dp.planetary_data->0->>'name') as sun_name,
    (dp.planetary_data->0->'rasi'->>'name') as sun_rasi,
    (dp.planetary_data->0->>'degree')::numeric as sun_degree,
    
    -- Calculate moon phase
    CASE 
        WHEN (dp.planetary_data->1->>'longitude')::numeric >= 0 AND (dp.planetary_data->1->>'longitude')::numeric < 90 THEN 'New Moon'
        WHEN (dp.planetary_data->1->>'longitude')::numeric >= 90 AND (dp.planetary_data->1->>'longitude')::numeric < 180 THEN 'First Quarter'
        WHEN (dp.planetary_data->1->>'longitude')::numeric >= 180 AND (dp.planetary_data->1->>'longitude')::numeric < 270 THEN 'Full Moon'
        ELSE 'Last Quarter'
    END as moon_phase,
    
    -- Day of week
    EXTRACT(DOW FROM je.date) as day_of_week,
    TO_CHAR(je.date, 'Day') as day_name
    
FROM journal_entries je
JOIN auth.users u ON je.user_id = u.id
LEFT JOIN user_profiles up ON je.user_id = up.user_id
LEFT JOIN daily_planets dp ON je.date = dp.date
WHERE je.mood_score IS NOT NULL;

-- Grant access
GRANT SELECT ON research_data_complete TO authenticated;

-- 2. MOON PHASE ANALYSIS VIEW
CREATE OR REPLACE VIEW moon_phase_analysis AS
SELECT 
    moon_phase,
    moon_rasi,
    COUNT(*) as total_entries,
    AVG(mood_score) as avg_mood,
    AVG(sleep_duration) as avg_sleep,
    COUNT(CASE WHEN disturbances = true THEN 1 END) as disturbance_count,
    ROUND(COUNT(CASE WHEN disturbances = true THEN 1 END) * 100.0 / COUNT(*), 2) as disturbance_percentage
FROM research_data_complete
GROUP BY moon_phase, moon_rasi
ORDER BY avg_mood DESC;

-- 3. USER BIRTH RASI VS MOON RASI CORRELATION
CREATE OR REPLACE VIEW birth_vs_transit_analysis AS
SELECT 
    user_birth_rasi,
    moon_rasi as transit_moon_rasi,
    COUNT(*) as entries,
    AVG(mood_score) as avg_mood,
    AVG(sleep_duration) as avg_sleep,
    STDDEV(mood_score) as mood_variance
FROM research_data_complete
GROUP BY user_birth_rasi, moon_rasi
HAVING COUNT(*) >= 3  -- Only show combinations with at least 3 entries
ORDER BY avg_mood DESC;

-- 4. NAKSHATRA CORRELATION VIEW  
CREATE OR REPLACE VIEW nakshatra_correlation AS
SELECT 
    user_birth_nakshatra,
    moon_rasi as current_moon_rasi,
    moon_phase,
    COUNT(*) as entry_count,
    AVG(mood_score) as avg_mood,
    AVG(sleep_duration) as avg_sleep,
    COUNT(CASE WHEN mood_score >= 8 THEN 1 END) as high_mood_days,
    COUNT(CASE WHEN mood_score <= 3 THEN 1 END) as low_mood_days
FROM research_data_complete
GROUP BY user_birth_nakshatra, moon_rasi, moon_phase
HAVING COUNT(*) >= 2
ORDER BY avg_mood DESC;

-- =============================================================================
-- POWERFUL RESEARCH QUERIES
-- =============================================================================

-- QUERY 1: Best Moon Phases for Each Birth Rasi
SELECT 
    user_birth_rasi,
    moon_phase,
    AVG(mood_score) as avg_mood,
    COUNT(*) as sample_size
FROM research_data_complete
GROUP BY user_birth_rasi, moon_phase
HAVING COUNT(*) >= 5  -- Minimum 5 entries for statistical significance
ORDER BY user_birth_rasi, avg_mood DESC;

-- QUERY 2: Moon Rasi Transit Effects on Birth Rasi
SELECT 
    user_birth_rasi,
    moon_rasi as transit_rasi,
    AVG(mood_score) as avg_mood,
    AVG(sleep_duration) as avg_sleep,
    COUNT(*) as total_entries,
    ROUND(AVG(mood_score), 2) as mood_rounded
FROM research_data_complete
GROUP BY user_birth_rasi, moon_rasi
HAVING COUNT(*) >= 3
ORDER BY user_birth_rasi, avg_mood DESC;

-- QUERY 3: Weekly Patterns by Moon Phase
SELECT 
    day_name,
    moon_phase,
    AVG(mood_score) as avg_mood,
    COUNT(*) as entries
FROM research_data_complete
GROUP BY day_of_week, day_name, moon_phase
ORDER BY day_of_week, avg_mood DESC;

-- QUERY 4: Sleep Disturbances by Moon Position
SELECT 
    moon_rasi,
    moon_phase,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN disturbances = true THEN 1 END) as disturbance_entries,
    ROUND(COUNT(CASE WHEN disturbances = true THEN 1 END) * 100.0 / COUNT(*), 2) as disturbance_rate
FROM research_data_complete
GROUP BY moon_rasi, moon_phase
HAVING COUNT(*) >= 5
ORDER BY disturbance_rate DESC;

-- QUERY 5: Individual User Analysis
SELECT 
    user_email,
    user_birth_rasi,
    user_birth_nakshatra,
    COUNT(*) as total_entries,
    AVG(mood_score) as avg_mood,
    AVG(sleep_duration) as avg_sleep,
    -- Best moon phase for this user
    (SELECT moon_phase FROM research_data_complete r2 
     WHERE r2.user_id = r1.user_id 
     GROUP BY moon_phase 
     ORDER BY AVG(mood_score) DESC 
     LIMIT 1) as best_moon_phase,
    -- Worst moon phase for this user
    (SELECT moon_phase FROM research_data_complete r2 
     WHERE r2.user_id = r1.user_id 
     GROUP BY moon_phase 
     ORDER BY AVG(mood_score) ASC 
     LIMIT 1) as worst_moon_phase
FROM research_data_complete r1
GROUP BY user_id, user_email, user_birth_rasi, user_birth_nakshatra
HAVING COUNT(*) >= 10  -- Users with at least 10 entries
ORDER BY avg_mood DESC;

-- QUERY 6: Retrograde Planet Effects
WITH retrograde_data AS (
    SELECT 
        je.*,
        dp.planetary_data,
        -- Check if any major planets are retrograde
        CASE WHEN EXISTS (
            SELECT 1 FROM jsonb_array_elements(dp.planetary_data) as planet
            WHERE (planet->>'name') IN ('Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn')
            AND (planet->>'is_retrograde')::boolean = true
        ) THEN true ELSE false END as major_retrograde
    FROM journal_entries je
    LEFT JOIN daily_planets dp ON je.date = dp.date
    WHERE je.mood_score IS NOT NULL
)
SELECT 
    major_retrograde,
    COUNT(*) as entries,
    AVG(mood_score) as avg_mood,
    AVG(sleep_duration) as avg_sleep,
    COUNT(CASE WHEN disturbances = true THEN 1 END) as disturbances
FROM retrograde_data
GROUP BY major_retrograde;

-- =============================================================================
-- STATISTICAL ANALYSIS QUERIES
-- =============================================================================

-- CORRELATION: Birth Rasi vs Favorable Moon Transits
SELECT 
    user_birth_rasi,
    moon_rasi as favorable_transit,
    AVG(mood_score) as avg_mood,
    COUNT(*) as sample_size,
    STDDEV(mood_score) as mood_std_dev
FROM research_data_complete
GROUP BY user_birth_rasi, moon_rasi
HAVING COUNT(*) >= 5 AND AVG(mood_score) >= 7
ORDER BY user_birth_rasi, avg_mood DESC;

-- MOOD DISTRIBUTION BY MOON PHASE
SELECT 
    moon_phase,
    COUNT(CASE WHEN mood_score <= 3 THEN 1 END) as low_mood,
    COUNT(CASE WHEN mood_score BETWEEN 4 AND 6 THEN 1 END) as medium_mood,
    COUNT(CASE WHEN mood_score >= 7 THEN 1 END) as high_mood,
    AVG(mood_score) as avg_mood
FROM research_data_complete
GROUP BY moon_phase
ORDER BY avg_mood DESC;

-- SLEEP QUALITY BY MOON POSITION
SELECT 
    moon_rasi,
    AVG(sleep_duration) as avg_sleep,
    COUNT(CASE WHEN disturbances = false THEN 1 END) as good_sleep_days,
    COUNT(CASE WHEN disturbances = true THEN 1 END) as disturbed_sleep_days,
    ROUND(COUNT(CASE WHEN disturbances = false THEN 1 END) * 100.0 / COUNT(*), 2) as good_sleep_percentage
FROM research_data_complete
GROUP BY moon_rasi
ORDER BY good_sleep_percentage DESC;

-- =============================================================================
-- ADVANCED RESEARCH VIEWS
-- =============================================================================

-- LONGITUDINAL ANALYSIS VIEW
CREATE OR REPLACE VIEW longitudinal_analysis AS
SELECT 
    user_id,
    user_email,
    user_birth_rasi,
    user_birth_nakshatra,
    DATE_TRUNC('month', entry_date) as month,
    AVG(mood_score) as monthly_avg_mood,
    AVG(sleep_duration) as monthly_avg_sleep,
    COUNT(*) as entries_per_month,
    -- Mood trend (comparing to previous month)
    LAG(AVG(mood_score)) OVER (PARTITION BY user_id ORDER BY DATE_TRUNC('month', entry_date)) as prev_month_mood
FROM research_data_complete
GROUP BY user_id, user_email, user_birth_rasi, user_birth_nakshatra, DATE_TRUNC('month', entry_date)
ORDER BY user_id, month;

-- MOON NAKSHATRA RESEARCH VIEW (Advanced)
CREATE OR REPLACE VIEW moon_nakshatra_research AS
WITH nakshatra_mapping AS (
    -- Map moon degree to nakshatra (simplified)
    SELECT *,
        CASE 
            WHEN moon_degree BETWEEN 0 AND 13.33 THEN 'Ashwini'
            WHEN moon_degree BETWEEN 13.33 AND 26.67 THEN 'Bharani'
            WHEN moon_degree BETWEEN 26.67 AND 30 THEN 'Krittika'
            -- Add more nakshatra mappings based on your calculation method
            ELSE 'Unknown'
        END as current_moon_nakshatra
    FROM research_data_complete
)
SELECT 
    user_birth_nakshatra,
    current_moon_nakshatra,
    moon_rasi,
    COUNT(*) as entries,
    AVG(mood_score) as avg_mood,
    AVG(sleep_duration) as avg_sleep,
    COUNT(CASE WHEN disturbances = true THEN 1 END) as disturbance_count
FROM nakshatra_mapping
GROUP BY user_birth_nakshatra, current_moon_nakshatra, moon_rasi
HAVING COUNT(*) >= 2
ORDER BY avg_mood DESC;

-- =============================================================================
-- EXPORT QUERIES FOR RESEARCH PAPERS
-- =============================================================================

-- COMPLETE DATASET FOR STATISTICAL ANALYSIS
CREATE OR REPLACE VIEW research_export AS
SELECT 
    -- User identifiers (anonymized)
    MD5(user_email) as user_hash,
    user_birth_rasi,
    user_birth_nakshatra,
    
    -- Entry data
    entry_date,
    mood_score,
    sleep_duration,
    disturbances,
    
    -- Astronomical data
    moon_rasi,
    moon_degree,
    moon_phase,
    moon_longitude,
    sun_rasi,
    
    -- Additional context
    day_of_week,
    day_name,
    EXTRACT(MONTH FROM entry_date) as month,
    EXTRACT(YEAR FROM entry_date) as year
FROM research_data_complete
ORDER BY entry_date, user_hash;

-- =============================================================================
-- QUICK ANALYSIS QUERIES
-- =============================================================================

-- Q1: Which moon phases produce highest mood scores?
SELECT moon_phase, AVG(mood_score) as avg_mood, COUNT(*) as entries
FROM research_data_complete 
GROUP BY moon_phase 
ORDER BY avg_mood DESC;

-- Q2: Best moon rasi transits for each birth rasi
SELECT user_birth_rasi, moon_rasi, AVG(mood_score) as avg_mood, COUNT(*) as entries
FROM research_data_complete 
GROUP BY user_birth_rasi, moon_rasi 
HAVING COUNT(*) >= 3
ORDER BY user_birth_rasi, avg_mood DESC;

-- Q3: Sleep disturbances by moon position
SELECT moon_rasi, moon_phase, 
    COUNT(*) as total,
    COUNT(CASE WHEN disturbances = true THEN 1 END) as disturbed,
    ROUND(COUNT(CASE WHEN disturbances = true THEN 1 END) * 100.0 / COUNT(*), 1) as disturbance_rate
FROM research_data_complete 
GROUP BY moon_rasi, moon_phase
ORDER BY disturbance_rate DESC;

-- Q4: Individual user patterns
SELECT user_email, user_birth_rasi,
    COUNT(*) as total_entries,
    AVG(mood_score) as avg_mood,
    MAX(mood_score) as best_mood,
    MIN(mood_score) as worst_mood
FROM research_data_complete 
GROUP BY user_email, user_birth_rasi
ORDER BY avg_mood DESC;

-- Q5: Weekly patterns
SELECT day_name, AVG(mood_score) as avg_mood, COUNT(*) as entries
FROM research_data_complete 
GROUP BY day_of_week, day_name
ORDER BY day_of_week;

-- =============================================================================
-- STATISTICAL SIGNIFICANCE TESTS
-- =============================================================================

-- Check sample sizes for statistical validity
SELECT 
    'Moon Phase Analysis' as analysis_type,
    moon_phase as category,
    COUNT(*) as sample_size,
    CASE WHEN COUNT(*) >= 30 THEN 'Statistically Significant' ELSE 'More data needed' END as significance
FROM research_data_complete
GROUP BY moon_phase
UNION ALL
SELECT 
    'Birth Rasi Analysis' as analysis_type,
    user_birth_rasi as category,
    COUNT(*) as sample_size,
    CASE WHEN COUNT(*) >= 30 THEN 'Statistically Significant' ELSE 'More data needed' END as significance
FROM research_data_complete
GROUP BY user_birth_rasi
ORDER BY analysis_type, sample_size DESC;

-- =============================================================================
-- ADMIN DASHBOARD QUERIES
-- =============================================================================

-- Admin overview with research metrics
CREATE OR REPLACE VIEW admin_research_overview AS
SELECT 
    COUNT(DISTINCT user_id) as total_users,
    COUNT(*) as total_entries,
    AVG(mood_score) as overall_avg_mood,
    AVG(sleep_duration) as overall_avg_sleep,
    COUNT(DISTINCT entry_date) as days_covered,
    COUNT(DISTINCT moon_rasi) as rasi_positions_covered,
    COUNT(DISTINCT moon_phase) as moon_phases_covered,
    MIN(entry_date) as earliest_entry,
    MAX(entry_date) as latest_entry
FROM research_data_complete;

-- Recent activity for admin monitoring
CREATE OR REPLACE VIEW admin_recent_activity AS
SELECT 
    user_email,
    entry_date,
    mood_score,
    sleep_duration,
    moon_rasi,
    moon_phase,
    created_at
FROM research_data_complete
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- =============================================================================
-- RESEARCH INSIGHTS QUERIES
-- =============================================================================

-- Find users with strong moon phase correlations
WITH user_moon_phase_stats AS (
    SELECT 
        user_id,
        user_email,
        moon_phase,
        AVG(mood_score) as avg_mood,
        COUNT(*) as entries
    FROM research_data_complete
    GROUP BY user_id, user_email, moon_phase
    HAVING COUNT(*) >= 3
),
user_phase_variance AS (
    SELECT 
        user_id,
        user_email,
        MAX(avg_mood) - MIN(avg_mood) as mood_variance,
        COUNT(*) as phase_count
    FROM user_moon_phase_stats
    GROUP BY user_id, user_email
)
SELECT 
    user_email,
    mood_variance,
    phase_count,
    CASE 
        WHEN mood_variance >= 3 THEN 'High Moon Sensitivity'
        WHEN mood_variance >= 2 THEN 'Moderate Moon Sensitivity'
        ELSE 'Low Moon Sensitivity'
    END as sensitivity_level
FROM user_phase_variance
WHERE phase_count >= 3
ORDER BY mood_variance DESC;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT SELECT ON moon_phase_analysis TO authenticated;
GRANT SELECT ON birth_vs_transit_analysis TO authenticated;
GRANT SELECT ON nakshatra_correlation TO authenticated;
GRANT SELECT ON longitudinal_analysis TO authenticated;
GRANT SELECT ON moon_nakshatra_research TO authenticated;
GRANT SELECT ON research_export TO authenticated;
GRANT SELECT ON admin_research_overview TO authenticated;
GRANT SELECT ON admin_recent_activity TO authenticated;

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================

SELECT 'Research Views Created Successfully!' as status,
       COUNT(*) as total_research_entries
FROM research_data_complete;
