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
    updatedAt: string;
  };
  gpsStatus: VehicleGpsStatus;
  isInTask: boolean;
  activeTaskId?: string;
  activeTaskTitle?: string;
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
  startedAt: string;
  finishedAt: string;
}

export interface DriverTelemetryPayload {
  vehicleId: string;
  taskId?: string;
  companyId?: string;
  teamId?: string;
  driverId?: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  accuracy?: number;
  timestamp: number;
}

export interface GpsFilterOptions {
  status: 'all' | VehicleGpsStatus;
  searchQuery: string;
  teamId?: string;
}
