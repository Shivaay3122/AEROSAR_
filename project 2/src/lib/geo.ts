import type { LatLng } from '@/types';

const EARTH_RADIUS_KM = 6371;

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Compute a destination point given a start, bearing (degrees), and distance (km).
 * Uses the haversine / great-circle formula for accuracy.
 */
export function destinationPoint(
  start: LatLng,
  bearingDeg: number,
  distanceKm: number
): LatLng {
  const angularDist = distanceKm / EARTH_RADIUS_KM;
  const bearing = toRadians(bearingDeg);
  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lon);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDist) +
      Math.cos(lat1) * Math.sin(angularDist) * Math.cos(bearing)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(lat1),
      Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: toDegrees(lat2),
    lon: ((toDegrees(lon2) + 540) % 360) - 180,
  };
}

/**
 * Haversine distance in km between two LatLng points.
 */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Bearing from point a to point b in degrees (0-359).
 */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLon = toRadians(b.lon - a.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Generate a circle of points around a center [lat, lon].
 * Returns [lat, lon][] pairs for polygon use.
 * Approximation using equirectangular projection locally — adequate for SAR distances.
 */
export function generateCircle(
  center: LatLng,
  radiusKm: number,
  segments = 48
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    const dest = destinationPoint(center, toDegrees(angle), radiusKm);
    points.push([dest.lat, dest.lon]);
  }
  return points;
}

/**
 * Calculate area of a polygon on the Earth's surface in km².
 * Uses a local equirectangular projection centered on the polygon centroid.
 * Accurate enough for search areas at this scale.
 */
export function polygonAreaKm2(points: [number, number][]): number {
  if (points.length < 3) return 0;

  const centroidLat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const latRad = toRadians(centroidLat);
  const kmPerDegLat = (2 * Math.PI * EARTH_RADIUS_KM) / 360;
  const kmPerDegLon = kmPerDegLat * Math.cos(latRad);

  const xy: [number, number][] = points.map((p) => [
    p[1] * kmPerDegLon,
    p[0] * kmPerDegLat,
  ]);

  let area = 0;
  for (let i = 0; i < xy.length - 1; i++) {
    area += xy[i][0] * xy[i + 1][1] - xy[i + 1][0] * xy[i][1];
  }
  return Math.abs(area) / 2;
}

/**
 * Convert polygon [lat, lon][] to GeoJSON [lon, lat][] ring.
 */
export function toGeoJSONRing(
  points: [number, number][]
): [number, number][] {
  return points.map((p) => [p[1], p[0]]);
}
