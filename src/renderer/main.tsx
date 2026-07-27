import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { TimerProvider } from './context/TimerContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TimerProvider>
      <App />
    </TimerProvider>
  </React.StrictMode>
);