import { useState, useEffect } from 'react';

export const useLocalStorageState = (
  key: string,
  defaultValue: string
): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) ?? defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
};
