'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Hook to trigger a callback when clicking outside the referenced element(s).
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T | null> | Array<RefObject<T | null>>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const refList = Array.isArray(refs) ? refs : [refs];

      const isInside = refList.some((ref) => ref.current?.contains(target));
      if (!isInside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler, enabled]);
}
