import { useEffect } from 'react';
import debounce from 'lodash/debounce';

type ResizeCallback = () => void;

export const useWindowResize = (callback: ResizeCallback): void => {
  const debouncedCallback = debounce(callback, 10);
  useEffect(() => {
    const handleResize = (): void => {
      debouncedCallback();
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [callback]);
};
