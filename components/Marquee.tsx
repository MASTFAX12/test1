
import React from 'react';
import type { PublicTheme } from '../types.ts';

interface MarqueeProps {
  text: string;
  speed?: number; // duration in seconds for one full scroll
  theme: PublicTheme;
}

const Marquee: React.FC<MarqueeProps> = ({ text, speed = 20, theme }) => {
  return (
    <div className={`w-full ${theme.cardBackground} p-4 rounded-xl overflow-hidden`}>
      <div 
        className="flex whitespace-nowrap"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        <span className={`text-xl ${theme.primaryText} font-semibold px-12`}>{text}</span>
        <span className={`text-xl ${theme.primaryText} font-semibold px-12`} aria-hidden="true">{text}</span>
      </div>
    </div>
  );
};

export default Marquee;
