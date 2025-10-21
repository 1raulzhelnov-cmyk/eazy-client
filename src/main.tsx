import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/index.css';

// Глобальные обработчики ошибок для отладки белого экрана в WebView
window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('[GlobalError]', (e as ErrorEvent).error || e.message || e);
});
window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('[UnhandledRejection]', (e as PromiseRejectionEvent).reason);
});

class RootErrorBoundary extends React.Component<{}, { hasError: boolean; msg?: string }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, msg: String(err) };
  }
  componentDidCatch(err: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', err, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 16 }}>App error. See console logs.</div>;
    }
    return this.props.children as React.ReactNode;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);