'use client';

import { useState, useEffect } from 'react';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface CountdownTimerProps {
  targetDate: string | Date;
  locale: LanguageType;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate, locale }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Calculate time remaining
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // If we've passed the target date, reset countdown
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    
    // Update countdown every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Clean up
    return () => clearInterval(timer);
  }, [targetDate]);

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="flex items-center space-x-1 bg-dark-grey/60 px-2 py-1 rounded-full text-xs font-medium text-light-grey">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-electric-blue mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {locale === 'tr' 
        ? `${days} gün ${hours} saat ${minutes} dk kaldı` 
        : `${days}d ${hours}h ${minutes}m ${seconds}s left`
      }
    </div>
  );
}