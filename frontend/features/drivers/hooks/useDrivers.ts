'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/ui/Toast';
import { Driver, DriverFormData, DriverStatus, DriverSortOrder } from '../types/driver.types';
import { DriverService } from '../services/driverService';

export function useDrivers() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('الكل');
  const [sortOrder, setSortOrder] = useState<DriverSortOrder>('lastActivity');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  // تحميل البيانات الأولية
  useEffect(() => {
    const loaded = DriverService.getDrivers();
    setDrivers(loaded);
    if (loaded.length > 0) {
      setSelectedId(loaded[0].id);
    }
  }, []);

  const userName = user?.name || user?.email?.split('@')[0] || 'محمد العتيبي';

  // حساب المؤشرات
  const metrics = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter((d) => d.status === 'نشط').length;
    const expiringSoon = drivers.filter((d) => {
      if (!d.expiry) return false;
      const expDate = new Date(d.expiry).getTime();
      const now = new Date().getTime();
      const diffDays = (expDate - now) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 60;
    }).length;
    const leaveOrInactive = drivers.filter(
      (d) => d.status === 'في إجازة' || d.status === 'غير نشط' || d.status === 'في الصيانة'
    ).length;

    return {
      total,
      active,
      expiringSoon,
      leaveOrInactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [drivers]);

  // التصفية والبحث
  const filteredDrivers = useMemo(() => {
    let result = drivers.filter((driver) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        driver.name.toLowerCase().includes(q) ||
        driver.license.toLowerCase().includes(q) ||
        driver.phone.includes(q) ||
        driver.vehicle.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'الكل' || driver.status === statusFilter;

      return matchesQuery && matchesStatus;
    });

    // الترتيب
    result = [...result].sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      }
      if (sortOrder === 'rating') {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }
      if (sortOrder === 'trips') {
        return parseInt(b.trips || '0') - parseInt(a.trips || '0');
      }
      return 0; // Default order
    });

    return result;
  }, [drivers, searchQuery, statusFilter, sortOrder]);

  // السائق المختار حالياً
  const selectedDriver = useMemo(() => {
    const found = drivers.find((d) => d.id === selectedId);
    return found || drivers[0] || null;
  }, [drivers, selectedId]);

  // فتح نموذج الإضافة
  const openCreateModal = useCallback(() => {
    setEditingDriver(null);
    setIsModalOpen(true);
  }, []);

  // فتح نموذج التعديل
  const openEditModal = useCallback((driver?: Driver) => {
    setEditingDriver(driver || selectedDriver);
    setIsModalOpen(true);
  }, [selectedDriver]);

  // إغلاق نموذج الإضافة / التعديل
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingDriver(null);
  }, []);

  // حفظ السائق (إضافة أو تعديل)
  const handleSaveDriver = useCallback(
    (formData: DriverFormData) => {
      if (editingDriver) {
        const updated = DriverService.updateDriver(editingDriver.id, formData);
        if (updated) {
          setDrivers((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d))
          );
          addToast({
            type: 'success',
            title: 'تم التحديث',
            message: `تم تحديث بيانات السائق "${updated.name}" بنجاح`,
          });
        }
      } else {
        const created = DriverService.createDriver(formData);
        setDrivers((prev) => [created, ...prev]);
        setSelectedId(created.id);
        addToast({
          type: 'success',
          title: 'تمت الإضافة',
          message: `تمت إضافة السائق "${created.name}" بنجاح`,
        });
      }
      closeModal();
    },
    [editingDriver, closeModal, addToast]
  );

  // تأكيد فتح مودال الحذف
  const promptDelete = useCallback((driver?: Driver) => {
    const target = driver || selectedDriver;
    if (target) {
      setDriverToDelete(target);
      setIsDeleteModalOpen(true);
    }
  }, [selectedDriver]);

  // تنفيذ الحذف
  const confirmDelete = useCallback(() => {
    if (!driverToDelete) return;
    const targetName = driverToDelete.name;
    const success = DriverService.deleteDriver(driverToDelete.id);
    if (success) {
      setDrivers((prev) => {
        const next = prev.filter((d) => d.id !== driverToDelete.id);
        if (selectedId === driverToDelete.id && next.length > 0) {
          setSelectedId(next[0].id);
        }
        return next;
      });
      addToast({
        type: 'info',
        title: 'تم الحذف',
        message: `تم حذف سجل السائق "${targetName}" نهائياً`,
      });
    }
    setIsDeleteModalOpen(false);
    setDriverToDelete(null);
  }, [driverToDelete, selectedId, addToast]);

  // تبديل حالة السائق (تفعيل / تعطيل)
  const handleToggleStatus = useCallback(
    (id?: number, forcedStatus?: DriverStatus) => {
      const targetId = id || selectedDriver?.id;
      if (!targetId) return;

      const updated = DriverService.toggleStatus(targetId, forcedStatus);
      if (updated) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
        );
        addToast({
          type: 'info',
          title: 'تغيير الحالة',
          message: `تم تعديل حالة "${updated.name}" إلى (${updated.status})`,
        });
      }
    },
    [selectedDriver, addToast]
  );

  // تصدير CSV
  const handleExportCSV = useCallback(() => {
    if (drivers.length === 0) {
      addToast({
        type: 'warning',
        message: 'لا توجد بيانات سائقين للتصدير حالياً',
      });
      return;
    }
    DriverService.exportToCSV(drivers);
    addToast({
      type: 'success',
      title: 'تم التصدير',
      message: 'تم تصدير سجلات السائقين بصيغة CSV المتوافقة مع Excel',
    });
  }, [drivers, addToast]);

  // استيراد بيانات تجريبية / محاكاة
  const handleImportClick = useCallback(() => {
    addToast({
      type: 'info',
      title: 'استيراد السجلات',
      message: 'يمكنك اختيار ملف CSV أو Excel لمطابقة واستيراد بيانات السائقين',
    });
  }, [addToast]);

  return {
    drivers,
    filteredDrivers,
    selectedDriver,
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    metrics,
    userName,
    menuOpen,
    setMenuOpen,
    isModalOpen,
    editingDriver,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveDriver,
    isDeleteModalOpen,
    driverToDelete,
    setIsDeleteModalOpen,
    promptDelete,
    confirmDelete,
    handleToggleStatus,
    handleExportCSV,
    handleImportClick,
    logout,
  };
}
