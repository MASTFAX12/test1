import React, { useState, useEffect } from 'react';
import type { PublicTheme } from '../types.ts';

interface TimeDisplayProps {
    theme: PublicTheme;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ theme }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className={`${theme.timeDisplayBackground} ${theme.primaryText} font-bold px-6 py-3 rounded-xl shadow-lg text-xl md:text-2xl lg:text-3xl`}>
      {time.toLocaleString('ar-SA', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}
    </div>
  );
};

export default TimeDisplay;