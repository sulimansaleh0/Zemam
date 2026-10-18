export type VehicleGpsStatus = 'moving' | 'idle' | 'available' | 'offline';

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface VehicleLiveTelemetry {
  vehicleId: string;
  plateNumber: string;
  model: string;
  year?: number;
  vehicleType?: string;
  teamId?: string;
  teamName?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  currentLocation: {
    lat: number;
    lng: number;
    speed: number;       // km/h
    heading: number;     // 0 - 360 degrees
    updatedAt: string | null;
  } | null;
  gpsStatus: VehicleGpsStatus;
  isInTask: boolean;
  activeTaskId?: string;
  activeTaskTitle?: string;
  activeTaskDescription?: string;
  recentPoints?: Array<{
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    timestamp?: number;
  }>;
}

export interface TripSummary {
  taskId: string;
  taskTitle?: string;
  vehicleId: string;
  plateNumber?: string;
  driverName?: string;
  totalDistanceKm: number;
  durationMinutes: number;
  averageSpeed: number;
  maxSpeed: number;
  startLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  endLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  encodedPath?: string; // Google Polyline encoded string or coordinate array
  coordinates?: [number, number][]; // Decoded directly by backend
  startedAt: string;
  finishedAt: string;
}

export interface FleetStats {
  total: number;
  moving: number;
  idle: number;
  available: number;
  offline: number;
}

export interface DriverTelemetryPayload {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  accuracy?: number;
  timestamp: number;
  intermediatePoints?: DriverTelemetryPayload[];
}

export interface PlannedLocationPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface PlannedRouteData {
  coordinates: [number, number][];
  distanceKm?: number;
  durationMinutes?: number;
  pickupLocation?: PlannedLocationPoint;
  deliveryLocation?: PlannedLocationPoint;
}

export interface GpsFilterOptions {
  status: 'all' | VehicleGpsStatus;
  searchQuery: string;
  teamId?: string;
}
