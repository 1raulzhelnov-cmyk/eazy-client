import React from 'react';
import ReactDOM from 'react-dom/client';
import ClientApp from '@/apps/client/App';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClientApp />
  </React.StrictMode>
);