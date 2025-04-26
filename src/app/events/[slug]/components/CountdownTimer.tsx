'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  locale: 'tr' | 'en';
}

export function CountdownTimer({ targetDate, locale }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };
    
    // İlk hesaplama
    updateTimer();
    
    // Her saniyede bir güncelleme
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);

  function formatTimeUnit(value: number, unit: string, locale: 'tr' | 'en'): string {
    if (locale === 'tr') {
      switch (unit) {
        case 'day': return `${value} gün`;
        case 'hour': return `${value} saat`;
        case 'minute': return `${value} dk`;
        case 'second': return `${value} sn`;
        default: return `${value}`;
      }
    } else {
      // İngilizce için tekil/çoğul kontrolü
      switch (unit) {
        case 'day': return `${value} ${value === 1 ? 'day' : 'days'}`;
        case 'hour': return `${value} ${value === 1 ? 'hour' : 'hours'}`;
        case 'minute': return `${value} ${value === 1 ? 'min' : 'mins'}`;
        case 'second': return `${value} ${value === 1 ? 'sec' : 'secs'}`;
        default: return `${value}`;
      }
    }
  }

  // Sadece gün, saat ve dakikayı göster (saniyeyi atla)
  const timeString = locale === 'tr'
    ? `${timeLeft.days} gün ${timeLeft.hours} saat ${timeLeft.minutes} dk kaldı`
    : `${timeLeft.days} ${timeLeft.days === 1 ? 'day' : 'days'} ${timeLeft.hours} ${timeLeft.hours === 1 ? 'hr' : 'hrs'} ${timeLeft.minutes} ${timeLeft.minutes === 1 ? 'min' : 'mins'} left`;

  return (
    <div className="flex items-center space-x-1 bg-dark-grey/60 px-2 py-1 rounded-full text-xs font-medium text-light-grey">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-electric-blue mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {timeString}
    </div>
  );
}