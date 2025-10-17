import { useEffect, useRef } from 'react';

/**
 * A custom hook to store the previous value of a state or prop.
 * This is useful for comparing the current and previous states in effects.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}