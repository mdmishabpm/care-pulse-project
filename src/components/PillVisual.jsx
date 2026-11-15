import React from 'react';

export default function PillVisual({ shape = 'round', color = 'white', size = 'md' }) {
  const colorMap = {
    white: 'bg-white border-slate-300 text-slate-700',
    yellow: 'bg-amber-300 border-amber-400 text-amber-900',
    blue: 'bg-sky-400 border-sky-500 text-sky-950',
    orange: 'bg-orange-400 border-orange-500 text-orange-950',
    red: 'bg-rose-500 border-rose-600 text-white',
    green: 'bg-emerald-400 border-emerald-500 text-emerald-950'
  };

  const selectedColor = colorMap[color.toLowerCase()] || colorMap.white;

  if (shape === 'capsule') {
    return (
      <div className={`relative inline-flex items-center justify-center rounded-full border-2 shadow-sm font-bold text-[10px] overflow-hidden ${selectedColor} ${
        size === 'lg' ? 'w-16 h-8 text-xs' : size === 'sm' ? 'w-8 h-4' : 'w-12 h-6'
      }`}>
        <div className="absolute inset-y-0 left-0 w-1/2 bg-white/30 border-r border-black/10"></div>
        <span className="relative z-10 font-mono tracking-tighter opacity-80">Rx</span>
      </div>
    );
  }

  if (shape === 'oval') {
    return (
      <div className={`relative inline-flex items-center justify-center rounded-[18px] border-2 shadow-sm font-bold ${selectedColor} ${
        size === 'lg' ? 'w-14 h-9 text-xs' : size === 'sm' ? 'w-7 h-5' : 'w-11 h-7 text-[10px]'
      }`}>
        <div className="w-full h-[1px] bg-black/15 absolute"></div>
        <span className="relative z-10 font-mono opacity-80">500</span>
      </div>
    );
  }

  // Default: round
  return (
    <div className={`relative inline-flex items-center justify-center rounded-full border-2 shadow-sm font-bold ${selectedColor} ${
      size === 'lg' ? 'w-10 h-10 text-xs' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8 text-[10px]'
    }`}>
      <div className="w-[1px] h-full bg-black/15 absolute"></div>
      <span className="relative z-10 font-mono opacity-80">+</span>
    </div>
  );
}
