import type { CalculationResult, SavedMission } from '@/types';
import { toGeoJSONRing } from './geo';

export function exportGeoJSON(result: CalculationResult): string {
  const features: GeoJSON.Feature[] = [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [toGeoJSONRing(result.searchAreaPolygon)],
      },
      properties: {
        type: 'search_area',
        area_km2: result.searchAreaKm2,
        missionRef: result.missionRef,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [result.lastKnownPosition.lon, result.lastKnownPosition.lat],
      },
      properties: {
        type: 'last_known_position',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [result.estimatedPosition.lon, result.estimatedPosition.lat],
      },
      properties: {
        type: 'estimated_position',
        distance_km: result.nominalDistanceKm,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: result.nominalTrack.map((p) => [p[1], p[0]]),
      },
      properties: {
        type: 'nominal_track',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [toGeoJSONRing(result.uncertaintyCircleLKP)],
      },
      properties: {
        type: 'position_uncertainty_lkp',
        radius_km: result.positionUncertaintyKm,
      },
    },
  ];

  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };

  return JSON.stringify(featureCollection, null, 2);
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateHTMLReport(result: CalculationResult): string {
  const i = result.inputs;
  const fmtNum = (n: number, d = 2) => n.toFixed(d);
  const fmtArea =
    result.searchAreaKm2 >= 1000
      ? `${(result.searchAreaKm2 / 1000).toFixed(2)} thousand km²`
      : `${fmtNum(result.searchAreaKm2)} km²`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>AEROSAR Mission Report — ${result.missionRef}</title>
<style>
  @page { margin: 2cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1a2433; background: #fff; line-height: 1.5; font-size: 13px;
  }
  .header {
    border-bottom: 3px solid #39D9FF; padding-bottom: 16px; margin-bottom: 24px;
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .brand { font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #0D1B2A; }
  .brand-sub { font-size: 11px; color: #5a6c80; letter-spacing: 1px; }
  .ref { text-align: right; }
  .ref-id { font-size: 14px; font-weight: 700; color: #0D1B2A; }
  .ref-time { font-size: 11px; color: #5a6c80; }
  .section { margin-bottom: 20px; }
  .section-title {
    font-size: 13px; font-weight: 700; color: #0D1B2A; text-transform: uppercase;
    letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;
  }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f0f4f8; }
  .row-label { color: #5a6c80; font-weight: 500; }
  .row-val { font-weight: 600; }
  .card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 8px; }
  .card-val { font-size: 22px; font-weight: 800; color: #0D1B2A; }
  .card-label { font-size: 11px; color: #5a6c80; text-transform: uppercase; letter-spacing: 1px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .list { list-style: none; }
  .list li { padding: 4px 0; padding-left: 18px; position: relative; }
  .list li::before { content: '▸'; position: absolute; left: 0; color: #39D9FF; }
  .warning { color: #C47800; }
  .disclaimer {
    margin-top: 24px; padding: 12px 16px; background: #FFF7E6; border: 1px solid #FFB547;
    border-radius: 6px; font-size: 12px; color: #6B4C00;
  }
  @media print { body { font-size: 12px; } .cards { grid-template-columns: repeat(3, 1fr); } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">AEROSAR</div>
      <div class="brand-sub">AIRCRAFT SEARCH &amp; RESCUE INTELLIGENCE SYSTEM</div>
    </div>
    <div class="ref">
      <div class="ref-id">${result.missionRef}</div>
      <div class="ref-time">Generated: ${new Date(result.calculationTimeUTC).toUTCString()}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Key Metrics</div>
    <div class="cards">
      <div class="card">
        <div class="card-val">${fmtArea}</div>
        <div class="card-label">Search Area</div>
      </div>
      <div class="card">
        <div class="card-val">${result.elapsedTimeLabel}</div>
        <div class="card-label">Elapsed Time</div>
      </div>
      <div class="card">
        <div class="card-val">${result.nominalDistanceLabel}</div>
        <div class="card-label">Nominal Distance</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Last Known Position</div>
    <div class="grid">
      <div class="row"><span class="row-label">Latitude</span><span class="row-val">${fmtNum(i.lat, 5)}°</span></div>
      <div class="row"><span class="row-label">Longitude</span><span class="row-val">${fmtNum(i.lon, 5)}°</span></div>
      <div class="row"><span class="row-label">Timestamp (UTC)</span><span class="row-val">${new Date(i.timestamp).toUTCString()}</span></div>
      <div class="row"><span class="row-label">Position Uncertainty</span><span class="row-val">${i.positionUncertaintyKm} km</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Aircraft Details</div>
    <div class="grid">
      <div class="row"><span class="row-label">Heading</span><span class="row-val">${i.heading}°</span></div>
      <div class="row"><span class="row-label">Speed</span><span class="row-val">${i.speed} ${i.speedUnit === 'kmh' ? 'km/h' : i.speedUnit}</span></div>
      <div class="row"><span class="row-label">Endurance</span><span class="row-val">${i.endurance} h</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Environmental Conditions</div>
    <div class="grid">
      <div class="row"><span class="row-label">Wind Direction</span><span class="row-val">${i.windDirection}°</span></div>
      <div class="row"><span class="row-label">Wind Speed</span><span class="row-val">${i.windSpeed} ${i.windSpeedUnit}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Calculated Results</div>
    <div class="grid">
      <div class="row"><span class="row-label">Search Area</span><span class="row-val">${fmtNum(result.searchAreaKm2)} km²</span></div>
      <div class="row"><span class="row-label">Nominal Distance</span><span class="row-val">${fmtNum(result.nominalDistanceKm)} km</span></div>
      <div class="row"><span class="row-label">Wind Drift</span><span class="row-val">${fmtNum(result.windDriftKm)} km</span></div>
      <div class="row"><span class="row-label">Est. Position Lat</span><span class="row-val">${fmtNum(result.estimatedPosition.lat, 5)}°</span></div>
      <div class="row"><span class="row-label">Est. Position Lon</span><span class="row-val">${fmtNum(result.estimatedPosition.lon, 5)}°</span></div>
      <div class="row"><span class="row-label">Calculation Time (UTC)</span><span class="row-val">${new Date(result.calculationTimeUTC).toUTCString()}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Model Assumptions</div>
    <ul class="list">
      ${result.assumptions.map((a) => `<li>${a}</li>`).join('')}
    </ul>
  </div>

  ${result.warnings.length > 0 ? `
  <div class="section">
    <div class="section-title">Warnings</div>
    <ul class="list">
      ${result.warnings.map((w) => `<li class="warning">${w}</li>`).join('')}
    </ul>
  </div>` : ''}

  ${result.missingInfo.length > 0 ? `
  <div class="section">
    <div class="section-title">Missing Information</div>
    <ul class="list">
      ${result.missingInfo.map((m) => `<li>${m}</li>`).join('')}
    </ul>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Model Limitations</div>
    <ul class="list">
      ${result.limitations.map((l) => `<li>${l}</li>`).join('')}
    </ul>
  </div>

  <div class="disclaimer">
    <strong>Prototype Disclaimer:</strong> AEROSAR is a decision-support prototype for demonstration purposes only.
    It is not a validated operational search-and-rescue system. All calculations are based on simplified models and
    should not be used for real emergency response. Real search-and-rescue operations require qualified coordination
    and validated procedures.
  </div>
</body>
</html>`;
}

export function printReport(result: CalculationResult): void {
  const html = generateHTMLReport(result);
  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow popups to generate the mission report.');
    return;
  }
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    w.print();
  }, 500);
}

// --- Mission history (localStorage) ---

const STORAGE_KEY = 'aerosar_missions';

export function loadMissions(): SavedMission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedMission[];
  } catch {
    return [];
  }
}

export function saveMission(mission: SavedMission): void {
  const existing = loadMissions();
  existing.unshift(mission);
  // Keep last 50 missions
  if (existing.length > 50) existing.length = 50;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save mission:', e);
  }
}

export function deleteMission(id: string): void {
  const existing = loadMissions().filter((m) => m.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to delete mission:', e);
  }
}

export function generateMissionId(): string {
  return `mission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
