'use client';

import { Bell, ChevronDown, CircleHelp, Menu, Search } from 'lucide-react';

interface HeaderProps {
  onMenu: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  userName: string;
}

export function Header({ onMenu, searchQuery, onSearchChange, userName }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-white/[.08] px-4 py-4 sm:px-7 lg:px-10">
      <button
        onClick={onMenu}
        aria-label="فتح القائمة"
        className="zd-focus rounded-lg bg-[#12243d] p-2.5 text-[#aec1dc] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative order-3 w-full sm:order-none sm:max-w-[310px] sm:flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7187a7]" />
        <input
          aria-label="البحث في المركبات والمهام"
          placeholder="ابحث في المركبات، السائقين، المهام..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="zd-focus h-10 w-full rounded-xl border border-white/[.09] bg-[#102039] pr-10 pl-4 text-xs text-[#e8f0ff] outline-none placeholder:text-[#657b9b] focus:border-[#4b84ff]"
        />
      </div>

      <div className="mr-auto flex items-center gap-2">
        <button
          aria-label="المساعدة"
          className="zd-focus rounded-xl border border-white/[.08] bg-[#102039] p-2.5 text-[#8298b5] hover:text-white"
        >
          <CircleHelp className="h-[17px] w-[17px]" />
        </button>

        <button
          aria-label="الإشعارات"
          className="zd-focus relative rounded-xl border border-white/[.08] bg-[#102039] p-2.5 text-[#8298b5] hover:text-white"
        >
          <Bell className="h-[17px] w-[17px]" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ec6871]" />
        </button>

        <button className="zd-focus hidden items-center gap-2 rounded-xl border border-white/[.08] bg-[#102039] px-3 py-2 text-xs text-[#c6d5e9] sm:flex">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#285195] text-[10px] font-bold">
            {userName[0]}
          </span>
          {userName.split(' ')[0]}
          <ChevronDown className="h-3.5 w-3.5 text-[#7186a5]" />
        </button>
      </div>
    </header>
  );
}
