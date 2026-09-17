import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Compass,
  ExternalLink,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { TimeOfDay, POI } from '../types';
import { POIS_DATA, CHACARA_GEO } from '../data/chacaraData';

interface HeaderBarProps {
  timeOfDay: TimeOfDay;
  setTimeOfDay: (t: TimeOfDay) => void;
  onSelectPoi: (poi: POI | null) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  showControlsPanel: boolean;
  setShowControlsPanel: (show: boolean) => void;
  onResetView: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  timeOfDay,
  setTimeOfDay,
  onSelectPoi,
  isFullscreen,
  toggleFullscreen,
  showControlsPanel,
  setShowControlsPanel,
  onResetView,
}) => {
  return (
    <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Brand & City Info */}
      <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-3 pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-100 text-sm md:text-base tracking-tight">
              Chácara - MG
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Vista 3D Realista
            </span>
          </div>
          <p className="text-slate-400 text-xs flex items-center gap-2">
            <span>Zona da Mata • 765m alt.</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-300">
              -21.6744°, -43.2231°
            </span>
          </p>
        </div>
      </div>

      {/* Center Search / POI Quick Selector */}
      <div className="hidden lg:flex items-center bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-auto gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <select
          aria-label="Ir para ponto de interesse"
          className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer py-1 pr-2"
          onChange={(e) => {
            const found = POIS_DATA.find((p) => p.id === e.target.value);
            if (found) onSelectPoi(found);
          }}
          defaultValue=""
        >
          <option value="" disabled className="bg-slate-800 text-slate-400">
            Explorar pontos de interesse ({POIS_DATA.length})...
          </option>
          {POIS_DATA.map((poi) => (
            <option key={poi.id} value={poi.id} className="bg-slate-800 text-slate-200">
              {poi.name} ({poi.altitudeMeters}m)
            </option>
          ))}
        </select>
      </div>

      {/* Right Controls: Time of Day, Google Maps Link, Layers, Fullscreen */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Time of Day Switcher */}
        <div className="bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl flex items-center">
          <button
            type="button"
            title="Modo Dia (Luz natural)"
            onClick={() => setTimeOfDay('day')}
            className={`p-2 rounded-lg transition-all ${
              timeOfDay === 'day'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Pôr do Sol (Luz dourada)"
            onClick={() => setTimeOfDay('sunset')}
            className={`p-2 rounded-lg transition-all ${
              timeOfDay === 'sunset'
                ? 'bg-orange-500/20 text-orange-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Modo Noite (Iluminação urbana)"
            onClick={() => setTimeOfDay('night')}
            className={`p-2 rounded-lg transition-all ${
              timeOfDay === 'night'
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Layers Panel */}
        <button
          type="button"
          onClick={() => setShowControlsPanel(!showControlsPanel)}
          className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl transition-all flex items-center gap-1.5 text-xs font-medium ${
            showControlsPanel
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-900/85 text-slate-300 hover:text-white border-slate-700/80'
          }`}
          title="Alternar painel de camadas e câmeras"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Camadas & Câmeras</span>
        </button>

        {/* Google Maps link */}
        <a
          href="https://www.google.com/maps/place/Ch%C3%A1cara+-+MG/@-21.674447,-43.2231489,1181m/data=!3m1!1e3!4m6!3m5!1s0xa27effa2ca4051:0x6c6144fbf92184ab!8m2!3d-21.673634!4d-43.2212359!16s%2Fm%2F0h_b7py"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-xl transition-all flex items-center gap-1 text-xs"
          title="Ver no Google Maps Oficial"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden md:inline">Google Maps</span>
        </a>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-xl transition-all"
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
