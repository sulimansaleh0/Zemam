'use client';

import { useEffect } from 'react';

/**
 * مكون يضمن إجبار وضع Light Mode النقي على تطبيق السائق PWA
 * بغض النظر عن تفضيلات نظام التشغيل أو السمة العامة لباقي الداشبورد
 */
export function DriverThemeEnforcer() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme-setting', 'light');
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
      document.body.style.color = '#0F172A';
    }

    return () => {
      // عند مغادرة مساحة السائق نعيد الوضع الطبيعي إن لزم
      if (typeof document !== 'undefined') {
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      }
    };
  }, []);

  return null;
}
