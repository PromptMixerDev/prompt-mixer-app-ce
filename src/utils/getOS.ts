export const MAC_OS = 'macOS';
const OTHER = 'Other';

export const getOS = (): string => {
  const userAgent = window.navigator.userAgent;
  if (userAgent.includes('Mac')) return MAC_OS;
  return OTHER;
};
