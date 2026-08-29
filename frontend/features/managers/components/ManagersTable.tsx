'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Building2,
  Calendar,
  ArrowDownUp,
  UserCheck,
  UserX,
  Link2,
  Unlink,
} from 'lucide-react';
import type { FleetManager, ManagerFilterStatus, ManagerSortOrder } from '../types/manager.types';
import type { Team } from '@/features/teams/types/team.types';

interface ManagersTableProps {
  managers: FleetManager[];
  teams: Team[];
  isLoading: boolean;
  onAddClick: () => void;
  onDeleteClick: (manager: FleetManager, teamName?: string) => void;
  onAssignTeamClick?: (manager: FleetManager) => void;
  onDisableTeamClick?: (manager: FleetManager) => void;
  onToggleStatusClick?: (manager: FleetManager) => void;
}

const SORT_CYCLE: ManagerSortOrder[] = ['newest', 'oldest', 'name'];

const SORT_LABELS: Record<ManagerSortOrder, string> = {
  newest: 'الأحدث أولاً',
  oldest: 'الأقدم أولاً',
  name: 'أبجدياً (البريد)',
};

export function ManagersTable({
  managers,
  teams,
  isLoading,
  onAddClick,
  onDeleteClick,
  onAssignTeamClick,
  onDisableTeamClick,
  onToggleStatusClick,
}: ManagersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ManagerFilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<ManagerSortOrder>('newest');

  const toggleSort = () => {
    const currentIndex = SORT_CYCLE.indexOf(sortOrder);
    setSortOrder(SORT_CYCLE[(currentIndex + 1) % SORT_CYCLE.length]);
  };

  // Team lookup map
  const teamMap = useMemo(() => {
    const map: Record<string, string> = {};
    teams.forEach((t) => {
      map[t._id] = t.name;
    });
    return map;
  }, [teams]);

  // Filter & Sort Logic
  const filteredManagers = useMemo(() => {
    return managers
      .filter((manager) => {
        const query = searchQuery.trim().toLowerCase();
        const emailMatch = (manager.email || '').toLowerCase().includes(query);
        const nameMatch = (manager.name || '').toLowerCase().includes(query);

        const teamIdStr =
          typeof manager.teamId === 'object' ? manager.teamId?._id : manager.teamId;
        const teamName = teamIdStr ? teamMap[teamIdStr] || '' : '';
        const teamMatch = teamName.toLowerCase().includes(query);

        const matchesSearch = !query || emailMatch || nameMatch || teamMatch;

        const currentStatus = (manager.status || 'active').toLowerCase();
        let matchesStatus = true;
        if (statusFilter === 'active') {
          matchesStatus = currentStatus === 'active';
        } else if (statusFilter === 'inactive') {
          matchesStatus = currentStatus === 'inactive';
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === 'name') {
          return a.email.localeCompare(b.email, 'en');
        }
        if (sortOrder === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        // newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [managers, searchQuery, statusFilter, sortOrder, teamMap]);

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
            placeholder="بحث بالبريد الإلكتروني أو اسم الفريق..."
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
              الكل ({managers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              نشط
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              معطل
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

          {/* Add Manager button */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مدير</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]/60 text-xs font-bold text-[var(--muted)]">
                <th className="py-3.5 px-4 sm:px-6">مدير الأسطول</th>
                <th className="py-3.5 px-4 sm:px-6">الفريق المسؤول عنه</th>
                <th className="py-3.5 px-4 sm:px-6">حالة الحساب</th>
                <th className="py-3.5 px-4 sm:px-6">تاريخ الإنشاء</th>
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
                        <div className="w-10 h-10 rounded-full bg-[var(--surface-2)]" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-4 bg-[var(--surface-2)] rounded" />
                          <div className="w-20 h-3 bg-[var(--surface-2)] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-24 h-6 bg-[var(--surface-2)] rounded-lg" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-16 h-5 bg-[var(--surface-2)] rounded-full" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-20 h-4 bg-[var(--surface-2)] rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="w-12 h-8 bg-[var(--surface-2)] rounded-lg mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredManagers.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">
                          لم يتم العثور على مدراء أساطيل
                        </h3>
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {searchQuery
                            ? 'جرب البحث بكلمات أخرى أو تغيير الفلتر'
                            : 'قم بإضافة مدراء وتعيينهم على الفرق للبدء في إدارة العمليات'}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          type="button"
                          onClick={onAddClick}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة أول مدير</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredManagers.map((manager) => {
                  const teamIdStr =
                    typeof manager.teamId === 'object'
                      ? manager.teamId?._id
                      : manager.teamId;
                  const teamName = teamIdStr ? teamMap[teamIdStr] : null;
                  const isActive = (manager.status || 'active').toLowerCase() === 'active';

                  return (
                    <tr
                      key={manager._id}
                      className="hover:bg-[var(--surface-2)]/40 transition-colors group"
                    >
                      {/* Manager Name & Email */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs flex items-center justify-center uppercase shrink-0">
                            {manager.name ? manager.name[0] : manager.email[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-[var(--text)] truncate">
                              {manager.name || 'مدير أسطول'}
                            </div>
                            <div
                              className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5 truncate font-mono"
                              dir="ltr"
                            >
                              <Mail className="w-3 h-3 shrink-0" />
                              <span>{manager.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Team */}
                      <td className="py-4 px-4 sm:px-6">
                        {teamName ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-500/20">
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{teamName}</span>
                            </span>
                            {onDisableTeamClick && (
                              <button
                                type="button"
                                onClick={() => onDisableTeamClick(manager)}
                                title="فك ارتباط المدير عن هذا الفريق"
                                className="p-1 rounded-lg text-[var(--muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                              >
                                <Unlink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--muted)] italic">
                              غير مرتبط بفريق
                            </span>
                            {onAssignTeamClick && (
                              <button
                                type="button"
                                onClick={() => onAssignTeamClick(manager)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                              >
                                <Link2 className="w-3 h-3" />
                                <span>تعيين</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 sm:px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>نشط</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>معطل</span>
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 sm:px-6 text-xs text-[var(--muted)]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {manager.createdAt
                              ? new Date(manager.createdAt).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Toggle status */}
                          {onToggleStatusClick && (
                            <button
                              type="button"
                              onClick={() => onToggleStatusClick(manager)}
                              title={isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                isActive
                                  ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500/10'
                                  : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                              }`}
                            >
                              {isActive ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Delete manager */}
                          <button
                            type="button"
                            onClick={() => onDeleteClick(manager, teamName || undefined)}
                            title="حذف حساب المدير"
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

