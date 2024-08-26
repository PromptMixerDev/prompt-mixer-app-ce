import { useEffect, useRef } from 'react';

export const useResizeObserver = (
  ref: React.RefObject<Element>,
  handler: (value: React.RefObject<Element>) => void
): void => {
  const savedHandler = useRef(handler);
  useEffect(() => {
    savedHandler.current = handler;
  });

  useEffect(() => {
    const observableElement = ref?.current;
    if (observableElement) {
      const resizeObserver = new ResizeObserver(() => {
        if (savedHandler.current) {
          savedHandler.current(ref);
        }
      });

      resizeObserver.observe(observableElement);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [ref]);
};
