export type SpeedUnit = 'knots' | 'kmh' | 'mph';
export type WindSpeedUnit = 'knots' | 'kmh' | 'mph';

export interface MissionInputs {
  lat: number;
  lon: number;
  timestamp: string; // ISO UTC string
  heading: number; // 0-359 degrees
  speed: number;
  speedUnit: SpeedUnit;
  endurance: number; // hours
  windDirection: number; // 0-359 degrees
  windSpeed: number;
  windSpeedUnit: WindSpeedUnit;
  positionUncertaintyKm: number; // km
}

export interface LatLng {
  lat: number;
  lon: number;
}

export interface CalculationResult {
  missionRef: string;
  inputs: MissionInputs;
  calculationTimeUTC: string;
  elapsedTimeHours: number;
  elapsedTimeLabel: string;
  nominalDistanceKm: number;
  nominalDistanceLabel: string;
  lastKnownPosition: LatLng;
  estimatedPosition: LatLng;
  driftedPosition: LatLng;
  windDriftKm: number;
  searchAreaPolygon: [number, number][]; // [lat, lon] pairs
  uncertaintyCircleLKP: [number, number][];
  uncertaintyCircleEst: [number, number][];
  nominalTrack: [number, number][]; // LKP to estimated position
  driftTrack: [number, number][]; // estimated to drifted position
  searchAreaKm2: number;
  positionUncertaintyKm: number;
  inputCompleteness: number; // 0-100
  warnings: string[];
  assumptions: string[];
  missingInfo: string[];
  limitations: string[];
  isSimulated: boolean;
}

export interface SavedMission {
  id: string;
  ref: string;
  savedAt: string;
  inputs: MissionInputs;
  result: CalculationResult;
  label: string;
}

export type Page = 'mission-control' | 'search-analysis' | 'mission-history' | 'about';

export interface ScenarioResult {
  label: string;
  result: CalculationResult;
}
