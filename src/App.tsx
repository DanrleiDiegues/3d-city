import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Map3DCanvas } from './components/Map3DCanvas';
import { HeaderBar } from './components/HeaderBar';
import { ControlsOverlay } from './components/ControlsOverlay';
import { PoiDetailModal } from './components/PoiDetailModal';
import { CompassWidget } from './components/CompassWidget';
import { PoiTooltip } from './components/PoiTooltip';
import { TimeOfDay, CameraPreset, MapLayers, POI } from './types';
import { POIS_DATA } from './data/chacaraData';
import { Eye, Navigation, Sparkles } from 'lucide-react';

export default function App() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [elevationScale, setElevationScale] = useState<number>(1.1);
  const [layers, setLayers] = useState<MapLayers>({
    buildings: true,
    pois: true,
    trees: true,
    roads: true,
    contourLines: false,
    satelliteTexture: true,
  });

  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [hoverPoi, setHoverPoi] = useState<POI | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset | null>('overview');
  const [isCinematicFlight, setIsCinematicFlight] = useState<boolean>(false);
  const [showControlsPanel, setShowControlsPanel] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        if (appContainerRef.current && typeof appContainerRef.current.requestFullscreen === 'function') {
          appContainerRef.current.requestFullscreen().catch(() => {
            // Ignored in restricted sandbox
          });
        }
      } else {
        if (typeof document.exitFullscreen === 'function') {
          document.exitFullscreen().catch(() => {
            // Ignored in restricted sandbox
          });
        }
      }
    } catch {
      // Safe fallback in restricted environments
    }
  }, []);

  const handleApplyPreset = (preset: CameraPreset) => {
    setIsCinematicFlight(false);
    setActivePreset(preset);
  };

  const handleHoverPoi = (poi: POI | null, pos: { x: number; y: number } | null) => {
    setHoverPoi(poi);
    setHoverPos(pos);
  };

  const handleFocusPoi = (poi: POI) => {
    setSelectedPoi(poi);
    setIsCinematicFlight(false);
  };

  return (
    <div
      ref={appContainerRef}
      id="chacara-3d-app-root"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
    >
      {/* 3D WebGL Canvas Viewport */}
      <Map3DCanvas
        timeOfDay={timeOfDay}
        elevationScale={elevationScale}
        layers={layers}
        selectedPoi={selectedPoi}
        onSelectPoi={setSelectedPoi}
        activePreset={activePreset}
        onPresetFinished={() => setActivePreset(null)}
        isCinematicFlight={isCinematicFlight}
        onHoverPoi={handleHoverPoi}
      />

      {/* Top Header Bar */}
      <HeaderBar
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        onSelectPoi={handleFocusPoi}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        showControlsPanel={showControlsPanel}
        setShowControlsPanel={setShowControlsPanel}
        onResetView={() => handleApplyPreset('overview')}
      />

      {/* Side Controls & Layers Drawer */}
      <ControlsOverlay
        layers={layers}
        setLayers={setLayers}
        elevationScale={elevationScale}
        setElevationScale={setElevationScale}
        onApplyPreset={handleApplyPreset}
        isCinematicFlight={isCinematicFlight}
        setIsCinematicFlight={setIsCinematicFlight}
        isOpen={showControlsPanel}
        onClose={() => setShowControlsPanel(false)}
      />

      {/* Interactive POI Detail Modal */}
      <PoiDetailModal
        poi={selectedPoi}
        onClose={() => setSelectedPoi(null)}
        onFocusCamera={handleFocusPoi}
      />

      {/* Hover Tooltip */}
      <PoiTooltip poi={hoverPoi} position={hoverPos} />

      {/* Compass Widget */}
      <CompassWidget onResetNorth={() => handleApplyPreset('overview')} />

      {/* Bottom Floating Quick Exploration Ribbon */}
      <nav aria-label="Exploração rápida de pontos turísticos" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
        <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Destacar:
        </span>
        {POIS_DATA.slice(0, 5).map((poi) => (
          <button
            key={poi.id}
            type="button"
            onClick={() => handleFocusPoi(poi)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              selectedPoi?.id === poi.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: poi.color }}
            />
            <span>{poi.name.split(' ')[0]} {poi.name.split(' ')[1] || ''}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
