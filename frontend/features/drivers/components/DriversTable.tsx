'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import {
  Users,
  Search,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Car,
  Truck,
  Shield,
  Star,
  Calendar,
  Building,
  UserCheck,
  UserX,
  Link2,
  Unlink,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react';
import type { Driver, DriverStatus } from '../types/driver.types';
import type { Team } from '@/features/teams/types/team.types';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';
import { getDriverDisplayName, getDriverTeamName, getDriverTeamId } from '../utils/driverHelpers';
import { getLicenseExpiryStatus } from '../utils/licenseEligibility';
import { ActionMenu, ActionMenuItem } from '@/shared/ui/ActionMenu';

interface DriversTableProps {
  driversData: Driver[];
  teamsList: Team[];
  isLoadingDrivers: boolean;
  onAddDriverClick: () => void;
  onToggleStatusClick: (driver: Driver) => void;
  onDeleteDriverClick: (driver: Driver) => void;
  onAssignVehicleClick: (driver: Driver) => void;
  onUnassignVehicleClick: (driver: Driver) => void;
  onAssignTeamClick: (driver: Driver) => void;
  onUnassignTeamClick: (driver: Driver) => void;
}

export function DriversTable({
  driversData,
  teamsList,
  isLoadingDrivers,
  onAddDriverClick,
  onToggleStatusClick,
  onDeleteDriverClick,
  onAssignVehicleClick,
  onUnassignVehicleClick,
  onAssignTeamClick,
  onUnassignTeamClick,
}: DriversTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'all'>('all');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'normal' | 'van' | 'truck'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Filtered drivers list based on search and filters
  const filteredData = useMemo(() => {
    return driversData.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // License category filter
      if (licenseFilter !== 'all') {
        const types = Array.isArray(item.licenseTypes) ? item.licenseTypes : [];
        if (!types.includes(licenseFilter)) return false;
      }

      // Team filter
      if (teamFilter !== 'all') {
        const dTeamId = getDriverTeamId(item.teamId);
        if (teamFilter === 'without_team') {
          if (dTeamId) return false;
        } else if (String(dTeamId) !== String(teamFilter)) {
          return false;
        }
      }

      // Search query
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const name = (item.name || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const phone = (item.phone || '').toLowerCase();
      const licenseNum = (item.licenseNumber || '').toLowerCase();
      const vehModel = (item.assignedVehicle?.model || '').toLowerCase();
      const vehPlate = String(item.assignedVehicle?.plateNumber || '').toLowerCase();
      const teamName = (getDriverTeamName(item.teamId, teamsList) || '').toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        licenseNum.includes(q) ||
        vehModel.includes(q) ||
        vehPlate.includes(q) ||
        teamName.includes(q)
      );
    });
  }, [driversData, statusFilter, licenseFilter, teamFilter, searchQuery, teamsList]);

  // Column definitions matching Zemam design system
  const columns = useMemo<ColumnDef<Driver>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>السائق</span>
            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
          </button>
        ),
        cell: ({ row }) => {
          const driver = row.original;
          const displayName = getDriverDisplayName(driver);

          return (
            <div className="flex items-center gap-3">
              <DriverAvatar driver={driver} size="md" />
              <div className="min-w-0">
                <Link
                  href={`/drivers/${driver._id}`}
                  className="font-bold text-xs text-[var(--text)] hover:text-[var(--primary)] transition-colors hover:underline block truncate"
                >
                  {displayName}
                </Link>
                <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] truncate max-w-[150px]" dir="ltr">
                    {driver.email}
                  </span>
                  {driver.phone && (
                    <span className="text-[10px] font-mono text-[var(--muted)]" dir="ltr">
                      · {driver.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'driverScore',
        header: 'تقييم الأداء',
        cell: ({ row }) => {
          const score = row.original.driverScore ?? 95;
          const getScoreColor = (s: number) => {
            if (s >= 90) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            if (s >= 75) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            if (s >= 60) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
          };

          return (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black font-mono border ${getScoreColor(
                  score
                )}`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{score}%</span>
              </span>
              <span className="text-[10px] text-[var(--muted)] font-medium">
                {score >= 90 ? 'سائق متميز' : score >= 75 ? 'سائق معتمد' : 'يحتاج متابعة'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'licenseCategory',
        header: 'فئة الرخصة',
        cell: ({ row }) => {
          const types = Array.isArray(row.original.licenseTypes) ? row.original.licenseTypes : [];
          if (types.length === 0) {
            return (
              <span className="text-[11px] text-[var(--muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                غير محددة
              </span>
            );
          }

          const hasTruck = types.includes('truck');
          const hasVan = types.includes('van');

          if (hasTruck) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Truck className="w-3 h-3" />
                <span>ثقيل (شاحنة)</span>
              </span>
            );
          }
          if (hasVan) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Car className="w-3 h-3" />
                <span>متوسط (فان/باص)</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Car className="w-3 h-3" />
              <span>خفيف (سيارة)</span>
            </span>
          );
        },
      },
      {
        id: 'licenseDetails',
        header: 'الرخصة والصلاحية',
        cell: ({ row }) => {
          const driver = row.original;
          const status = getLicenseExpiryStatus(driver.licenseExpiry);

          return (
            <div className="space-y-0.5 text-xs">
              <div className="font-mono text-[11px] font-semibold text-[var(--text)]">
                {driver.licenseNumber ? `#${driver.licenseNumber}` : 'بدون رقم'}
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    status.status === 'valid'
                      ? 'bg-emerald-500'
                      : status.status === 'expiring_soon'
                      ? 'bg-amber-500'
                      : status.status === 'expired'
                      ? 'bg-rose-500'
                      : 'bg-zinc-400'
                  }`}
                />
                <span
                  className={
                    status.status === 'expired'
                      ? 'text-rose-500 font-semibold'
                      : status.status === 'expiring_soon'
                      ? 'text-amber-500 font-semibold'
                      : 'text-[var(--muted)]'
                  }
                >
                  {status.text}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'assignedVehicle',
        header: 'المركبة المسندة',
        cell: ({ row }) => {
          const veh = row.original.assignedVehicle;
          if (!veh) {
            return (
              <span className="text-[11px] text-[var(--muted)] font-medium">
                غير مسند لمركبة
              </span>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0 border border-[var(--border)]">
                <Car className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <Link
                  href={`/vehicles/${veh._id}`}
                  className="font-semibold text-xs text-[var(--text)] hover:text-[var(--primary)] transition-colors hover:underline block truncate"
                >
                  {veh.model}
                </Link>
                <div
                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px] text-[var(--text)] mt-0.5"
                  dir="ltr"
                >
                  <span className="text-[8px] text-[var(--muted)]">KSA</span>
                  <span className="font-bold">{veh.plateNumber}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'teamId',
        header: 'الفريق التشغيلي',
        cell: ({ row }) => {
          const teamName = getDriverTeamName(row.original.teamId, teamsList);
          const teamId = getDriverTeamId(row.original.teamId);

          if (!teamName) {
            return <span className="text-[11px] text-[var(--muted)]">بدون فريق</span>;
          }

          return (
            <Link
              href={teamId ? `/teams/${teamId}` : '#'}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--surface-2)] hover:bg-[var(--primary)]/10 text-[var(--text)] hover:text-[var(--primary)] border border-[var(--border)] transition-colors"
            >
              <Building className="w-3 h-3 text-[var(--muted)]" />
              <span>{teamName}</span>
            </Link>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => {
          const driver = row.original;
          const isActive = driver.status === 'active';
          const hasVehicle = !!driver.assignedVehicle;
          const hasTeam = !!getDriverTeamId(driver.teamId);

          const menuItems: ActionMenuItem[] = [
            {
              label: 'عرض الملف الشامل',
              icon: ExternalLink,
              variant: 'primary',
              onClick: () => {
                window.location.href = `/drivers/${driver._id}`;
              },
            },
            {
              label: hasVehicle ? 'تغيير المركبة المسندة' : 'إسناد مركبة للسائق',
              icon: Car,
              onClick: () => onAssignVehicleClick(driver),
            },
          ];

          if (hasVehicle) {
            menuItems.push({
              label: 'فك ارتباط المركبة',
              icon: Unlink,
              variant: 'warning',
              onClick: () => onUnassignVehicleClick(driver),
            });
          }

          menuItems.push({
            label: hasTeam ? 'تغيير الفريق' : 'إسناد لفريق تشغيلي',
            icon: Link2,
            onClick: () => onAssignTeamClick(driver),
          });

          if (hasTeam) {
            menuItems.push({
              label: 'فك ارتباط الفريق',
              icon: Unlink,
              variant: 'warning',
              onClick: () => onUnassignTeamClick(driver),
            });
          }

          menuItems.push({
            label: isActive ? 'تعطيل الحساب' : 'تفعيل الحساب',
            icon: isActive ? UserX : UserCheck,
            variant: isActive ? 'warning' : 'success',
            onClick: () => onToggleStatusClick(driver),
          });

          menuItems.push({
            label: 'حذف السائق',
            icon: Trash2,
            variant: 'danger',
            onClick: () => onDeleteDriverClick(driver),
          });

          return (
            <div className="flex items-center justify-end">
              <ActionMenu items={menuItems} align="left" />
            </div>
          );
        },
      },
    ],
    [
      teamsList,
      onAssignVehicleClick,
      onUnassignVehicleClick,
      onAssignTeamClick,
      onUnassignTeamClick,
      onToggleStatusClick,
      onDeleteDriverClick,
    ]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
      {/* Search & Filters Toolbar */}
      <div className="p-4 border-b border-[var(--border)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، البريد، الجوال، اللوحة، أو الرخصة..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-36">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DriverStatus | 'all')}
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط فقط</option>
              <option value="inactive">غير نشط فقط</option>
            </select>
          </div>

          {/* License Category Filter */}
          <div className="relative w-36">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value as any)}
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
            >
              <option value="all">كل الرخص</option>
              <option value="normal">خفيف (سيارة)</option>
              <option value="van">متوسط (حافلة)</option>
              <option value="truck">ثقيل (شاحنة)</option>
            </select>
          </div>

          {/* Team Filter */}
          <div className="relative w-40">
            <Building className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
            >
              <option value="all">كل الفرق</option>
              <option value="without_team">بدون فريق</option>
              {teamsList.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Driver Button */}
        <button
          type="button"
          onClick={onAddDriverClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-opacity cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سائق</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[var(--border)] bg-[var(--surface-2)]/40 text-[11px] font-bold text-[var(--muted)]"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-3.5 px-4 font-bold select-none">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoadingDrivers ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-xs text-[var(--muted)]">
                  جارٍ تحميل بيانات السائقين...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <Users className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-[var(--text)]">لا يوجد سائقون مطابقون</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    {searchQuery || statusFilter !== 'all' || licenseFilter !== 'all' || teamFilter !== 'all'
                      ? 'جرّب تغيير معايير البحث أو الفلاتر المحددة'
                      : 'ابدأ بإضافة أول سائق لأسطولك التشغيلي'}
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--surface-2)]/50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3.5 px-4 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoadingDrivers && table.getRowModel().rows.length > 0 && (
        <div className="p-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <div className="font-medium">
            عرض{' '}
            <span className="font-bold text-[var(--text)]">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            إلى{' '}
            <span className="font-bold text-[var(--text)]">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredData.length
              )}
            </span>{' '}
            من إجمالي <span className="font-bold text-[var(--text)]">{filteredData.length}</span> سائق
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="الصفحة الأولى"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-[var(--text)] text-xs">
              صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
