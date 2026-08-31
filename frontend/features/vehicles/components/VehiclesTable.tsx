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
  Car,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Plus,
  SlidersHorizontal,
  Users,
  Link2,
  Unlink,
  Trash2,
  Building2,
} from 'lucide-react';
import type { VehicleWithRelations, VehicleStatus } from '../types/vehicle.types';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { useTeams } from '@/features/teams';
import { ActionMenu, ActionMenuItem } from '@/shared/ui/ActionMenu';

interface VehiclesTableProps {
  vehiclesData: VehicleWithRelations[];
  isLoadingVehicles: boolean;
  onAddVehicleClick: () => void;
  onAssignDriverClick: (selectedVehicle: VehicleWithRelations) => void;
  onChangeStatusClick: (selectedVehicle: VehicleWithRelations) => void;
  onAssignTeamClick?: (selectedVehicle: VehicleWithRelations) => void;
  onRemoveTeamClick?: (selectedVehicle: VehicleWithRelations) => void;
  onUnassignDriverClick?: (selectedVehicle: VehicleWithRelations) => void;
  onDeleteVehicleClick?: (selectedVehicle: VehicleWithRelations) => void;
}

export function VehiclesTable({
  vehiclesData,
  isLoadingVehicles,
  onAddVehicleClick,
  onAssignDriverClick,
  onChangeStatusClick,
  onAssignTeamClick,
  onRemoveTeamClick,
  onUnassignDriverClick,
  onDeleteVehicleClick,
}: VehiclesTableProps) {
  const { data: teamsList = [] } = useTeams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');

  // Filtered vehicles list based on status & search
  const filteredData = useMemo(() => {
    return vehiclesData.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.model.toLowerCase().includes(q) ||
        String(item.plateNumber).includes(q) ||
        (item.driverName && item.driverName.toLowerCase().includes(q)) ||
        (item.driverEmail && item.driverEmail.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [vehiclesData, statusFilter, searchQuery]);

  // Column definitions
  const columns = useMemo<ColumnDef<VehicleWithRelations>[]>(
    () => [
      {
        accessorKey: 'model',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-bold hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            المركبة والموديل
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0 shadow-xs border border-[var(--border)]">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <Link
                  href={`/vehicles/${vehicle._id}`}
                  className="font-semibold text-xs text-[var(--text)] hover:text-[var(--primary)] transition-colors hover:underline block"
                >
                  {vehicle.model}
                </Link>
                <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                  <span className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[10px] font-mono">
                    {vehicle.year}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'plateNumber',
        header: 'رقم اللوحة',
        cell: ({ row }) => (
          <div className="font-mono text-xs font-bold text-[var(--text)] bg-[var(--surface-2)]/60 px-2.5 py-1 rounded-lg border border-[var(--border)] w-fit" dir="ltr">
            {row.original.plateNumber}
          </div>
        ),
      },
      {
        accessorKey: 'teamId',
        header: 'الفريق التشغيلي',
        cell: ({ row }) => {
          const vehicle = row.original;
          const teamIdStr =
            typeof vehicle.teamId === 'object' && vehicle.teamId
              ? (vehicle.teamId as any)._id
              : vehicle.teamId;
          const team = teamsList.find((t) => t._id === teamIdStr);

          if (!team) {
            return (
              <span className="text-[11px] text-[var(--muted)] italic">
                المستودع العام
              </span>
            );
          }

          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-500/20">
              <Users className="w-3 h-3" />
              <span>{team.name}</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'الحالة والنشاط',
        cell: ({ row }) => (
          <VehicleStatusBadge
            status={row.original.status}
            isInTask={row.original.isInTask}
          />
        ),
      },
      {
        accessorKey: 'driverId',
        header: 'السائق المعين',
        cell: ({ row }) => {
          const vehicle = row.original;
          if (!vehicle.driverName) {
            return (
              <button
                onClick={() => onAssignDriverClick(vehicle)}
                className="text-[11px] font-medium text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                تعيين سائق
              </button>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-[10px] font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--text)]">
                  {vehicle.driverName}
                </div>
                {vehicle.driverEmail && (
                  <div className="text-[10px] text-[var(--muted)]" dir="ltr">
                    {vehicle.driverEmail}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => {
          const vehicle = row.original;
          const isActive = vehicle.status === 'active';
          const hasTeam = Boolean(vehicle.teamId);
          const hasDriver = Boolean(vehicle.driverId);

          return (
            <div className="flex items-center gap-1.5 justify-center">
              {/* Visible quick action: If no team, show "تعيين لفريق" */}
              {!hasTeam && onAssignTeamClick && (
                <button
                  type="button"
                  onClick={() => onAssignTeamClick(vehicle)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                  title="تعيين لفريق تشغيلي"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>تعيين لفريق</span>
                </button>
              )}

              {/* If has team and no driver, show "تعيين سائق" */}
              {hasTeam && !hasDriver && (
                <button
                  type="button"
                  onClick={() => onAssignDriverClick(vehicle)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold hover:bg-teal-500/20 transition-colors cursor-pointer"
                  title="تعيين سائق للمركبة"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>تعيين سائق</span>
                </button>
              )}

              {/* Action Menu (Kebab ⋮) */}
              {(() => {
                const menuItems: ActionMenuItem[] = [];

                if (hasTeam && onRemoveTeamClick) {
                  menuItems.push({
                    label: 'فك الارتباط عن الفريق',
                    icon: Unlink,
                    variant: 'warning',
                    onClick: () => onRemoveTeamClick(vehicle),
                  });
                } else if (!hasTeam && onAssignTeamClick) {
                  menuItems.push({
                    label: 'تعيين لفريق تشغيلي',
                    icon: Link2,
                    variant: 'primary',
                    onClick: () => onAssignTeamClick(vehicle),
                  });
                }

                if (hasDriver && onUnassignDriverClick) {
                  menuItems.push({
                    label: 'فك ارتباط السائق',
                    icon: Unlink,
                    variant: 'warning',
                    onClick: () => onUnassignDriverClick(vehicle),
                  });
                } else {
                  menuItems.push({
                    label: 'تعيين سائق للمركبة',
                    icon: UserCheck,
                    onClick: () => onAssignDriverClick(vehicle),
                  });
                }

                menuItems.push({
                  label: isActive ? 'تعطيل المركبة' : 'تفعيل المركبة',
                  icon: Power,
                  variant: isActive ? 'warning' : 'success',
                  onClick: () => onChangeStatusClick(vehicle),
                });

                if (onDeleteVehicleClick) {
                  menuItems.push({
                    label: 'حذف المركبة',
                    icon: Trash2,
                    variant: 'danger',
                    onClick: () => onDeleteVehicleClick(vehicle),
                  });
                }

                return <ActionMenu items={menuItems} align="left" />;
              })()}
            </div>
          );
        },
      },
    ],
    [
      onAssignDriverClick,
      onChangeStatusClick,
      onAssignTeamClick,
      onRemoveTeamClick,
      onUnassignDriverClick,
      onDeleteVehicleClick,
      teamsList,
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
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالموديل، اللوحة، أو السائق..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-44">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة فقط</option>
              <option value="inactive">غير نشطة فقط</option>
            </select>
          </div>
        </div>

        {/* Add Vehicle Button */}
        <button
          onClick={onAddVehicleClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مركبة</span>
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
            {isLoadingVehicles ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-xs text-[var(--muted)]">
                  جارٍ تحميل بيانات المركبات...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <Car className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-[var(--text)]">لا توجد مركبات مسجلة</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    {searchQuery || statusFilter !== 'all'
                      ? 'جرّب تغيير عبارة البحث أو الفلتر'
                      : 'ابدأ بإضافة أول مركبة لأسطولك الآن'}
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--surface-2)]/50 transition-colors text-xs"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4">
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
      {!isLoadingVehicles && table.getPageCount() > 1 && (
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
          <div>
            صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()} (إجمالي {filteredData.length} مركبة)
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
