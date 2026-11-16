import type { MissionInputs, CalculationResult, LatLng } from '@/types';
import {
  destinationPoint,
  generateCircle,
  polygonAreaKm2,
} from './geo';

// --- Unit conversions ---

const KNOTS_TO_KMH = 1.852;
const MPH_TO_KMH = 1.609344;

export function speedToKmh(speed: number, unit: MissionInputs['speedUnit']): number {
  switch (unit) {
    case 'knots':
      return speed * KNOTS_TO_KMH;
    case 'mph':
      return speed * MPH_TO_KMH;
    case 'kmh':
      return speed;
  }
}

export function kmhToUnit(kmh: number, unit: MissionInputs['speedUnit']): number {
  switch (unit) {
    case 'knots':
      return kmh / KNOTS_TO_KMH;
    case 'mph':
      return kmh / MPH_TO_KMH;
    case 'kmh':
      return kmh;
  }
}

export function speedLabel(unit: MissionInputs['speedUnit']): string {
  return unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'kts';
}

export function kmToNm(km: number): number {
  return km / 1.852;
}

// --- Main calculation engine ---

const REFERENCE_TIME = new Date('2026-10-09T14:00:00Z'); // Current date as reference

export function calculate(
  inputs: MissionInputs,
  isSimulated = false
): CalculationResult {
  const warnings: string[] = [];
  const assumptions: string[] = [];
  const missingInfo: string[] = [];
  const limitations: string[] = [];

  const lkP: LatLng = { lat: inputs.lat, lon: inputs.lon };
  const lastContact = new Date(inputs.timestamp);
  const now = new Date(); // Use current time as reference
  const refTime = isSimulated ? REFERENCE_TIME : now;

  // Elapsed time
  const elapsedMs = refTime.getTime() - lastContact.getTime();
  const elapsedTimeHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedTimeHours < 0) {
    warnings.push(
      'Last known position timestamp is in the future relative to calculation time. Using zero elapsed time for movement.'
    );
  }

  const effectiveElapsed = Math.max(0, elapsedTimeHours);

  // Nominal movement
  const speedKmh = speedToKmh(inputs.speed, inputs.speedUnit);
  const enduranceLimitedHours = Math.min(effectiveElapsed, inputs.endurance);

  if (effectiveElapsed > inputs.endurance) {
    warnings.push(
      `Elapsed time (${effectiveElapsed.toFixed(1)} h) exceeds remaining endurance (${inputs.endurance} h). Nominal movement capped at endurance.`
    );
  }

  const nominalDistanceKm = speedKmh * enduranceLimitedHours;

  const estimatedPosition = destinationPoint(
    lkP,
    inputs.heading,
    nominalDistanceKm
  );

  assumptions.push(
    `Aircraft maintained constant heading of ${inputs.heading}° at ${inputs.speed} ${speedLabel(inputs.speedUnit)} for ${enduranceLimitedHours.toFixed(2)} hours (limited by endurance or elapsed time).`
  );
  assumptions.push(
    'No course changes, altitude changes, or maneuvering are modeled.'
  );

  // Wind drift — simplified model
  // Wind pushes aircraft along wind direction at a fraction of wind speed
  // Fraction depends on aircraft type; using a conservative 15% drift factor
  const DRIFT_FACTOR = 0.15;
  const windSpeedKmh = speedToKmh(inputs.windSpeed, inputs.windSpeedUnit);
  const windDriftKm = windSpeedKmh * effectiveElapsed * DRIFT_FACTOR;

  const driftedPosition = destinationPoint(
    estimatedPosition,
    inputs.windDirection,
    windDriftKm
  );

  assumptions.push(
    `Wind modeled as ${inputs.windDirection}° at ${inputs.windSpeed} ${speedLabel(inputs.windSpeedUnit)} with a ${DRIFT_FACTOR * 100}% drift factor over ${effectiveElapsed.toFixed(2)} hours.`
  );
  assumptions.push(
    'Wind drift factor is a simplified heuristic, not an aerodynamic model.'
  );

  if (inputs.windSpeed > 0) {
    assumptions.push(
      `Wind drift applied along wind direction (${inputs.windDirection}°), not along aircraft-relative airflow.`
    );
  }

  // Position uncertainty circles
  const uncertaintyLKP = generateCircle(lkP, inputs.positionUncertaintyKm);
  const uncertaintyEst = generateCircle(estimatedPosition, inputs.positionUncertaintyKm);

  // Search area polygon — convex hull of both uncertainty circles
  const allPoints: [number, number][] = [
    ...uncertaintyLKP,
    ...uncertaintyEst,
  ];
  const searchAreaPolygon = convexHull(allPoints);

  const searchAreaKm2 = polygonAreaKm2(searchAreaPolygon);

  // Tracks
  const nominalTrack: [number, number][] = [
    [lkP.lat, lkP.lon],
    [estimatedPosition.lat, estimatedPosition.lon],
  ];
  const driftTrack: [number, number][] = [
    [estimatedPosition.lat, estimatedPosition.lon],
    [driftedPosition.lat, driftedPosition.lon],
  ];

  // Input completeness
  const allFields = 11;
  const filledFields = Object.values(inputs).filter(
    (v) => v !== undefined && v !== null && v !== '' && !Number.isNaN(v)
  ).length;
  const inputCompleteness = Math.round((filledFields / allFields) * 100);

  // Limitations
  limitations.push(
    'This is a decision-support prototype, not a validated operational search-and-rescue system.'
  );
  limitations.push(
    'Constant heading and speed is unlikely for a real aircraft in distress.'
  );
  limitations.push(
    'Wind drift model is a simplified heuristic and does not account for aircraft aerodynamics or altitude.'
  );
  limitations.push(
    'Position uncertainty is modeled as a uniform circle, not a probability distribution.'
  );
  limitations.push(
    'Real search-and-rescue operations require qualified coordination and validated procedures.'
  );

  if (inputs.positionUncertaintyKm === 0) {
    warnings.push('Position uncertainty is set to 0 km. Search area may be too small.');
  }

  if (inputs.speed === 0) {
    missingInfo.push(
      'Aircraft speed is 0. Nominal movement cannot be estimated; search area is centered on last known position.'
    );
  }

  const missionRef = `SAR-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const elapsedLabel =
    effectiveElapsed < 1
      ? `${Math.round(effectiveElapsed * 60)} min`
      : `${effectiveElapsed.toFixed(1)} h`;

  const nominalDistLabel =
    nominalDistanceKm < 1
      ? `${Math.round(nominalDistanceKm * 1000)} m`
      : `${nominalDistanceKm.toFixed(1)} km`;

  return {
    missionRef,
    inputs,
    calculationTimeUTC: now.toISOString(),
    elapsedTimeHours: effectiveElapsed,
    elapsedTimeLabel: elapsedLabel,
    nominalDistanceKm,
    nominalDistanceLabel: nominalDistLabel,
    lastKnownPosition: lkP,
    estimatedPosition,
    driftedPosition,
    windDriftKm,
    searchAreaPolygon,
    uncertaintyCircleLKP: uncertaintyLKP,
    uncertaintyCircleEst: uncertaintyEst,
    nominalTrack,
    driftTrack,
    searchAreaKm2,
    positionUncertaintyKm: inputs.positionUncertaintyKm,
    inputCompleteness,
    warnings,
    assumptions,
    missingInfo,
    limitations,
    isSimulated,
  };
}

// --- Convex hull (Graham scan) ---

function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;

  // Sort by (lat, lon)
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const cross = (
    o: [number, number],
    a: [number, number],
    b: [number, number]
  ): number =>
    (a[1] - o[1]) * (b[0] - o[0]) - (a[0] - o[0]) * (b[1] - o[1]);

  const lower: [number, number][] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// --- Demo mission data ---

export const DEMO_MISSION: MissionInputs = {
  lat: 36.852,
  lon: -76.293,
  timestamp: '2026-10-09T12:30:00Z',
  heading: 75,
  speed: 145,
  speedUnit: 'knots',
  endurance: 4.5,
  windDirection: 210,
  windSpeed: 22,
  windSpeedUnit: 'knots',
  positionUncertaintyKm: 8,
};

export function getReferenceTime(): Date {
  return REFERENCE_TIME;
}
