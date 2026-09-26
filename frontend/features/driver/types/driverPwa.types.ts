export interface DriverProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companyId?: string | { _id: string; name: string };
  teamId?: string | { _id: string; name: string };
  vehicleId?: string | { _id: string; plateNumber: string; model: string };
  status?: string;
}

export interface DriverTask {
  _id: string;
  title?: string;
  description?: string;
  status: 'pending' | 'inprogress' | 'finished' | 'declined';
  pickupLocation?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  deliveryLocation?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  customer?: {
    name?: string;
    phone?: string;
  };
  driverId?: any;
  vehicleId?: {
    _id?: string;
    plateNumber?: string;
    model?: string;
  } | string;
  startOdometer?: number;
  endOdometer?: number;
  proofOfDeliveryPhoto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfflineAction {
  id: string;
  type: 'FINISH_TASK' | 'ACCEPT_TASK' | 'SUBMIT_FUEL' | 'SUBMIT_MAINTENANCE';
  url: string;
  method: 'POST' | 'PATCH';
  body: any;
  isFormData?: boolean;
  createdAt: number;
}

export interface FuelLogPayload {
  vehicleId: string;
  liters: number;
  cost: number;
  fuelType: '91' | '95' | 'diesel';
  odometer: number;
  notes?: string;
  receiptPhoto?: File | null;
}

export interface MaintenanceReportPayload {
  vehicleId: string;
  type: 'routine' | 'emergency' | 'accident' | 'tires' | 'other';
  description: string;
  odometer?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  damagePhotos?: File[];
  lat?: number;
  lng?: number;
}

export interface VehicleInspectionItem {
  id: string;
  label: string;
  passed: boolean;
}
