
import React, { useState, useEffect } from 'react';

const TimeDisplay: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-sm text-white font-semibold px-4 py-2 rounded-lg shadow-lg text-sm md:text-base">
      {time.toLocaleString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </div>
  );
};

export default TimeDisplay;
