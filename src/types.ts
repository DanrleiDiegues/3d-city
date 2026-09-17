export interface POI {
  id: string;
  name: string;
  category: 'landmark' | 'church' | 'public' | 'hotel' | 'commercial' | 'leisure';
  lat: number;
  lng: number;
  x: number; // 3D local coordinate
  z: number; // 3D local coordinate
  y?: number; // Calculated terrain height
  altitudeMeters: number;
  address: string;
  description: string;
  iconName: string;
  color: string;
}

export interface RoadSegment {
  name: string;
  type: 'main' | 'secondary' | 'rural' | 'hill';
  points: [number, number][]; // [x, z] coordinates in 3D scene space
  width: number;
}

export interface BuildingData {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  floors: number;
  rotation: number;
  roofType: 'gable' | 'hip' | 'flat' | 'steeple' | 'chalet';
  wallColor: string;
  roofColor: string;
  type: 'residential' | 'commercial' | 'public' | 'church';
  name?: string;
  poiId?: string;
}

export type TimeOfDay = 'day' | 'sunset' | 'night';

export type CameraPreset = 'overview' | 'church' | 'prefeitura' | 'pequena_suica' | 'south_entry' | 'aerial_isometric';

export interface MapLayers {
  buildings: boolean;
  pois: boolean;
  trees: boolean;
  roads: boolean;
  contourLines: boolean;
  satelliteTexture: boolean;
}
