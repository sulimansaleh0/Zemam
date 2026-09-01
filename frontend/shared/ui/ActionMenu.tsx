'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 200; // estimated max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setPosition({
      top: flipUp ? rect.top - 8 : rect.bottom + 6,
      left: align === 'left' ? rect.left : rect.right,
    });
  }, [align]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', () => setIsOpen(false), { capture: true });
      window.addEventListener('resize', () => setIsOpen(false));
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', () => setIsOpen(false), { capture: true });
      window.removeEventListener('resize', () => setIsOpen(false));
    };
  }, [isOpen, updatePosition]);

  if (!items || items.length === 0) return null;

  const variantStyles: Record<string, string> = {
    default: 'text-[var(--text)] hover:bg-[var(--surface-2)]',
    danger: 'text-rose-500 hover:bg-rose-500/10',
    success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10',
    primary: 'text-[var(--primary)] hover:bg-[var(--primary-light)]',
  };

  // Determine transform-origin based on flip and alignment
  const flipUp = buttonRef.current
    ? window.innerHeight - buttonRef.current.getBoundingClientRect().bottom < 200 && buttonRef.current.getBoundingClientRect().top > 200
    : false;

  return (
    <div className={`relative inline-block text-right ${className}`}>
      <button
        ref={buttonRef}
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

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-48 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-1 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: flipUp ? undefined : position.top,
              bottom: flipUp ? window.innerHeight - position.top : undefined,
              left: align === 'left' ? position.left : undefined,
              right: align === 'right' ? window.innerWidth - position.left : undefined,
            }}
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
          </div>,
          document.body
        )}
    </div>
  );
}
