// ============================================================
//  Map & Route Calculation Utilities
// ============================================================

export interface RouteData {
  coordinates: [number, number][]; // [lat, lng] array for Leaflet Polyline
  distanceKm?: number;
  durationMinutes?: number;
}

export interface GeocodingResult {
  address: string;
  lat: number;
  lng: number;
}

/**
 * جلب المسار الفعلي على الطرق عبر OSRM Driving Engine
 */
export async function fetchDrivingRoute(
  start: [number, number], // [lat, lng]
  end: [number, number],   // [lat, lng]
  signal?: AbortSignal
): Promise<RouteData> {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  // OSRM expects coordinates in order: lng,lat
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('OSRM request failed');
    const data = await res.json();

    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0];
      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const coordinates: [number, number][] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );
      if (coordinates.length > 0) {
        coordinates[0] = start;
        coordinates[coordinates.length - 1] = end;
      }
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.max(1, Math.round(route.duration / 60));

      return {
        coordinates,
        distanceKm,
        durationMinutes,
      };
    }
  } catch {
    // If routing fails or network is offline, gracefully return direct straight line
  }

  return {
    coordinates: [start, end],
  };
}

/**
 * البحث عن العناوين والأماكن في السعودية والمنطقة
 */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Photon OpenStreetMap Search API
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
    trimmed
  )}&limit=5&lang=ar`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.features || !Array.isArray(data.features)) return [];

    interface PhotonFeature {
      geometry: { coordinates: [number, number] };
      properties: {
        name?: string;
        street?: string;
        city?: string;
        district?: string;
        state?: string;
        country?: string;
      };
    }

    return (data.features as PhotonFeature[]).map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const p = feature.properties;
      const parts = [p.name, p.street, p.city || p.district, p.state, p.country].filter(Boolean);
      const address = parts.length > 0 ? parts.join(', ') : 'موقع محدد';

      return {
        address,
        lat,
        lng,
      };
    });
  } catch {
    return [];
  }
}

/**
 * تحويل الإحداثيات إلى اسم عنوان مقروء (Reverse Geocoding)
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar,en`;

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        'User-Agent': 'ZamamFleetManagementApp/1.0',
      },
    });
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
