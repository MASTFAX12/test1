import React from 'react';

interface MarqueeProps {
  text: string;
  speed?: number; // duration in seconds for one full scroll
}

const Marquee: React.FC<MarqueeProps> = ({ text, speed = 20 }) => {
  return (
    <div className="w-full bg-black/20 backdrop-blur-sm p-4 rounded-xl overflow-hidden">
      <div 
        className="flex whitespace-nowrap"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        <span className="text-xl text-white/90 font-semibold px-12">{text}</span>
        <span className="text-xl text-white/90 font-semibold px-12" aria-hidden="true">{text}</span>
      </div>
    </div>
  );
};

export default Marquee;