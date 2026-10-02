import React, { useState } from 'react';
import { Unit, Lease, MaintenanceTicket, Currency } from '../../types';
import { Language, translations } from '../../locales/translations';
import { 
  Home, 
  CreditCard, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Calendar, 
  Building,
  Check
} from 'lucide-react';

interface TenantPortalViewProps {
  leases: Lease[];
  units: Unit[];
  tickets: MaintenanceTicket[];
  currency: Currency;
  lang: Language;
  onOpenNewTicket: () => void;
  onPayRent: (lease: Lease) => void;
}

export const TenantPortalView: React.FC<TenantPortalViewProps> = ({
  leases,
  units,
  tickets,
  currency,
  lang,
  onOpenNewTicket,
  onPayRent,
}) => {
  const t = translations[lang];
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Default logged in tenant: Sultan Abdullah Al Dossary (ten_01, unit_101)
  const myLease = leases.find((l) => l.tenant_id === 'ten_01') || leases[0];
  const myUnit = units.find((u) => u.id === myLease.unit_id) || units[0];
  const myTickets = tickets.filter((tkt) => tkt.unit_id === myUnit.id || tkt.tenant_id === 'ten_01');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(val) + ' ' + (currency === 'SAR' ? (lang === 'ar' ? 'ر.س' : 'SAR') : currency === 'AED' ? (lang === 'ar' ? 'د.إ' : 'AED') : currency);
  };

  const handlePayNow = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      onPayRent(myLease);
      setTimeout(() => setPaymentSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Tenant Welcome Card */}
      <div className="bg-gradient-to-br from-[#0F5A47] to-[#0A3D30] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-mono">
              {lang === 'ar' ? 'بوابة المستأجر الإلكترونية' : 'Tenant Smart Portal'}
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-semibold">
              {lang === 'ar' ? 'عقد موثق عبر إيجار' : 'Verified Lease'}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {lang === 'ar' ? myLease.tenant_name_ar : myLease.tenant_name_en}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1.5 mt-1">
              <Building className="w-4 h-4" />
              <span>{lang === 'ar' ? myLease.property_name_ar : myLease.property_name_en} · {myUnit.unit_number}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-200 block">{lang === 'ar' ? 'رقم العقد:' : 'Lease ID:'}</span>
              <span className="font-mono font-bold">{myLease.lease_number}</span>
            </div>
            <div>
              <span className="text-emerald-200 block">{lang === 'ar' ? 'نهاية العقد:' : 'Expires:'}</span>
              <span className="font-bold tabular-numbers">{myLease.end_date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rent Payment Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0F5A47]" />
            <h2 className="font-bold text-slate-900 text-base">
              {lang === 'ar' ? 'دفعة الإيجار القادمة' : 'Next Rental Installment'}
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {myLease.days_until_due > 0 ? (lang === 'ar' ? `متبقي ${myLease.days_until_due} يوم` : `${myLease.days_until_due}d left`) : (lang === 'ar' ? 'مستحقة اليوم' : 'Due Today')}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">{lang === 'ar' ? 'المبلغ المستحق للدفع:' : 'Payable Amount:'}</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-numbers">
              {formatCurrency(myLease.installment_amount)}
            </span>
          </div>
          <div className="text-end text-xs text-slate-500">
            <span>تاريخ الاستحقاق:</span>
            <strong className="block text-slate-800 tabular-numbers">{myLease.next_due_date}</strong>
          </div>
        </div>

        {paymentSuccess ? (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'ar' ? 'تم تأكيد السداد وإصدار الإيصال الإلكتروني بنجاح!' : 'Payment processed successfully!'}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="w-full py-3 text-sm font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              <CreditCard className="w-4 h-4" />
              <span>{paying ? (lang === 'ar' ? 'جاري الاتصال ببوابة مدى...' : 'Processing Mada payment...') : (lang === 'ar' ? 'سداد فوري عبر مدى / Apple Pay' : 'Pay with Mada / Apple Pay')}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              بوابة دفع آمنة 100% ومتوافقة مع نظام المدفوعات السعودي وApple Pay.
            </p>
          </div>
        )}
      </div>

      {/* Maintenance Request Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-slate-900 text-base">
              {lang === 'ar' ? 'طلبات الصيانة الخاصة بوحدتي' : 'My Maintenance Requests'}
            </h2>
          </div>

          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'طلب صيانة جديد' : 'New Request'}</span>
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {myTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {lang === 'ar' ? 'لا توجد طلبات صيانة حالياً، كل شيء على ما يرام!' : 'No maintenance requests logged.'}
            </div>
          ) : (
            myTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-slate-500 font-semibold">{tkt.ticket_number}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                      {lang === 'ar' ? tkt.title_ar : tkt.title_en}
                    </h3>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    tkt.status === 'in_progress' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    tkt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    {tkt.status === 'in_progress' ? t.statusInProgress :
                     tkt.status === 'completed' ? t.statusCompleted : t.statusRequested}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {lang === 'ar' ? tkt.description_ar : tkt.description_en}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>الفني: <strong className="text-slate-800">{tkt.assigned_technician_name}</strong></span>
                  <span className="tabular-numbers">{tkt.created_at}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
