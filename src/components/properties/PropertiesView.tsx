import React, { useState } from 'react';
import { Property, Unit, Currency, UnitStatus } from '../../types';
import { Language, translations } from '../../locales/translations';
import {
  Building,
  Search,
  Plus,
  CheckCircle,
  Clock,
  Wrench,
  User,
  MapPin,
  X,
  Building2,
} from 'lucide-react';

interface PropertiesViewProps {
  properties: Property[];
  setProperties?: React.Dispatch<React.SetStateAction<Property[]>>;
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  currency: Currency;
  lang: Language;
  onOpenNewTicketForUnit: (unitId: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  setProperties,
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

  // Add Property Modal State
  const [isAddPropOpen, setIsAddPropOpen] = useState(false);
  const [propNameAr, setPropNameAr] = useState('');
  const [propCityAr, setPropCityAr] = useState('الرياض');
  const [propDistrictAr, setPropDistrictAr] = useState('');
  const [propType, setPropType] = useState<'residential_compound' | 'tower' | 'commercial_plaza'>('residential_compound');

  // Add Unit Modal State
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [unitPropId, setUnitPropId] = useState(properties[0]?.id || '');
  const [unitNumber, setUnitNumber] = useState('');
  const [unitRooms, setUnitRooms] = useState('3');
  const [unitBaths, setUnitBaths] = useState('2');
  const [unitArea, setUnitArea] = useState('140');
  const [unitRent, setUnitRent] = useState('4500');
  const [unitStatus, setUnitStatus] = useState<UnitStatus>('vacant');
  const [unitTenantName, setUnitTenantName] = useState('');

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

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propNameAr.trim() || !setProperties) return;
    const newProp: Property = {
      id: `prop-${Date.now()}`,
      org_id: 'org-1',
      name_ar: propNameAr.trim(),
      name_en: propNameAr.trim(),
      type: propType,
      city_ar: propCityAr.trim() || 'الرياض',
      city_en: propCityAr.trim() || 'Riyadh',
      district_ar: propDistrictAr.trim() || 'حي الملقا',
      district_en: propDistrictAr.trim() || 'Al Malqa',
      total_units: 10,
      occupied_units: 0,
      vacant_units: 10,
      maintenance_units: 0,
      monthly_revenue: 0,
      image_url: '/catalog/tower-riyadh.jpg',
    };
    setProperties((prev) => [newProp, ...prev]);
    setUnitPropId(newProp.id);
    setPropNameAr('');
    setPropDistrictAr('');
    setIsAddPropOpen(false);
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNumber.trim()) return;
    const parentProp = properties.find((p) => p.id === unitPropId) || properties[0];
    const monthly = parseFloat(unitRent) || 4000;
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      property_id: parentProp?.id || 'prop-1',
      property_name_ar: parentProp?.name_ar || 'عقار رئيسي',
      property_name_en: parentProp?.name_en || 'Main Property',
      unit_number: unitNumber.trim(),
      floor: 1,
      type: '2br',
      rooms: parseInt(unitRooms, 10) || 3,
      bathrooms: parseInt(unitBaths, 10) || 2,
      area_sqm: parseInt(unitArea, 10) || 120,
      annual_rent: monthly * 12,
      monthly_rent: monthly,
      status: unitStatus,
      current_tenant_name: unitStatus === 'occupied' ? unitTenantName.trim() || 'مستأجر جديد' : undefined,
    };
    setUnits((prev) => [newUnit, ...prev]);
    setUnitNumber('');
    setUnitTenantName('');
    setIsAddUnitOpen(false);
  };

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
            {lang === 'ar'
              ? 'إدارة شاملة للمباني، المجمعات وتفاصيل كل وحدة سكنية وتجارية (حفظ تلقائي)'
              : 'Manage buildings, compounds, and individual leased spaces (Auto-Saved)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {setProperties && (
            <button
              onClick={() => setIsAddPropOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة عقار / مبنى جديد' : 'Add Property'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setUnitPropId(properties[0]?.id || '');
              setIsAddUnitOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F5A47] hover:bg-[#0A4A35] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة وحدة / شقة جديدة' : 'Add Unit'}</span>
          </button>
        </div>
      </div>

      {/* Property Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPropertyId('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
            placeholder={
              lang === 'ar' ? 'بحث برقم الوحدة أو اسم المستأجر...' : 'Search by unit # or tenant...'
            }
            className="w-full text-xs ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F5A47]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'occupied', 'vacant', 'maintenance'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0F5A47] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all'
                ? lang === 'ar'
                  ? 'الكل'
                  : 'All'
                : st === 'occupied'
                ? lang === 'ar'
                  ? 'مؤجرة'
                  : 'Occupied'
                : st === 'vacant'
                ? lang === 'ar'
                  ? 'شاغرة'
                  : 'Vacant'
                : lang === 'ar'
                ? 'تحت الصيانة'
                : 'Maintenance'}
            </button>
          ))}
        </div>
      </div>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
          <Building2 className="w-10 h-10 text-[#0F5A47] mx-auto opacity-80" />
          <h3 className="font-black text-sm text-slate-800">
            {lang === 'ar' ? 'لا توجد وحدات عقارية حالياً' : 'No property units found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'ar'
              ? 'يمكنك البدء بإضافة عقارك الأول ووحداتك السكنية أو التجارية الآن وستحفظ تلقائياً في حسابك.'
              : 'Add your first property and units now — they are saved automatically.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {setProperties && (
              <button
                onClick={() => setIsAddPropOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                {lang === 'ar' ? '+ إضافة عقار جديد' : '+ Add Property'}
              </button>
            )}
            <button
              onClick={() => setIsAddUnitOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0F5A47] text-white font-bold text-xs cursor-pointer"
            >
              {lang === 'ar' ? '+ إضافة وحدة جديدة' : '+ Add Unit'}
            </button>
          </div>
        </div>
      ) : (
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
                  <span className="text-[10px] text-slate-400 block">
                    {lang === 'ar' ? 'الإيجار الشهري:' : 'Monthly Rent:'}
                  </span>
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
      )}

      {/* Modal 1: Add New Property */}
      {isAddPropOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddProperty}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {lang === 'ar' ? 'إضافة عقار / مبنى جديد' : 'Add New Property / Building'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPropOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'اسم العقار أو العمارة *' : 'Property Name *'}
              </label>
              <input
                type="text"
                required
                value={propNameAr}
                onChange={(e) => setPropNameAr(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: برج النخيل السكني' : 'e.g. Al Nakheel Tower'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'المدينة:' : 'City:'}
                </label>
                <input
                  type="text"
                  value={propCityAr}
                  onChange={(e) => setPropCityAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الحي:' : 'District:'}
                </label>
                <input
                  type="text"
                  value={propDistrictAr}
                  onChange={(e) => setPropDistrictAr(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: حي العليا' : 'Al Olaya'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'نوع العقار:' : 'Property Type:'}
              </label>
              <select
                value={propType}
                onChange={(e) => setPropType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
              >
                <option value="residential_compound">مجمع / عمارة سكنية</option>
                <option value="commercial_tower">برج مكاتب تجاري</option>
                <option value="retail_plaza">بلازا معارض ومحلات</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddPropOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F5A47] text-white font-black cursor-pointer"
              >
                {lang === 'ar' ? 'حفظ العقار' : 'Save Property'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Add New Unit */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddUnit}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {lang === 'ar' ? 'إضافة وحدة / شقة جديدة' : 'Add New Unit / Apartment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUnitOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {properties.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'العقار التابع له:' : 'Property:'}
                </label>
                <select
                  value={unitPropId}
                  onChange={(e) => setUnitPropId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رقم الوحدة / الشقة *' : 'Unit Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="A-101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الإيجار الشهري:' : 'Monthly Rent:'}
                </label>
                <input
                  type="number"
                  required
                  value={unitRent}
                  onChange={(e) => setUnitRent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الغرف:' : 'Rooms:'}
                </label>
                <input
                  type="number"
                  value={unitRooms}
                  onChange={(e) => setUnitRooms(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'دورات المياه:' : 'Baths:'}
                </label>
                <input
                  type="number"
                  value={unitBaths}
                  onChange={(e) => setUnitBaths(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'المساحة م²:' : 'Area sqm:'}
                </label>
                <input
                  type="number"
                  value={unitArea}
                  onChange={(e) => setUnitArea(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'حالة الوحدة:' : 'Status:'}
              </label>
              <select
                value={unitStatus}
                onChange={(e) => setUnitStatus(e.target.value as UnitStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
              >
                <option value="vacant">شاغرة (جاهزة للإيجار)</option>
                <option value="occupied">مؤجرة حالياً</option>
                <option value="maintenance">تحت الصيانة</option>
              </select>
            </div>

            {unitStatus === 'occupied' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم المستأجر الحالي:' : 'Current Tenant Name:'}
                </label>
                <input
                  type="text"
                  value={unitTenantName}
                  onChange={(e) => setUnitTenantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddUnitOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F5A47] text-white font-black cursor-pointer"
              >
                {lang === 'ar' ? 'حفظ الوحدة' : 'Save Unit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
