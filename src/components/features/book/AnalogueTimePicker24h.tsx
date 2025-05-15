'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import styles from './AnalogueTimePicker24h.module.css';
import { format, isToday, isSameDay, getDay } from 'date-fns';

// TypeScript interfaces
interface TimeValue {
  hours: number;
  minutes: number;
}

interface TimePickerProps {
  defaultStartTime?: TimeValue;
  defaultEndTime?: TimeValue;
  onTimeChange?: (data: {
    startTime: TimeValue;
    endTime: TimeValue;
    currentType: 'start' | 'end';
  }) => void;
  language?: 'tr' | 'en';
  selectedDate?: Date;
  showPrice?: boolean;
  price?: number;
  className?: string;
}

interface TimePickerState {
  startTime: TimeValue;
  endTime: TimeValue;
  currentType: 'start' | 'end';
  currentMode: 'hours' | 'minutes';
}

// Opening and closing hours by day of the week
// 0 = Sunday, 1 = Monday, etc.
const OPENING_HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 10, close: 20 }, // Sunday: 10:00 - 20:00
  1: { open: 10, close: 22 }, // Monday: 10:00 - 22:00
  2: { open: 10, close: 22 }, // Tuesday: 10:00 - 22:00
  3: { open: 10, close: 22 }, // Wednesday: 10:00 - 22:00
  4: { open: 10, close: 22 }, // Thursday: 10:00 - 22:00
  5: { open: 10, close: 22 }, // Friday: 10:00 - 22:00
  6: { open: 9, close: 23 },  // Saturday: 09:00 - 23:00
};

