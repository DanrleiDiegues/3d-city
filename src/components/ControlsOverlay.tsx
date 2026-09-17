import React from 'react';
import {
  Camera,
  Building,
  Trees,
  MapPin,
  Route,
  Activity,
  Play,
  Pause,
  Compass,
  RotateCcw,
  Sliders,
  HelpCircle,
  X,
} from 'lucide-react';
import { CameraPreset, MapLayers } from '../types';

interface ControlsOverlayProps {
  layers: MapLayers;
  setLayers: React.Dispatch<React.SetStateAction<MapLayers>>;
  elevationScale: number;
  setElevationScale: (val: number) => void;
  onApplyPreset: (preset: CameraPreset) => void;
  isCinematicFlight: boolean;
  setIsCinematicFlight: (val: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  layers,
  setLayers,
  elevationScale,
  setElevationScale,
  onApplyPreset,
  isCinematicFlight,
  setIsCinematicFlight,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <aside aria-label="Painel de controle 3D" className="absolute top-20 right-3 z-30 w-80 max-h-[calc(100vh-100px)] overflow-y-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-200 text-xs flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-400" />
          <h2 className="font-semibold text-sm text-white">Controles do Mapa 3D</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Camera Presets */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Câmeras & Ângulos de Visão
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onApplyPreset('overview')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
          >
            <span className="text-base">🛰️</span>
            <div>
              <div className="font-semibold text-white">Visão Geral</div>
              <div className="text-[10px] text-slate-400">Aérea completa</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('church')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
          >
            <span className="text-base">⛪</span>
            <div>
              <div className="font-semibold text-white">Paróquia</div>
              <div className="text-[10px] text-slate-400">São Sebastião</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('prefeitura')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
          >
            <span className="text-base">🏛️</span>
            <div>
              <div className="font-semibold text-white">Prefeitura</div>
              <div className="text-[10px] text-slate-400">Centro cívico</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('pequena_suica')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-pink-600/30 hover:border-pink-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
          >
            <span className="text-base">🏔️</span>
            <div>
              <div className="font-semibold text-white">Pequena Suíça</div>
              <div className="text-[10px] text-slate-400">Hotel & Mirante</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('south_entry')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-600/30 hover:border-amber-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
          >
            <span className="text-base">🛣️</span>
            <div>
              <div className="font-semibold text-white">Entrada Sul</div>
              <div className="text-[10px] text-slate-400">Marconato</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('aerial_isometric')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-600/30 hover:border-purple-500/50 border border-slate-700/60 text-left transition flex items-center gap-2"
          >
            <span className="text-base">📐</span>
            <div>
              <div className="font-semibold text-white">Isométrica</div>
              <div className="text-[10px] text-slate-400">Perspectiva 45°</div>
            </div>
          </button>
        </div>

        {/* Cinematic Drone Tour Button */}
        <button
          type="button"
          onClick={() => setIsCinematicFlight(!isCinematicFlight)}
          className={`w-full mt-2 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition shadow-lg ${
            isCinematicFlight
              ? 'bg-red-600/80 hover:bg-red-600 text-white border-red-500 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
          }`}
        >
          {isCinematicFlight ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Parar Voo Cinemático</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Iniciar Voo Panorâmico (Drone)</span>
            </>
          )}
        </button>
      </div>

      {/* 2. 3D Layers Toggles */}
      <div className="border-t border-slate-800 pt-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Camadas do Modelo 3D
        </span>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Casas e Prédios Elevados 3D</span>
            </div>
            <input
              type="checkbox"
              checked={layers.buildings}
              onChange={(e) => setLayers((prev) => ({ ...prev, buildings: e.target.checked }))}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Placas e Pontos de Interesse</span>
            </div>
            <input
              type="checkbox"
              checked={layers.pois}
              onChange={(e) => setLayers((prev) => ({ ...prev, pois: e.target.checked }))}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer">
            <div className="flex items-center gap-2">
              <Trees className="w-4 h-4 text-green-400" />
              <span>Vegetação e Florestas 3D</span>
            </div>
            <input
              type="checkbox"
              checked={layers.trees}
              onChange={(e) => setLayers((prev) => ({ ...prev, trees: e.target.checked }))}
              className="w-4 h-4 accent-green-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-blue-400" />
              <span>Ruas e Postes de Luz Noturnos</span>
            </div>
            <input
              type="checkbox"
              checked={layers.roads}
              onChange={(e) => setLayers((prev) => ({ ...prev, roads: e.target.checked }))}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Grade Topográfica (Curvas de Nível)</span>
            </div>
            <input
              type="checkbox"
              checked={layers.contourLines}
              onChange={(e) => setLayers((prev) => ({ ...prev, contourLines: e.target.checked }))}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. Relevo / Elevation Exaggeration */}
      <div className="border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-xs">Exagero do Relevo</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">{elevationScale.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={elevationScale}
          onChange={(e) => setElevationScale(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0.5x Suave</span>
          <span>1.0x Real</span>
          <span>2.5x Dramático</span>
        </div>
      </div>

      {/* 4. Mouse / Touch Gestures Guide */}
      <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 space-y-1 bg-slate-950/40 p-2.5 rounded-xl">
        <div className="font-semibold text-slate-300 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Como Navegar em 3D:</span>
        </div>
        <p>• <strong>Girar:</strong> Clique com botão esquerdo e arraste</p>
        <p>• <strong>Aproximar / Zoom:</strong> Roda do mouse ou pinça no celular</p>
        <p>• <strong>Mover / Panorâmica:</strong> Botão direito ou dois dedos</p>
        <p>• <strong>Detalhes:</strong> Clique em qualquer casa ou placa</p>
      </div>
    </aside>
  );
};
