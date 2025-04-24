'use client';

import { useState, useEffect, useRef } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';

interface AnalogTimeSelectorProps {
  onChange: (startTime: string, endTime: string) => void;
  initialStartTime?: string;
  initialEndTime?: string;
  minTime?: string;
  maxTime?: string;
  language?: 'tr' | 'en';
}

const AnalogTimeSelector: React.FC<AnalogTimeSelectorProps> = ({
  onChange,
  initialStartTime = '09:00',
  initialEndTime = '10:00',
  minTime = '09:00',
  maxTime = '22:00',
  language = 'tr'
}) => {
  const [selectingEndTime, setSelectingEndTime] = useState(false);
  const [startTime, setStartTime] = useState<Date>(() => {
    const [hours, minutes] = initialStartTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 9, minutes || 0, 0, 0);
    return date;
  });
  const [endTime, setEndTime] = useState<Date>(() => {
    const [hours, minutes] = initialEndTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 10, minutes || 0, 0, 0);
    return date;
  });
  const [activeTime, setActiveTime] = useState<Date>(startTime);
  
  // Convert minTime and maxTime to Date objects
  const minTimeDate = (() => {
    const [hours, minutes] = minTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 9, minutes || 0, 0, 0);
    return date;
  })();
  
  const maxTimeDate = (() => {
    const [hours, minutes] = maxTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 22, minutes || 0, 0, 0);
    return date;
  })();
  
  // Get formatted time string
  const getFormattedTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Handle time change
  const handleTimeChange = (newTime: Date) => {
    // Ensure time is within bounds
    if (newTime < minTimeDate) newTime = new Date(minTimeDate);
    if (newTime > maxTimeDate) newTime = new Date(maxTimeDate);
    
    // Round to 15-minute intervals
    const minutes = newTime.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    newTime.setMinutes(roundedMinutes);
    
    if (!selectingEndTime) {
      setStartTime(newTime);
      setActiveTime(newTime);
      
      // If new start time is greater than end time, adjust end time
      if (newTime >= endTime) {
        const newEndTime = new Date(newTime);
        newEndTime.setHours(newEndTime.getHours() + 1);
        if (newEndTime > maxTimeDate) newEndTime.setTime(maxTimeDate.getTime());
        setEndTime(newEndTime);
      }
    } else {
      // Ensure end time is after start time
      if (newTime <= startTime) {
        newTime = new Date(startTime);
        newTime.setMinutes(startTime.getMinutes() + 15);
      }
      setEndTime(newTime);
      setActiveTime(newTime);
    }
    
    onChange(getFormattedTime(selectingEndTime ? startTime : newTime), 
             getFormattedTime(selectingEndTime ? newTime : endTime));
  };

  // Toggle between selecting start and end time
  const toggleTimeSelection = () => {
    setSelectingEndTime(!selectingEndTime);
    setActiveTime(selectingEndTime ? startTime : endTime);
  };

  // Calculate the angle for the highlighted segment
  const startAngle = (startTime.getHours() % 12 + startTime.getMinutes() / 60) * 30; // 30 degrees per hour
  const endAngle = (endTime.getHours() % 12 + endTime.getMinutes() / 60) * 30;
  
  // Create the SVG path for the highlighted arc
  const createArcPath = (startAngle: number, endAngle: number, radius: number): string => {
    // Ensure endAngle > startAngle for proper arc drawing
    if (endAngle <= startAngle) endAngle += 360;
    
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);
    
    // Large arc flag is 1 if angle > 180 degrees
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Translations
  const texts = {
    tr: {
      startTime: "Başlangıç Saati",
      endTime: "Bitiş Saati",
      select: "Seç"
    },
    en: {
      startTime: "Start Time",
      endTime: "End Time",
      select: "Select"
    }
  };
  
  // Use the correct language
  const t = texts[language];

  return (
    <div className="analog-time-selector flex flex-col items-center">
      <div className="mb-4 flex items-center justify-between w-full max-w-xs">
        <div 
          className={`time-selector p-2 rounded cursor-pointer border ${!selectingEndTime ? 'border-primary bg-primary/10' : 'border-border'}`}
          onClick={() => setSelectingEndTime(false)}
        >
          <div className="text-xs text-muted-foreground">{t.startTime}</div>
          <div className="text-lg font-medium">{getFormattedTime(startTime)}</div>
        </div>
        
        <div className="mx-2 text-muted-foreground">→</div>
        
        <div 
          className={`time-selector p-2 rounded cursor-pointer border ${selectingEndTime ? 'border-primary bg-primary/10' : 'border-border'}`}
          onClick={() => setSelectingEndTime(true)}
        >
          <div className="text-xs text-muted-foreground">{t.endTime}</div>
          <div className="text-lg font-medium">{getFormattedTime(endTime)}</div>
        </div>
      </div>
      
      <div className="clock-container relative w-64 h-64">
        {/* Highlighted arc for the selected time range */}
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
          <path 
            d={createArcPath(startAngle, endAngle, 40)} 
            fill="rgba(225, 6, 0, 0.15)" 
            stroke="rgba(225, 6, 0, 0.5)"
            strokeWidth="1"
          />
        </svg>
        
        {/* Start time marker */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
          style={{ 
            transform: `rotate(${startAngle}deg)`,
            transformOrigin: 'center'
          }}
        >
          <div className="absolute top-0 left-1/2 h-1/2 w-1 bg-primary rounded-full transform -translate-x-1/2"></div>
        </div>
        
        {/* End time marker */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
          style={{ 
            transform: `rotate(${endAngle}deg)`,
            transformOrigin: 'center'
          }}
        >
          <div className="absolute top-0 left-1/2 h-1/2 w-1 bg-race-blue rounded-full transform -translate-x-1/2"></div>
        </div>
        
        <Clock
          value={activeTime}
          onChange={handleTimeChange as any}
          renderNumbers={true}
          className="w-full h-full z-0"
        />
      </div>
      
      <div className="mt-2 text-sm text-center">
        {selectingEndTime ? 
          `${t.select} ${t.endTime.toLowerCase()}` : 
          `${t.select} ${t.startTime.toLowerCase()}`
        }
      </div>
    </div>
  );
};

export default AnalogTimeSelector;