import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Mulki app:', error, errorInfo);
  }

  private handleHardReload = () => {
    // Clear any service workers and caches then reload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center font-sans" dir="rtl">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <div>
              <h2 className="text-xl font-black text-white">حدث خطأ أثناء تحميل المنصة</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                يرجى الضغط على الزر أدناه لتحديث الذاكرة المؤقتة وتشغيل أحدث إصدار من منصة مُلكي.
              </p>
            </div>
            <button
              onClick={this.handleHardReload}
              className="w-full py-3 px-4 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold text-xs transition-all shadow-lg cursor-pointer"
            >
              تحديث وتشغيل المنصة الآن 🔄
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
