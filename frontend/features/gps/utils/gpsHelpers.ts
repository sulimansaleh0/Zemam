import type { VehicleGpsStatus } from '../types/gps.types';

/**
 * حساب المسافة بين نقطتين كرويتين على الأرض بمعادلة هافرسين (Haversine Formula) بالكيلومترات
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * حساب زاوية الاتجاه (Bearing / Heading 0-360) بين نقطتين
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);

  let brng = toDeg(Math.atan2(y, x));
  return Math.round((brng + 360) % 360);
}

/**
 * فك تشفير مسار Google Polyline المضغوط إلى مصفوفة إحداثيات [lat, lng]
 */
export function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * تشفير مصفوفة نقاط [lat, lng] إلى نص Polyline مضغوط لتوفير قاعدة البيانات
 */
export function encodePolyline(points: [number, number][]): string {
  if (!points || points.length === 0) return '';
  let output = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const [rawLat, rawLng] of points) {
    const lat = Math.round(rawLat * 1e5);
    const lng = Math.round(rawLng * 1e5);

    output += encodeSignedNumber(lat - prevLat);
    output += encodeSignedNumber(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }

  return output;
}

function encodeSignedNumber(num: number): string {
  let sgn_num = num < 0 ? ~(num << 1) : num << 1;
  let encodeString = '';
  while (sgn_num >= 0x20) {
    encodeString += String.fromCharCode((0x20 | (sgn_num & 0x1f)) + 63);
    sgn_num >>= 5;
  }
  encodeString += String.fromCharCode(sgn_num + 63);
  return encodeString;
}

/**
 * تكوين وسم ولون حالة الـ GPS للمركبة
 */
export function getGpsStatusConfig(status: VehicleGpsStatus) {
  switch (status) {
    case 'moving':
      return {
        label: 'متحركة',
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        dotClass: 'bg-emerald-500 animate-pulse',
        pinColor: '#10b981',
      };
    case 'idle':
      return {
        label: 'متوقفة',
        badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        dotClass: 'bg-amber-500',
        pinColor: '#f59e0b',
      };
    case 'available':
      return {
        label: 'متاحة',
        badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        dotClass: 'bg-blue-500',
        pinColor: '#3b82f6',
      };
    case 'offline':
    default:
      return {
        label: 'غير متصلة',
        badgeClass: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
        dotClass: 'bg-neutral-400',
        pinColor: '#9ca3af',
      };
  }
}

/**
 * تنسيق وقت آخر تحديث
 */
export function formatLastSeen(dateInput: string | number | Date): string {
  if (!dateInput) return 'غير محدد';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'غير معروف';

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 10) return 'الآن';
  if (diffSeconds < 60) return `منذ ${diffSeconds} ثانية`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  return date.toLocaleDateString('ar-SA');
}
