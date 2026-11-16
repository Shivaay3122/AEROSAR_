import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Circle, ScaleControl, useMap, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CalculationResult } from '@/types';
import { AlertTriangle, RefreshCw, Layers, Play } from 'lucide-react';

interface SARMapProps {
  result: CalculationResult | null;
  fitTrigger: number;
  centerTrigger: number;
  flyTrigger: number;
  onMapClick?: (lat: number, lon: number) => void;
}

type LayerKey = 'osm' | 'satellite' | 'dark';

const LAYERS: Record<LayerKey, { url: string; attribution: string; subdomains: string; maxZoom: number }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    subdomains: '',
    maxZoom: 19,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  },
};

// Custom aircraft icon using divIcon
function makeAircraftIcon(heading: number): L.DivIcon {
  return L.divIcon({
    className: 'aerosar-aircraft-marker',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div class="aerosar-pulse" style="position:absolute;inset:0;border:2px solid #39D9FF;border-radius:50%;"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(${heading}deg);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#39D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function makeEstimatedIcon(): L.DivIcon {
  return L.divIcon({
    className: 'aerosar-estimated-marker',
    html: `
      <div style="width:16px;height:16px;border:2px solid #42E8A5;border-radius:50%;background:rgba(66,232,165,0.3);box-shadow:0 0 12px rgba(66,232,165,0.6);"></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function makeDriftedIcon(): L.DivIcon {
  return L.divIcon({
    className: 'aerosar-drifted-marker',
    html: `
      <div style="width:12px;height:12px;border:2px dashed #FFB547;border-radius:50%;background:rgba(255,181,71,0.2);"></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function makeClickIcon(): L.DivIcon {
  return L.divIcon({
    className: 'aerosar-click-marker',
    html: `
      <div style="width:20px;height:20px;border:3px solid #39D9FF;border-radius:50%;background:rgba(57,217,255,0.25);box-shadow:0 0 14px rgba(57,217,255,0.7);"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function FitBounds({ result, trigger }: { result: CalculationResult | null; trigger: number }) {
  const map = useMap();
  const lastTrigger = useRef(0);

  useEffect(() => {
    if (!result || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;

    const bounds = L.latLngBounds([]);
    result.searchAreaPolygon.forEach((p) => bounds.extend([p[0], p[1]]));
    result.uncertaintyCircleLKP.forEach((p) => bounds.extend([p[0], p[1]]));
    result.uncertaintyCircleEst.forEach((p) => bounds.extend([p[0], p[1]]));
    bounds.extend([result.lastKnownPosition.lat, result.lastKnownPosition.lon]);
    bounds.extend([result.estimatedPosition.lat, result.estimatedPosition.lon]);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [result, trigger, map]);

  return null;
}

function CenterOnLKP({ result, trigger }: { result: CalculationResult | null; trigger: number }) {
  const map = useMap();
  const lastTrigger = useRef(0);

  useEffect(() => {
    if (!result || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;
    map.setView([result.lastKnownPosition.lat, result.lastKnownPosition.lon], 10, { animate: true });
  }, [result, trigger, map]);

  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const resize = () => map.invalidateSize();
    resize();
    const timer = setTimeout(resize, 200);

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onClick]);
  return null;
}

function TileErrorHandler({ onError }: { onError: () => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onError();
    map.on('tileerror', handler);
    return () => { map.off('tileerror', handler); };
  }, [map, onError]);
  return null;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function bearingBetween(a: [number, number], b: [number, number]): number {
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function AircraftFlyAnimation({
  result,
  trigger,
}: {
  result: CalculationResult;
  trigger: number;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const lastTrigger = useRef(-1);

  useEffect(() => {
    if (trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;
    if (trigger < 0) return;

    const start: [number, number] = [result.lastKnownPosition.lat, result.lastKnownPosition.lon];
    const est: [number, number] = [result.estimatedPosition.lat, result.estimatedPosition.lon];
    const hasDrift = result.windDriftKm > 0;
    const drift: [number, number] = hasDrift
      ? [result.driftedPosition.lat, result.driftedPosition.lon]
      : est;

    const waypoints: [number, number][] = [start, est];
    if (hasDrift) waypoints.push(drift);

    const durations = hasDrift ? [2500, 1500] : [3000];

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    const marker = L.marker(start, {
      icon: makeAircraftIcon(result.inputs.heading),
      zIndexOffset: 1000,
    }).addTo(map);
    marker.bindTooltip('Flying…', { sticky: true });
    markerRef.current = marker;

    let segment = 0;
    let segStart = performance.now();
    const segDuration = durations[segment];
    const p0 = waypoints[segment];
    const p1 = waypoints[segment + 1];
    let heading = bearingBetween(p0, p1);
    marker.setIcon(makeAircraftIcon(heading));
    marker.setTooltipContent(`En route to ${segment === 0 ? 'Estimated Position' : 'Wind-Adjusted Position'}`);

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - segStart;
      const t = Math.min(elapsed / segDuration, 1);
      const eased = 1 - (1 - t) * (1 - t);

      const lat = lerp(p0[0], p1[0], eased);
      const lon = lerp(p0[1], p1[1], eased);
      marker.setLatLng([lat, lon]);

      if (t >= 1) {
        segment++;
        if (segment < waypoints.length - 1) {
          segStart = now;
          const np0 = waypoints[segment];
          const np1 = waypoints[segment + 1];
          heading = bearingBetween(np0, np1);
          marker.setIcon(makeAircraftIcon(heading));
          marker.setTooltipContent('En route to Wind-Adjusted Position');
          // update closure vars — use recursive call
          raf = requestAnimationFrame(tick2);
          return;
        }
        marker.setTooltipContent(result.windDriftKm > 0 ? 'Wind-Adjusted Position' : 'Estimated Position');
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    // second segment tick (separate closure for updated p0/p1)
    const tick2 = (now: number) => {
      const np0 = waypoints[1];
      const np1 = waypoints[2];
      const segDur = durations[1];
      const elapsed = now - segStart;
      const t = Math.min(elapsed / segDur, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const lat = lerp(np0[0], np1[0], eased);
      const lon = lerp(np0[1], np1[1], eased);
      marker.setLatLng([lat, lon]);
      if (t >= 1) {
        marker.setTooltipContent('Wind-Adjusted Position');
        return;
      }
      raf = requestAnimationFrame(tick2);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [result, trigger, map]);

  return null;
}

export default function SARMap({ result, fitTrigger, centerTrigger, flyTrigger, onMapClick }: SARMapProps) {
  const defaultCenter: [number, number] = [36.852, -76.293];
  const [activeLayer, setActiveLayer] = useState<LayerKey>('satellite');
  const [showLayerSwitcher, setShowLayerSwitcher] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [clickPos, setClickPos] = useState<[number, number] | null>(null);

  const layer = LAYERS[activeLayer];

  const handleTileError = useCallback(() => {
    setTileError(true);
  }, []);

  const handleRetryTiles = useCallback(() => {
    setTileError(false);
    setActiveLayer((prev) => (prev === 'satellite' ? 'osm' : prev === 'osm' ? 'dark' : 'satellite'));
  }, []);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setClickPos([lat, lon]);
    onMapClick?.(lat, lon);
  }, [onMapClick]);

  const layerLabels: Record<LayerKey, string> = {
    satellite: 'Satellite',
    osm: 'Street Map',
    dark: 'Dark Mode',
  };

  return (
    <div className="relative h-full w-full" style={{ minHeight: '300px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={8}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
        worldCopyJump={true}
      >
        <TileLayer
          key={activeLayer}
          url={layer.url}
          attribution={layer.attribution}
          subdomains={layer.subdomains || 'abc'}
          maxZoom={layer.maxZoom}
          detectRetina={true}
        />
        <ScaleControl position="bottomright" imperial={false} />
        <MapResizer />
        <ClickHandler onClick={handleMapClick} />
        <TileErrorHandler onError={handleTileError} />
        <FitBounds result={result} trigger={fitTrigger} />
        <CenterOnLKP result={result} trigger={centerTrigger} />
        {result && (
          <AircraftFlyAnimation result={result} trigger={flyTrigger} />
        )}

        {clickPos && (
          <Marker position={clickPos} icon={makeClickIcon()}>
            <LeafletTooltip sticky>
              {clickPos[0].toFixed(4)}, {clickPos[1].toFixed(4)}
            </LeafletTooltip>
          </Marker>
        )}

      {result && (
        <>
          {/* Search area polygon */}
          <Polygon
            positions={result.searchAreaPolygon}
            pathOptions={{
              color: '#FF5D6C',
              weight: 3,
              opacity: 1,
              fillColor: '#FF5D6C',
              fillOpacity: 0.2,
            }}
          />

          {/* Uncertainty circle at LKP */}
          <Circle
            center={[result.lastKnownPosition.lat, result.lastKnownPosition.lon]}
            radius={result.positionUncertaintyKm * 1000}
            pathOptions={{
              color: '#FFB547',
              weight: 1.5,
              opacity: 0.6,
              fillColor: '#FFB547',
              fillOpacity: 0.08,
              dashArray: '4,4',
            }}
          />

          {/* Uncertainty circle at estimated position */}
          <Circle
            center={[result.estimatedPosition.lat, result.estimatedPosition.lon]}
            radius={result.positionUncertaintyKm * 1000}
            pathOptions={{
              color: '#FFB547',
              weight: 1.5,
              opacity: 0.6,
              fillColor: '#FFB547',
              fillOpacity: 0.08,
              dashArray: '4,4',
            }}
          />

          {/* Nominal track */}
          <Polyline
            positions={result.nominalTrack}
            pathOptions={{
              color: '#42E8A5',
              weight: 2.5,
              opacity: 0.8,
              dashArray: '6,4',
            }}
          />

          {/* Drift track */}
          {result.windDriftKm > 0 && (
            <Polyline
              positions={result.driftTrack}
              pathOptions={{
                color: '#FFB547',
                weight: 2,
                opacity: 0.7,
                dashArray: '3,6',
              }}
            />
          )}

          {/* Last known position — aircraft marker */}
          <Marker
            position={[result.lastKnownPosition.lat, result.lastKnownPosition.lon]}
            icon={makeAircraftIcon(result.inputs.heading)}
          >
            <LeafletTooltip sticky>
              Last Known Position
            </LeafletTooltip>
          </Marker>

          {/* Estimated position */}
          <Marker
            position={[result.estimatedPosition.lat, result.estimatedPosition.lon]}
            icon={makeEstimatedIcon()}
          >
            <LeafletTooltip sticky>
              Estimated Position
            </LeafletTooltip>
          </Marker>

          {/* Drifted position */}
          {result.windDriftKm > 0 && (
            <Marker
              position={[result.driftedPosition.lat, result.driftedPosition.lon]}
              icon={makeDriftedIcon()}
            >
              <LeafletTooltip sticky>
                Wind-Adjusted Position
              </LeafletTooltip>
            </Marker>
          )}
        </>
      )}
      </MapContainer>

      {/* Layer switcher button */}
      <div className="absolute top-3 left-3 z-[500]">
        <button
          onClick={() => setShowLayerSwitcher((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-panel/90 backdrop-blur border border-subtle rounded-md text-xs text-primary hover:bg-elevated transition-colors shadow-panel"
          title="Switch map layer"
        >
          <Layers className="w-3.5 h-3.5 text-cyan" />
          {layerLabels[activeLayer]}
        </button>
        {showLayerSwitcher && (
          <div className="absolute top-full mt-1 left-0 bg-panel/95 backdrop-blur border border-subtle rounded-md shadow-elevated overflow-hidden min-w-[120px]">
            {(Object.keys(LAYERS) as LayerKey[]).map((key) => (
              <button
                key={key}
                onClick={() => { setActiveLayer(key); setShowLayerSwitcher(false); setTileError(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  activeLayer === key
                    ? 'bg-cyan-dim text-cyan'
                    : 'text-muted hover:text-primary hover:bg-elevated'
                }`}
              >
                {layerLabels[key]}
              </button>
            ))}
          </div>
        )}
      </div>

      {tileError && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 px-4 py-2.5 bg-panel/95 backdrop-blur border border-amber/30 rounded-lg shadow-elevated">
          <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0" />
          <span className="text-xs text-muted">Map tiles failed to load.</span>
          <button
            onClick={handleRetryTiles}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-elevated text-primary text-xs font-medium rounded-md border border-default hover:border-cyan/30 transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-cyan" />
            Switch layer
          </button>
        </div>
      )}
    </div>
  );
}
