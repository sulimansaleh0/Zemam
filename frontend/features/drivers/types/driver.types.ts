export type DriverStatus = 'نشط' | 'في الصيانة' | 'في إجازة' | 'غير نشط';

export interface DriverActivityItem {
  id: string;
  title: string;
  date: string;
  statusOrAmount: string;
  type: 'task' | 'report' | 'fuel';
  tagStyle?: string;
}

export interface Driver {
  id: number;
  name: string;
  initials: string;
  phone: string;
  license: string;
  expiry: string; // YYYY-MM-DD
  expiryLabel: string;
  rating: string;
  trips: string;
  tasks: string;
  status: DriverStatus;
  vehicle: string;
  vehicleType: string;
  color: string;
  lastSeen: string;
  joinedDate?: string;
  score?: number;
  tasksList?: DriverActivityItem[];
  reportsList?: DriverActivityItem[];
  fuelList?: DriverActivityItem[];
}

export interface DriverFormData {
  name: string;
  phone: string;
  license: string;
  expiry: string;
  vehicle?: string;
  vehicleType?: string;
  status?: DriverStatus;
}

export type DriverSortOrder = 'lastActivity' | 'rating' | 'trips' | 'name';
