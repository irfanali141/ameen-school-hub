import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SchoolProvider } from './contexts/SchoolContext';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SchoolProvider>
    <ToastProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ToastProvider>
  </SchoolProvider>
);
