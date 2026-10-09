import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { Property, FinancialTransaction } from '../../types';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Building, 
  ShieldCheck, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Wallet,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface InvestorPortalViewProps {
  lang: Language;
  properties: Property[];
  transactions: FinancialTransaction[];
}

export const InvestorPortalView: React.FC<InvestorPortalViewProps> = ({
  lang,
  properties,
  transactions,
}) => {
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Financial calculations for the investor portfolio
  const portfolioTotalValue = 42500000; // 42.5M SAR
  const monthlyGrossIncome = 285000;
  const monthlyMaintenanceOpEx = 18450;
  const managementFee = 14250; // 5% property management commission
  const monthlyNetCashDistributed = monthlyGrossIncome - monthlyMaintenanceOpEx - managementFee; // 252,300 SAR
  const annualNetYield = 8.4; // 8.4% Net Yield

  const handleDownloadStatement = () => {
    setDownloadingReport(true);
    setTimeout(() => {
      setDownloadingReport(false);
      window.print();
    }, 700);
  };

  return (
    <div className="space-y-6">
      
      {/* Investor Profile & Luxury Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0F5A47] to-[#147a61] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
            ف
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {lang === 'ar' ? 'بوابة كبار الملاك والمستثمرين VIP' : 'VIP Investor Portal'}
              </span>
              <span className="text-xs text-emerald-200">محفظة الأصول العقارية المدارة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              {lang === 'ar' ? 'الشيخ فهد بن عبدالعزيز آل راشد' : 'Sheikh Fahad Al-Rashid'}
            </h1>
            <p className="text-xs text-emerald-100 mt-0.5">
              {lang === 'ar'
                ? 'الحساب البنكي المعتمد للتحويل: مصرف الراجحي (SA42 8000 0201 4590 1120 0019)'
                : 'Registered Payout IBAN: Al Rajhi Bank'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownloadStatement}
          disabled={downloadingReport}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-emerald-50 text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-70 shrink-0"
        >
          <Download className="w-4 h-4 text-[#0F5A47]" />
          <span>{downloadingReport ? (lang === 'ar' ? 'جاري تجهيز الكشف...' : 'Generating...') : (lang === 'ar' ? 'تحميل كشف حساب المالك PDF' : 'Download Owner Statement')}</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{lang === 'ar' ? 'إجمالي قيمة الأصول العقارية' : 'Portfolio Asset Value'}</span>
            <Building className="w-4 h-4 text-[#0F5A47]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {portfolioTotalValue.toLocaleString()} <span className="text-xs font-sans text-slate-500">ر.س</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% ارتفاع تقييم الأصول مقارنة بالعام السابق</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{lang === 'ar' ? 'صافي العائد الاستثماري السنوي' : 'Net Rental Yield'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {annualNetYield}% <span className="text-xs font-sans text-slate-500">سنوياً</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <span>أعلى من متوسط السوق العقاري بـ 1.8 نقطة</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{lang === 'ar' ? 'صافي الأرباح المحولة لحسابك هذا الشهر' : 'Net Monthly Cashflow'}</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#0F5A47] font-mono">
            {monthlyNetCashDistributed.toLocaleString()} <span className="text-xs font-sans text-slate-500">ر.س</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم التحويل بنجاح في 28-09-2026</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{lang === 'ar' ? 'متوسط نسبة الإشغال للمحفظة' : 'Average Occupancy'}</span>
            <PieChart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            96.8%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            150 من أصل 154 وحدة مأهولة بالكامل
          </div>
        </div>

      </div>

      {/* Monthly Statement Breakdown Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {lang === 'ar' ? 'كشف حساب المالك الشهري المفصل (سبتمبر 2026)' : 'September 2026 Owner Statement Ledger'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'توزيع الإيرادات المحصلة، فواتير الصيانة المعتمدة، وعمولة الإدارة' : 'Collected gross rent, certified maintenance OpEx, and 5% management fees'}
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {lang === 'ar' ? 'كشف مالي معتمد' : 'Verified Statement'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5 text-start">العقار والأصل</th>
                <th className="py-3 px-5 text-center">الوحدات والإشغال</th>
                <th className="py-3 px-5 text-end">إجمالي الإيجارات المحصلة</th>
                <th className="py-3 px-5 text-end">مصروفات الصيانة والتشغيل</th>
                <th className="py-3 px-5 text-end">عمولة الإدارة (5%)</th>
                <th className="py-3 px-5 text-end">صافي المحول للمالك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {properties.map((property) => {
                const propertyRent = property.id === 'prop-1' ? 140000 : property.id === 'prop-2' ? 115000 : 30000;
                const propertyOpEx = property.id === 'prop-1' ? 8200 : property.id === 'prop-2' ? 7600 : 2650;
                const propFee = propertyRent * 0.05;
                const propNet = propertyRent - propertyOpEx - propFee;

                return (
                  <tr key={property.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {lang === 'ar' ? property.name_ar : property.name_en}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lang === 'ar' ? property.city_ar : property.city_en} · {lang === 'ar' ? property.district_ar : property.district_en}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                        {property.total_units} وحدة (96%)
                      </span>
                    </td>

                    <td className="py-4 px-5 text-end font-mono font-bold text-slate-900">
                      {propertyRent.toLocaleString()} ر.س
                    </td>

                    <td className="py-4 px-5 text-end font-mono text-rose-600 font-semibold">
                      - {propertyOpEx.toLocaleString()} ر.س
                    </td>

                    <td className="py-4 px-5 text-end font-mono text-slate-500">
                      - {propFee.toLocaleString()} ر.س
                    </td>

                    <td className="py-4 px-5 text-end font-mono font-black text-[#0F5A47] text-sm">
                      {propNet.toLocaleString()} ر.س
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t-2 border-slate-200">
              <tr>
                <td colSpan={2} className="py-3 px-5 text-slate-900 font-extrabold text-sm">
                  المجموع الإجمالي المحول لحساب الشيخ فهد:
                </td>
                <td className="py-3 px-5 text-end font-mono font-black text-slate-900">
                  {monthlyGrossIncome.toLocaleString()} ر.س
                </td>
                <td className="py-3 px-5 text-end font-mono text-rose-700">
                  - {monthlyMaintenanceOpEx.toLocaleString()} ر.س
                </td>
                <td className="py-3 px-5 text-end font-mono text-slate-600">
                  - {managementFee.toLocaleString()} ر.س
                </td>
                <td className="py-3 px-5 text-end font-mono text-base font-black text-[#0F5A47]">
                  {monthlyNetCashDistributed.toLocaleString()} ر.س
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
