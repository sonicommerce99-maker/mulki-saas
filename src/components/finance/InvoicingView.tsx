import React, { useState, useEffect } from 'react';
import { FinancialTransaction, Currency, Organization, Unit } from '../../types';
import { Language, translations } from '../../locales/translations';
import { FinancialAuditReportModal } from './FinancialAuditReportModal';
import { loadAccountSettings, LandlordAccountSettings } from '../../lib/accountSettings';
import { 
  exportTransactionsToZatcaCSV, 
  exportTransactionsToZatcaPDF,
  exportSingleTransactionInvoicePDF
} from '../../utils/zatcaReportExporter';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Printer, 
  QrCode, 
  X, 
  Check, 
  Building2, 
  FileText,
  FileSpreadsheet,
  Download,
  Landmark,
  Settings
} from 'lucide-react';

interface InvoicingViewProps {
  transactions: FinancialTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  org: Organization;
  units: Unit[];
  currency: Currency;
  lang: Language;
  onOpenAccountSettings?: () => void;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({
  transactions,
  setTransactions,
  org,
  units,
  currency,
  lang,
  onOpenAccountSettings,
}) => {
  const t = translations[lang];
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [activeInvoice, setActiveInvoice] = useState<FinancialTransaction | null>(null);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isAuditReportModalOpen, setIsAuditReportModalOpen] = useState(false);
  const [accountSettings, setAccountSettings] = useState<LandlordAccountSettings>(loadAccountSettings());

  useEffect(() => {
    const handleUpdated = () => setAccountSettings(loadAccountSettings());
    window.addEventListener('account-settings-updated', handleUpdated);
    return () => window.removeEventListener('account-settings-updated', handleUpdated);
  }, []);

