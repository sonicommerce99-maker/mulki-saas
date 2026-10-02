import React, { useState } from 'react';
import { Property, Unit, Currency, UnitStatus } from '../../types';
import { Language, translations } from '../../locales/translations';
import { 
  Building, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  Clock, 
  Wrench, 
  User, 
  MapPin, 
  Layers
} from 'lucide-react';

interface PropertiesViewProps {
  properties: Property[];
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  currency: Currency;
  lang: Language;
  onOpenNewTicketForUnit: (unitId: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  units,
  setUnits,
  currency,
  lang,
  onOpenNewTicketForUnit,
}) => {
  const t = translations[lang];
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'vacant' | 'maintenance'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(val) + ' ' + (currency === 'SAR' ? (lang === 'ar' ? 'ر.س' : 'SAR') : currency === 'AED' ? (lang === 'ar' ? 'د.إ' : 'AED') : currency);
  };

  const filteredUnits = units.filter((unit) => {
    if (selectedPropertyId !== 'all' && unit.property_id !== selectedPropertyId) return false;
    if (statusFilter !== 'all' && unit.status !== statusFilter) return false;
    if (searchTerm) {
      const matchNumber = unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTenant = unit.current_tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchNumber && !matchTenant) return false;
    }
    return true;
  });

  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>{lang === 'ar' ? 'مؤجرة' : 'Occupied'}</span>
          </span>
        );
      case 'vacant':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{lang === 'ar' ? 'شاغرة' : 'Vacant'}</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <Wrench className="w-3 h-3 text-rose-600" />
            <span>{lang === 'ar' ? 'تحت الصيانة' : 'Maintenance'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#0F5A47]" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t.navProperties}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'ar' ? 'إدارة شاملة للمباني، المجمعات وتفاصيل كل وحدة سكنية وتجارية' : 'Manage buildings, compounds, and individual leased spaces'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {properties.length} {lang === 'ar' ? 'عقارات' : 'Properties'} · {units.length} {lang === 'ar' ? 'وحدات' : 'Units'}
          </span>
        </div>
      </div>

      {/* Property Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPropertyId('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            selectedPropertyId === 'all'
              ? 'bg-[#0F5A47] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.allProperties} ({units.length})
        </button>

        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPropertyId(p.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedPropertyId === p.id
                ? 'bg-[#0F5A47] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-3 h-3 opacity-70" />
            <span>{lang === 'ar' ? p.name_ar : p.name_en}</span>
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث برقم الوحدة أو اسم المستأجر...' : 'Search by unit # or tenant...'}
            className="w-full text-xs ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F5A47]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'occupied', 'vacant', 'maintenance'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0F5A47] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? (lang === 'ar' ? 'الكل' : 'All') :
               st === 'occupied' ? (lang === 'ar' ? 'مؤجرة' : 'Occupied') :
               st === 'vacant' ? (lang === 'ar' ? 'شاغرة' : 'Vacant') :
               (lang === 'ar' ? 'تحت الصيانة' : 'Maintenance')}
            </button>
          ))}
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            onClick={() => setSelectedUnit(unit)}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-base font-extrabold text-slate-900 font-mono group-hover:text-[#0F5A47] transition-colors">
                    {unit.unit_number}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {lang === 'ar' ? unit.property_name_ar : unit.property_name_en}
                  </span>
                </div>
                {getStatusBadge(unit.status)}
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-3 gap-1 py-2 my-2 border-y border-slate-100 text-[11px] text-center text-slate-600">
                <div>
                  <span className="font-bold text-slate-900 block">{unit.rooms}</span>
                  <span className="text-slate-400">{lang === 'ar' ? 'غرف' : 'Rooms'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{unit.bathrooms}</span>
                  <span className="text-slate-400">{lang === 'ar' ? 'دورات مياه' : 'Baths'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{unit.area_sqm}</span>
                  <span className="text-slate-400">م² / sqm</span>
                </div>
              </div>

              {/* Tenant info */}
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-900 truncate">
                    {unit.current_tenant_name || (lang === 'ar' ? 'جاهزة للإيجار' : 'Available')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom rent & action */}
            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الإيجار الشهري:' : 'Monthly Rent:'}</span>
                <span className="font-bold text-[#0F5A47] text-xs sm:text-sm tabular-numbers">
                  {formatCurrency(unit.monthly_rent)}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNewTicketForUnit(unit.id);
                }}
                className="p-1.5 text-slate-600 hover:text-[#0F5A47] hover:bg-emerald-50 rounded-lg transition-colors"
                title={t.newTicketBtn}
              >
                <Wrench className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
