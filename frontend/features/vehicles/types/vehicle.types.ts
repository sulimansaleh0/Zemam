export interface Vehicle {
  id: string;          // PK
  model: string;       // اسم وموديل المركبة
  year: number;        // سنة الصنع
  plateNumber: number; // رقم اللوحة (Unique)
  gpsDeviceId: string; // معرف جهاز التتبع
  gpsUniqueId: string; // المعرف الفريد للـ GPS
  teamId: string;      // FK -> team.id
  companyId: string;   // FK -> company.id
  driverId: string;    // FK -> user.id
}

export type VehicleStatus = 'active' | 'maintenance' | 'stopped' | 'unavailable';

export interface VehicleWithRelations extends Vehicle {
  driverName: string;
  driverPhone: string;
  teamName: string;
  companyName: string;
  status: VehicleStatus;
}

export type CreateVehicleInput = Omit<Vehicle, 'id'>;
export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface Company {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
}
