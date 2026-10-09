import React from 'react';
import { Property, Unit, MaintenanceTicket, Lease, Currency, FinancialTransaction } from '../../types';
import { Language, translations } from '../../locales/translations';
import { MonthlyRevenueExpenseChart } from './MonthlyRevenueExpenseChart';
import { 
  Building, 
  ArrowUpRight, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  MessageSquare, 
  FileText
} from 'lucide-react';

interface OverviewTabProps {
  properties: Property[];
  units: Unit[];
  tickets: MaintenanceTicket[];
  leases: Lease[];
  transactions?: FinancialTransaction[];
  currency: Currency;
  lang: Language;
  onNavigateTab: (tab: string) => void;
  onOpenNewTicket: () => void;
  onOpenLeaseReminder: (lease: Lease) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  properties,
  units,
  tickets,
  leases,
  transactions = [],
  currency,
  lang,
  onNavigateTab,
  onOpenNewTicket,
  onOpenLeaseReminder,
}) => {
  const t = translations[lang];

  // Calculated metrics
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const maintenanceUnits = units.filter(u => u.status === 'maintenance').length;
  const occupancyPercentage = Math.round((occupiedUnits / (totalUnits || 1)) * 100);

  const totalMonthlyIncome = properties.reduce((acc, p) => acc + p.monthly_revenue, 0);
  const totalLoggedExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.total_amount, 0);
  const netProfit = totalMonthlyIncome - totalLoggedExpenses;

  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && t.status !== 'invoiced');
  const activeTickets = tickets.filter(t => t.status !== 'invoiced');

  const overdueLeases = leases.filter(l => l.is_overdue);
  const totalOutstanding = overdueLeases.reduce((acc, l) => acc + l.installment_amount, 0);
  const totalVatEstimated = totalMonthlyIncome * 0.15;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(val) + ' ' + (currency === 'SAR' ? (lang === 'ar' ? 'ر.س' : 'SAR') : currency === 'AED' ? (lang === 'ar' ? 'د.إ' : 'AED') : currency);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome with GCC Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ar' ? 'لوحة المتابعة العقارية الموحدة' : 'Unified Real Estate Portfolio'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'ar' 
              ? 'متابعة حية للمجمعات، الأبراج، عقود الإيجار، وتذاكر الصيانة عبر دول الخليج العربي' 
              : 'Live performance metrics across GCC residential compounds, commercial towers & leases'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newTicketBtn}</span>
          </button>

          <button
            onClick={() => onNavigateTab('leases')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 text-amber-700" />
            <span>{t.collectRentBtn}</span>
          </button>

          <button
            onClick={() => onNavigateTab('expenses')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>🧾</span>
            <span>{lang === 'ar' ? 'المصاريف العقارية' : 'Expenses'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('finance')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>{t.navFinance}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (5 Metrics including Net Profit = Revenue - Expenses) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Portfolio Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t.totalPortfolioRevenue}</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[#0F5A47]">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-numbers">
            {formatCurrency(totalMonthlyIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{t.vatCollected}:</span>
            <span className="font-semibold text-emerald-800 tabular-numbers">
              {formatCurrency(totalVatEstimated)}
            </span>
          </div>
        </div>

        {/* Metric 2: Net Profit (Revenue - Expenses) */}
        <div className="bg-gradient-to-br from-[#0A4A35] to-[#0F5A47] p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
            <span>{lang === 'ar' ? 'صافي الربح (الإيرادات - المصاريف)' : 'Net Profit (Rev - Exp)'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-amber-300 text-[10px] font-mono">
              NOI
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300 tabular-numbers">
            {formatCurrency(netProfit)}
          </div>
          <div className="mt-2 text-xs text-emerald-100 flex items-center justify-between border-t border-white/15 pt-2">
            <span>{lang === 'ar' ? 'المصاريف:' : 'Expenses:'} {formatCurrency(totalLoggedExpenses)}</span>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-bold text-amber-300 hover:underline cursor-pointer"
            >
              {lang === 'ar' ? 'التفاصيل' : 'View'}
            </button>
          </div>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t.occupancyRate}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {occupancyPercentage}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-numbers">
            {occupiedUnits} <span className="text-sm font-normal text-slate-500">/ {totalUnits} {lang === 'ar' ? 'وحدة' : 'Units'}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-amber-700">{vacantUnits} {t.vacantUnits}</span>
            <span>·</span>
            <span className="text-blue-700">{maintenanceUnits} {t.maintenanceUnits}</span>
          </div>
        </div>

        {/* Metric 3: Outstanding Rent (Alert Card) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t.outstandingRent}</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 tabular-numbers">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="font-medium text-rose-700">
              {overdueLeases.length} {lang === 'ar' ? 'عقود متأخرة الدفع' : 'Overdue Leases'}
            </span>
            <button
              onClick={() => onNavigateTab('leases')}
              className="text-xs font-bold text-[#0F5A47] hover:underline"
            >
              {lang === 'ar' ? 'إرسال تذكير' : 'Trigger Alert'}
            </button>
          </div>
        </div>

        {/* Metric 4: Active Maintenance Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t.activeTickets}</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-numbers">
            {activeTickets.length} <span className="text-sm font-normal text-slate-500">{lang === 'ar' ? 'تذكرة نشطة' : 'Active'}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-rose-600 font-semibold">
              {urgentTickets.length} {lang === 'ar' ? 'طارئة / تكييف' : 'Urgent / HVAC'}
            </span>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs font-bold text-[#0F5A47] hover:underline"
            >
              {lang === 'ar' ? 'متابعة' : 'Manage'}
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Recharts Monthly Revenue vs Expenses & Previous Month Comparison */}
      <MonthlyRevenueExpenseChart
        lang={lang}
        currency={currency}
        properties={properties}
        transactions={transactions}
        variant="portfolio"
      />

      {/* Properties Grid with High-Fidelity GCC Generated Assets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#0F5A47]" />
            <span>{lang === 'ar' ? 'العقارات والمجمعات الاستثمارية' : 'Managed Properties & Portfolios'}</span>
          </h2>
          <button
            onClick={() => onNavigateTab('properties')}
            className="text-xs font-semibold text-[#0F5A47] hover:underline"
          >
            {lang === 'ar' ? 'عرض تفاصيل كافة الوحدات' : 'View all units'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              {/* Property Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={property.image_url}
                  alt={lang === 'ar' ? property.name_ar : property.name_en}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 end-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {lang === 'ar' ? property.city_ar : property.city_en} · {lang === 'ar' ? property.district_ar : property.district_en}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                    {lang === 'ar' ? property.name_ar : property.name_en}
                  </h3>
                  
                  {/* Occupancy stats bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>{t.occupancyRate}</span>
                      <span className="font-bold text-slate-900 tabular-numbers">
                        {Math.round((property.occupied_units / property.total_units) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-[#0F5A47] h-full"
                        style={{ width: `${(property.occupied_units / property.total_units) * 100}%` }}
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${(property.vacant_units / property.total_units) * 100}%` }}
                      />
                      <div
                        className="bg-rose-400 h-full"
                        style={{ width: `${(property.maintenance_units / property.total_units) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Units breakdown info */}
                  <div className="mt-3 grid grid-cols-3 text-center border-y border-slate-100 py-2 text-xs">
                    <div>
                      <span className="block font-bold text-emerald-800 tabular-numbers">{property.occupied_units}</span>
                      <span className="text-slate-500">{lang === 'ar' ? 'مؤجرة' : 'Occupied'}</span>
                    </div>
                    <div className="border-x border-slate-100">
                      <span className="block font-bold text-amber-700 tabular-numbers">{property.vacant_units}</span>
                      <span className="text-slate-500">{lang === 'ar' ? 'شاغرة' : 'Vacant'}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 tabular-numbers">{property.maintenance_units}</span>
                      <span className="text-slate-500">{lang === 'ar' ? 'صيانة' : 'Maint.'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    <span>{lang === 'ar' ? 'الدخل الشهري:' : 'Monthly Income:'}</span>
                    <span className="block font-bold text-[#0F5A47] text-sm tabular-numbers">
                      {formatCurrency(property.monthly_revenue)}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateTab('properties')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {lang === 'ar' ? 'إدارة الوحدات' : 'Manage Units'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Recent Critical Maintenance Tickets & Urgent Rent Due */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Column 1: Live Maintenance Pipeline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>{lang === 'ar' ? 'أحدث بلاغات الصيانة العاجلة' : 'Recent Maintenance Requests'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ar' ? 'تتبع لحظي من مرحلة الطلب إلى إنهاء الصيانة' : 'Real-time progression from dispatch to repair'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs font-bold text-[#0F5A47] hover:underline"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View all'}
            </button>
          </div>

          <div className="space-y-3">
            {tickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onNavigateTab('maintenance')}
                className="p-3.5 rounded-xl border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                      <span className="font-mono text-slate-700 font-bold">{ticket.ticket_number}</span>
                      <span>·</span>
                      <span>{ticket.unit_number}</span>
                      <span>·</span>
                      <span>{lang === 'ar' ? ticket.property_name_ar : ticket.property_name_en}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
                      {lang === 'ar' ? ticket.title_ar : ticket.title_en}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {lang === 'ar' ? ticket.description_ar : ticket.description_en}
                    </p>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-1 rounded-md shrink-0 ${
                    ticket.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : ticket.status === 'requested'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : ticket.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ticket.status === 'requested' ? t.statusRequested :
                     ticket.status === 'in_progress' ? t.statusInProgress :
                     ticket.status === 'completed' ? t.statusCompleted : t.statusInvoiced}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>{lang === 'ar' ? 'الفني:' : 'Tech:'} <strong className="text-slate-700">{ticket.assigned_technician_name}</strong></span>
                  <span className="tabular-numbers">{ticket.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Rent Collection Action Board (WhatsApp ready) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0F5A47]" />
                <span>{lang === 'ar' ? 'استحقاقات الإيجار والتذكيرات' : 'Upcoming & Overdue Rent'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ar' ? 'تنبيهات فورية للمستأجرين عبر WhatsApp' : 'Direct WhatsApp payment triggers'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('leases')}
              className="text-xs font-bold text-[#0F5A47] hover:underline"
            >
              {lang === 'ar' ? 'إدارة العقود' : 'All leases'}
            </button>
          </div>

          <div className="space-y-3">
            {leases.slice(0, 3).map((lease) => (
              <div
                key={lease.id}
                className="p-3.5 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono text-slate-700 font-semibold">{lease.lease_number}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-900">{lease.unit_number}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                    {lang === 'ar' ? lease.tenant_name_ar : lease.tenant_name_en}
                  </h4>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>{lang === 'ar' ? 'الاستحقاق:' : 'Due:'} <strong className="tabular-numbers text-slate-700">{lease.next_due_date}</strong></span>
                    <span>·</span>
                    <span className={lease.is_overdue ? 'text-rose-600 font-bold' : 'text-emerald-700 font-medium'}>
                      {lease.is_overdue 
                        ? (lang === 'ar' ? `متأخر ${lease.overdue_days} يوم` : `${lease.overdue_days}d overdue`)
                        : (lang === 'ar' ? `متبقي ${lease.days_until_due} يوم` : `${lease.days_until_due}d left`)}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-0 border-slate-100 pt-2 sm:pt-0">
                  <span className="font-bold text-slate-900 tabular-numbers text-sm">
                    {formatCurrency(lease.installment_amount)}
                  </span>
                  
                  <button
                    onClick={() => onOpenLeaseReminder(lease)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-[#0F5A47] hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'ar' ? 'تذكير واتساب' : 'WhatsApp'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
