import React from 'react';
import { POI } from '../types';

interface PoiTooltipProps {
  poi: POI | null;
  position: { x: number; y: number } | null;
}

export const PoiTooltip: React.FC<PoiTooltipProps> = ({ poi, position }) => {
  if (!poi || !position) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: poi.color }} />
        <div>
          <div className="font-bold text-xs">{poi.name}</div>
          <div className="text-[10px] text-slate-400">
            {poi.altitudeMeters}m de altitude • Clique para detalhes
          </div>
        </div>
      </div>
      <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 mx-auto -mt-1" />
    </div>
  );
};
