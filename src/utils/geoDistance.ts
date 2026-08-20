/**
 * Haversine formula & smart distance/proximity utilities for Hanoi coordinates.
 */

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

// Default West Lake Hanoi center
export const DEFAULT_HANOI_COORDS: GeoCoordinate = {
  lat: 21.0560,
  lng: 105.8240,
};

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DistanceInfo {
  distanceKm: number;
  distanceFormatted: string;
  walkMinutes: number;
  rideMinutes: number;
  travelBadgeVi: string;
  travelBadgeEn: string;
  isNearby: boolean; // < 1.5km
}

/**
 * Formats distance and travel time nicely for a meticulous Virgo user
 */
export function getDistanceInfo(
  targetLat: number,
  targetLng: number,
  userLat?: number,
  userLng?: number
): DistanceInfo {
  const uLat = userLat ?? DEFAULT_HANOI_COORDS.lat;
  const uLng = userLng ?? DEFAULT_HANOI_COORDS.lng;

  const distanceKm = calculateDistanceKm(uLat, uLng, targetLat, targetLng);
  
  // Walking speed ~ 4.5 km/h -> 1 km is ~13.3 min
  const walkMinutes = Math.max(1, Math.round(distanceKm * 13.3));
  // Motorbike in Hanoi city speed ~ 22 km/h -> 1 km is ~2.7 min + 2 min buffer
  const rideMinutes = Math.max(1, Math.round(distanceKm * 2.7 + 1));

  let distanceFormatted = '';
  if (distanceKm < 1) {
    distanceFormatted = `${Math.round(distanceKm * 1000)} m`;
  } else {
    distanceFormatted = `${distanceKm.toFixed(1)} km`;
  }

  const travelBadgeVi = distanceKm < 1.2 
    ? `${distanceFormatted} • ~${walkMinutes}p đi bộ` 
    : `${distanceFormatted} • ~${rideMinutes}p xe máy`;

  const travelBadgeEn = distanceKm < 1.2
    ? `${distanceFormatted} • ~${walkMinutes}m walk`
    : `${distanceFormatted} • ~${rideMinutes}m ride`;

  return {
    distanceKm,
    distanceFormatted,
    walkMinutes,
    rideMinutes,
    travelBadgeVi,
    travelBadgeEn,
    isNearby: distanceKm < 1.5,
  };
}

/**
 * Formats distance in km or meters
 */
export function formatDistanceKm(distanceKm: number, lang: 'vi' | 'en' = 'vi'): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates travel time in minutes based on mode
 */
export function estimateTravelMinutes(distanceKm: number, mode: 'walk' | 'bike' = 'walk'): number {
  if (mode === 'walk') {
    return Math.max(1, Math.round(distanceKm * 13.3));
  }
  return Math.max(1, Math.round(distanceKm * 2.7 + 1));
}

/**
 * Sorts spots based on combined score of Proximity (distance to user) and Popularity/Quality score
 * @param spots Array of spots with lat, lng and optional popularityScore
 * @param userLat Current user latitude
 * @param userLng Current user longitude
 * @param distanceWeight Weight between 0 and 1 for distance vs popularity (default: 0.6 = 60% distance, 40% popularity)
 */
export function sortSpotsByProximityAndPopularity<T extends { lat?: number; lng?: number; popularityScore?: number }>(
  spots: T[],
  userLat?: number,
  userLng?: number,
  distanceWeight: number = 0.65
): (T & { distanceKm: number; combinedScore: number })[] {
  const uLat = userLat ?? DEFAULT_HANOI_COORDS.lat;
  const uLng = userLng ?? DEFAULT_HANOI_COORDS.lng;

  const calculated = spots.map((spot) => {
    const sLat = spot.lat ?? DEFAULT_HANOI_COORDS.lat;
    const sLng = spot.lng ?? DEFAULT_HANOI_COORDS.lng;
    const distanceKm = calculateDistanceKm(uLat, uLng, sLat, sLng);
    return {
      ...spot,
      distanceKm,
      rawPopularity: spot.popularityScore ?? 85,
    };
  });

  // Calculate min & max distance for normalization
  const distances = calculated.map(s => s.distanceKm);
  const minDistance = Math.min(...distances, 0.1);
  const maxDistance = Math.max(...distances, 5.0);
  const distRange = Math.max(0.1, maxDistance - minDistance);

  // Normalized score: Closer = higher proximity score (0 to 100), Higher popularity = higher score (0 to 100)
  const scored = calculated.map((item) => {
    // Inverse distance normalized: 100 when distance is minimum, 0 when distance is maximum
    const proximityScore = Math.max(0, Math.min(100, 100 * (1 - (item.distanceKm - minDistance) / distRange)));
    const popularityScore = item.rawPopularity; // already 0-100
    const combinedScore = proximityScore * distanceWeight + popularityScore * (1 - distanceWeight);

    return {
      ...item,
      combinedScore,
    };
  });

  // Sort descending by combinedScore (or ascending by distance if same score)
  return scored.sort((a, b) => b.combinedScore - a.combinedScore);
}
