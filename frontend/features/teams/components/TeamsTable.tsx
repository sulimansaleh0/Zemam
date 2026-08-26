'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserPlus,
  UserMinus,
  UserX,
  Truck,
  ArrowDownUp,
  Building2,
} from 'lucide-react';
import type { Team, TeamFilterStatus, TeamSortOrder } from '../types/team.types';

interface TeamsTableProps {
  teams: Team[];
  isLoading: boolean;
  companyName?: string;
  vehicleCounts?: Record<string, number>;
  onAddClick: () => void;
  onEditClick: (team: Team) => void;
  onDeleteClick: (team: Team) => void;
  onAssignManagerClick: (team: Team) => void;
  onRemoveManagerClick?: (managerId: string, teamName: string) => void;
}

const SORT_CYCLE: TeamSortOrder[] = ['newest', 'oldest', 'name'];

const SORT_LABELS: Record<TeamSortOrder, string> = {
  newest: 'الأحدث أولاً',
  oldest: 'الأقدم أولاً',
  name: 'أبجدياً (الاسم)',
};

export function TeamsTable({
  teams,
  isLoading,
  companyName,
  vehicleCounts = {},
  onAddClick,
  onEditClick,
  onDeleteClick,
  onAssignManagerClick,
  onRemoveManagerClick,
}: TeamsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeamFilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<TeamSortOrder>('newest');

  const toggleSort = () => {
    const currentIndex = SORT_CYCLE.indexOf(sortOrder);
    setSortOrder(SORT_CYCLE[(currentIndex + 1) % SORT_CYCLE.length]);
  };

  // Filter & Sort Logic
  const filteredTeams = useMemo(() => {
    return teams
      .filter((team) => {
        // Search
        const query = searchQuery.trim().toLowerCase();
        const matchesName = team.name.toLowerCase().includes(query);
        const managerObj = typeof team.managerId === 'object' ? team.managerId : null;
        const matchesManager = managerObj
          ? (managerObj.name || '').toLowerCase().includes(query) ||
            (managerObj.email || '').toLowerCase().includes(query)
          : false;

        const matchesSearch = !query || matchesName || matchesManager;

        // Status Filter
        let matchesStatus = true;
        if (statusFilter === 'assigned') {
          matchesStatus = Boolean(team.managerId);
        } else if (statusFilter === 'unassigned') {
          matchesStatus = !team.managerId;
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === 'name') {
          return a.name.localeCompare(b.name, 'ar');
        }
        if (sortOrder === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        // newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [teams, searchQuery, statusFilter, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الفريق أو المدير المسند..."
            className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
          />
        </div>

        {/* Filter & Sort & Add */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filters */}
          <div className="flex items-center gap-1 p-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              الكل ({teams.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('assigned')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'assigned'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              مدارة
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unassigned')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'unassigned'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              شاغرة
            </button>
          </div>

          {/* Sort button */}
          <button
            type="button"
            onClick={toggleSort}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] rounded-xl transition-colors cursor-pointer"
            title="تغيير ترتيب العرض"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>{SORT_LABELS[sortOrder]}</span>
          </button>

          {/* Add Team button */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء فريق</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]/60 text-xs font-bold text-[var(--muted)]">
                <th className="py-3.5 px-4 sm:px-6">الفريق التشغيلي</th>
                <th className="py-3.5 px-4 sm:px-6">مدير الأسطول المسند</th>
                <th className="py-3.5 px-4 sm:px-6">المركبات المخصصة</th>
                <th className="py-3.5 px-4 sm:px-6">الشركة التابعة</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)]" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-4 bg-[var(--surface-2)] rounded" />
                          <div className="w-16 h-3 bg-[var(--surface-2)] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-28 h-5 bg-[var(--surface-2)] rounded-lg" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-20 h-5 bg-[var(--surface-2)] rounded-full" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-24 h-4 bg-[var(--surface-2)] rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="w-16 h-8 bg-[var(--surface-2)] rounded-lg mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredTeams.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">
                          لا توجد فرق تشغيلية مطابقة
                        </h3>
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {searchQuery
                            ? 'جرب البحث بكلمات أخرى أو تغيير الفلتر'
                            : 'ابدأ بإنشاء أول فريق تشغيلي لشركتك لتنظيم الأسطول'}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          type="button"
                          onClick={onAddClick}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إنشاء أول فريق</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => {
                  const vehiclesCount = vehicleCounts[team._id] ?? 0;
                  const manager = team.managerId;
                  const hasManager = Boolean(manager);
                  const managerId =
                    typeof manager === 'object' && manager !== null
                      ? manager._id
                      : typeof manager === 'string'
                      ? manager
                      : null;
                  const managerName =
                    typeof manager === 'object' && manager !== null
                      ? manager.name || manager.email.split('@')[0]
                      : null;
                  const managerEmail =
                    typeof manager === 'object' && manager !== null
                      ? manager.email
                      : null;

                  return (
                    <tr
                      key={team._id}
                      className="hover:bg-[var(--surface-2)]/40 transition-colors group"
                    >
                      {/* Team Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0 shadow-xs border border-[var(--border)]">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[var(--text)]">
                              {team.name}
                            </div>
                            <div className="text-[11px] font-mono text-[var(--muted)] mt-0.5">
                              ID: {team._id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Manager */}
                      <td className="py-4 px-4 sm:px-6">
                        {hasManager ? (
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                              <UserCheck className="w-3.5 h-3.5 shrink-0" />
                              <span
                                className="truncate max-w-[130px]"
                                title={managerEmail || undefined}
                              >
                                {managerName || managerEmail || 'مدير أسطول'}
                              </span>
                            </div>

                            {/* Quick Manager Actions */}
                            <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => onAssignManagerClick(team)}
                                title="تغيير مدير الفريق"
                                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                              </button>

                              {onRemoveManagerClick && managerId && (
                                <button
                                  type="button"
                                  onClick={() => onRemoveManagerClick(managerId, team.name)}
                                  title="إلغاء تعيين / تعطيل المدير"
                                  className="p-1 rounded-md text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssignManagerClick(team)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-dashed border-[var(--primary)]/40 bg-[var(--primary-light)]/40 text-[var(--primary)] hover:bg-[var(--primary-light)] font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>تعيين مدير</span>
                          </button>
                        )}
                      </td>

                      {/* Vehicles count */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]/10">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{vehiclesCount} مركبة</span>
                        </span>
                      </td>

                      {/* Company info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text)] font-medium">
                          <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {typeof team.companyId === 'object' && team.companyId?.name
                              ? team.companyId.name
                              : companyName || 'الشركة الرئيسية'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onAssignManagerClick(team)}
                            title={hasManager ? 'تغيير مدير الفريق' : 'تعيين مدير للفريق'}
                            className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditClick(team)}
                            title="تعديل اسم الفريق"
                            className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteClick(team)}
                            title="حذف الفريق"
                            className="p-2 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
