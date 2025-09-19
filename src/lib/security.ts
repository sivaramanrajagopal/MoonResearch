// Security utilities and configurations

// Admin email configuration - UPDATE THESE WITH YOUR ACTUAL ADMIN EMAILS
const ADMIN_EMAILS = [
  'vrsiva78@icloud.com', // Primary admin email
  'sivaramanrajagopal@gmail.com', // Secondary admin email
  // Add more admin emails as needed
];

// Check if user is admin
export const isUserAdmin = (userEmail: string | undefined): boolean => {
  if (!userEmail) return false;
  
  // For production, also check environment variable
  const envAdmins = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
  const allAdmins = [...ADMIN_EMAILS.map(email => email.toLowerCase()), ...envAdmins];
  
  return allAdmins.includes(userEmail.toLowerCase());
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove event handlers
    .trim()
    .substring(0, 5000); // Limit length
};

// Validate mood score
export const validateMoodScore = (score: number | null): boolean => {
  if (score === null) return true; // Optional field
  return score >= 1 && score <= 10;
};

// Validate sleep duration
export const validateSleepDuration = (duration: number | null): boolean => {
  if (duration === null) return true; // Optional field
  return duration >= 0 && duration <= 24;
};

// Rate limiting check (client-side)
export const checkRateLimit = (lastEntryTime: string | null): boolean => {
  if (!lastEntryTime) return true;
  
  const lastEntry = new Date(lastEntryTime);
  const now = new Date();
  const timeDiff = now.getTime() - lastEntry.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Allow maximum 1 entry per hour
  return hoursDiff >= 1;
};

// Validate journal entry data
export const validateJournalEntry = (data: {
  mood_score: number | null;
  sleep_duration: number | null;
  notes: string | null;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateMoodScore(data.mood_score)) {
    errors.push('Mood score must be between 1 and 10');
  }
  
  if (!validateSleepDuration(data.sleep_duration)) {
    errors.push('Sleep duration must be between 0 and 24 hours');
  }
  
  if (data.notes && data.notes.length > 5000) {
    errors.push('Notes must be less than 5000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Environment validation
export const validateEnvironment = (): boolean => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  return requiredEnvVars.every(envVar => 
    process.env[envVar] && process.env[envVar] !== ''
  );
};

// Security headers for production
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Content Security Policy
export const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
`.replace(/\s{2,}/g, ' ').trim();
