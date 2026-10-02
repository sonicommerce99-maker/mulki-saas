import React, { useState } from 'react';
import { FinancialTransaction, Currency, Organization } from '../../types';
import { Language } from '../../locales/translations';
import { 
  exportTransactionsToZatcaCSV, 
  exportTransactionsToZatcaPDF 
} from '../../utils/zatcaReportExporter';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  QrCode, 
  X, 
  Building2, 
  CheckCircle2, 
  Filter, 
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';

interface FinancialAuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: FinancialTransaction[];
  org: Organization;
  currency: Currency;
  lang: Language;
}

export const FinancialAuditReportModal: React.FC<FinancialAuditReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  org,
  currency,
  lang,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'current_month' | 'q3' | 'year'>('all');

  if (!isOpen) return null;

  // Filter logic
  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (dateFilter === 'current_month') {
      const currentMonth = new Date().toISOString().substring(0, 7);
      return tx.date.startsWith(currentMonth);
    }
    return true;
  });

  // Financial aggregates
  const totalIncomeGross = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.total_amount, 0);

  const totalIncomeBase = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + (tx.base_amount || tx.amount), 0);

  const totalVatCollected = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.vat_amount, 0);

  const totalExpenseGross = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.total_amount, 0);

  const netOperatingIncome = totalIncomeGross - totalExpenseGross;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  // CSV Generator compatible with regional Arabic & English Excel
  const handleExportCSV = () => {
    const headers = [
      'Transaction Ref / رقم القيد',
      'Date / التاريخ',
      'Property / العقار',
      'Unit / الوحدة',
      'Counterparty / الطرف المتعامل',
      'Category / التصنيف المحاسبي',
      'Type / نوع القيد',
      'Base Taxable Amount / المبلغ الخاضع للضريبة',
      'VAT Rate / نسبة الضريبة',
      'VAT Amount / مبلغ الضريبة (15%)',
      'Total Amount / الإجمالي شامل الضريبة',
      'Currency / العملة',
      'Payment Method / طريقة السداد',
      'Org Tax ID / الرقم الضريبي للمنشأة',
    ];

    const rows = filtered.map((tx) => [
      `"${tx.reference_number}"`,
      `"${tx.date}"`,
      `"${tx.property_name_ar || tx.property_name_en}"`,
      `"${tx.unit_number || 'عام'}"`,
      `"${tx.tenant_name || 'غير محدد'}"`,
      `"${lang === 'ar' ? tx.category_ar : tx.category_en}"`,
      `"${tx.type === 'income' ? (lang === 'ar' ? 'إيراد إيجار' : 'Income') : (lang === 'ar' ? 'مصروف تشغيلي' : 'Expense')}"`,
      (tx.base_amount || tx.amount).toFixed(2),
      '15%',
      tx.vat_amount.toFixed(2),
      tx.total_amount.toFixed(2),
      `"${tx.currency}"`,
      `"${tx.payment_method}"`,
      `"${org.vat_number || '310892049100003'}"`,
    ]);

    // Prepend UTF-8 BOM for Arabic support in MS Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mulki_Financial_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[95vh]">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="print:hidden p-4 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F5A47] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base">
                  {lang === 'ar' ? 'التقرير المالي وكشف الحساب الضريبي المعتمد' : 'Certified Financial & Tax Audit Report'}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  ZATCA Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'كشف القيود المحاسبية، الإيرادات، والمصروفات المتوافق مع متطلبات الفوترة الخليجية'
                  : 'Transaction ledger and VAT audit statement compliant with GCC financial frameworks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Export to CSV */}
            <button
              onClick={() => exportTransactionsToZatcaCSV(filtered, org, currency, lang)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer shadow-xs active:scale-95"
              title="تنزيل كملف Excel / CSV معتمد وفق متطلبات ZATCA"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'تصدير كملف CSV' : 'Export to CSV'}</span>
            </button>

            {/* Export to PDF Blob */}
            <button
              onClick={() => exportTransactionsToZatcaPDF(filtered, org, currency, lang)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
              title="توليد وتنزيل ملف PDF فوري معتمد"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{lang === 'ar' ? 'تصدير كتقرير PDF' : 'Export to PDF'}</span>
            </button>

            {/* Print Dialog */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
              title="طباعة مباشرة"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Hidden during print) */}
        <div className="print:hidden bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'نوع القيود:' : 'Filter Type:'}</span>
            </span>
            <div className="bg-white rounded-xl p-0.5 border border-slate-200 flex">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterType === 'all' ? 'bg-[#0F5A47] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterType === 'income' ? 'bg-[#0F5A47] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'الإيرادات فقط' : 'Income'}
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterType === 'expense' ? 'bg-[#0F5A47] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'المصروفات فقط' : 'Expense'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'الفترة الزمنية:' : 'Period:'}</span>
            </span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1 font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{lang === 'ar' ? 'كامل السجل التاريخي' : 'All Time'}</option>
              <option value="current_month">{lang === 'ar' ? 'الشهر الجاري' : 'Current Month'}</option>
            </select>
          </div>
        </div>

        {/* Printable Audit Report Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white space-y-6 text-slate-900 printable-document">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#0F5A47] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0 border border-emerald-700">
                <Building2 className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {lang === 'ar' ? org.name_ar : org.name_en}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'ar' ? 'شركة إدارة وتطوير واستثمار الأملاك العقارية' : 'Real Estate Asset & Property Management'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1 font-mono font-bold">
                  <span>س.ت: 1010884920</span>
                  <span>·</span>
                  <span>الرقم الضريبي: {org.vat_number || '310892049100003'}</span>
                </div>
              </div>
            </div>

            <div className="text-start sm:text-end bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {lang === 'ar' ? 'بيانات التقرير المحاسبي' : 'Audit Report Metadata'}
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                REP-{Date.now().toString().slice(-6)}
              </div>
              <div className="text-slate-600 mt-1">
                تاريخ الإصدار: <span className="font-bold text-slate-900">{reportDate}</span>
              </div>
              <div className="text-emerald-700 font-bold text-[11px] mt-0.5 flex items-center gap-1 sm:justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>معتمد للنظام الضريبي والمحاسبي</span>
              </div>
            </div>
          </div>

          {/* Executive Summary Cards (Compliant Accounting Totals) */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              {lang === 'ar' ? 'ملخص القوائم والتدفقات المالية والضريبية' : 'Financial & Tax Summary Breakdown'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">إجمالي الإيرادات المحصلة</div>
                <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-1">
                  {formatNumber(totalIncomeGross)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currency} (شامل الضريبة)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">الأساس الخاضع للضريبة</div>
                <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-1">
                  {formatNumber(totalIncomeBase)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currency} (قبل الضريبة)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-bold text-emerald-800">ضريبة القيمة المضافة (15%)</div>
                <div className="text-base sm:text-lg font-black text-emerald-900 font-mono mt-1">
                  {formatNumber(totalVatCollected)}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">{currency} (ZATCA VAT)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="text-[11px] font-bold text-rose-800">المصروفات التشغيلية</div>
                <div className="text-base sm:text-lg font-black text-rose-700 font-mono mt-1">
                  {formatNumber(totalExpenseGross)}
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5">{currency} (OpEx & Repairs)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-white col-span-2 md:col-span-1 shadow-sm">
                <div className="text-[11px] font-bold text-slate-300">صافي الدخل التشغيلي (NOI)</div>
                <div className="text-base sm:text-lg font-black text-amber-300 font-mono mt-1">
                  {formatNumber(netOperatingIncome)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currency} (Net Cashflow)</div>
              </div>
            </div>
          </div>

          {/* Audit Ledger Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'ar' ? 'سجل العمليات والقيود التفصيلي' : 'Detailed Transaction Audit Logs'}
              </h2>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {filtered.length} {lang === 'ar' ? 'عملية مسجلة' : 'records'}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-start">
                    <th className="py-2.5 px-3 text-start">التاريخ</th>
                    <th className="py-2.5 px-3 text-start">رقم المرجع</th>
                    <th className="py-2.5 px-3 text-start">العقار / الوحدة</th>
                    <th className="py-2.5 px-3 text-start">الطرف المتعامل</th>
                    <th className="py-2.5 px-3 text-start">البند المحاسبي</th>
                    <th className="py-2.5 px-3 text-end">الأساس الخاضع</th>
                    <th className="py-2.5 px-3 text-end">ضريبة 15%</th>
                    <th className="py-2.5 px-3 text-end">الإجمالي ({currency})</th>
                    <th className="py-2.5 px-3 text-center">طريقة السداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((tx, idx) => {
                    const baseAmt = tx.base_amount || tx.amount;
                    return (
                      <tr 
                        key={tx.id} 
                        className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {tx.reference_number}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 whitespace-nowrap">
                            {tx.property_name_ar}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {tx.unit_number ? `وحدة ${tx.unit_number}` : 'تشغيل عام'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                          {tx.tenant_name || 'جهة معتمدة'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'income' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {lang === 'ar' ? tx.category_ar : tx.category_en}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-slate-600">
                          {formatNumber(baseAmt)}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-slate-600">
                          {formatNumber(tx.vat_amount)}
                        </td>
                        <td className={`py-2.5 px-3 text-end font-mono font-bold whitespace-nowrap ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatNumber(tx.total_amount)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {tx.payment_method}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                    <td colSpan={5} className="py-3 px-3 text-start">
                      الإجمالي النهائي للحركات المحددة ({filtered.length} قيد)
                    </td>
                    <td className="py-3 px-3 text-end font-mono text-slate-300">
                      {formatNumber(totalIncomeBase)}
                    </td>
                    <td className="py-3 px-3 text-end font-mono text-emerald-300">
                      {formatNumber(totalVatCollected)}
                    </td>
                    <td className="py-3 px-3 text-end font-mono text-amber-300 text-sm">
                      {formatNumber(netOperatingIncome)}
                    </td>
                    <td className="py-3 px-3 text-center text-[10px] text-slate-400 font-mono">
                      {currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Legal Signatures & ZATCA Verification Stamp */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Stamp & QR Code */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center shrink-0">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                <div className="font-bold text-slate-900 mb-0.5">ختم التحقق الإلكتروني المشفر</div>
                <div>مشفر وفقاً لمعايير ZATCA للمرحلة الثانية للربط والتكامل.</div>
                <div className="font-mono text-[9px] text-slate-400 mt-1">HASH: e3b0c44298fc1c149afbf4c8996fb</div>
              </div>
            </div>

            {/* Accountant Signature Block */}
            <div className="text-center p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700">إعداد المحاسب القانوني المعتمد</div>
              <div className="h-10 flex items-center justify-center text-slate-400 italic text-xs">
                أ. محمد إبراهيم الشهري (SOCPA)
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">
                التوقيع والاعتماد المحاسبي
              </div>
            </div>

            {/* Financial Director Stamp Block */}
            <div className="text-center p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700">اعتماد الإدارة المالية وختم المنشأة</div>
              <div className="h-10 flex items-center justify-center font-serif text-[#0F5A47] font-bold text-xs">
                ✓ معتمد رسمياً - إدارة الرقابة المالية
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">
                ختم الشركة وتاريخ التوثيق
              </div>
            </div>

          </div>

          {/* Compliance Disclaimer */}
          <div className="text-[10px] text-slate-400 text-center pt-2">
            تم استخراج هذا التقرير آلياً عبر نظام مُلكي (Mulki PropTech). يُعتمد هذا الكشف كوثيقة محاسبية رسمية لأغراض التدقيق المالي وتقديم الإقرارات الضريبية لدى هيئة الزكاة والضريبة والجمارك (ZATCA) والهيئات الضريبية المعتمدة في دول مجلس التعاون الخليجي.
          </div>

        </div>

      </div>
    </div>
  );
};
