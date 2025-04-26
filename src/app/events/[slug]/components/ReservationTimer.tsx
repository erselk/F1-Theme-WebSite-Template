'use client';

import { useState, useEffect } from 'react';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface ReservationTimerProps {
  startTime: Date;
  duration: number; // in minutes
  onExpire: () => void;
  locale: LanguageType;
  className?: string;
}

export function ReservationTimer({ 
  startTime, 
  duration, 
  onExpire,
  locale,
  className = ''
}: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  useEffect(() => {
    // Calculate end time based on start time and duration
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    // Function to update the remaining time
    const updateRemainingTime = () => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        // Time's up
        setTimeLeft(0);
        clearInterval(timerId);
        onExpire();
      } else {
        setTimeLeft(Math.floor(difference / 1000));
      }
    };
    
    // Initial call
    updateRemainingTime();
    
    // Set interval to update every second
    const timerId = setInterval(updateRemainingTime, 1000);
    
    // Clean up interval
    return () => clearInterval(timerId);
  }, [startTime, duration, onExpire]);
  
  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={className}>
      {locale === 'tr' 
        ? `Bilet rezervasyonunuzun süresi doluyor: ${formatTimeLeft()}`
        : `Your ticket reservation expires in: ${formatTimeLeft()}`
      }
    </div>
  );
}