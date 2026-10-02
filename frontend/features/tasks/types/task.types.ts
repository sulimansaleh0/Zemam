// ============================================================
//  Task Module Types — Strictly aligned with Backend Task Model
// ============================================================

export type TaskStatus = 'pending' | 'inprogress' | 'finished' | 'declined';

export interface LocationPoint {
  address: string;
  lat: string;
  lng: string;
}

export interface PopulatedDriver {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface PopulatedVehicle {
  _id: string;
  plateNumber: number | string;
  model: string;
  year?: number;
  type?: string;
  status?: string;
  isInTask?: boolean;
  teamId?: string;
  driverId?: string;
}

export interface PopulatedTeam {
  _id: string;
  name: string;
}

export interface BackendTask {
  _id: string;
  description: string;
  status: TaskStatus;
  startTime: string;
  expectedEndTime?: string;
  startOdometer?: number;
  endOdometer?: number;
  isDelayed?: boolean;
  startedAt?: string;
  finishedAt?: string;
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
  vehicleId: string | PopulatedVehicle;
  driverId?: string | PopulatedDriver;
  teamId?: string | PopulatedTeam;
  companyId: string;
  declineReason?: string;
  tripSummary?: {
    taskId?: string;
    totalDistanceKm?: number;
    durationMinutes?: number;
    averageSpeed?: number;
    maxSpeed?: number;
    encodedPath?: string;
    startLocation?: { lat: number; lng: number; address?: string };
    endLocation?: { lat: number; lng: number; address?: string };
    startedAt?: string;
    finishedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskWithRelations extends BackendTask {
  vehicleModel: string;
  vehiclePlate: string | number;
  driverName: string;
  driverPhone: string;
  teamName: string;
  formattedStartTime: string;
}

export interface CreateTaskInput {
  description: string;
  vehicleId: string;
  driverId?: string;
  teamId?: string;
  startTime: string;
  expectedEndTime?: string;
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
}

export interface UpdateTaskInput {
  description?: string;
  vehicleId?: string;
  driverId?: string;
  teamId?: string;
  startTime?: string;
  expectedEndTime?: string;
  pickupLocation?: LocationPoint;
  deliveryLocation?: LocationPoint;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  finished: number;
  declined: number;
  completionRate: number;
}
