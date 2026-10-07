import { useState, useEffect } from 'react';

/**
 * Generic debounce hook for delaying state updates (e.g. search queries)
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 350ms)
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
