import React, { useState } from 'react';
import { Lease, Currency, FinancialTransaction } from '../../types';
import { Language, translations } from '../../locales/translations';
import { 
  FileCheck, 
  MessageSquare, 
  AlertCircle, 
  Check, 
  X, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

interface RentCollectionProps {
  leases: Lease[];
  setLeases: React.Dispatch<React.SetStateAction<Lease[]>>;
  currency: Currency;
  lang: Language;
  onAddTransaction: (tx: FinancialTransaction) => void;
  selectedLeaseForReminder: Lease | null;
  setSelectedLeaseForReminder: (lease: Lease | null) => void;
}

export const RentCollection: React.FC<RentCollectionProps> = ({
  leases,
  setLeases,
  currency,
  lang,
  onAddTransaction,
  selectedLeaseForReminder,
  setSelectedLeaseForReminder,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'overdue'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<'friendly' | 'dueToday' | 'overdue'>('friendly');
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(val) + ' ' + (currency === 'SAR' ? (lang === 'ar' ? 'ر.س' : 'SAR') : currency === 'AED' ? (lang === 'ar' ? 'د.إ' : 'AED') : currency);
  };

  const filteredLeases = leases.filter((lease) => {
    const matchSearch =
      lease.tenant_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.lease_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') return lease.is_overdue;
    if (statusFilter === 'expiring_soon') return lease.status === 'expiring_soon';
    if (statusFilter === 'active') return lease.status === 'active' && !lease.is_overdue;
    return true;
  });

  // Handle Mark as Paid
  const handleMarkAsPaid = (lease: Lease) => {
    const vatRate = 0.15;
    const total = lease.installment_amount;
    const base = Number((total / (1 + vatRate)).toFixed(2));
    const vat = Number((total - base).toFixed(2));

    const newTx: FinancialTransaction = {
      id: `tx_${Date.now()}`,
      org_id: 'org_aqar_gcc_01',
      property_id: lease.property_id,
      property_name_ar: lease.property_name_ar,
      property_name_en: lease.property_name_en,
      unit_id: lease.unit_id,
      unit_number: lease.unit_number,
      type: 'income',
      category_ar: `تحصيل إيجار دوري (${lease.unit_number})`,
      category_en: `Rent Payment (${lease.unit_number})`,
      amount: base,
      vat_rate: vatRate,
      vat_amount: vat,
      total_amount: total,
      currency: currency,
      date: new Date().toISOString().substring(0, 10),
      reference_number: `REC-${Date.now().toString().slice(-6)}`,
      tenant_name: lease.tenant_name_ar,
      payment_method: 'mada',
      notes_ar: `سداد العقد رقم ${lease.lease_number}`,
    };

    onAddTransaction(newTx);

    // Update lease state
    setLeases(
      leases.map((l) => {
        if (l.id === lease.id) {
          return {
            ...l,
            is_overdue: false,
            days_until_due: 90, // Next quarter
            next_due_date: '2027-01-05',
          };
        }
        return l;
      })
    );

    setPaymentSuccessToast(
      lang === 'ar'
        ? `تم تسجيل سداد مبلغ ${formatCurrency(total)} للمستأجر ${lease.tenant_name_ar} وإصدار سند القبض بنجاح!`
        : `Payment of ${formatCurrency(total)} recorded for ${lease.tenant_name_en}!`
    );

    setTimeout(() => {
      setPaymentSuccessToast(null);
    }, 4500);
  };

  // WhatsApp Message Generation
  const getWhatsAppMessage = (lease: Lease) => {
    const formattedAmount = formatCurrency(lease.installment_amount);

    if (selectedTemplate === 'friendly') {
      return `مرحباً أستاذ ${lease.tenant_name_ar}،
نود تذكيركم بود بأن موعد استحقاق دفعة الإيجار القادمة لعقاركم (${lease.property_name_ar} - الوحدة ${lease.unit_number}) هو بتاريخ ${lease.next_due_date}، بمبلغ ${formattedAmount}.
شاكرين لكم حسن تعاونكم الدائم.
شركة إتقان لإدارة العقارات - عقار فلو`;
    }

    if (selectedTemplate === 'dueToday') {
      return `السلام عليكم أستاذ ${lease.tenant_name_ar}،
نفيدكم بأن اليوم هو موعد سداد دفعة الإيجار المستحقة لعقدكم رقم (${lease.lease_number}) بمبلغ ${formattedAmount}.
يمكنكم السداد عبر التحويل المباشر لحساب الآيبان:
SA0380000456123456789012 (مصرف الراجحي)
أو عبر نظام سداد (رمز المفوتر: 142).
شاكرين لكم التزامكم.`;
    }

    // Overdue Template
    return `إشعار رسمي بالتأخير
المستأجر الكريم: ${lease.tenant_name_ar}
عقد رقم: ${lease.lease_number}
الوحدة: ${lease.unit_number} - ${lease.property_name_ar}
المبلغ المتأخر: ${formattedAmount}
نود إحاطتكم بتأخر سداد الدفعة الإيجارية المستحقة منذ ${lease.overdue_days || 5} أيام. يرجى المبادرة بالسداد العاجل لتجنب اتخاذ الإجراءات النظامية عبر منصة إيجار / التنفيذ.
للتحويل أو الاستفسار يرجى الرد على هذه الرسالة.`;
  };

  const getWhatsAppUrl = (lease: Lease) => {
    const phone = lease.tenant_phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(getWhatsAppMessage(lease));
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {paymentSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{paymentSuccessToast}</span>
          </div>
          <button onClick={() => setPaymentSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#0F5A47]" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t.leaseTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.leaseSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {leases.length} {lang === 'ar' ? 'عقود موثقة' : 'Active Leases'}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالاسم، رقم الوحدة، أو رقم العقد...' : 'Search by tenant, unit #, or lease #...'}
            className="w-full text-xs ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F5A47]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 me-1 shrink-0" />
          {(['all', 'active', 'expiring_soon', 'overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0F5A47] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? (lang === 'ar' ? 'كافة العقود' : 'All') :
               st === 'active' ? (lang === 'ar' ? 'نشطة' : 'Active') :
               st === 'expiring_soon' ? (lang === 'ar' ? 'تنتهي قريباً' : 'Expiring Soon') :
               (lang === 'ar' ? 'متأخرات السداد' : 'Overdue')}
            </button>
          ))}
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4 text-start">{t.tenantName}</th>
                <th className="py-3 px-4 text-start">{t.unitNumber}</th>
                <th className="py-3 px-4 text-start">{t.contractNumber}</th>
                <th className="py-3 px-4 text-start">{t.annualRent}</th>
                <th className="py-3 px-4 text-start">{t.installmentAmount}</th>
                <th className="py-3 px-4 text-start">{t.nextDue}</th>
                <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الإجراءات والتحصيل' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeases.map((lease) => (
                <tr key={lease.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Tenant */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>
                      <span>{lang === 'ar' ? lease.tenant_name_ar : lease.tenant_name_en}</span>
                      <span className="block text-[11px] text-slate-500 font-normal tabular-numbers">{lease.tenant_phone}</span>
                    </div>
                  </td>

                  {/* Unit */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{lease.unit_number}</span>
                    <span className="block text-[11px] text-slate-500">{lang === 'ar' ? lease.property_name_ar : lease.property_name_en}</span>
                  </td>

                  {/* Contract # */}
                  <td className="py-3.5 px-4 font-mono text-slate-700 text-xs">
                    {lease.lease_number}
                  </td>

                  {/* Annual Rent */}
                  <td className="py-3.5 px-4 tabular-numbers font-medium text-slate-700">
                    {formatCurrency(lease.annual_rent)}
                  </td>

                  {/* Installment Amount */}
                  <td className="py-3.5 px-4 tabular-numbers font-bold text-slate-900">
                    {formatCurrency(lease.installment_amount)}
                  </td>

                  {/* Next Due */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="tabular-numbers font-semibold text-slate-800 text-xs">{lease.next_due_date}</span>
                      {lease.is_overdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                          <AlertCircle className="w-3 h-3" />
                          <span>{lang === 'ar' ? `متأخر ${lease.overdue_days} يوم` : `${lease.overdue_days}d overdue`}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                          <span>{lang === 'ar' ? `متبقي ${lease.days_until_due} يوم` : `${lease.days_until_due}d left`}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedLeaseForReminder(lease)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#0F5A47] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title={t.sendReminder}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تذكير واتساب' : 'WhatsApp'}</span>
                      </button>

                      <button
                        onClick={() => handleMarkAsPaid(lease)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] transition-colors shadow-xs"
                        title={t.markAsPaid}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.markAsPaid}</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Message Composer & Dispatch Modal */}
      {selectedLeaseForReminder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#0F5A47]" />
                  <span>{t.whatsappTemplatesTitle}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {lang === 'ar' ? selectedLeaseForReminder.tenant_name_ar : selectedLeaseForReminder.tenant_name_en} · {selectedLeaseForReminder.tenant_phone}
                </span>
              </div>
              <button
                onClick={() => setSelectedLeaseForReminder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'ar' ? 'اختر قالب الإشعار المعتمد:' : 'Select Notification Template:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('friendly')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    selectedTemplate === 'friendly'
                      ? 'border-[#0F5A47] bg-emerald-50 text-[#0F5A47] ring-1 ring-[#0F5A47]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.templateFriendly}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('dueToday')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    selectedTemplate === 'dueToday'
                      ? 'border-[#0F5A47] bg-emerald-50 text-[#0F5A47] ring-1 ring-[#0F5A47]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.templateDueToday}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('overdue')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    selectedTemplate === 'overdue'
                      ? 'border-rose-400 bg-rose-50 text-rose-700 ring-1 ring-rose-400'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.templateOverdue}
                </button>
              </div>
            </div>

            {/* Message Preview Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'معاينة نص الرسالة الصادرة:' : 'Message Text Preview:'}
              </label>
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {getWhatsAppMessage(selectedLeaseForReminder)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLeaseForReminder(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>

              <a
                href={getWhatsAppUrl(selectedLeaseForReminder)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-xs transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t.sendViaWhatsApp}</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
