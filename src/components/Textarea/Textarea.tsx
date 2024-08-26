import React, { useRef, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useResizeObserver } from 'hooks';
import styles from './Textarea.module.css';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = useCallback(() => {
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current!.style.height = 'auto';
        textareaRef.current!.style.height = `${textareaRef.current!.scrollHeight}px`;
      });
    }
  }, []);

  const debouncedResize = useCallback(debounce(handleResize, 100), [
    handleResize,
  ]);

  useEffect(() => {
    handleResize();
  }, [props.value]);

  useResizeObserver(textareaRef, debouncedResize);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      className={`${styles.textarea} ${className}`}
    />
  );
};
