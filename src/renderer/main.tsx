import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { StorageProvider } from './context/StorageContext';
import { TimerProvider } from './context/TimerContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StorageProvider>
      <TimerProvider>
        <App />
      </TimerProvider>
    </StorageProvider>
  </React.StrictMode>
);