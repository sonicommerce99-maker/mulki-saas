import React, { useState, useMemo } from 'react';
import { Property, Unit, FinancialTransaction, Currency } from '../../types';
import { Language } from '../../locales/translations';
import {
  Receipt,
  Plus,
  Building2,
  Home,
  Wrench,
  Zap,
  ShieldCheck,
  FileText,
  Trash2,
  Filter,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  CheckCircle2,
  Search,
} from 'lucide-react';

interface ExpensesViewProps {
  properties: Property[];
  units: Unit[];
  transactions: FinancialTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  currency: Currency;
  lang: Language;
}

type ExpenseCategoryKey =
  | 'maintenance'
  | 'utilities'
  | 'government_fees'
  | 'cleaning_security'
  | 'management'
  | 'other';

const EXPENSE_CATEGORIES: Record<
  ExpenseCategoryKey,
  { label_ar: string; label_en: string; badgeClass: string; icon: React.ReactNode }
> = {
  maintenance: {
    label_ar: 'صيانة وإصلاحات (تكييف، سباكة، مصاعد)',
    label_en: 'Maintenance & Repairs (HVAC, Plumbing, Elevators)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <Wrench className="w-3.5 h-3.5 text-amber-600" />,
  },
  utilities: {
    label_ar: 'مرافق وفواتير (كهرباء، مياه، إنترنت)',
    label_en: 'Utilities & Bills (Electricity, Water, Internet)',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: <Zap className="w-3.5 h-3.5 text-blue-600" />,
  },
  government_fees: {
    label_ar: 'رسوم حكومية وبلدية وتأمين',
    label_en: 'Government, Municipal & Insurance Fees',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />,
  },
  cleaning_security: {
    label_ar: 'نظافة وحراسة وتشغيل المبنى',
    label_en: 'Cleaning, Security & Building Operations',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <Building2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  management: {
    label_ar: 'رسوم إدارة وأتعاب مكاتب ومحاماة',
    label_en: 'Management, Legal & Brokerage Fees',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: <FileText className="w-3.5 h-3.5 text-indigo-600" />,
  },
  other: {
    label_ar: 'مصاريف عقارية أخرى متنوعة',
    label_en: 'Other Miscellaneous Property Expenses',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: <Receipt className="w-3.5 h-3.5 text-slate-600" />,
  },
};

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  properties,
  units,
  transactions,
  setTransactions,
  currency,
  lang,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccessBanner, setSavedSuccessBanner] = useState(false);

  // Form states for adding a new expense
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || '');
  const [unitId, setUnitId] = useState<string>('');
  const [categoryKey, setCategoryKey] = useState<ExpenseCategoryKey>('maintenance');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [includesVat, setIncludesVat] = useState<boolean>(true);
  const [vendorName, setVendorName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'mada' | 'cash' | 'apple_pay'>('bank_transfer');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const formatCurrency = (val: number) => {
    return (
      new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
        maximumFractionDigits: 0,
      }).format(Math.round(val)) +
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

  // Available units for the selected property in the modal
  const unitsForSelectedProperty = useMemo(() => {
    return units.filter((u) => u.property_id === propertyId);
  }, [units, propertyId]);

  // All expense transactions
  const expenseTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.type === 'expense');
  }, [transactions]);

  // Filtered expense transactions
  const filteredExpenses = useMemo(() => {
    return expenseTransactions.filter((tx) => {
      if (selectedPropertyFilter !== 'all' && tx.property_id !== selectedPropertyFilter) {
        return false;
      }
      if (selectedCategoryFilter !== 'all' && tx.category !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCat =
          (tx.category_ar || '').toLowerCase().includes(q) ||
          (tx.category_en || '').toLowerCase().includes(q);
        const matchProp =
          (tx.property_name_ar || '').toLowerCase().includes(q) ||
          (tx.property_name_en || '').toLowerCase().includes(q);
        const matchUnit = (tx.unit_number || '').toLowerCase().includes(q);
        const matchRef = (tx.reference_number || '').toLowerCase().includes(q);
        const matchNotes = (tx.notes_ar || '').toLowerCase().includes(q);
        return matchCat || matchProp || matchUnit || matchRef || matchNotes;
      }
      return true;
    });
  }, [expenseTransactions, selectedPropertyFilter, selectedCategoryFilter, searchQuery]);

  // Financial Summary Metrics (Revenues vs Expenses -> Net Profit)
  const totalPortfolioRevenue = useMemo(() => {
    const propRevenue = properties.reduce((acc, p) => acc + p.monthly_revenue, 0);
    const txIncome = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.total_amount, 0);
    return propRevenue > 0 ? propRevenue : txIncome;
  }, [properties, transactions]);

  const totalExpensesAmount = useMemo(() => {
    return expenseTransactions.reduce((acc, tx) => acc + tx.total_amount, 0);
  }, [expenseTransactions]);

  const netProfit = totalPortfolioRevenue - totalExpensesAmount;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amountInput);
    if (!numericAmount || numericAmount <= 0) return;

    const targetProperty = properties.find((p) => p.id === propertyId) || properties[0];
    const targetUnit = units.find((u) => u.id === unitId);
    const catInfo = EXPENSE_CATEGORIES[categoryKey];

    const baseAmt = includesVat ? numericAmount / 1.15 : numericAmount;
    const vatAmt = includesVat ? numericAmount - baseAmt : numericAmount * 0.15;
    const totalAmt = includesVat ? numericAmount : numericAmount + vatAmt;

    const newExpenseTx: FinancialTransaction = {
      id: `exp-${Date.now()}`,
      org_id: 'org_aqar_gcc_01',
      property_id: targetProperty?.id || 'prop_01',
      property_name_ar: targetProperty?.name_ar || 'عقار عام',
      property_name_en: targetProperty?.name_en || 'General Property',
      unit_id: targetUnit?.id,
      unit_number: targetUnit?.unit_number,
      type: 'expense',
      category: categoryKey,
      category_ar: customTitle.trim() ? customTitle.trim() : catInfo.label_ar,
      category_en: customTitle.trim() ? customTitle.trim() : catInfo.label_en,
      amount: Number(baseAmt.toFixed(2)),
      base_amount: Number(baseAmt.toFixed(2)),
      vat_rate: 0.15,
      vat_amount: Number(vatAmt.toFixed(2)),
      total_amount: Number(totalAmt.toFixed(2)),
      currency,
      date: expenseDate,
      reference_number: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant_name: vendorName.trim() || (lang === 'ar' ? 'مورد / مقاول صيانة' : 'Maintenance Vendor'),
      payment_method: paymentMethod,
      notes_ar: notes.trim() || catInfo.label_ar,
    };

    setTransactions((prev) => [newExpenseTx, ...prev]);
    setAmountInput('');
    setCustomTitle('');
    setVendorName('');
    setNotes('');
    setUnitId('');
    setIsAddModalOpen(false);
    setSavedSuccessBanner(true);
    setTimeout(() => setSavedSuccessBanner(false), 3500);
  };

  const handleDeleteExpense = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'ar'
                  ? 'إدارة وتتبع المصاريف العقارية والتشغيلية'
                  : 'Property & Unit Expense Tracker'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {lang === 'ar'
                  ? 'تسجيل مصاريف الصيانة، فواتير المرافق، والرسوم مع ربطها المباشر بالعقار والوحدة وحساب صافي الربح تلقائياً'
                  : 'Log maintenance, utility bills, and fees linked to specific properties and units with live Net Profit calculation'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (properties.length > 0 && !propertyId) {
              setPropertyId(properties[0].id);
            }
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تسجيل مصروف عقاري جديد' : 'Add Property Expense'}</span>
        </button>
      </div>

      {savedSuccessBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {lang === 'ar'
              ? 'تم تسجيل المصروف العقاري بنجاح وتحديث صافي الربح في لوحة التحكم!'
              : 'Expense recorded and Net Profit updated across the dashboard!'}
          </span>
        </div>
      )}

      {/* 3 KPI Summary Cards: Total Revenue vs Total Expenses = Net Profit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{lang === 'ar' ? 'إجمالي الإيرادات الشهرية' : 'Total Monthly Revenue'}</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tabular-numbers">
            {formatCurrency(totalPortfolioRevenue)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {lang === 'ar' ? 'إجمالي الدخل من العقارات والعقود النشطة' : 'Gross income across active properties'}
          </div>
        </div>

        {/* Card 2: Total Property Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700">
            <span>{lang === 'ar' ? 'إجمالي المصاريف العقارية المسجلة' : 'Total Logged Property Expenses'}</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 tabular-numbers">
            {formatCurrency(totalExpensesAmount)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              {expenseTransactions.length}{' '}
              {lang === 'ar' ? 'عملية مصروف مسجلة' : 'expense records'}
            </span>
            <span className="font-semibold text-rose-700">
              {lang === 'ar' ? 'صيانة · مرافق · رسوم' : 'Maintenance · Utilities · Fees'}
            </span>
          </div>
        </div>

        {/* Card 3: Net Profit (Revenue - Expenses) */}
        <div className="bg-gradient-to-br from-[#0A4A35] to-[#0F5A47] p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
            <span>
              {lang === 'ar'
                ? 'صافي الربح (الإيرادات - المصاريف)'
                : 'Net Profit (Revenue - Expenses)'}
            </span>
            <span className="p-1.5 rounded-lg bg-white/10 text-amber-300">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300 tabular-numbers">
            {formatCurrency(netProfit)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-100/90 flex items-center justify-between">
            <span>
              {lang === 'ar' ? 'هامش صافي الربح التشغيلي:' : 'Net Profit Margin:'}
            </span>
            <span className="font-mono font-bold bg-white/15 px-2 py-0.5 rounded text-white">
              {totalPortfolioRevenue > 0
                ? `${Math.round((netProfit / totalPortfolioRevenue) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#0F5A47]" />
            <span>{lang === 'ar' ? 'تصفية حسب العقار:' : 'Filter by Property:'}</span>
          </span>
          <select
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-[#0F5A47]"
          >
            <option value="all">{lang === 'ar' ? 'جميع العقارات' : 'All Properties'}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {lang === 'ar' ? p.name_ar : p.name_en}
              </option>
            ))}
          </select>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-[#0F5A47]"
          >
            <option value="all">{lang === 'ar' ? 'جميع تصنيفات المصاريف' : 'All Categories'}</option>
            {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategoryKey[]).map((key) => (
              <option key={key} value={key}>
                {lang === 'ar' ? EXPENSE_CATEGORIES[key].label_ar : EXPENSE_CATEGORIES[key].label_en}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'بحث في المصاريف، رقم الوحدة، المقاول...'
                : 'Search expenses, unit, vendor...'
            }
            className="w-full ps-9 pe-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-[#0F5A47]"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            {lang === 'ar' ? 'سجل المصاريف العقارية التفصيلي' : 'Detailed Property Expenses Log'}
          </h3>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            {filteredExpenses.length} {lang === 'ar' ? 'مصروف' : 'Expenses'}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700">
              {lang === 'ar'
                ? 'لا توجد مصاريف مسجلة مطابقة للبحث الحالي'
                : 'No property expenses found matching your filter'}
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
            >
              {lang === 'ar' ? '+ إضافة أول مصروف عقاري' : '+ Add First Expense'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'التاريخ والمرجع' : 'Date & Ref'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'بيان المصروف والتصنيف' : 'Expense & Category'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'العقار والوحدة المرتبطة' : 'Linked Property & Unit'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المورد / الجهة' : 'Vendor / Payee'}</th>
                  <th className="py-3 px-4 text-end">{lang === 'ar' ? 'المبلغ الأساسي' : 'Base'}</th>
                  <th className="py-3 px-4 text-end">{lang === 'ar' ? 'الضريبة (15%)' : 'VAT 15%'}</th>
                  <th className="py-3 px-4 text-end">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'ar' ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{tx.date}</div>
                        <div className="text-[10px] font-mono text-slate-400">{tx.reference_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {lang === 'ar' ? tx.category_ar : tx.category_en}
                        </div>
                        {tx.notes_ar && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {tx.notes_ar}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#0F5A47] shrink-0" />
                          <span>{lang === 'ar' ? tx.property_name_ar : tx.property_name_en}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Home className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {tx.unit_number
                              ? lang === 'ar'
                                ? `وحدة رقم: ${tx.unit_number}`
                                : `Unit: ${tx.unit_number}`
                              : lang === 'ar'
                              ? 'مصروف عام على العقار بالكامل'
                              : 'Building-wide expense'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">
                          {tx.tenant_name || (lang === 'ar' ? 'مقاول / خدمة صيانة' : 'Service Vendor')}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-400 uppercase">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end font-mono text-slate-600 whitespace-nowrap">
                        {formatCurrency(tx.base_amount || tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-end font-mono text-slate-500 whitespace-nowrap">
                        {formatCurrency(tx.vat_amount)}
                      </td>
                      <td className="py-3 px-4 text-end font-mono font-black text-rose-600 whitespace-nowrap">
                        -{formatCurrency(tx.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={lang === 'ar' ? 'حذف المصروف' : 'Delete Expense'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Property Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    {lang === 'ar' ? 'تسجيل مصروف عقاري جديد' : 'Record New Property Expense'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'ar'
                      ? 'اربط المصروف بالعقار والوحدة ليتم خصمه تلقائياً من صافي الربح'
                      : 'Link expense to property & unit to deduct from Net Profit'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-5 space-y-4 text-xs">
              {/* 1. Property & Unit Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'العقار المرتبط بالمصروف *' : 'Select Property *'}
                  </label>
                  <select
                    required
                    value={propertyId}
                    onChange={(e) => {
                      setPropertyId(e.target.value);
                      setUnitId('');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {lang === 'ar' ? p.name_ar : p.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'الوحدة السكنية/التجارية (اختياري)' : 'Linked Unit (Optional)'}
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  >
                    <option value="">
                      {lang === 'ar' ? '— مصروف عام على العقار بالكامل —' : '— Building-Wide Expense —'}
                    </option>
                    {unitsForSelectedProperty.map((u) => (
                      <option key={u.id} value={u.id}>
                        {lang === 'ar' ? `وحدة ${u.unit_number}` : `Unit ${u.unit_number}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Category & Custom Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'تصنيف المصروف *' : 'Expense Category *'}
                  </label>
                  <select
                    value={categoryKey}
                    onChange={(e) => setCategoryKey(e.target.value as ExpenseCategoryKey)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  >
                    {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategoryKey[]).map((key) => (
                      <option key={key} value={key}>
                        {lang === 'ar'
                          ? EXPENSE_CATEGORIES[key].label_ar
                          : EXPENSE_CATEGORIES[key].label_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'عنوان / بيان المصروف' : 'Expense Title'}
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'مثال: إصلاح تكييف مركزي أو فاتورة كهرباء'
                        : 'e.g. AC Compressor Repair or Water Bill'
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>
              </div>

              {/* 3. Amount, Date & Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? `المبلغ (${currency}) *` : `Amount (${currency}) *`}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="1500"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-black text-rose-600 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'تاريخ المصروف *' : 'Expense Date *'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'طريقة السداد' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  >
                    <option value="bank_transfer">
                      {lang === 'ar' ? 'تحويل بنكي (IBAN)' : 'Bank Transfer'}
                    </option>
                    <option value="mada">{lang === 'ar' ? 'بطاقة مدى / فيزا' : 'Mada / Card'}</option>
                    <option value="cash">{lang === 'ar' ? 'نقداً (كاش)' : 'Cash'}</option>
                    <option value="apple_pay">Apple Pay / STC Pay</option>
                  </select>
                </div>
              </div>

              {/* 4. Vendor & VAT Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'اسم المقاول / شركة الصيانة / الجهة' : 'Vendor / Payee Name'}
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'مثال: شركة الكهرباء / مؤسسة التبريد للصيانة'
                        : 'e.g. National Electricity Co.'
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={includesVat}
                      onChange={(e) => setIncludesVat(e.target.checked)}
                      className="w-4 h-4 accent-[#0F5A47] rounded"
                    />
                    <span className="font-bold text-slate-700">
                      {lang === 'ar'
                        ? 'المبلغ المدخل شامل ضريبة القيمة المضافة (15%)'
                        : 'Amount includes 15% VAT'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'ملاحظات إضافية (رقم الفاتورة / تفاصيل)' : 'Additional Notes'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'أي تفاصيل إضافية حول الصيانة أو الفاتورة...'
                      : 'Optional notes about this expense...'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#0F5A47]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-sm cursor-pointer"
                >
                  {lang === 'ar' ? 'حفظ المصروف وخصمه من صافي الربح' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