  // New Transaction Form state
  const [newTxType, setNewTxType] = useState<'income' | 'expense'>('income');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || '');
  const [newTenantName, setNewTenantName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredTx = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.total_amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.total_amount, 0);

  const netCashflow = totalIncome - totalExpense;

  const totalVat = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.vat_amount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 2,
    }).format(val) + ' ' + (currency === 'SAR' ? (lang === 'ar' ? 'ر.س' : 'SAR') : currency === 'AED' ? (lang === 'ar' ? 'د.إ' : 'AED') : currency);
  };

  const handleCreateTx = () => {
    const amt = parseFloat(newAmount) || 0;
    if (amt <= 0) return;

    const unit = units.find((u) => u.id === newUnitId) || units[0];
    const vatRate = 0.15;
    const base = Number((amt / (1 + vatRate)).toFixed(2));
    const vat = Number((amt - base).toFixed(2));

    const newTx: FinancialTransaction = {
      id: `tx_${Date.now()}`,
      org_id: org.id,
      property_id: unit.property_id,
      property_name_ar: unit.property_name_ar,
      property_name_en: unit.property_name_en,
      unit_id: unit.id,
      unit_number: unit.unit_number,
      type: newTxType,
      category_ar: newCategory || (newTxType === 'income' ? 'تحصيل إيجار' : 'مصروفات صيانة وتشغيل'),
      category_en: newCategory || (newTxType === 'income' ? 'Rental Income' : 'Maintenance OpEx'),
      amount: base,
      vat_rate: vatRate,
      vat_amount: vat,
      total_amount: amt,
      currency: currency,
      date: new Date().toISOString().substring(0, 10),
      reference_number: `TX-${Date.now().toString().slice(-6)}`,
      tenant_name: newTenantName || unit.current_tenant_name,
      payment_method: 'mada',
      notes_ar: newNotes,
    };

    setTransactions([newTx, ...transactions]);
    setIsNewTxModalOpen(false);
    setNewAmount('');
    setNewCategory('');
    setNewNotes('');
  };

  const handlePrint = () => {
    window.print();
  };

  // ZATCA-compliant Data-to-Blob CSV Downloader
  const handleExportCSV = () => {
    exportTransactionsToZatcaCSV(filteredTx, org, currency, lang);
  };

  // ZATCA-compliant Data-to-Blob PDF Downloader
  const handleExportPDF = () => {
    exportTransactionsToZatcaPDF(filteredTx, org, currency, lang);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#0F5A47]" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t.financeTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.financeSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAccountSettings && (
            <button
              onClick={onOpenAccountSettings}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              title="إدخال وتعديل اسم البنك ورقم الآيبان IBAN الذي يظهر للمستأجرين في الفواتير"
            >
              <Landmark className="w-4 h-4 text-slate-950" />
              <span>{lang === 'ar' ? 'إعدادات الحساب البنكي (IBAN)' : 'Bank & IBAN Settings'}</span>
            </button>
          )}

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer group active:scale-95"
            title={lang === 'ar' ? 'تصدير السجل المالي والضريبي كملف CSV' : 'Export financial and tax ledger to CSV'}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>{lang === 'ar' ? 'تصدير كملف CSV' : 'Export to CSV'}</span>
          </button>

          {/* Export to PDF Button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-xs transition-all cursor-pointer group active:scale-95"
            title={lang === 'ar' ? 'توليد وتنزيل تقرير مالي وضريبي PDF' : 'Generate and download financial tax report PDF'}
          >
            <Download className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
            <span>{lang === 'ar' ? 'تصدير كتقرير PDF' : 'Export to PDF'}</span>
          </button>

          {/* Detailed Audit Statement Modal Preview */}
          <button
            onClick={() => setIsAuditReportModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
            title="معاينة كشف الحساب والتقرير الشامل للطباعة"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{lang === 'ar' ? 'معاينة التقرير' : 'Preview Report'}</span>
          </button>

          {/* New Transaction Button */}
          <button
            onClick={() => setIsNewTxModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل قيد مالي' : 'Log Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{lang === 'ar' ? 'إجمالي الإيرادات المحصلة' : 'Total Collected Income'}</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-numbers">
            {formatCurrency(totalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {lang === 'ar' ? 'شامل عقود الإيجار والخدمات' : 'Leases and service fees'}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t.expensesMonth}</span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-700">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 tabular-numbers">
            {formatCurrency(totalExpense)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {lang === 'ar' ? 'صيانة، فواتير تشغيل، عقود صيانة' : 'Repairs, utilities and contractors'}
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t.netOperatingIncome}</span>
            <span className="text-xs font-bold text-[#0F5A47]">NOI</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F5A47] tabular-numbers">
            {formatCurrency(netCashflow)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {lang === 'ar' ? 'الفائض النقدي التشغيلي الصافي' : 'Net operational cash balance'}
          </div>
        </div>

        {/* VAT Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t.vatCollected}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">15% VAT</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-numbers">
            {formatCurrency(totalVat)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {lang === 'ar' ? 'إجمالي ضريبة القيمة المضافة المحتسبة (15%)' : 'Calculated 15% Value Added Tax'}
          </div>
        </div>

      </div>

      {/* Filter Tabs & Quick Table Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'income', 'expense'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === filter
                  ? 'bg-[#0F5A47] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter === 'all' ? (lang === 'ar' ? 'كافة القيود' : 'All Entries') :
               filter === 'income' ? (lang === 'ar' ? 'الإيرادات والسندات' : 'Income') :
               (lang === 'ar' ? 'المصروفات والتكاليف' : 'Expenses')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>{lang === 'ar' ? `المعروض: ${filteredTx.length} قيد محاسبي` : `Showing: ${filteredTx.length} records`}</span>
          <span className="text-slate-300">·</span>
          <button
            onClick={handleExportCSV}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            title="Export to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
          <span className="text-slate-300">·</span>
          <button
            onClick={handleExportPDF}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            title="Export to PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to PDF</span>
          </button>
          <span className="text-slate-300">·</span>
          <button
            onClick={() => setIsAuditReportModalOpen(true)}
            className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'معاينة التقرير' : 'Preview Report'}</span>
          </button>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'رقم السند / الفاتورة' : 'Ref #'}</th>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'البيان والتصنيف' : 'Description'}</th>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الوحدة والعقار' : 'Unit & Property'}</th>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المبلغ الأساسي' : 'Base'}</th>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الضريبة (15%)' : 'VAT (15%)'}</th>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الفاتورة الضريبية' : 'Invoice'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Ref # & Date */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{tx.reference_number}</span>
                    <span className="text-[11px] text-slate-400 tabular-numbers">{tx.date}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{lang === 'ar' ? tx.category_ar : tx.category_en}</span>
                    </div>
                    {tx.tenant_name && (
                      <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                        {tx.tenant_name}
                      </span>
                    )}
                  </td>

                  {/* Unit & Property */}
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="font-bold text-slate-900">{tx.unit_number || 'عام'}</span>
                    <span className="block text-[11px] text-slate-500">{lang === 'ar' ? tx.property_name_ar : tx.property_name_en}</span>
                  </td>

                  {/* Base Amount */}
                  <td className="py-3.5 px-4 tabular-numbers text-slate-600">
                    {formatCurrency(tx.amount)}
                  </td>

                  {/* VAT Amount */}
                  <td className="py-3.5 px-4 tabular-numbers text-emerald-800 font-medium">
                    {formatCurrency(tx.vat_amount)}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 tabular-numbers font-bold text-slate-900">
                    <span className={tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.total_amount)}
                    </span>
                  </td>

                  {/* Invoice Modal Trigger & Direct Download PDF Button */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setActiveInvoice(tx)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#0F5A47] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'عرض الفاتورة' : 'Invoice'}</span>
                      </button>

                      <button
                        onClick={() => exportSingleTransactionInvoicePDF(tx, org, currency, accountSettings)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'تحميل ملخص الفاتورة الضريبية PDF' : 'Download Tax Invoice Summary PDF'}
                      >
                        <Download className="w-3.5 h-3.5 text-[#0F5A47]" />
                        <span>{lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Electronic Tax Invoice Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Actions Bar (Not printed) */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#0F5A47]" />
                <span>{lang === 'ar' ? 'معاينة الفاتورة الضريبية الإلكترونية (Tax e-Invoice)' : 'Electronic Tax Invoice Preview'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportSingleTransactionInvoicePDF(activeInvoice, org, currency, accountSettings)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-lg shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printInvoice}</span>
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-900 bg-white" id="printable-tax-invoice">
              
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-[#0F5A47]" />
                    <h2 className="text-lg font-extrabold text-slate-900">{accountSettings.companyNameAr || org.name_ar}</h2>
                  </div>
                  <p className="text-xs text-slate-600">{accountSettings.companyNameEn || org.name_en}</p>
                  <div className="text-xs text-slate-500 pt-1 space-y-0.5">
                    <div>السجل التجاري (CR): <strong className="font-mono text-slate-900">{accountSettings.crNumber || org.cr_number}</strong></div>
                    <div>الرقم الضريبي (VAT ID): <strong className="font-mono text-slate-900">{accountSettings.vatNumber || org.vat_number}</strong></div>
                    <div>{accountSettings.cityAddress || org.address_ar}</div>
                  </div>
                </div>

                {/* Digital QR Code Visual */}
                <div className="flex flex-col items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-24 h-24 bg-white border border-slate-300 p-1 rounded-lg flex items-center justify-center relative">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0F5A47] mt-1 uppercase tracking-wider">Digital QR</span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">{t.taxInvoice}</span>
                  <span className="font-mono font-bold text-base text-slate-900">{activeInvoice.reference_number}</span>
                  <span className="block text-slate-500 mt-1">تاريخ الإصدار: <strong className="tabular-numbers text-slate-900">{activeInvoice.date}</strong></span>
                </div>
                <div>
                  <span className="text-slate-500 block">{t.buyerInfo}</span>
                  <span className="font-bold text-slate-900 text-sm">{activeInvoice.tenant_name || 'عميل نقدي'}</span>
                  <span className="block text-slate-500 mt-1">الوحدة: {activeInvoice.unit_number} ({activeInvoice.property_name_ar})</span>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 text-start">البند / Description</th>
                    <th className="py-2.5 px-3 text-center">الكمية</th>
                    <th className="py-2.5 px-3 text-start">{t.baseAmount}</th>
                    <th className="py-2.5 px-3 text-start">{t.vatRate}</th>
                    <th className="py-2.5 px-3 text-start">{t.vatAmount}</th>
                    <th className="py-2.5 px-3 text-end">{t.totalWithVat}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-3">
                      <strong className="text-slate-900">{activeInvoice.category_ar}</strong>
                      <span className="block text-slate-500 text-[11px]">{activeInvoice.property_name_ar} - وحدة {activeInvoice.unit_number}</span>
                    </td>
                    <td className="py-3 px-3 text-center tabular-numbers">1</td>
                    <td className="py-3 px-3 tabular-numbers">{formatCurrency(activeInvoice.amount)}</td>
                    <td className="py-3 px-3 tabular-numbers">15%</td>
                    <td className="py-3 px-3 tabular-numbers font-semibold text-emerald-800">{formatCurrency(activeInvoice.vat_amount)}</td>
                    <td className="py-3 px-3 tabular-numbers text-end font-bold text-slate-900">{formatCurrency(activeInvoice.total_amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals Summary Card */}
              <div className="flex justify-end">
                <div className="w-64 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>الإجمالي قبل الضريبة:</span>
                    <span className="font-mono tabular-numbers font-semibold">{formatCurrency(activeInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span className="font-mono tabular-numbers font-bold">{formatCurrency(activeInvoice.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-300 pt-2">
                    <span>الإجمالي النهائي المستحق:</span>
                    <span className="font-mono tabular-numbers text-[#0F5A47]">{formatCurrency(activeInvoice.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Landlord Bank Account & IBAN Box on Tax Invoice */}
              <div className="p-3.5 rounded-2xl bg-[#F2F9F3] border border-[#0F5A47]/25 text-xs space-y-1.5">
                <div className="font-black text-[#0A4A35] flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#0F5A47]" />
                  <span>بيانات الحساب البنكي المعتمد لسداد الفاتورة (Bank Account & IBAN):</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="text-slate-700">
                    <span>البنك: <strong>{accountSettings.bankName}</strong></span>
                    <span className="mx-2">·</span>
                    <span>المستفيد: <strong>{accountSettings.beneficiaryName}</strong></span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white border border-emerald-300 font-mono font-black text-[#0F5A47]" dir="ltr">
                    {accountSettings.ibanNumber}
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
                {lang === 'ar'
                  ? 'فاتورة ضريبية مبسطة وسند مالي صادر إلكترونياً عبر منصة مَحْفَظَتِي العَقَارِيَّة (شامل حساب ضريبة القيمة المضافة 15%).'
                  : 'Electronic tax invoice and financial voucher generated by My Real Estate Portfolio (including 15% VAT calculation).'}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* New Transaction Logging Modal */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'ar' ? 'تسجيل معاملة مالية وسند قبض/صرف' : 'Log Financial Transaction'}
              </h3>
              <button onClick={() => setIsNewTxModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewTxType('income')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  newTxType === 'income'
                    ? 'bg-emerald-50 text-[#0F5A47] border-[#0F5A47]'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {lang === 'ar' ? 'إيراد / سند قبض' : 'Income'}
              </button>
              <button
                type="button"
                onClick={() => setNewTxType('expense')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  newTxType === 'expense'
                    ? 'bg-rose-50 text-rose-700 border-rose-400'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {lang === 'ar' ? 'مصروف / سند صرف' : 'Expense'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'الوحدة المرتبطة:' : 'Unit:'}
              </label>
              <select
                value={newUnitId}
                onChange={(e) => setNewUnitId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white text-slate-900"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_number} - {u.property_name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'بيان المعاملة أو الصرف:' : 'Category / Description:'}
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={newTxType === 'income' ? 'تحصيل دفعة إيجار ربع سنوية' : 'صيانة مضخات مياه'}
                className="w-full text-xs border border-slate-300 rounded-xl p-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? `المبلغ الإجمالي شامل الضريبة (${currency}):` : `Grand Total (${currency}):`}
              </label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="15000"
                className="w-full text-xs font-mono font-bold border border-slate-300 rounded-xl p-2 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewTxModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateTx}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-lg shadow-xs"
              >
                {lang === 'ar' ? 'حفظ وإصدار السند' : 'Record Entry'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Certified Financial & Tax Audit Report Modal (PDF / CSV) */}
      <FinancialAuditReportModal
        isOpen={isAuditReportModalOpen}
        onClose={() => setIsAuditReportModalOpen(false)}
        transactions={transactions}
        org={org}
        currency={currency}
        lang={lang}
      />

    </div>
  );
};
