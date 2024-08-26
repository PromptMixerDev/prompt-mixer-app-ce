export const generateIdFromString = (inputString: string): string => {
  return inputString.toLowerCase().replace(/\s+/g, '');
};
