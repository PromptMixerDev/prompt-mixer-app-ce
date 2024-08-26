import type { Middleware, UnknownAction } from '@reduxjs/toolkit';

export const serializeDateMiddleware: Middleware = () => (next) => (action) => {
  const typedAction = action as UnknownAction;
  if (typedAction.type !== 'flexLayoutModel/setModel') {
    const serializeDateToISO = (value: any): any => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (Array.isArray(value)) {
        return value.map(serializeDateToISO);
      }
      if (value && typeof value === 'object' && value !== null) {
        const serializedObj: Record<string, any> = {};
        Object.keys(value as object).forEach((key) => {
          serializedObj[key] = serializeDateToISO(value[key]);
        });
        return serializedObj;
      }
      return value;
    };

    const serializedAction = {
      ...typedAction,
      payload: serializeDateToISO(typedAction.payload),
    };

    return next(serializedAction);
  }
  return next(typedAction);
};
