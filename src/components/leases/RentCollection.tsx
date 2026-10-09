import React, { useState, useEffect } from 'react';
import { Lease, Currency } from '../../types';
import { Language, translations } from '../../locales/translations';
import { loadAccountSettings } from '../../lib/accountSettings';
import {
  FileCheck,
  MessageSquare,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Mail,
  BellRing,
  Send,
  Copy,
  CheckCircle2,
  Settings2,
} from 'lucide-react';

interface RentCollectionProps {
  leases: Lease[];
  setLeases: React.Dispatch<React.SetStateAction<Lease[]>>;
  currency: Currency;
  lang: Language;
  onAddTransaction: (tx: any) => void;
  selectedLeaseForReminder: Lease | null;
  setSelectedLeaseForReminder: (lease: Lease | null) => void;
}

interface EmailAutoReminderConfig {
  enabled: boolean; // Optional toggle
  daysBeforeDue: number; // e.g. 7 days before due date
  ccLandlordEmail: string;
  includeBankIbanInEmail: boolean;
}

const EMAIL_CONFIG_KEY = 'portfolio_email_reminder_config_v1';

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

  // Optional Email Notification System States
  const [emailConfig, setEmailConfig] = useState<EmailAutoReminderConfig>(() => {
    try {
      const saved = localStorage.getItem(EMAIL_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      enabled: false, // Optional by default (اختياري غير إلزامي)
      daysBeforeDue: 7,
      ccLandlordEmail: '',
      includeBankIbanInEmail: true,
    };
  });

  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false);
  const [selectedLeaseForEmail, setSelectedLeaseForEmail] = useState<Lease | null>(null);
  const [recipientEmailInput, setRecipientEmailInput] = useState('');
  const [copiedEmailBody, setCopiedEmailBody] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(emailConfig));
    } catch {
      // ignore
    }
  }, [emailConfig]);

  // Add New Manual Lease Modal State
  const [isAddLeaseOpen, setIsAddLeaseOpen] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('966501234567');
  const [tenantEmail, setTenantEmail] = useState('');
  const [enableLeaseEmailAlert, setEnableLeaseEmailAlert] = useState(false);
  const [propertyName, setPropertyName] = useState('مجمع الواحة السكني الفاخر');
  const [unitNumber, setUnitNumber] = useState('A-101');
  const [leaseNumber, setLeaseNumber] = useState(`EJ-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [annualRent, setAnnualRent] = useState('48000');
  const [paymentFreq, setPaymentFreq] = useState<'monthly' | 'quarterly' | 'semi_annual' | 'annual'>('quarterly');
  const [nextDueDate, setNextDueDate] = useState('2026-11-01');

  const formatCurrency = (val: number) => {
    return (
      new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
        maximumFractionDigits: 0,
      }).format(val) +
      ' ' +
      (currency === 'SAR'
        ? lang === 'ar'
          ? 'ر.س'
          : 'SAR'
        : currency === 'AED'
        ? lang === 'ar'
          ? 'د.إ'
          : 'AED'
        : currency)
    );
  };

  const filteredLeases = leases.filter((lease) => {
    const matchSearch =
      lease.tenant_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.lease_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lease.tenant_email && lease.tenant_email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') return lease.is_overdue;
    if (statusFilter === 'expiring_soon') return lease.status === 'expiring_soon';
    if (statusFilter === 'active') return lease.status === 'active' && !lease.is_overdue;
    return true;
  });

  // Leases approaching due date (<= daysBeforeDue or overdue)
  const upcomingOrOverdueLeases = leases.filter(
    (l) => l.is_overdue || l.days_until_due <= emailConfig.daysBeforeDue
  );

  const handleAddManualLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !unitNumber.trim()) return;
    const annual = parseFloat(annualRent) || 48000;
    const divisor =
      paymentFreq === 'monthly'
        ? 12
        : paymentFreq === 'quarterly'
        ? 4
        : paymentFreq === 'semi_annual'
        ? 2
        : 1;

    const newLease: Lease = {
      id: `lease-${Date.now()}`,
      property_id: 'prop-1',
      property_name_ar: propertyName.trim(),
      property_name_en: propertyName.trim(),
      unit_id: `unit-${Date.now()}`,
      unit_number: unitNumber.trim(),
      tenant_id: `tenant-${Date.now()}`,
      tenant_name_ar: tenantName.trim(),
      tenant_name_en: tenantName.trim(),
      tenant_phone: tenantPhone.trim() || '966500000000',
      tenant_email: tenantEmail.trim() || undefined,
      email_reminder_enabled: enableLeaseEmailAlert,
      lease_number: leaseNumber.trim() || `EJ-${Date.now().toString().slice(-5)}`,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2027-10-01',
      annual_rent: annual,
      installment_amount: Math.round(annual / divisor),
      payment_frequency: paymentFreq,
      deposit_amount: 5000,
      status: 'active',
      next_due_date: nextDueDate,
      days_until_due: 25,
      is_overdue: false,
    };

    setLeases((prev) => [newLease, ...prev]);
    setTenantName('');
    setTenantEmail('');
    setEnableLeaseEmailAlert(false);
    setIsAddLeaseOpen(false);
    setPaymentSuccessToast(
      lang === 'ar'
        ? `تمت إضافة عقد الإيجار (${newLease.lease_number}) للمستأجر ${newLease.tenant_name_ar} وحفظه تلقائياً!`
        : `Lease contract (${newLease.lease_number}) saved!`
    );
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  // Handle Mark as Paid
  const handleMarkAsPaid = (lease: Lease) => {
    const vatRate = 0.15;
    const total = lease.installment_amount;
    const base = Number((total / (1 + vatRate)).toFixed(2));
    const vat = Number((total - base).toFixed(2));

    const newTx = {
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

    setLeases(
      leases.map((l) => {
        if (l.id === lease.id) {
          return {
            ...l,
            is_overdue: false,
            days_until_due: 90,
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

  // WhatsApp Message Generation dynamically using Landlord's configured IBAN & Bank Name
  const getWhatsAppMessage = (lease: Lease) => {
    const formattedAmount = formatCurrency(lease.installment_amount);
    const accountSettings = loadAccountSettings();

    if (selectedTemplate === 'friendly') {
      return `مرحباً أستاذ ${lease.tenant_name_ar}،
نود تذكيركم بود بأن موعد استحقاق دفعة الإيجار القادمة لعقاركم (${lease.property_name_ar} - الوحدة ${lease.unit_number}) هو بتاريخ ${lease.next_due_date}، بمبلغ ${formattedAmount}.
شاكرين لكم حسن تعاونكم الدائم.
${accountSettings.companyNameAr} - منصة مَحْفَظَتِي العَقَارِيَّة`;
    }

    if (selectedTemplate === 'dueToday') {
      return `السلام عليكم أستاذ ${lease.tenant_name_ar}،
نفيدكم بأن اليوم هو موعد سداد دفعة الإيجار المستحقة لعقدكم رقم (${lease.lease_number}) بمبلغ ${formattedAmount}.
يمكنكم السداد عبر التحويل المباشر لحساب الآيبان المعتمد:
${accountSettings.ibanNumber} (${accountSettings.bankName})
المستفيد: ${accountSettings.beneficiaryName}
شاكرين لكم التزامكم.`;
    }

    return `إشعار رسمي بالتأخير
المستأجر الكريم: ${lease.tenant_name_ar}
عقد رقم: ${lease.lease_number}
الوحدة: ${lease.unit_number} - ${lease.property_name_ar}
المبلغ المتأخر: ${formattedAmount}
نود إحاطتكم بتأخر سداد الدفعة الإيجارية المستحقة منذ ${lease.overdue_days || 5} أيام. يرجى المبادرة بالسداد العاجل على حساب الآيبان:
${accountSettings.ibanNumber} (${accountSettings.bankName})
لتجنب اتخاذ الإجراءات النظامية عبر منصة إيجار.`;
  };

  const getWhatsAppUrl = (lease: Lease) => {
    const phone = lease.tenant_phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(getWhatsAppMessage(lease));
    return `https://wa.me/${phone}?text=${text}`;
  };

  // Email Subject & Body Generator (Optional Email Reminder Integration)
  const getEmailSubject = (lease: Lease) => {
    const accountSettings = loadAccountSettings();
    if (lease.is_overdue) {
      return `إشعار هام بتأخر سداد دفعة الإيجار - عقد رقم ${lease.lease_number} | ${accountSettings.companyNameAr}`;
    }
    return `تذكير بموعد استحقاق دفعة الإيجار (${lease.next_due_date}) - الوحدة ${lease.unit_number} | ${accountSettings.companyNameAr}`;
  };

  const getEmailBody = (lease: Lease) => {
    const formattedAmount = formatCurrency(lease.installment_amount);
    const accountSettings = loadAccountSettings();

    const bankBlock = emailConfig.includeBankIbanInEmail
      ? `\n----------------------------------------\nبيانات الحساب البنكي المعتمد للسداد:\n• اسم البنك: ${accountSettings.bankName}\n• رقم الآيبان (IBAN): ${accountSettings.ibanNumber}\n• اسم المستفيد: ${accountSettings.beneficiaryName}\n----------------------------------------\n`
      : '';

    if (lease.is_overdue) {
      return `المستأجر الكريم / ${lease.tenant_name_ar} المحترم،
تحية طيبة وبعد،

نود إشعاركم بتأخر سداد الدفعة الإيجارية المستحقة لعقدكم رقم (${lease.lease_number}) الخاص بالوحدة (${lease.unit_number}) في عقار (${lease.property_name_ar}).

• المبلغ المستحق: ${formattedAmount}
• تاريخ الاستحقاق: ${lease.next_due_date} (متأخر ${lease.overdue_days || 5} أيام)
${bankBlock}
نرجو التكرم بالمبادرة بالسداد وإرسال إيصال التحويل لإصدار سند القبض الضريبي الإلكتروني.

مع خالص الشكر والتقدير،
إدارة الأملاك والتحصيل - ${accountSettings.companyNameAr}`;
    }

    return `المستأجر الكريم / ${lease.tenant_name_ar} المحترم،
تحية طيبة وبعد،

نود تذكيركم بود باقتراب موعد استحقاق الدفعة الإيجارية القادمة الخاصة بعقدكم رقم (${lease.lease_number}):

• العقار والوحدة: ${lease.property_name_ar} - وحدة رقم (${lease.unit_number})
• قيمة الدفعة المستحقة: ${formattedAmount}
• تاريخ الاستحقاق: ${lease.next_due_date} (متبقي ${lease.days_until_due} أيام)
${bankBlock}
شاكرين لكم التزامكم الدائم وحسن تعاونكم.

مع خالص التحية والتقدير،
إدارة الأملاك والتحصيل - ${accountSettings.companyNameAr}`;
  };

  const handleOpenEmailModal = (lease: Lease) => {
    setSelectedLeaseForEmail(lease);
    setRecipientEmailInput(lease.tenant_email || '');
    setCopiedEmailBody(false);
  };

  const handleSendEmailAction = (lease: Lease) => {
    const emailTarget = recipientEmailInput.trim() || lease.tenant_email || '';
    // Save updated email on lease if user typed one
    if (emailTarget && emailTarget !== lease.tenant_email) {
      setLeases((prev) =>
        prev.map((l) => (l.id === lease.id ? { ...l, tenant_email: emailTarget } : l))
      );
    }

    const subject = encodeURIComponent(getEmailSubject(lease));
    const body = encodeURIComponent(getEmailBody(lease));
    const ccParam = emailConfig.ccLandlordEmail
      ? `&cc=${encodeURIComponent(emailConfig.ccLandlordEmail)}`
      : '';

    const mailtoUrl = `mailto:${emailTarget}?subject=${subject}&body=${body}${ccParam}`;
    const linkEl = document.createElement('a');
    linkEl.href = mailtoUrl;
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);

    setPaymentSuccessToast(
      lang === 'ar'
        ? `تم تجهيز وإرسال إشعار البريد الإلكتروني للمستأجر (${lease.tenant_name_ar}) بنجاح!`
        : `Email reminder prepared and triggered for ${lease.tenant_name_en}!`
    );
    setTimeout(() => setPaymentSuccessToast(null), 4000);
    setSelectedLeaseForEmail(null);
  };

  const handleSendBulkDueEmails = () => {
    const targetLeases = upcomingOrOverdueLeases.filter((l) => l.tenant_email);
    if (targetLeases.length === 0) {
      setPaymentSuccessToast(
        lang === 'ar'
          ? 'لا توجد عقود مستحقة مسجل بها بريد إلكتروني حالياً (البريد الإلكتروني اختياري).'
          : 'No upcoming leases have an email address configured.'
      );
      setTimeout(() => setPaymentSuccessToast(null), 4000);
      return;
    }

    const bccList = targetLeases.map((l) => l.tenant_email).join(',');
    const accountSettings = loadAccountSettings();
    const subject = encodeURIComponent(
      `تذكير بموعد استحقاق دفعة الإيجار | ${accountSettings.companyNameAr}`
    );
    const body = encodeURIComponent(
      `المستأجر الكريم،\nتحية طيبة وبعد،\n\nنود تذكيركم باقتراب موعد استحقاق دفعة الإيجار الدورية الخاصة بوحدتكم العقارية.\n\nبيانات الحساب البنكي للسداد:\n• البنك: ${accountSettings.bankName}\n• الآيبان (IBAN): ${accountSettings.ibanNumber}\n• المستفيد: ${accountSettings.beneficiaryName}\n\nشاكرين لكم حسن تعاونكم،\n${accountSettings.companyNameAr}`
    );

    const linkEl = document.createElement('a');
    linkEl.href = `mailto:?bcc=${bccList}&subject=${subject}&body=${body}`;
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);

    setPaymentSuccessToast(
      lang === 'ar'
        ? `تم إطلاق التذكير الجماعي عبر البريد الإلكتروني لعدد (${targetLeases.length}) مستأجرين تقترب دفعاتهم!`
        : `Bulk email reminder triggered for (${targetLeases.length}) tenants!`
    );
    setTimeout(() => setPaymentSuccessToast(null), 4500);
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
          <button
            onClick={() => setPaymentSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Optional Email Reminders Configuration Button */}
          <button
            onClick={() => setIsEmailSettingsOpen(!isEmailSettingsOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              emailConfig.enabled
                ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span>
              {lang === 'ar'
                ? 'إشعارات البريد الإلكتروني (اختياري)'
                : 'Email Reminders (Optional)'}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                emailConfig.enabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {emailConfig.enabled
                ? lang === 'ar'
                  ? 'مفعّل'
                  : 'ON'
                : lang === 'ar'
                ? 'اختياري / متوقف'
                : 'OPTIONAL'}
            </span>
          </button>

          <button
            onClick={() => setIsAddLeaseOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F5A47] hover:bg-[#0A4A35] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة عقد إيجار جديد' : 'Add New Lease'}</span>
          </button>
        </div>
      </div>

      {/* Optional Email Reminder Control Panel (Collapsible) */}
      {isEmailSettingsOpen && (
        <div className="bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/40 rounded-2xl border border-blue-200/90 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-100 pb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-slate-900 text-sm">
                    {lang === 'ar'
                      ? 'نظام تذكيرات البريد الإلكتروني التلقائية للمستأجرين (ميزة اختيارية غير إلزامية)'
                      : 'Automated Tenant Email Reminder System (100% Optional Feature)'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {lang === 'ar' ? 'اختياري بالكامل' : 'Optional'}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">
                  {lang === 'ar'
                    ? 'يمكنك الاعتماد على الواتساب فقط، أو تفعيل إشعارات البريد الإلكتروني لإرسال تذكير رسمي للمستأجرين قبل موعد الاستحقاق مع رقم الآيبان (IBAN).'
                    : 'You can rely on WhatsApp alone, or optionally enable email notifications for upcoming rent due dates.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={emailConfig.enabled}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, enabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#0F5A47] rounded cursor-pointer"
                />
                <span className="font-black text-slate-800">
                  {lang === 'ar'
                    ? 'تفعيل تذكيرات البريد الإلكتروني'
                    : 'Enable Email Reminders'}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar'
                  ? 'إرسال التذكير قبل موعد الاستحقاق بـ:'
                  : 'Remind before due date by:'}
              </label>
              <select
                value={emailConfig.daysBeforeDue}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    daysBeforeDue: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
              >
                <option value={3}>3 أيام قبل الاستحقاق</option>
                <option value={7}>7 أيام قبل الاستحقاق (موصى به)</option>
                <option value={14}>14 يوماً قبل الاستحقاق</option>
                <option value={30}>30 يوماً قبل الاستحقاق</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar'
                  ? 'نسخة لبريد المالك / المحاسب (CC - اختياري):'
                  : 'CC Landlord Email (Optional):'}
              </label>
              <input
                type="email"
                dir="ltr"
                value={emailConfig.ccLandlordEmail}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    ccLandlordEmail: e.target.value,
                  })
                }
                placeholder="accounting@yourcompany.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendBulkDueEmails}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar'
                    ? `إرسال تذكير بريدي للمستحقين (${upcomingOrOverdueLeases.length})`
                    : `Send Bulk Email (${upcomingOrOverdueLeases.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'بحث بالاسم، الإيميل، رقم الوحدة، أو العقد...'
                : 'Search by tenant, email, unit #, or lease #...'
            }
            className="w-full text-xs ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F5A47]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 me-1 shrink-0" />
          {(['all', 'active', 'expiring_soon', 'overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0F5A47] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all'
                ? lang === 'ar'
                  ? 'كافة العقود'
                  : 'All'
                : st === 'active'
                ? lang === 'ar'
                  ? 'نشطة'
                  : 'Active'
                : st === 'expiring_soon'
                ? lang === 'ar'
                  ? 'تنتهي قريباً'
                  : 'Expiring Soon'
                : lang === 'ar'
                ? 'متأخرات السداد'
                : 'Overdue'}
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
                <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الإجراءات والتذكير (واتساب / إيميل)' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeases.map((lease) => (
                <tr key={lease.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>
                      <span>{lang === 'ar' ? lease.tenant_name_ar : lease.tenant_name_en}</span>
                      <span className="block text-[11px] text-slate-500 font-normal tabular-numbers">
                        {lease.tenant_phone}
                      </span>
                      {lease.tenant_email && (
                        <span className="block text-[10px] text-blue-600 font-mono">
                          ✉️ {lease.tenant_email}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{lease.unit_number}</span>
                    <span className="block text-[11px] text-slate-500">
                      {lang === 'ar' ? lease.property_name_ar : lease.property_name_en}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700 text-xs">
                    {lease.lease_number}
                  </td>

                  <td className="py-3.5 px-4 tabular-numbers font-medium text-slate-700">
                    {formatCurrency(lease.annual_rent)}
                  </td>

                  <td className="py-3.5 px-4 tabular-numbers font-bold text-slate-900">
                    {formatCurrency(lease.installment_amount)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="tabular-numbers font-semibold text-slate-800 text-xs">
                        {lease.next_due_date}
                      </span>
                      {lease.is_overdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                          <AlertCircle className="w-3 h-3" />
                          <span>
                            {lang === 'ar'
                              ? `متأخر ${lease.overdue_days} يوم`
                              : `${lease.overdue_days}d overdue`}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                          <span>
                            {lang === 'ar'
                              ? `متبقي ${lease.days_until_due} يوم`
                              : `${lease.days_until_due}d left`}
                          </span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {/* WhatsApp Reminder Button */}
                      <button
                        onClick={() => setSelectedLeaseForReminder(lease)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#0F5A47] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        title={t.sendReminder}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                      </button>

                      {/* Optional Email Reminder Button */}
                      <button
                        onClick={() => handleOpenEmailModal(lease)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        title={
                          lang === 'ar'
                            ? 'إرسال تذكير عبر البريد الإلكتروني (اختياري)'
                            : 'Send Email Reminder (Optional)'
                        }
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>{lang === 'ar' ? 'إيميل' : 'Email'}</span>
                      </button>

                      {/* Mark as Paid Button */}
                      <button
                        onClick={() => handleMarkAsPaid(lease)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] transition-colors shadow-xs cursor-pointer"
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

      {/* Add Manual Lease Modal */}
      {isAddLeaseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddManualLease}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {lang === 'ar' ? 'إضافة عقد إيجار ومستأجر جديد' : 'Add New Lease Contract'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddLeaseOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'اسم المستأجر الكامل *' : 'Tenant Full Name *'}
              </label>
              <input
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: فهد بن عبدالعزيز العتيبي' : 'Tenant Name'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رقم الجوال (واتساب):' : 'WhatsApp Phone:'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'البريد الإلكتروني (اختياري):' : 'Email (Optional):'}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  placeholder="tenant@email.com (اختياري)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم العقار:' : 'Property Name:'}
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رقم الوحدة / الشقة *' : 'Unit Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الإيجار السنوي الإجمالي *' : 'Annual Rent *'}
                </label>
                <input
                  type="number"
                  required
                  value={annualRent}
                  onChange={(e) => setAnnualRent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'دورية السداد:' : 'Billing Cycle:'}
                </label>
                <select
                  value={paymentFreq}
                  onChange={(e) => setPaymentFreq(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                >
                  <option value="monthly">شهري (12 دفعة)</option>
                  <option value="quarterly">ربع سنوي (4 دفعات)</option>
                  <option value="semi_annual">نصف سنوي (دفعتين)</option>
                  <option value="annual">سنوي</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رقم عقد إيجار:' : 'Contract Number:'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={leaseNumber}
                  onChange={(e) => setLeaseNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'تاريخ الاستحقاق القادم:' : 'Next Due Date:'}
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Optional Email Reminder Checkbox */}
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={enableLeaseEmailAlert}
                onChange={(e) => setEnableLeaseEmailAlert(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span className="text-[11px] font-bold text-slate-700">
                {lang === 'ar'
                  ? 'تفعيل التذكير التلقائي عبر البريد الإلكتروني لهذا المستأجر (اختياري)'
                  : 'Enable automatic email reminder for this tenant (Optional)'}
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddLeaseOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F5A47] text-white font-black cursor-pointer"
              >
                {lang === 'ar' ? 'حفظ العقد' : 'Save Lease'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email Reminder Composer & Dispatch Modal (Optional Integration) */}
      {selectedLeaseForEmail && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {lang === 'ar'
                      ? 'إرسال إشعار استحقاق الإيجار عبر البريد الإلكتروني (اختياري)'
                      : 'Send Rent Due Email Notification (Optional)'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedLeaseForEmail.tenant_name_ar} · {selectedLeaseForEmail.unit_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeaseForEmail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar'
                  ? 'البريد الإلكتروني للمستأجر (اختياري - يمكنك إدخاله أو تعديله):'
                  : 'Tenant Email Address (Optional):'}
              </label>
              <input
                type="email"
                dir="ltr"
                value={recipientEmailInput}
                onChange={(e) => setRecipientEmailInput(e.target.value)}
                placeholder="tenant@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'عنوان الرسالة (Subject):' : 'Email Subject:'}
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                {getEmailSubject(selectedLeaseForEmail)}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar'
                  ? 'نص رسالة البريد الإلكتروني (مُدرج به الآيبان IBAN تلقائياً):'
                  : 'Email Body Preview (Includes Bank IBAN):'}
              </label>
              <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                {getEmailBody(selectedLeaseForEmail)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${getEmailSubject(selectedLeaseForEmail)}\n\n${getEmailBody(selectedLeaseForEmail)}`
                  );
                  setCopiedEmailBody(true);
                  setTimeout(() => setCopiedEmailBody(false), 2500);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedEmailBody ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ar' ? 'تم نسخ نص الإيميل!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>{lang === 'ar' ? 'نسخ النص' : 'Copy Text'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeaseForEmail(null)}
                  className="px-3.5 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSendEmailAction(selectedLeaseForEmail)}
                  className="flex items-center gap-1.5 px-4 py-2 font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {lang === 'ar'
                      ? 'إرسال عبر البريد الإلكتروني الآن'
                      : 'Send Email Now'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {lang === 'ar'
                    ? selectedLeaseForReminder.tenant_name_ar
                    : selectedLeaseForReminder.tenant_name_en}{' '}
                  · {selectedLeaseForReminder.tenant_phone}
                </span>
              </div>
              <button
                onClick={() => setSelectedLeaseForReminder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'ar' ? 'اختر قالب الإشعار المعتمد:' : 'Select Notification Template:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('friendly')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    selectedTemplate === 'overdue'
                      ? 'border-rose-400 bg-rose-50 text-rose-700 ring-1 ring-rose-400'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.templateOverdue}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'معاينة نص الرسالة الصادرة:' : 'Message Text Preview:'}
              </label>
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {getWhatsAppMessage(selectedLeaseForReminder)}
              </div>
            </div>

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
