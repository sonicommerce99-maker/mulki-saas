import React from 'react';
import { Language } from '../../locales/translations';
import { Lock, MessageSquare, AlertTriangle, Phone, ShieldAlert, ArrowLeft } from 'lucide-react';

interface SuspendedAccountNoticeProps {
  lang: Language;
  companyName?: string;
  adminPhone?: string;
  onReturnToSuperAdmin?: () => void;
}

export const SuspendedAccountNotice: React.FC<SuspendedAccountNoticeProps> = ({
  lang,
  companyName = 'دار الخليج للاستثمار العقاري',
  adminPhone = '+966501234567',
  onReturnToSuperAdmin,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 border-2 border-rose-200 shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Top Warning Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        {/* Lock Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-10 h-10 animate-bounce" />
        </div>

        {/* Message Headings */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {lang === 'ar' ? 'تنبيه استحقاق الفاتورة الدورية' : 'Subscription Payment Required'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {lang === 'ar' ? `تم تعليق حساب (${companyName}) مؤقتاً` : `Account Suspended Temporarily`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {lang === 'ar'
              ? 'نحيطكم علماً بأن اشتراك المنصة الشهري قد انتهت صلاحيته ولم يتم تسجيل عملية السداد حتى الآن. يرجى تجديد الاشتراك لاستعادة الوصول الفوري لكافة العقود والبيانات.'
              : 'Your platform subscription period has expired. Please renew your subscription to restore immediate access to all properties, contracts, and tenants.'}
          </p>
        </div>

        {/* Payment & Bank Details Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-start space-y-2">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
            <span>بيانات سداد الفاتورة المعلقة:</span>
            <span className="text-rose-600 font-mono font-bold">799 ر.س</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>البنك المعتمد:</span>
            <strong className="text-slate-800">مصرف الراجحي (Al Rajhi)</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>رقم الآيبان (IBAN):</span>
            <span className="font-mono font-bold text-slate-800">SA42 8000 0201 4590 1120 0019</span>
          </div>
        </div>

        {/* WhatsApp Immediate Activation Button */}
        <div className="space-y-3 pt-2">
          <a
            href={`https://wa.me/966501234567?text=${encodeURIComponent(`السلام عليكم، نود تجديد وتفعيل اشتراك حساب شركة (${companyName}) في منصة مُلكي وإرسال إشعار السداد.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-sm transition-all shadow-lg active:scale-98"
          >
            <MessageSquare className="w-5 h-5" />
            <span>تواصل فوري عبر WhatsApp مع الإدارة لتفعيل الحساب</span>
          </a>

          {onReturnToSuperAdmin && (
            <button
              onClick={onReturnToSuperAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>العودة للوحة تحكم مالك المنصة (Super Admin)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
