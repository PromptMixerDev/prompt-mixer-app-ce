import { useEffect } from 'react';

interface HTMLElementWithTimeout extends HTMLElement {
  scrollTimeout?: ReturnType<typeof setTimeout>;
}

export const useScrollVisibility = (): void => {
  const handleScroll = (event: Event): void => {
    const target = event.target as HTMLElementWithTimeout;
    if (target) {
      target.classList.add('scrolling');
      if (target.scrollTimeout) {
        clearTimeout(target.scrollTimeout);
      }
      target.scrollTimeout = setTimeout(() => {
        target.classList.remove('scrolling');
      }, 1000);
    }
  };

  useEffect(() => {
    document.addEventListener('scroll', handleScroll, true);

    return (): void => {
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);
};
