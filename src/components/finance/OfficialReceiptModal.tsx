import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { FinancialTransaction, Lease, Property, Unit, Tenant } from '../../types';
import { Printer, Download, CheckCircle2, ShieldCheck, QrCode, X, Building, Share2 } from 'lucide-react';

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  transaction?: FinancialTransaction | null;
  lease?: Lease | null;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  isOpen,
  onClose,
  lang,
  transaction,
  lease,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const receiptNumber = transaction?.reference_number || 'REC-2026-9041';
  const tenantName = lease ? 'سلطان عبدالله الدوسري' : 'عميل منصة مُلكي';
  const tenantId = '1098452310';
  const propertyName = 'مجمع الواحة السكني الفاخر - الرياض';
  const unitNumber = 'فيلا V-101 (الدور الأرضي)';
  const baseAmount = transaction?.base_amount || 37500;
  const vatRate = 0.15;
  const vatAmount = transaction?.vat_amount || (baseAmount * vatRate);
  const totalAmount = transaction?.total_amount || (baseAmount + vatAmount);
  const paymentMethod = transaction?.payment_method || 'mada';
  const paymentDate = transaction?.date || new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Toolbar (hidden during print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">
              {lang === 'ar' ? 'سند قبض إلكتروني رسمي معتمد (ZATCA Phase 2)' : 'Official ZATCA Compliant E-Receipt'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'طباعة مباشرة' : 'Print'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? (lang === 'ar' ? 'جاري التجهيز...' : 'Preparing...') : (lang === 'ar' ? 'حفظ PDF' : 'Save PDF')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL RECEIPT DOCUMENT */}
        <div id="official-receipt-print" className="p-6 sm:p-8 bg-white text-slate-900 space-y-6 font-sans">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#0F5A47] pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F5A47] to-[#147a61] flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-2 border-emerald-300/40">
                مُ
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0F5A47] tracking-tight">
                  شركة إتقان العقارية لإدارة الأملاك ذ.م.م
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  ITQAN REAL ESTATE & PROPERTY MANAGEMENT CO. L.L.C
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-600 mt-1">
                  <span>س.ت: <strong>1010789456</strong></span>
                  <span>الرقم الضريبي: <strong>310458923400003</strong></span>
                  <span>الرياض · المملكة العربية السعودية</span>
                </div>
              </div>
            </div>

            {/* Official Badge & Status */}
            <div className="text-start sm:text-end bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-1.5 sm:justify-end text-emerald-800 text-xs font-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>سند قبض وضريبة معتمد</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                رقم السند: <span className="text-[#0F5A47]">{receiptNumber}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                تاريخ الإصدار: {paymentDate}
              </div>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="text-center bg-slate-50 py-2.5 rounded-xl border border-slate-200">
            <h2 className="text-base sm:text-lg font-black text-slate-800">
              سند قبض إيجار رسمي إلكتروني
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-semibold">
              Official Rent Payment & Tax E-Receipt
            </p>
          </div>

          {/* Parties & Property Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>بيانات المستأجر / المستلم منه:</span>
                <span className="text-[10px] text-slate-500 font-mono">Tenant Info</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الاسم الكريم:</span>
                <strong className="text-slate-900">{tenantName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الهوية الوطنية / الإقامة:</span>
                <span className="font-mono font-semibold text-slate-800">{tenantId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة السداد:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                  شبكة مدى السعودية (MADA Pay)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>بيانات العين المؤجرة:</span>
                <span className="text-[10px] text-slate-500 font-mono">Leased Property</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">اسم العقار:</span>
                <strong className="text-slate-900">{propertyName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الوحدة:</span>
                <span className="font-mono font-bold text-[#0F5A47]">{unitNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم عقد إيجار الموحد:</span>
                <span className="font-mono font-bold text-indigo-700">EJ-2026-9041</span>
              </div>
            </div>
          </div>

          {/* Amount In Words Banner */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-center justify-between">
            <span className="font-semibold">المبلغ المستلم كتابةً:</span>
            <strong className="font-black text-xs sm:text-sm">
              فقط ثلاثة وأربعون ألفاً ومائة وخمسة وعشرون ريالاً سعودياً لا غير
            </strong>
          </div>

          {/* Financial Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#0F5A47] text-white">
                <tr>
                  <th className="py-2.5 px-4 font-bold text-start">البيان / Description</th>
                  <th className="py-2.5 px-4 font-bold text-end">المبلغ الأساسي</th>
                  <th className="py-2.5 px-4 font-bold text-end">ضريبة القيمة المضافة (15%)</th>
                  <th className="py-2.5 px-4 font-bold text-end">الإجمالي شامل الضريبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    دفعة الإيجار الربع سنوية (الدفعة الأولى 2026)
                  </td>
                  <td className="py-3 px-4 text-end font-mono font-semibold">
                    {baseAmount.toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-4 text-end font-mono text-slate-600">
                    {vatAmount.toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-4 text-end font-mono font-bold text-slate-900">
                    {totalAmount.toLocaleString()} ر.س
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-end text-slate-700 text-xs sm:text-sm">
                    المبلغ الإجمالي المستلم والمثبت دفترياً:
                  </td>
                  <td className="py-3 px-4 text-end font-mono text-base font-black text-[#0F5A47]">
                    {totalAmount.toLocaleString()} ر.س
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ZATCA Phase 2 QR & Official Stamp Section */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            
            {/* ZATCA QR Code */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 flex items-center justify-center shrink-0">
                {/* SVG ZATCA Matrix QR */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 2h2v4h-2v-4zm-4 2h2v2h-2v-2zm6-4h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-600 leading-tight">
                <span className="font-bold text-[#0F5A47] block text-xs">ختم ZATCA الإلكتروني</span>
                رمز تشفير TLV مطابق لمتطلبات الفوترة الإلكترونية - المرحلة الثانية لهيئة الزكاة والجمارك.
              </div>
            </div>

            {/* Official Digital Golden Stamp */}
            <div className="text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#0F5A47] p-1 flex items-center justify-center rotate-[-6deg] shadow-xs">
                <div className="w-full h-full rounded-full border border-emerald-600 bg-emerald-50/60 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[8px] font-bold text-slate-700">شركة إتقان العقارية</span>
                  <span className="text-[10px] font-black text-[#0F5A47] uppercase tracking-wider">مُعتمد ومُسدّد</span>
                  <span className="text-[7px] text-slate-500 font-mono">PAID & CERTIFIED</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-semibold">الختم الرقمي للمنشأة</span>
            </div>

            {/* Authorized Signature */}
            <div className="text-center sm:text-end space-y-2">
              <span className="text-xs text-slate-500 block">توقيع المحاسب القانوني / المدير المالي</span>
              <div className="font-serif italic text-base text-[#0F5A47] font-bold">
                A. Al-Mansoor
              </div>
              <div className="h-0.5 bg-slate-300 w-32 ms-auto" />
              <span className="text-[10px] text-slate-400 block font-mono">التوقيع الإلكتروني المؤرخ</span>
            </div>

          </div>

          {/* Legal Notice */}
          <div className="text-[10px] text-slate-400 text-center pt-2">
            هذا المستند صادر إلكترونياً من منصة مُلكي (Mulki PropTech) ومعتمد رسمياً وفقاً لأنظمة التجارة الإلكترونية المعمول بها في المملكة العربية السعودية ودول مجلس التعاون الخليجي.
          </div>

        </div>

      </div>
    </div>
  );
};
