import { useEffect, useRef } from 'react';

/**
 * A custom hook to store the previous value of a state or prop.
 * This is useful for comparing the current and previous states in effects.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
  // FIX: Explicitly pass `undefined` as the initial value to `useRef`.
  // The error "Expected 1 arguments, but got 0" on the next line likely points to this call
  // in environments with older React type definitions that require an initial value.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
