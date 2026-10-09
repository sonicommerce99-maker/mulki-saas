import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { Language } from '../../locales/translations';
import { FinancialTransaction, Lease } from '../../types';
import {
  LandlordAccountSettings,
  loadAccountSettings,
} from '../../lib/accountSettings';
import { MulkiAppIcon } from '../layout/MulkiLogo';
import {
  Printer,
  Download,
  ShieldCheck,
  X,
  Landmark,
  Copy,
  Settings,
  CheckCircle2,
} from 'lucide-react';

/**
 * Encodes the 5 mandatory ZATCA Phase 1 fields into a TLV (Tag-Length-Value) Base64 string:
 * Tag 1: Seller / Company Name
 * Tag 2: VAT Registration Number
 * Tag 3: Invoice Timestamp (ISO 8601)
 * Tag 4: Invoice Total (with VAT)
 * Tag 5: VAT Total Amount
 */
export function generateZatcaPhase1TlvBase64(params: {
  companyName: string;
  vatNumber: string;
  invoiceDate: string;
  totalWithVat: number;
  vatAmount: number;
}): string {
  const encoder = new TextEncoder();
  const isoTimestamp = params.invoiceDate.includes('T')
    ? params.invoiceDate
    : `${params.invoiceDate}T12:00:00Z`;

  const fields: Array<{ tag: number; value: string }> = [
    { tag: 1, value: params.companyName },
    { tag: 2, value: params.vatNumber },
    { tag: 3, value: isoTimestamp },
    { tag: 4, value: params.totalWithVat.toFixed(2) },
    { tag: 5, value: params.vatAmount.toFixed(2) },
  ];

  const tlvChunks: Uint8Array[] = [];
  let totalByteLength = 0;

  for (const field of fields) {
    const valueBytes = encoder.encode(field.value);
    const chunk = new Uint8Array(2 + valueBytes.length);
    chunk[0] = field.tag;
    chunk[1] = valueBytes.length;
    chunk.set(valueBytes, 2);
    tlvChunks.push(chunk);
    totalByteLength += chunk.length;
  }

  const combined = new Uint8Array(totalByteLength);
  let offset = 0;
  for (const chunk of tlvChunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  let binary = '';
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  transaction?: FinancialTransaction | null;
  lease?: Lease | null;
  onOpenAccountSettings?: () => void;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  isOpen,
  onClose,
  lang,
  transaction,
  lease,
  onOpenAccountSettings,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedTlv, setCopiedTlv] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [accountSettings, setAccountSettings] = useState<LandlordAccountSettings>(
    loadAccountSettings()
  );

  useEffect(() => {
    if (isOpen) {
      setAccountSettings(loadAccountSettings());
    }
    const handleUpdated = () => {
      setAccountSettings(loadAccountSettings());
    };
    window.addEventListener('account-settings-updated', handleUpdated);
    return () => window.removeEventListener('account-settings-updated', handleUpdated);
  }, [isOpen]);

  const receiptNumber = transaction?.reference_number || 'REC-2026-9041';
  const tenantName = lease ? 'سلطان عبدالله الدوسري' : 'عميل منصة مَحْفَظَتِي العَقَارِيَّة';
  const tenantId = '1098452310';
  const propertyName = transaction?.property_name_ar || 'مجمع الواحة السكني الفاخر - الرياض';
  const unitNumber = 'فيلا V-101 (الدور الأرضي)';
  const baseAmount = transaction?.base_amount || 37500;
  const vatRate = 0.15;
  const vatAmount = transaction?.vat_amount ?? Math.round(baseAmount * vatRate);
  const totalAmount = transaction?.total_amount || baseAmount + vatAmount;
  const paymentDate = transaction?.date || new Date().toISOString().split('T')[0];

  const zatcaTlvBase64 = useMemo(() => {
    return generateZatcaPhase1TlvBase64({
      companyName: accountSettings.companyNameAr || 'مؤسسة مَحْفَظَتِي العَقَارِيَّة',
      vatNumber: accountSettings.vatNumber || '310458923400003',
      invoiceDate: paymentDate,
      totalWithVat: totalAmount,
      vatAmount: vatAmount,
    });
  }, [
    accountSettings.companyNameAr,
    accountSettings.vatNumber,
    paymentDate,
    totalAmount,
    vatAmount,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    QRCode.toDataURL(zatcaTlvBase64, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch(() => {
        if (isMounted) setQrCodeDataUrl('');
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, zatcaTlvBase64]);

  if (!isOpen) return null;

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
        <div className="print:hidden p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">
              {lang === 'ar'
                ? 'سند قبض وفاتورة ضريبية إلكترونية'
                : 'Official Digital Rent & Tax Receipt'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenAccountSettings && (
              <button
                type="button"
                onClick={onOpenAccountSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer"
                title="تعديل اسم البنك ورقم الآيبان IBAN وبيانات المنشأة"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar' ? 'تعديل بيانات البنك (IBAN)' : 'Edit Bank & IBAN'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'طباعة مباشرة' : 'Print'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloading
                  ? lang === 'ar'
                    ? 'جاري التجهيز...'
                    : 'Preparing...'
                  : lang === 'ar'
                  ? 'حفظ PDF'
                  : 'Save PDF'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL RECEIPT DOCUMENT */}
        <div
          id="official-receipt-print"
          className="p-6 sm:p-8 bg-white text-slate-900 space-y-5 font-sans"
        >
          {/* Official Letterhead Dynamically Populated from AccountSettings */}
          <div className="border-b-2 border-[#0F5A47] pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <MulkiAppIcon className="w-14 h-14 rounded-2xl" />
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0F5A47] tracking-tight">
                  {accountSettings.companyNameAr}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {accountSettings.companyNameEn}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-600 mt-1">
                  <span>
                    س.ت: <strong>{accountSettings.crNumber}</strong>
                  </span>
                  <span>
                    الرقم الضريبي: <strong>{accountSettings.vatNumber}</strong>
                  </span>
                  <span>{accountSettings.cityAddress}</span>
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
              سند قبض إيجار وفاتورة ضريبية إلكترونية
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
                  تحويل بنكي / شبكة مدى (MADA / IBAN)
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
                <span className="font-mono font-bold text-indigo-700">
                  {lease?.lease_number || 'EJ-2026-9041'}
                </span>
              </div>
            </div>
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
                    {transaction?.category_ar || 'دفعة الإيجار الربع سنوية (الدفعة الأولى 2026)'}
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
                    المبلغ الإجمالي المستحق / المثبت دفترياً:
                  </td>
                  <td className="py-3 px-4 text-end font-mono text-base font-black text-[#0F5A47]">
                    {totalAmount.toLocaleString()} ر.س
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* NEW: Official Landlord Bank Account & IBAN Section for Tenant Payments */}
          <div className="p-4 rounded-2xl bg-[#F2F9F3] border-2 border-[#0F5A47]/25 space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/10 pb-2">
              <div className="flex items-center gap-2 font-black text-[#0A4A35]">
                <Landmark className="w-4 h-4 text-[#0F5A47]" />
                <span>
                  بيانات الحساب البنكي المعتمد لتحويل وسداد الإيجارات (Bank Account & IBAN):
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-[#0F5A47] px-2 py-0.5 rounded-md">
                OFFICIAL LANDLORD IBAN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5 space-y-1">
                <div className="text-slate-500 text-[11px]">
                  اسم البنك:{' '}
                  <strong className="text-slate-900 font-black">{accountSettings.bankName}</strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  اسم المستفيد:{' '}
                  <strong className="text-slate-900">{accountSettings.beneficiaryName}</strong>
                </div>
              </div>

              <div className="sm:col-span-7 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-emerald-300 shadow-2xs">
                <div className="text-start">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                    IBAN Number / رقم الآيبان البنكي
                  </span>
                  <span
                    className="font-mono text-xs sm:text-sm font-black text-[#0F5A47] tracking-wider select-all"
                    dir="ltr"
                  >
                    {accountSettings.ibanNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(accountSettings.ibanNumber.replace(/\s+/g, ''));
                    setCopiedIban(true);
                    setTimeout(() => setCopiedIban(false), 2000);
                  }}
                  className="print:hidden px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0F5A47] font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedIban ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ IBAN</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {accountSettings.accountNotes && (
              <div className="text-[11px] text-slate-600 pt-0.5">
                💡 <strong>ملاحظة للمستأجر:</strong> {accountSettings.accountNotes}
              </div>
            )}
          </div>

          {/* Digital QR & Official Stamp Section */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Dynamic TLV Base64 QR Code */}
            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 flex items-center justify-center shrink-0 overflow-hidden">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Invoice TLV QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 2h2v4h-2v-4zm-4 2h2v2h-2v-2zm6-4h2v2h-2v-2z" />
                    </svg>
                  )}
                </div>
                <div className="text-[10px] text-slate-600 leading-tight space-y-1">
                  <span className="font-bold text-[#0F5A47] block text-xs">
                    {lang === 'ar' ? 'رمز الفاتورة المشفر (TLV QR)' : 'Dynamic TLV Base64 QR'}
                  </span>
                  <p>
                    {lang === 'ar'
                      ? 'مشفر ديناميكياً (Base64 TLV): اسم المنشأة، الرقم الضريبي، التاريخ، الإجمالي، ومبلغ الضريبة (15%).'
                      : 'Dynamically encoded TLV Base64: Seller Name, VAT ID, Invoice Date, Total & VAT Amount.'}
                  </p>
                </div>
              </div>

              {/* Base64 TLV String Inspector & Copy */}
              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-1.5">
                <code
                  className="text-[9px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 truncate flex-1 select-all"
                  dir="ltr"
                  title={zatcaTlvBase64}
                >
                  {zatcaTlvBase64}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(zatcaTlvBase64);
                    setCopiedTlv(true);
                    setTimeout(() => setCopiedTlv(false), 2000);
                  }}
                  className="print:hidden px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-[#0F5A47] font-bold text-[9px] shrink-0 cursor-pointer border border-emerald-200"
                  title="Copy TLV Base64 String"
                >
                  {copiedTlv ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : 'Base64'}
                </button>
              </div>
            </div>

            {/* Official Digital Golden Stamp */}
            <div className="text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#0F5A47] p-1 flex items-center justify-center rotate-[-6deg] shadow-xs">
                <div className="w-full h-full rounded-full border border-emerald-600 bg-emerald-50/60 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[8px] font-bold text-slate-700 line-clamp-1">
                    {accountSettings.companyNameAr}
                  </span>
                  <span className="text-[10px] font-black text-[#0F5A47] uppercase tracking-wider">
                    مُعتمد ومُسدّد
                  </span>
                  <span className="text-[7px] text-slate-500 font-mono">PAID & CERTIFIED</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-semibold">الختم الرقمي للمنشأة</span>
            </div>

            {/* Authorized Signature */}
            <div className="text-center sm:text-end space-y-2">
              <span className="text-xs text-slate-500 block">توقيع المحاسب القانوني / المدير المالي</span>
              <div className="font-serif italic text-base text-[#0F5A47] font-bold">
                {accountSettings.financialManagerName || 'A. Al-Mansoor'}
              </div>
              <div className="h-0.5 bg-slate-300 w-32 ms-auto" />
              <span className="text-[10px] text-slate-400 block font-mono">التوقيع الإلكتروني المؤرخ</span>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="text-[10px] text-slate-400 text-center pt-2">
            هذا المستند صادر إلكترونياً من منصة مَحْفَظَتِي العَقَارِيَّة (My Real Estate Portfolio) ومعتمد رسمياً وفقاً لأنظمة التجارة الإلكترونية المعمول بها في المملكة العربية السعودية ودول مجلس التعاون الخليجي.
          </div>
        </div>
      </div>
    </div>
  );
};
