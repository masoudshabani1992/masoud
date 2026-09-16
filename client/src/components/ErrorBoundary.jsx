import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.hash = '#hub';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 my-6" dir="rtl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">خطایی در بارگذاری این بخش رخ داد</h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              سیستم به طور خودکار از بروز اختلال در سامانه جلوگیری کرد. با دکمه زیر به صفحه اصلی بازگردید.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>بازگشت به صفحه اصلی</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تلاش مجدد</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
