import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';

interface CompassWidgetProps {
  onResetNorth: () => void;
}

export const CompassWidget: React.FC<CompassWidgetProps> = ({ onResetNorth }) => {
  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onResetNorth}
        title="Alinhar ao Norte geográfico / Resetar Câmera"
        className="w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center group transition active:scale-95"
      >
        <span className="text-[10px] font-black text-rose-500 leading-none group-hover:scale-110 transition">
          N
        </span>
        <div className="w-1 h-3 bg-gradient-to-b from-rose-500 to-slate-400 rounded-full my-0.5" />
        <span className="text-[8px] font-bold text-slate-500 leading-none">S</span>
      </button>
    </div>
  );
};
