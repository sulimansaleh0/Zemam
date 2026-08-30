'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'primary';
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function ActionMenu({ items, align = 'left', className = '' }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  if (!items || items.length === 0) return null;

  const variantStyles: Record<string, string> = {
    default: 'text-[var(--text)] hover:bg-[var(--surface-2)]',
    danger: 'text-rose-500 hover:bg-rose-500/10',
    success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10',
    primary: 'text-[var(--primary)] hover:bg-[var(--primary-light)]',
  };

  return (
    <div className={`relative inline-block text-right ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="خيارات إضافية"
        aria-expanded={isOpen}
        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } z-50 mt-1.5 w-48 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-1 animate-in fade-in zoom-in-95 duration-150`}
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            const style = variantStyles[item.variant || 'default'];

            return (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${style}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
