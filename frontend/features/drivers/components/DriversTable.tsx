'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  Car,
  Truck,
  Building,
  UserCheck,
  UserX,
  Link2,
  Unlink,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import type { Driver, DriverStatus } from '../types/driver.types';
import type { Team } from '@/features/teams/types/team.types';
import type { PaginationInfo } from '@/shared/types/api.types';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';
import { DriverScoreBadge } from './DriverScoreBadge';
import { DriverTableToolbar } from './DriverTableToolbar';
import { getDriverDisplayName, getDriverTeamName, getDriverTeamId } from '../utils/driverHelpers';
import { getLicenseExpiryStatus } from '../utils/licenseEligibility';
import { ActionMenu, ActionMenuItem } from '@/shared/ui/ActionMenu';
import { TablePagination } from '@/shared/ui';

interface DriversTableProps {
  driversData: Driver[];
  teamsList: Team[];
  pagination?: PaginationInfo;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: DriverStatus | 'all';
  onStatusFilterChange?: (val: DriverStatus | 'all') => void;
  licenseFilter?: 'all' | 'normal' | 'van' | 'truck';
  onLicenseFilterChange?: (val: 'all' | 'normal' | 'van' | 'truck') => void;
  teamFilter?: string;
  onTeamFilterChange?: (val: string) => void;
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
  pagination,
  currentPage = 1,
  onPageChange,
  searchQuery: externalSearchQuery,
  onSearchChange,
  statusFilter: externalStatusFilter,
  onStatusFilterChange,
  licenseFilter: externalLicenseFilter,
  onLicenseFilterChange,
  teamFilter: externalTeamFilter,
  onTeamFilterChange,
  isLoadingDrivers,
  onAddDriverClick,
  onToggleStatusClick,
  onDeleteDriverClick,
  onAssignVehicleClick,
  onUnassignVehicleClick,
  onAssignTeamClick,
  onUnassignTeamClick,
}: DriversTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalSearch, setInternalSearch] = useState('');
  const [internalStatus, setInternalStatus] = useState<DriverStatus | 'all'>('all');
  const [internalLicense, setInternalLicense] = useState<'all' | 'normal' | 'van' | 'truck'>('all');
  const [internalTeam, setInternalTeam] = useState<string>('all');

  const activeSearch = externalSearchQuery !== undefined ? externalSearchQuery : internalSearch;
  const activeStatus = externalStatusFilter !== undefined ? externalStatusFilter : internalStatus;
  const activeLicense = externalLicenseFilter !== undefined ? externalLicenseFilter : internalLicense;
  const activeTeam = externalTeamFilter !== undefined ? externalTeamFilter : internalTeam;

  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    else setInternalSearch(val);
  };

  const handleStatusChange = (val: DriverStatus | 'all') => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    else setInternalStatus(val);
  };

  const handleLicenseChange = (val: 'all' | 'normal' | 'van' | 'truck') => {
    if (onLicenseFilterChange) onLicenseFilterChange(val);
    else setInternalLicense(val);
  };

  const handleTeamChange = (val: string) => {
    if (onTeamFilterChange) onTeamFilterChange(val);
    else setInternalTeam(val);
  };

  // Client-side fallback filtering if external controls are uncontrolled
  const filteredData = useMemo(() => {
    if (externalSearchQuery !== undefined || externalStatusFilter !== undefined) {
      return driversData;
    }

    return driversData.filter((item) => {
      if (activeStatus !== 'all' && item.status !== activeStatus) {
        return false;
      }

      if (activeLicense !== 'all') {
        const types = Array.isArray(item.licenseTypes) ? item.licenseTypes : [];
        if (!types.includes(activeLicense)) return false;
      }

      if (activeTeam !== 'all') {
        const dTeamId = getDriverTeamId(item.teamId);
        if (activeTeam === 'without_team') {
          if (dTeamId) return false;
        } else if (String(dTeamId) !== String(activeTeam)) {
          return false;
        }
      }

      const q = activeSearch.trim().toLowerCase();
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
  }, [
    driversData,
    externalSearchQuery,
    externalStatusFilter,
    activeStatus,
    activeLicense,
    activeTeam,
    activeSearch,
    teamsList,
  ]);

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
        cell: ({ row }) => <DriverScoreBadge score={row.original.driverScore} />,
      },
      {
        id: 'assignedVehicle',
        header: 'المركبة الحالية',
        cell: ({ row }) => {
          const veh = row.original.assignedVehicle;
          if (!veh) {
            return (
              <span className="text-xs text-[var(--muted)] italic">
                لا توجد مركبة
              </span>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0">
                <Car className="w-3.5 h-3.5 text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[var(--text)] block truncate">
                  {veh.model}
                </span>
                <span className="font-mono text-[10px] text-[var(--muted)] block" dir="ltr">
                  {veh.plateNumber}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'team',
        header: 'الفريق التشغيلي',
        cell: ({ row }) => {
          const tName = getDriverTeamName(row.original.teamId, teamsList);
          if (!tName) {
            return (
              <span className="text-xs text-[var(--muted)] italic">
                بدون فريق
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <Building className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
              <span className="truncate max-w-[130px]">{tName}</span>
            </div>
          );
        },
      },
      {
        id: 'license',
        header: 'بيانات الرخصة',
        cell: ({ row }) => {
          const driver = row.original;
          const status = getLicenseExpiryStatus(driver.licenseExpiry);
          const types = Array.isArray(driver.licenseTypes) ? driver.licenseTypes : [];

          const typeLabelMap: Record<string, string> = {
            normal: 'خفيف',
            van: 'متوسط',
            truck: 'ثقيل',
          };

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-semibold text-[var(--text)]" dir="ltr">
                  {driver.licenseNumber || '—'}
                </span>
                {status.status !== 'unknown' && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      status.status === 'expired'
                        ? 'bg-rose-500/10 text-rose-500'
                        : status.status === 'expiring_soon'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {status.text}
                  </span>
                )}
              </div>
              {types.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {types.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.2 bg-[var(--surface-2)] text-[var(--muted)] rounded font-medium border border-[var(--border)]"
                    >
                      {typeLabelMap[t] || t}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
          const hasVehicle = Boolean(driver.assignedVehicle);
          const hasTeam = Boolean(getDriverTeamId(driver.teamId));

          const menuItems: ActionMenuItem[] = [
            {
              label: 'عرض الملف الشامل',
              icon: ExternalLink,
              variant: 'primary',
              onClick: () => {
                router.push(`/drivers/${driver._id}`);
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
            label: hasTeam ? 'تغيير الفريق' : 'إسناد إلى فريق',
            icon: Link2,
            onClick: () => onAssignTeamClick(driver),
          });

          if (hasTeam) {
            menuItems.push({
              label: 'إزالة من الفريق',
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
            <div className="flex items-center justify-center">
              <ActionMenu items={menuItems} align="left" />
            </div>
          );
        },
      },
    ],
    [
      teamsList,
      router,
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
    ...(pagination
      ? {}
      : {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: {
            pagination: {
              pageSize: 8,
            },
          },
        }),
  });

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
      {/* Search & Filters Toolbar */}
      <DriverTableToolbar
        searchQuery={activeSearch}
        onSearchChange={handleSearchChange}
        statusFilter={activeStatus}
        onStatusFilterChange={handleStatusChange}
        licenseFilter={activeLicense}
        onLicenseFilterChange={handleLicenseChange}
        teamFilter={activeTeam}
        onTeamFilterChange={handleTeamChange}
        teamsList={teamsList}
        onAddDriverClick={onAddDriverClick}
      />

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-[var(--surface-2)]/50 border-b border-[var(--border)] text-xs text-[var(--muted)] font-semibold"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-3 px-4 font-semibold">
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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <span>جاري تحميل بيانات السائقين...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-xs text-[var(--muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Truck className="w-8 h-8 opacity-30" />
                    <p className="font-bold text-sm text-[var(--text)]">لا يوجد سائقين مطابقين</p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {activeSearch || activeStatus !== 'all' || activeLicense !== 'all' || activeTeam !== 'all'
                        ? 'جرّب تغيير عبارة البحث أو الفلاتر المحددة'
                        : 'ابدأ بإضافة أول سائق في أسطولك'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--surface-2)]/40 transition-colors text-xs"
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

      {/* Shared Unified Pagination Footer */}
      {!isLoadingDrivers && (
        <TablePagination
          currentPage={pagination ? pagination.page : table.getState().pagination.pageIndex + 1}
          totalPages={pagination ? pagination.totalPages : table.getPageCount()}
          totalItems={pagination ? pagination.total : filteredData.length}
          hasNextPage={pagination ? pagination.hasNextPage : table.getCanNextPage()}
          hasPrevPage={pagination ? pagination.hasPrevPage : table.getCanPreviousPage()}
          onPageChange={(p) => {
            if (pagination) onPageChange?.(p);
            else table.setPageIndex(p - 1);
          }}
          itemLabel="سائق"
        />
      )}
    </div>
  );
}
