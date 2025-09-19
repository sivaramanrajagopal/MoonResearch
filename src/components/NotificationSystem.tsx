'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NotificationSystem() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Show permission request if not granted
      if (Notification.permission === 'default') {
        setTimeout(() => setShowPermissionRequest(true), 3000); // Show after 3 seconds
      }
    }
  }, []);

  useEffect(() => {
    if (permission === 'granted' && user) {
      // Set up daily reminder
      setupDailyReminder();
    }
  }, [permission, user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPermissionRequest(false);
      
      if (result === 'granted') {
        // Send welcome notification
        new Notification(
          language === 'ta' ? 'அறிவிப்புகள் இயக்கப்பட்டன!' : 'Notifications Enabled!',
          {
            body: language === 'ta' ? 
              'நாங்கள் உங்களுக்கு தினசரி நினைவூட்டல்களை அனுப்புவோம்' :
              'We\'ll send you daily reminders to log your experiences',
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          }
        );
      }
    }
  };

  const setupDailyReminder = () => {
    // Clear any existing reminders
    const existingWorker = localStorage.getItem('notificationWorker');
    if (existingWorker) {
      clearInterval(parseInt(existingWorker));
    }

    // Set up daily reminder at 9 PM
    const scheduleNotification = () => {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(21, 0, 0, 0); // 9:00 PM

      // If it's already past 9 PM today, schedule for tomorrow
      if (now > reminderTime) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      setTimeout(() => {
        sendDailyReminder();
        // Schedule next day's reminder
        setInterval(sendDailyReminder, 24 * 60 * 60 * 1000); // Every 24 hours
      }, timeUntilReminder);
    };

    scheduleNotification();
  };

  const sendDailyReminder = () => {
    if (permission === 'granted') {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if user already logged today
      const hasLoggedToday = localStorage.getItem(`logged_${today}`);
      
      if (!hasLoggedToday) {
        new Notification(
          language === 'ta' ? '🌙 இன்றைய அனுபவத்தை பதிவு செய்யுங்கள்' : '🌙 Log Today\'s Experience',
          {
            body: language === 'ta' ? 
              'உங்கள் மனநிலை, தூக்கம் மற்றும் அனுபவங்களை பதிவு செய்ய நேரம் ஆயிற்று' :
              'Time to record your mood, sleep, and daily experiences',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'daily-reminder',
            requireInteraction: true
          }
        );
      }
    }
  };

  // Handle notification clicks
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.action === 'log-entry') {
          window.location.href = '/journal/new';
        } else if (event.data.action === 'remind-later') {
          // Remind again in 2 hours
          setTimeout(sendDailyReminder, 2 * 60 * 60 * 1000);
        }
      });
    }
  }, []);

  if (!showPermissionRequest || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm border border-gray-200 z-50">
      <div className="flex items-start space-x-3">
        <BellIcon className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className={`text-sm font-medium text-black ${language === 'ta' ? 'font-tamil' : ''}`}>
            {language === 'ta' ? 'தினசரி நினைவூட்டல்கள்' : 'Daily Reminders'}
          </h3>
          <p className={`text-xs text-gray-600 mt-1 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {language === 'ta' ? 
              'உங்கள் தினசரி அனுபவங்களை பதிவு செய்ய நினைவூட்டல்களை பெறுங்கள்' :
              'Get reminders to log your daily experiences for better research data'
            }
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={requestNotificationPermission}
              className={`text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 ${language === 'ta' ? 'font-tamil' : ''}`}
            >
              {language === 'ta' ? 'இயக்கு' : 'Enable'}
            </button>
            <button
              onClick={() => setShowPermissionRequest(false)}
              className={`text-xs text-gray-500 hover:text-gray-700 ${language === 'ta' ? 'font-tamil' : ''}`}
            >
              {language === 'ta' ? 'பின்னர்' : 'Later'}
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowPermissionRequest(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
