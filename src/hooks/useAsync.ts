import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const useAsync = <T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>,
  ...args: Args
): AsyncState<T> & { execute: () => void } => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const memoizedOperation = useCallback(operation, []);

  const fetchData = useCallback(async () => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const data: T = await memoizedOperation(...args);
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({ data: null, error: error as Error, isLoading: false });
    }
  }, [memoizedOperation, ...args]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const execute = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  return { ...state, execute };
};
