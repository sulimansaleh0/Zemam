'use client';

import React, { useMemo, useState } from 'react';
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
  Radio,
  Building2,
  Users,
  User,
  Phone,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { VehicleWithRelations, VehicleStatus } from '../types/vehicle.types';
import { VehicleStatusBadge } from './VehicleStatusBadge';

interface VehiclesTableProps {
  vehiclesData: VehicleWithRelations[];
  isLoadingVehicles: boolean;
  onAddVehicleClick: () => void;
  onEditVehicleClick: (selectedVehicle: VehicleWithRelations) => void;
  onDeleteVehicleClick: (selectedVehicle: VehicleWithRelations) => void;
}

export function VehiclesTable({
  vehiclesData,
  isLoadingVehicles,
  onAddVehicleClick,
  onEditVehicleClick,
  onDeleteVehicleClick,
}: VehiclesTableProps) {
  const [vehiclesSorting, setVehiclesSorting] = useState<SortingState>([]);
  const [vehiclesSearchQuery, setVehiclesSearchQuery] = useState('');
  const [vehiclesStatusFilter, setVehiclesStatusFilter] = useState<VehicleStatus | 'all'>('all');

  // Filtered vehicles list based on status
  const filteredVehiclesList = useMemo(() => {
    if (vehiclesStatusFilter === 'all') return vehiclesData;
    return vehiclesData.filter((item) => item.status === vehiclesStatusFilter);
  }, [vehiclesData, vehiclesStatusFilter]);

  // Column definitions for vehicles
  const vehicleColumns = useMemo<ColumnDef<VehicleWithRelations>[]>(
    () => [
      {
        accessorKey: 'model',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-bold hover:text-[var(--primary)] transition-colors"
          >
            المركبة والموديل
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
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
                <div className="font-semibold text-sm text-[var(--text)]">
                  {vehicle.model}
                </div>
                <div className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                  <span className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[11px] font-mono">
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
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-bold hover:text-[var(--primary)] transition-colors"
          >
            رقم اللوحة
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const plate = getValue<number>();
          return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[var(--border)] bg-[var(--surface-2)] shadow-xs">
              <span className="text-xs font-bold text-[var(--muted)]">KSA</span>
              <span className="font-mono text-sm font-black tracking-wider text-[var(--text)]">
                {plate}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'driverName',
        header: 'السائق المسؤول',
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                <User className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span>{vehicle.driverName}</span>
              </div>
              {vehicle.driverPhone && (
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] font-mono">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span dir="ltr">{vehicle.driverPhone}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'companyName',
        header: 'الشركة والفريق',
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text)]">
                <Building2 className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                <span className="truncate max-w-[180px]">{vehicle.companyName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                <Users className="w-3 h-3 text-[var(--muted)] shrink-0" />
                <span className="truncate max-w-[180px]">{vehicle.teamName}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'gpsDeviceId',
        header: 'جهاز التتبع (GPS)',
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text)]">
                <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{vehicle.gpsDeviceId}</span>
              </div>
              <div className="text-[10px] font-mono text-[var(--muted)] truncate max-w-[140px]">
                {vehicle.gpsUniqueId}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ getValue }) => {
          const status = getValue<VehicleStatus>();
          return <VehicleStatusBadge status={status} />;
        },
      },
      {
        id: 'vehicleActions',
        header: 'الإجراءات',
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button
                type="button"
                onClick={() => onEditVehicleClick(vehicle)}
                title="تعديل بيانات المركبة"
                className="p-1.5 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteVehicleClick(vehicle)}
                title="حذف المركبة"
                className="p-1.5 text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [onEditVehicleClick, onDeleteVehicleClick]
  );

  const vehiclesTable = useReactTable({
    data: filteredVehiclesList,
    columns: vehicleColumns,
    state: {
      sorting: vehiclesSorting,
      globalFilter: vehiclesSearchQuery,
    },
    onSortingChange: setVehiclesSorting,
    onGlobalFilterChange: setVehiclesSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs">
        {/* Search & Filter */}
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              value={vehiclesSearchQuery ?? ''}
              onChange={(e) => setVehiclesSearchQuery(e.target.value)}
              placeholder="بحث بالموديل، رقم اللوحة، السائق، أو المعرف..."
              className="w-full pl-3 pr-10 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
            <SlidersHorizontal className="w-4 h-4 text-[var(--muted)] mx-1" />
            <select
              value={vehiclesStatusFilter}
              onChange={(e) =>
                setVehiclesStatusFilter(e.target.value as VehicleStatus | 'all')
              }
              className="bg-transparent text-xs font-medium text-[var(--text)] border-none focus:outline-none pr-1 cursor-pointer"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="maintenance">في الصيانة</option>
              <option value="stopped">متوقفة</option>
              <option value="unavailable">غير متاحة</option>
            </select>
          </div>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={onAddVehicleClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مركبة</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              {vehiclesTable.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-[var(--border)] bg-[var(--surface-2)]/60 text-xs font-bold text-[var(--muted)]"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3.5 px-4 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {isLoadingVehicles ? (
                // Loading Skeleton
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--surface-2)] rounded-xl" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-[var(--surface-2)] rounded" />
                          <div className="w-14 h-3 bg-[var(--surface-2)] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-6 bg-[var(--surface-2)] rounded-lg" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-28 h-4 bg-[var(--surface-2)] rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32 h-4 bg-[var(--surface-2)] rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-[var(--surface-2)] rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-6 bg-[var(--surface-2)] rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="w-12 h-6 bg-[var(--surface-2)] rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : vehiclesTable.getRowModel().rows.length > 0 ? (
                vehiclesTable.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[var(--surface-2)]/40 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={vehicleColumns.length} className="py-12 text-center text-[var(--muted)]">
                    <Car className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm text-[var(--text)]">لا توجد مركبات مطابقة</p>
                    <p className="text-xs mt-1">جرّب تغيير عبارة البحث أو الفلاتر المحددة</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-2)]/30 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span>عرض</span>
            <select
              value={vehiclesTable.getState().pagination.pageSize}
              onChange={(e) => vehiclesTable.setPageSize(Number(e.target.value))}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
            >
              {[5, 6, 10, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>مركبات لكل صفحة</span>
            <span className="mr-2 border-r border-[var(--border)] pr-2">
              إجمالي المركبات:{' '}
              <strong className="text-[var(--text)]">{vehiclesData.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="ml-2 font-medium">
              صفحة {vehiclesTable.getState().pagination.pageIndex + 1} من{' '}
              {Math.max(1, vehiclesTable.getPageCount())}
            </span>

            <button
              onClick={() => vehiclesTable.setPageIndex(0)}
              disabled={!vehiclesTable.getCanPreviousPage()}
              className="p-1 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="الصفحة الأولى"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => vehiclesTable.previousPage()}
              disabled={!vehiclesTable.getCanPreviousPage()}
              className="p-1 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => vehiclesTable.nextPage()}
              disabled={!vehiclesTable.getCanNextPage()}
              className="p-1 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                vehiclesTable.setPageIndex(vehiclesTable.getPageCount() - 1)
              }
              disabled={!vehiclesTable.getCanNextPage()}
              className="p-1 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
