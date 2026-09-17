import React from 'react';
import {
  X,
  MapPin,
  Mountain,
  Navigation,
  ExternalLink,
  Church,
  Building2,
  Hotel,
  Palmtree,
  Trees,
  Wrench,
  Store,
  ShoppingBag,
  Coffee,
} from 'lucide-react';
import { POI } from '../types';

interface PoiDetailModalProps {
  poi: POI | null;
  onClose: () => void;
  onFocusCamera: (poi: POI) => void;
}

export const PoiDetailModal: React.FC<PoiDetailModalProps> = ({
  poi,
  onClose,
  onFocusCamera,
}) => {
  if (!poi) return null;

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'church':
        return <Church className="w-5 h-5 text-blue-400" />;
      case 'public':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'hotel':
        return <Hotel className="w-5 h-5 text-pink-400" />;
      case 'leisure':
        return <Trees className="w-5 h-5 text-teal-400" />;
      case 'commercial':
        return <Store className="w-5 h-5 text-amber-400" />;
      default:
        return <MapPin className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'church':
        return 'Templo Religioso / Patrimônio';
      case 'public':
        return 'Órgão Público Municipal';
      case 'hotel':
        return 'Hotel / Hospedagem de Montanha';
      case 'leisure':
        return 'Lazer / Ecoturismo';
      case 'commercial':
        return 'Comércio & Serviços';
      default:
        return 'Marco Urbano';
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    poi.name + ', Chácara - MG'
  )}`;

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${poi.color}25`, border: `1px solid ${poi.color}50` }}
          >
            {renderCategoryIcon(poi.category)}
          </div>
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${poi.color}20`, color: poi.color }}
            >
              {getCategoryLabel(poi.category)}
            </span>
            <h3 className="font-bold text-base text-white leading-tight mt-0.5">{poi.name}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Address & Altitude Metric Badges */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 flex items-center gap-2">
          <Mountain className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Altitude</div>
            <div className="font-mono font-bold text-white text-xs">{poi.altitudeMeters} metros</div>
          </div>
        </div>
        <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Coordenadas</div>
            <div className="font-mono text-xs text-slate-300">
              {poi.lat.toFixed(4)}°, {poi.lng.toFixed(4)}°
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="text-xs text-slate-300 mb-2.5 flex items-center gap-1.5">
        <span className="text-slate-500 font-semibold">Endereço:</span>
        <span className="text-slate-200">{poi.address}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 mb-3">
        {poi.description}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <button
          type="button"
          onClick={() => onFocusCamera(poi)}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-900/30"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Focar Câmera 3D</span>
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs flex items-center gap-1 transition"
          title="Abrir no Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