const AnalogueTimePicker24h: React.FC<TimePickerProps> = ({
  defaultStartTime = { hours: 10, minutes: 0 },
  defaultEndTime = { hours: 11, minutes: 0 },
  onTimeChange,
  language = 'tr',
  selectedDate = new Date(),
  showPrice = false,
  price = 0,
  className,
}) => {
  // State
  const [state, setState] = useState<TimePickerState>({
    startTime: { ...defaultStartTime },
    endTime: { ...defaultEndTime },
    currentType: 'start', // Start with start time selection
    currentMode: 'hours', // Start with hour selection
  });
  
  // State for mouse tracking for hands
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseAngle, setMouseAngle] = useState(0);
  
  // Last mouse position to handle continuous rotation
  const lastMouseAngleRef = useRef(0);
  const rotationCountRef = useRef(0);

  // Refs for DOM elements
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minuteHandRef = useRef<HTMLDivElement>(null);
  const cursorPointerRef = useRef<HTMLDivElement>(null); // Yeni çizgi referansı

  // Get current time to limit selections for today
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  
  // Get day of week and opening/closing hours
  const dayOfWeek = getDay(selectedDate);
  const openingHour = OPENING_HOURS[dayOfWeek]?.open || 10;
  const closingHour = OPENING_HOURS[dayOfWeek]?.close || 22;
  
  // Latest start time based on closing hour (don't allow starting too late)
  const latestStartHour = closingHour - 1;
  
  // Check if a time is in the past (only matters for today)
  const isTimePast = (hours: number, minutes: number) => {
    if (!isSameDay(selectedDate, new Date())) return false;
    
    return (
      hours < currentHour || 
      (hours === currentHour && minutes < currentMinute)
    );
  };
  
  // Check if a time is within opening hours
  const isWithinOpeningHours = (hours: number) => {
    return hours >= openingHour && hours < closingHour;
  };
  
  // Check if a time is selectable for start time
  const isSelectableForStart = (hours: number, minutes: number) => {
    // Must be within opening hours (but less than latest start hour)
    if (!isWithinOpeningHours(hours) || hours > latestStartHour) return false;
    
    // Can't be in the past for today
    if (isTimePast(hours, minutes)) return false;
    
    return true;
  };
  
  // Check if a time is selectable based on current selections
  const isTimeSelectable = (hours: number, minutes: number) => {
    if (state.currentType === 'start') {
      return isSelectableForStart(hours, minutes);
    } else {
      // For end time, check that it's after start time and within opening hours
      if (hours < state.startTime.hours) return false;
      if (hours === state.startTime.hours && minutes <= state.startTime.minutes) return false;
      if (hours >= closingHour) return false;
      
      return true;
    }
  };

  // Get current time value based on current type
  const getCurrentTime = () => {
    return state.currentType === 'start' ? state.startTime : state.endTime;
  };

  // Mouse move handler to update clock hands based on pointer position
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!clockContainerRef.current) return;
    
    const rect = clockContainerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;
    
    // Calculate angle in degrees
    // 90 derece sola çevirme düzeltmesi
    let newAngle = Math.atan2(mouseY, mouseX) * 180 / Math.PI;
    if (newAngle < 0) newAngle += 360;
    
    // Handle continuous rotation
    const angleDiff = newAngle - lastMouseAngleRef.current;
    
    // Detect when crossing 0/360 boundary
    if (angleDiff > 270) {
      rotationCountRef.current--;
    } else if (angleDiff < -270) {
      rotationCountRef.current++;
    }
    
    lastMouseAngleRef.current = newAngle;
    
    // Apply total rotation including full rotations
    const totalAngle = newAngle + (rotationCountRef.current * 360);
    setMouseAngle(totalAngle);
    
    setMousePosition({ x: mouseX, y: mouseY });
  };

  // Update clock hands position based on mouse or selected time
  const updateHandPositions = () => {
    const currentTime = getCurrentTime();
    
    if (!hourHandRef.current || !minuteHandRef.current) return;
    
    if (state.currentMode === 'hours') {
      // Set hour hand based on mouse angle if mouse is being tracked
      if (mousePosition.x !== 0 || mousePosition.y !== 0) {
        hourHandRef.current.style.transform = `translate(-50%, 0) rotate(${mouseAngle}deg)`;
      } else {
        // Fallback to current time
        const hourAngle = (currentTime.hours % 12) * 30 + (currentTime.hours % 12 === 0 ? 0 : currentTime.minutes * 0.5);
        hourHandRef.current.style.transform = `translate(-50%, 0) rotate(${hourAngle}deg)`;
      }
      hourHandRef.current.style.display = 'block';
      minuteHandRef.current.style.display = 'none';
    } else {
      // Set minute hand based on mouse angle if mouse is being tracked
      if (mousePosition.x !== 0 || mousePosition.y !== 0) {
        minuteHandRef.current.style.transform = `translate(-50%, 0) rotate(${mouseAngle}deg)`;
      } else {
        // Fallback to current time
        const minuteAngle = currentTime.minutes * 6;
        minuteHandRef.current.style.transform = `translate(-50%, 0) rotate(${minuteAngle}deg)`;
      }
      hourHandRef.current.style.display = 'none';
      minuteHandRef.current.style.display = 'block';
    }
  };

  // Update cursor pointer position and length based on mouse position
  const updateCursorPointer = () => {
    if (!cursorPointerRef.current || mousePosition.x === 0 && mousePosition.y === 0) return;
    
    // Calculate distance from center to mouse position
    const distance = Math.sqrt(mousePosition.x * mousePosition.x + mousePosition.y * mousePosition.y);
    
    // Set width to be the distance from center to mouse position
    cursorPointerRef.current.style.width = `${distance}px`;
    
    // Rotate to point at mouse position
    cursorPointerRef.current.style.transform = `translate(0, -50%) rotate(${mouseAngle}deg)`;
    
    // Show the pointer
    cursorPointerRef.current.style.display = 'block';
  };

  // Update hand positions when state or mouse position changes
  useEffect(() => {
    updateHandPositions();
  }, [state, mousePosition, mouseAngle]);

  // Update cursor position when mouse position changes
  useEffect(() => {
    updateCursorPointer();
  }, [mousePosition, mouseAngle]);

  // Reset mouse position when mouse leaves clock
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    if (cursorPointerRef.current) {
      cursorPointerRef.current.style.display = 'none';
    }
  };

  // Set time type (start or end)
  const setTimeType = (type: 'start' | 'end') => {
    setState(prevState => ({
      ...prevState,
      currentType: type,
      // Always go back to hours when switching time type
      currentMode: 'hours'
    }));
    
    // Reset rotation tracking
    rotationCountRef.current = 0;
    lastMouseAngleRef.current = 0;
  };

  // Calculate hour from mouse angle
  const getHourFromAngle = (angle: number): number => {
    // Görsel açıyla tıklama açısını senkronize etmek için açıyı ayarlıyoruz
    // 90 derece sağa döndür (böylece görsel çizgi ile tıklama noktası eşleşecek)
    const adjustedAngle = (angle + 90) % 360;
    
    // Normalize the angle to 0-360
    const normalizedAngle = adjustedAngle;
    
    // Map to 12-hour clock
    let hour = Math.round(normalizedAngle / 30) % 12;
    
    // Adjust for outer/inner ring (day/night)
    if (mousePosition.x * mousePosition.x + mousePosition.y * mousePosition.y > 70 * 70) {
      // Outer ring (night hours 13-00)
      hour = hour === 0 ? 0 : hour + 12;
    } else {
      // Inner ring (day hours 1-12)
      hour = hour === 0 ? 12 : hour;
    }
    
    return hour;
  };
  
  // Calculate minute from mouse angle
  const getMinuteFromAngle = (angle: number): number => {
    // Görsel açıyla tıklama açısını senkronize etmek için açıyı ayarlıyoruz
    // 90 derece sağa döndür
    const adjustedAngle = (angle + 90) % 360;
    
    // Normalize the angle to 0-360
    const normalizedAngle = adjustedAngle;
    
    // Convert to minute (0-59)
    const minute = Math.round(normalizedAngle / 6) % 60;
    
    // Round to nearest 5
    return Math.round(minute / 5) * 5;
  };
  
  // Handle click on the clock face
  const handleClockClick = () => {
    if (state.currentMode === 'hours') {
      const hour = getHourFromAngle(mouseAngle);
      setHours(hour);
    } else {
      const minute = getMinuteFromAngle(mouseAngle);
      setMinutes(minute);
    }
  };

  // Set hours
  const setHours = (hours: number) => {
    // Don't allow selecting invalid hours
    if (!isTimeSelectable(hours, 0)) return;
    
    setState(prevState => {
      const updatedState = { ...prevState };
      
      if (prevState.currentType === 'start') {
        updatedState.startTime = { ...updatedState.startTime, hours };
        // Also update end time if needed to maintain valid range
        if (hours > updatedState.endTime.hours || 
           (hours === updatedState.endTime.hours && updatedState.startTime.minutes >= updatedState.endTime.minutes)) {
          updatedState.endTime = { 
            hours: Math.min(hours + 1, closingHour - 1), 
            minutes: updatedState.endTime.minutes 
          };
        }
      } else {
        updatedState.endTime = { ...updatedState.endTime, hours };
      }
      
      // Auto switch to minutes after setting hours
      updatedState.currentMode = 'minutes';
      
      return updatedState;
    });

    if (onTimeChange) {
      const updatedTime = { ...getCurrentTime(), hours };
      const data = {
        startTime: state.currentType === 'start' ? updatedTime : state.startTime,
        endTime: state.currentType === 'end' ? updatedTime : state.endTime,
        currentType: state.currentType
      };
      onTimeChange(data);
    }
    
    // Reset rotation tracking for minute selection
    rotationCountRef.current = 0;
    lastMouseAngleRef.current = 0;
  };

  // Set minutes
  const setMinutes = (minutes: number) => {
    // Don't allow selecting invalid minutes
    if (!isTimeSelectable(getCurrentTime().hours, minutes)) return;
    
    setState(prevState => {
      const updatedState = { ...prevState };
      
      if (prevState.currentType === 'start') {
        updatedState.startTime = { ...updatedState.startTime, minutes };
        
        // Check if we need to adjust end time
        const startTimeValue = updatedState.startTime.hours * 60 + updatedState.startTime.minutes;
        const endTimeValue = updatedState.endTime.hours * 60 + updatedState.endTime.minutes;
        
        if (startTimeValue >= endTimeValue) {
          // Add at least 15 minutes to start time for end time
          let newEndMinutes = minutes;
          let newEndHours = updatedState.startTime.hours + 1;
          
          // Ensure end time is within opening hours
          if (newEndHours >= closingHour) {
            newEndHours = closingHour - 1;
            newEndMinutes = 45;
          }
          
          updatedState.endTime = { 
            hours: newEndHours, 
            minutes: newEndMinutes 
          };
        }
        
        // After selecting start time minutes, automatically switch to end time hours
        updatedState.currentType = 'end';
        updatedState.currentMode = 'hours';
      } else {
        updatedState.endTime = { ...updatedState.endTime, minutes };
        // End time minutes selected, stay in minutes mode
      }
      
      return updatedState;
    });

    if (onTimeChange) {
      const updatedTime = { ...getCurrentTime(), minutes };
      const data = {
        startTime: state.currentType === 'start' ? updatedTime : state.startTime,
        endTime: state.currentType === 'end' ? updatedTime : state.endTime,
        currentType: state.currentType === 'start' ? 'end' : 'end'  // Always move to end type after setting start minutes
      };
      onTimeChange(data);
    }
    
    // Reset rotation tracking when switching between start and end
    if (state.currentType === 'start') {
      rotationCountRef.current = 0;
      lastMouseAngleRef.current = 0;
    }
  };

  // Format time as HH:MM
  const formatTime = (time: TimeValue) => {
    // Dakikaları doğru formatta göstermeyi düzeltiyoruz
    const hours = Math.max(0, time.hours).toString().padStart(2, '0');
    const minutes = Math.max(0, time.minutes).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Create clock numbers (hours and minutes)
  const renderClockNumbers = () => {
    const hourNumbers: JSX.Element[] = [];
    const minuteNumbers: JSX.Element[] = [];

    // Create day hours (1-12) in inner circle
    for (let i = 1; i <= 12; i++) {
      const radius = 53; // Inner circle (küçültülmüş boyuta göre ayarlandı)
      const angle = ((i % 12) * 30 - 90) * (Math.PI / 180); // -90 degrees offset to start from 12 o'clock
      const left = 100 + radius * Math.cos(angle); // 100 merkez noktası (200/2)
      const top = 100 + radius * Math.sin(angle); // 100 merkez noktası (200/2)

      const actualHour = i; // 1-12
      const isSelectable = isTimeSelectable(actualHour, 0);
      const isActive = getCurrentTime().hours === actualHour;

      hourNumbers.push(
        <div
          key={`hour-day-${i}`}
          className={`${styles.hourNumber} ${isActive ? styles.active : ''} ${!isSelectable ? styles.disabled : ''}`}
          style={{
            left: `${left - 10}px`, // 10 = width / 2
            top: `${top - 10}px`, // 10 = height / 2
            display: state.currentMode === 'hours' ? 'flex' : 'none',
            cursor: isSelectable ? 'pointer' : 'not-allowed',
            zIndex: 2
          }}
          onClick={() => isSelectable && setHours(actualHour)}
        >
          {actualHour}
        </div>
      );
    }
    
    // Create night hours (13-00) in outer circle
    for (let i = 13; i <= 24; i++) {
      const radius = 80; // Outer circle (küçültülmüş boyuta göre ayarlandı)
      // Adjust angle to match 1-12 positions but in outer ring
      const hourPos = i - 12;
      const angle = ((hourPos % 12) * 30 - 90) * (Math.PI / 180);
      const left = 100 + radius * Math.cos(angle); // 100 merkez noktası (200/2)
      const top = 100 + radius * Math.sin(angle); // 100 merkez noktası (200/2)

      const actualHour = i === 24 ? 0 : i; // Convert 24 to 0
      const isSelectable = isTimeSelectable(actualHour, 0);
      const isActive = getCurrentTime().hours === actualHour;

      hourNumbers.push(
        <div
          key={`hour-night-${i}`}
          className={`${styles.hourNumber} ${isActive ? styles.active : ''} ${!isSelectable ? styles.disabled : ''}`}
          style={{
            left: `${left - 10}px`, // 10 = width / 2
            top: `${top - 10}px`, // 10 = height / 2
            display: state.currentMode === 'hours' ? 'flex' : 'none',
            cursor: isSelectable ? 'pointer' : 'not-allowed',
            zIndex: 2
          }}
          onClick={() => isSelectable && setHours(actualHour)}
        >
          {actualHour}
        </div>
      );
    }

    // Create minute numbers in increments of 5
    for (let i = 0; i < 60; i += 5) {
      const radius = 80; // Use outer circle for minutes (küçültülmüş boyuta göre ayarlandı)
      const angle = (i * 6 - 90) * (Math.PI / 180); // 6 degrees per minute, -90 to start from 12 o'clock
      const left = 100 + radius * Math.cos(angle); // 100 merkez noktası (200/2)
      const top = 100 + radius * Math.sin(angle); // 100 merkez noktası (200/2)

      const isSelectable = isTimeSelectable(getCurrentTime().hours, i);
      const isActive = getCurrentTime().minutes === i;

      minuteNumbers.push(
        <div
          key={`minute-${i}`}
          className={`${styles.hourNumber} ${styles.minuteNumber} ${isActive ? styles.active : ''} ${!isSelectable ? styles.disabled : ''}`}
          style={{
            left: `${left - 10}px`, // 10 = width / 2
            top: `${top - 10}px`, // 10 = height / 2
            display: state.currentMode === 'minutes' ? 'flex' : 'none',
            cursor: isSelectable ? 'pointer' : 'not-allowed',
            zIndex: 2
          }}
          onClick={() => isSelectable && setMinutes(i)}
        >
          {i.toString().padStart(2, '0')}
        </div>
      );
    }

    return [...hourNumbers, ...minuteNumbers];
  };

  // Get current time based on selection
  const currentTime = getCurrentTime();
  
  // Translations
  const texts = {
    tr: {
      startTime: "Başlangıç",
      endTime: "Bitiş",
      hours: "Saat",
      minutes: "Dakika",
      price: "Fiyat",
    },
    en: {
      startTime: "Start",
      endTime: "End",
      hours: "Hour",
      minutes: "Minute",
      price: "Price",
    }
  };
  
  // Use the correct language
  const t = texts[language];

  return (
    <div className={`${styles.timePickerContainer} ${className || ''}`}>
      <div className={styles.timePickerLayout}>
        {/* Clock face */}
        <div 
          className={styles.clockContainer} 
          ref={clockContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClockClick}
        >
          <div className={styles.clockCenter}></div>
          <div className={styles.cursorPointer} ref={cursorPointerRef}></div>
          <div className={styles.clockCircles}>
            <div className={styles.innerCircle}></div>
            <div className={styles.outerCircle}></div>
          </div>
          {renderClockNumbers()}
        </div>

        {/* Controls and Price - Saat bileşeninden tamamen ayrı olarak */}
        <div className={styles.controlsContainer}>
          {/* Start/End selector */}
          <div className={styles.timeTypeSelector}>
            <div 
              className={`${styles.timeTypeButton} ${state.currentType === 'start' ? styles.active : ''}`}
              onClick={() => setTimeType('start')}
            >
              <div className={styles.timeTypeLabel}>{t.startTime}</div>
              <div className={styles.timeValue}>{formatTime(state.startTime)}</div>
            </div>
            <div 
              className={`${styles.timeTypeButton} ${state.currentType === 'end' ? styles.active : ''}`}
              onClick={() => setTimeType('end')}
            >
              <div className={styles.timeTypeLabel}>{t.endTime}</div>
              <div className={styles.timeValue}>{formatTime(state.endTime)}</div>
            </div>
          </div>
          
          {/* Price display - Butonların altına yerleştirildi */}
          {showPrice && (
            <div className={styles.priceContainer}>
              <div className={styles.priceLabel}>{t.price}</div>
              <div className={styles.priceValue}>{price.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalogueTimePicker24h;