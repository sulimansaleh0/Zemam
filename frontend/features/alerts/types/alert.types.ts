// ============================================================
//  Alert Module Types — Strictly aligned with Backend Alert Model
// ============================================================

export type AlertType =
  | 'fuel_issue'
  | 'frequent_maintenance'
  | 'license_expiry'
  | 'insurance_expiry'
  | 'driver_score_drop'
  | 'gps_alert';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BackendAlert {
  _id: string;
  companyId: string;
  teamId?: string | null;
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  vehicleId?: string | null;
  driverId?: string | null;
  relatedId?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AlertsResponse {
  alerts: BackendAlert[];
}

export interface MarkAlertReadResponse {
  alert: BackendAlert;
}
