import { useCallback, useEffect, useRef } from 'react';

interface UseOutsideClickOptions {
  ignoreElementRef?: React.RefObject<HTMLElement>;
}

export const useOutsideClick = (
  callback: () => void,
  options: UseOutsideClickOptions = {}
): React.RefObject<any> => {
  const { ignoreElementRef } = options;
  const wrapperRef = useRef<any>(null);
  const handleOutsideClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.stopPropagation();
      const isClickOnIgnoreElement = ignoreElementRef
        ? ignoreElementRef.current?.contains(event.target as Node)
        : false;
      if (
        !isClickOnIgnoreElement &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        callback();
      }
    },
    [callback, wrapperRef, ignoreElementRef]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  return wrapperRef;
};
