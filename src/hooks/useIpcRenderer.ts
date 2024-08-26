import { useEffect } from 'react';

type IpcRendererEventHandlers = Record<string, (...args: any[]) => void>;

interface UseIpcRendererReturnType {
  send: (channel: string, ...args: any[]) => void;
}

type SendIpcEvent = (channel: string, ...args: unknown[]) => void;

export const useIpcRenderer = (
  eventHandlers: IpcRendererEventHandlers = {},
  dep: any[] = []
): UseIpcRendererReturnType => {
  useEffect(() => {
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      window.electron?.ipcRenderer.on(event, handler);
    });

    return () => {
      Object.entries(eventHandlers).forEach(([event]) => {
        window.electron?.ipcRenderer.removeAllListeners(event);
      });
    };
  }, [JSON.stringify(eventHandlers), ...dep]);

  const send: SendIpcEvent = (channel: string, ...args: unknown[]) => {
    window.electron?.ipcRenderer.send(channel, ...args);
  };

  return { send };
};
