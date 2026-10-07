'use client';

import React, { useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Car,
  Fuel,
  Shield,
  Users,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { vehicleFormSchema, VehicleFormValues } from '../schemas/vehicle.schema';
import { useCreateVehicle, useAvailableDrivers } from '../hooks/useVehicles';
import { useTeams } from '@/features/teams';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getVehicleTeamId, getVehicleTeamName } from '../utils/vehicleHelpers';
import { checkDriverVehicleEligibility } from '@/features/drivers/utils/licenseEligibility';
import type { BackendDriver } from '@/features/drivers';
import { Modal } from '@/shared/ui/Modal';
import { VehicleBasicTab } from './form/VehicleBasicTab';
import { VehicleSpecsTab } from './form/VehicleSpecsTab';
import { VehicleDocsTab } from './form/VehicleDocsTab';
import { VehicleAssignTab } from './form/VehicleAssignTab';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'basic' | 'specs' | 'docs' | 'assign';

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'basic', label: '1. الهيكل واللوحة', icon: Car },
  { id: 'specs', label: '2. الوقود والكفاءة', icon: Fuel },
  { id: 'docs', label: '3. الرخصة والتأمين', icon: Shield },
  { id: 'assign', label: '4. الفريق والسائق', icon: Users },
];

export function VehicleFormModal({ isOpen, onClose }: VehicleFormModalProps) {
  const { user } = useAuth();
  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formError, setFormError] = useState<string | null>(null);
  const { data: teamsList = [], isLoading: isLoadingTeams } = useTeams();
  const { drivers: availableDrivers = [], isLoading: isLoadingDrivers } = useAvailableDrivers();
  const createVehicleMutation = useCreateVehicle();

  const userTeamId = getVehicleTeamId(user?.teamId);
  const userTeamName =
    getVehicleTeamName(user?.teamId, teamsList) || 'فريقك التشغيلي';

  // If fleet manager, filter drivers to only their team
  const filteredDrivers = isFleetManager && userTeamId
    ? availableDrivers.filter((d: BackendDriver) => {
        const dTeamId = getVehicleTeamId(d.teamId);
        return String(dTeamId) === String(userTeamId);
      })
    : availableDrivers;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      model: '',
      plateNumber: '',
      licenseNumber: '',
      licenseExpiry: '',
      teamId: isFleetManager && userTeamId ? userTeamId : '',
      driverId: '',
    },
  });

  const selectedVehicleType = useWatch({ control, name: 'vehicleType' });
  const selectedDriverId = useWatch({ control, name: 'driverId' });

  // Reset form state on close
  const handleClose = useCallback(() => {
    setActiveTab('basic');
    setFormError(null);
    reset({
      model: '',
      plateNumber: '',
      licenseNumber: '',
      licenseExpiry: '',
      teamId: isFleetManager && userTeamId ? userTeamId : '',
      driverId: '',
    });
    onClose();
  }, [isFleetManager, userTeamId, reset, onClose]);

  // Check driver eligibility for selected vehicle type
  const selectedDriverObj = filteredDrivers.find((d: BackendDriver) => d._id === selectedDriverId);
  const driverEligibility = selectedDriverObj && selectedVehicleType
    ? checkDriverVehicleEligibility(selectedDriverObj, { vehicleType: selectedVehicleType })
    : null;

  const isPending = createVehicleMutation.isPending || isSubmitting;

  const onSubmit = async (values: VehicleFormValues) => {
    if (isPending) return;
    setFormError(null);
    try {
      const assignedTeamId = isFleetManager && userTeamId ? userTeamId : (values.teamId || undefined);

      // Single atomic vehicle creation with driver assignment
      await createVehicleMutation.mutateAsync({
        model: values.model.trim(),
        year: Number(values.year),
        plateNumber: String(values.plateNumber).trim(),
        vehicleType: values.vehicleType,
        tankCapacity: Number(values.tankCapacity),
        fuelType: values.fuelType,
        expectedFuelEfficiency: Number(values.expectedFuelEfficiency),
        licenseNumber: values.licenseNumber.trim(),
        licenseExpiry: new Date(values.licenseExpiry).toISOString(),
        ...(values.insuranceCompany?.trim() ? { insuranceCompany: values.insuranceCompany.trim() } : {}),
        ...(values.insuranceNumber?.trim() ? { insuranceNumber: values.insuranceNumber.trim() } : {}),
        ...(values.insuranceExpiry ? { insuranceExpiry: new Date(values.insuranceExpiry).toISOString() } : {}),
        teamId: assignedTeamId,
        driverId: values.driverId || undefined,
      });

      handleClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'تعذر تسجيل المركبة، يرجى التحقق من البيانات والمحاولة مجدداً');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة مركبة جديدة للأسطول"
      description="أدخل مواصفات المركبة وبيانات الاستمارة والتأمين وتعيين الفريق والسائق"
      icon={Car}
      iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      maxWidth="max-w-2xl"
      preventClose={isPending}
      aria-labelledby="vehicle-modal-title"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        {formError && (
          <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <p className="font-medium leading-relaxed">{formError}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface-2)]/30 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'basic' && (
            <VehicleBasicTab
              register={register}
              errors={errors}
              selectedVehicleType={selectedVehicleType}
              setValue={setValue}
              disabled={isPending}
            />
          )}

          {activeTab === 'specs' && (
            <VehicleSpecsTab
              register={register}
              errors={errors}
              disabled={isPending}
            />
          )}

          {activeTab === 'docs' && (
            <VehicleDocsTab
              register={register}
              errors={errors}
              disabled={isPending}
            />
          )}

          {activeTab === 'assign' && (
            <VehicleAssignTab
              register={register}
              isFleetManager={isFleetManager}
              userTeamName={userTeamName}
              teamsList={teamsList}
              isLoadingTeams={isLoadingTeams}
              filteredDrivers={filteredDrivers}
              isLoadingDrivers={isLoadingDrivers}
              selectedDriverObj={selectedDriverObj}
              driverEligibility={driverEligibility}
              disabled={isPending}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-[var(--border)] bg-[var(--surface-2)]/20">
          <div className="flex items-center gap-2">
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'assign') setActiveTab('docs');
                  else if (activeTab === 'docs') setActiveTab('specs');
                  else if (activeTab === 'specs') setActiveTab('basic');
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] rounded-xl transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            )}
            {activeTab !== 'assign' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'basic') setActiveTab('specs');
                  else if (activeTab === 'specs') setActiveTab('docs');
                  else if (activeTab === 'docs') setActiveTab('assign');
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-colors cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <span>تسجيل المركبة</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
