import { useEffect, useRef } from 'react';

export function usePrevious<V>(value: V): V | undefined {
  const ref = useRef<V>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
