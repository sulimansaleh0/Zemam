'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from '@/shared/context/ThemeContext';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'فاتح', icon: Sun },
    { value: 'dark', label: 'داكن', icon: Moon },
    { value: 'system', label: 'تلقائي (النظام)', icon: Laptop },
  ];

  const CurrentIcon =
    theme === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="تبديل مظهر الواجهة"
        aria-expanded={isOpen}
        className="zd-focus group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[.08] bg-[var(--zd-surface)] text-[var(--zd-muted)] transition-all duration-200 hover:border-white/[.15] hover:text-[var(--zd-text)] hover:shadow-sm"
      >
        <CurrentIcon className="h-[17px] w-[17px] transition-transform duration-300 group-hover:rotate-12" />
      </button>

      {isOpen && (
        <div
          dir="rtl"
          className="zd-rise absolute left-0 top-full z-50 mt-2 min-w-[170px] rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1.5 shadow-2xl backdrop-blur-md transition-all"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[var(--zd-muted)]">
            مظهر الواجهة
          </div>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[var(--zd-blue)] text-white shadow-sm'
                      : 'text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
