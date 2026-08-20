import { Driver, DriverFormData, DriverStatus } from '../types/driver.types';
import {
  INITIAL_DRIVERS,
  BRAND_COLORS,
  extractInitials,
  formatArabicDate,
} from '../data/mockDrivers';

const STORAGE_KEY = 'zamam_drivers_data_v1';

export class DriverService {
  /**
   * جلب جميع السائقين من التخزين المحلي أو البيانات الافتراضية
   */
  static getDrivers(): Driver[] {
    if (typeof window === 'undefined') return INITIAL_DRIVERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load drivers from localStorage', e);
    }
    // حفظ البيانات الافتراضية لأول مرة
    this.saveDrivers(INITIAL_DRIVERS);
    return INITIAL_DRIVERS;
  }

  /**
   * حفظ قائمة السائقين في التخزين المحلي
   */
  static saveDrivers(drivers: Driver[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
    } catch (e) {
      console.error('Failed to save drivers to localStorage', e);
    }
  }

  /**
   * إضافة سائق جديد
   */
  static createDriver(formData: DriverFormData): Driver {
    const drivers = this.getDrivers();
    const newId = drivers.length > 0 ? Math.max(...drivers.map((d) => d.id)) + 1 : 1;
    const colorIndex = Math.floor(Math.random() * BRAND_COLORS.length);

    const newDriver: Driver = {
      id: newId,
      name: formData.name.trim(),
      initials: extractInitials(formData.name),
      phone: formData.phone.trim(),
      license: formData.license.trim() || `L-${Math.floor(1000000 + Math.random() * 9000000)}`,
      expiry: formData.expiry || new Date().toISOString().split('T')[0],
      expiryLabel: formatArabicDate(formData.expiry),
      rating: '٥.٠',
      trips: '٠',
      tasks: '٠',
      status: formData.status || 'نشط',
      vehicle: formData.vehicle || '—',
      vehicleType: formData.vehicleType || 'غير مخصص',
      color: BRAND_COLORS[colorIndex],
      lastSeen: 'متصل الآن',
      joinedDate: 'اليوم',
      score: 100,
      tasksList: [],
      reportsList: [],
      fuelList: [],
    };

    const updated = [newDriver, ...drivers];
    this.saveDrivers(updated);
    return newDriver;
  }

  /**
   * تحديث بيانات سائق موجود
   */
  static updateDriver(id: number, data: Partial<DriverFormData | Driver>): Driver | null {
    const drivers = this.getDrivers();
    const index = drivers.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const current = drivers[index];
    const updatedName = data.name !== undefined ? data.name.trim() : current.name;
    const updatedExpiry = data.expiry !== undefined ? data.expiry : current.expiry;

    const updatedDriver: Driver = {
      ...current,
      ...data,
      name: updatedName,
      initials: data.name ? extractInitials(data.name) : current.initials,
      expiry: updatedExpiry,
      expiryLabel: data.expiry ? formatArabicDate(data.expiry) : current.expiryLabel,
    };

    drivers[index] = updatedDriver;
    this.saveDrivers(drivers);
    return updatedDriver;
  }

  /**
   * حذف سائق
   */
  static deleteDriver(id: number): boolean {
    const drivers = this.getDrivers();
    const filtered = drivers.filter((d) => d.id !== id);
    if (filtered.length === drivers.length) return false;
    this.saveDrivers(filtered);
    return true;
  }

  /**
   * تبديل حالة السائق (تفعيل / تعطيل)
   */
  static toggleStatus(id: number, forcedStatus?: DriverStatus): Driver | null {
    const drivers = this.getDrivers();
    const index = drivers.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const current = drivers[index];
    const newStatus: DriverStatus =
      forcedStatus || (current.status === 'نشط' ? 'غير نشط' : 'نشط');

    const updatedDriver: Driver = {
      ...current,
      status: newStatus,
    };

    drivers[index] = updatedDriver;
    this.saveDrivers(drivers);
    return updatedDriver;
  }

  /**
   * تصدير بيانات السائقين إلى ملف CSV مع ترميز UTF-8 لدعم اللغة العربية في Excel
   */
  static exportToCSV(drivers: Driver[]): void {
    if (typeof window === 'undefined' || !drivers.length) return;

    const headers = [
      'الرقم التعريفي',
      'الاسم الكامل',
      'رقم الجوال',
      'رقم الرخصة',
      'تاريخ الانتهاء',
      'التقييم',
      'الرحلات المكتملة',
      'المهام',
      'الحالة',
      'المركبة',
      'نوع المركبة',
      'آخر ظهور',
    ];

    const rows = drivers.map((d) => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.phone}"`,
      `"${d.license}"`,
      `"${d.expiryLabel || d.expiry}"`,
      d.rating,
      d.trips,
      d.tasks,
      d.status,
      `"${d.vehicle}"`,
      `"${d.vehicleType}"`,
      `"${d.lastSeen}"`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `zamam_drivers_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
