import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from 'store/store';
import { NotificationProvider } from 'components/NotificationProvider';
import App from './App';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on: (channel: string, func: (...args: any[]) => void) => void;
        send: (channel: string, ...args: any[]) => void;
        removeListener: (
          channel: string,
          func: (...args: any[]) => void
        ) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <Provider store={store}>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </Provider>
);
