import React, { useState, useEffect } from 'react';
import { Language } from '../../locales/translations';
import {
  LandlordAccountSettings,
  loadAccountSettings,
  saveAccountSettings,
  defaultLandlordAccountSettings,
} from '../../lib/accountSettings';
import {
  Building2,
  Landmark,
  CreditCard,
  CheckCircle2,
  Info,
  X,
  FileCheck,
  RotateCcw,
  ShieldCheck,
  Copy,
} from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onPreviewReceipt?: () => void;
}

const POPULAR_BANKS = [
  'مصرف الراجحي (Al Rajhi Bank)',
  'البنك الأهلي السعودي (SNB)',
  'مصرف الإنماء (Alinma Bank)',
  'بنك الرياض (Riyad Bank)',
  'بنك البلاد (Bank Albilad)',
  'Banque Populaire (BCP)',
  'Attijariwafa Bank',
  'CIH Bank',
];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onPreviewReceipt,
}) => {
  const [form, setForm] = useState<LandlordAccountSettings>(loadAccountSettings());
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(loadAccountSettings());
      setSavedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAccountSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleSaveAndPreview = () => {
    saveAccountSettings(form);
    onClose();
    if (onPreviewReceipt) {
      onPreviewReceipt();
    }
  };

  const handleResetDefaults = () => {
    setForm(defaultLandlordAccountSettings);
    saveAccountSettings(defaultLandlordAccountSettings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#083A2A] via-[#0F5A47] to-[#147a61] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D2EBD4] text-[#0A4A35] flex items-center justify-center shadow-md shrink-0">
              <Landmark className="w-6 h-6 text-[#0A4A35]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  ACCOUNT & IBAN SETTINGS
                </span>
                <span className="text-xs text-emerald-200">
                  {lang === 'ar' ? 'إعدادات الفوترة والتحصيل' : 'Billing & Payout Setup'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-0.5">
                {lang === 'ar'
                  ? 'إعدادات الحساب البنكي (IBAN) وبيانات المنشأة العقارية'
                  : 'Account & Bank (IBAN) Settings for Tenant Invoices'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Clear Informational Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300/80 text-amber-950 flex items-start gap-3 shadow-2xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <div className="font-black text-xs sm:text-sm text-slate-900">
                {lang === 'ar'
                  ? 'تنبيه هام: هذه البيانات ستظهر تلقائياً في الفواتير وسندات القبض الموجهة للمستأجرين'
                  : 'Important: These details automatically appear on all tenant invoices and official receipts'}
              </div>
              <p className="text-xs text-slate-700">
                {lang === 'ar'
                  ? 'أدخل اسم البنك ورقم الآيبان (IBAN) الخاص بمكتبك العقاري أو حسابك كمالك عقار، ليتمكن المستأجرون من تحويل دفعات الإيجار مباشرة إلى حسابك البنكي عند استلام الفاتورة الضريبية أو سند القبض الإلكتروني.'
                  : 'Enter your real estate office or landlord Bank Name and IBAN so tenants can transfer rent payments directly to your bank account when viewing invoices or official receipts.'}
              </p>
            </div>
          </div>

          {savedNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-black flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'تم حفظ بيانات الحساب البنكي (IBAN) وتحديث الفواتير وسندات القبض بنجاح!'
                  : 'Bank account (IBAN) and company settings saved and applied to all receipts!'}
              </span>
            </div>
          )}

          {/* Section 1: Bank Account & IBAN Details */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F2F9F3] border border-[#0F5A47]/20 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-900/10 pb-2.5">
              <div className="flex items-center gap-2 font-black text-sm text-[#0A4A35]">
                <CreditCard className="w-4 h-4 text-[#0F5A47]" />
                <span>
                  {lang === 'ar'
                    ? '1. بيانات الحساب البنكي لتحصيل الإيجارات (Bank & IBAN)'
                    : '1. Rent Collection Bank Account (Bank Name & IBAN)'}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-[#0F5A47] px-2.5 py-0.5 rounded-full">
                {lang === 'ar' ? 'يظهر في الفواتير وسند القبض' : 'Shown on Invoices & Receipts'}
              </span>
            </div>

            {/* Quick Bank Selector Chips */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">
                {lang === 'ar' ? 'اختيار سريع للبنك (أو اكتب اسم البنك بالأسفل):' : 'Quick Select Bank:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BANKS.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setForm({ ...form, bankName: bank })}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      form.bankName === bank
                        ? 'bg-[#0F5A47] text-amber-300 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {lang === 'ar' ? 'اسم البنك المعتمد *' : 'Bank Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder={lang === 'ar' ? 'مثال: مصرف الراجحي / البنك الأهلي' : 'e.g. Al Rajhi Bank'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-[#0F5A47] font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {lang === 'ar' ? 'اسم المستفيد (صاحب الحساب) *' : 'Beneficiary Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.beneficiaryName}
                  onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
                  placeholder={lang === 'ar' ? 'اسم الشركة العقارية أو المالك' : 'Company or Landlord Name'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-[#0F5A47] font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  {lang === 'ar'
                    ? 'رقم الآيبان البنكي (IBAN) الموجه للمستأجرين *'
                    : 'Bank IBAN Number (Shown to Tenants) *'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={form.ibanNumber}
                    onChange={(e) => setForm({ ...form, ibanNumber: e.target.value.toUpperCase() })}
                    placeholder="SA00 0000 0000 0000 0000 0000"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#0F5A47]/40 focus:border-[#0F5A47] font-mono text-sm font-black text-slate-900 tracking-wider focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(form.ibanNumber.replace(/\s+/g, ''));
                      setCopiedIban(true);
                      setTimeout(() => setCopiedIban(false), 2000);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedIban ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  {lang === 'ar' ? 'تعليمات التحويل للمستأجر (تظهر أسفل الآيبان):' : 'Transfer Instructions for Tenant:'}
                </label>
                <input
                  type="text"
                  value={form.accountNotes}
                  onChange={(e) => setForm({ ...form, accountNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 focus:border-[#0F5A47] text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Real Estate Company / Landlord Identity on Invoices */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-[#0F5A47]" />
              <span>
                {lang === 'ar'
                  ? '2. بيانات المنشأة العقارية والرقم الضريبي (ترويسة الفاتورة وسند القبض)'
                  : '2. Company & Tax Identity (Invoice & Receipt Header)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم الشركة / المكتب العقاري (عربي):' : 'Company Name (Arabic):'}
                </label>
                <input
                  type="text"
                  value={form.companyNameAr}
                  onChange={(e) => setForm({ ...form, companyNameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم الشركة (إنجليزي):' : 'Company Name (English):'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.companyNameEn}
                  onChange={(e) => setForm({ ...form, companyNameEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الرقم الضريبي للمنشأة (VAT Number):' : 'VAT Registration Number:'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.vatNumber}
                  onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رقم السجل التجاري (CR):' : 'Commercial Registration (CR):'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.crNumber}
                  onChange={(e) => setForm({ ...form, crNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Live Preview Box as seen on OfficialReceiptModal */}
          <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-[#0F5A47]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[#0F5A47] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'معاينة حية: كيف ستظهر بيانات البنك للمستأجر في الفواتير وسند القبض'
                    : 'Live Preview: How Bank & IBAN Details Appear on Tenant Receipts'}
                </span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">OfficialReceiptModal Preview</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-black text-slate-900">{form.bankName || '—'}</div>
                <div className="text-[11px] text-slate-600">
                  {lang === 'ar' ? 'المستفيد:' : 'Beneficiary:'} <strong>{form.beneficiaryName || '—'}</strong>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 font-mono text-xs font-black text-[#0F5A47]" dir="ltr">
                {form.ibanNumber || 'SA00 0000 0000 0000 0000 0000'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {onPreviewReceipt && (
                <button
                  type="button"
                  onClick={handleSaveAndPreview}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'حفظ ومعاينة سند القبض الآن' : 'Save & Preview Receipt'}</span>
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F5A47] hover:bg-[#0A4A35] text-white font-black shadow-md transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'حفظ إعدادات الحساب والبنك ✅' : 'Save Account & Bank Settings ✅'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
