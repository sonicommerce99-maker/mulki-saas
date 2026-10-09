import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { Property, Unit } from '../../types';
import { 
  Building2, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Clock, 
  MessageSquare, 
  User, 
  Key, 
  Eye, 
  Maximize2,
  DollarSign
} from 'lucide-react';

interface VisualFloorMapProps {
  lang: Language;
  properties: Property[];
  units: Unit[];
  onSelectUnit?: (unit: Unit) => void;
  onOpenWhatsApp?: (unitNumber: string) => void;
}

export const VisualFloorMap: React.FC<VisualFloorMapProps> = ({
  lang,
  properties,
  units,
  onSelectUnit,
  onOpenWhatsApp,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || 'prop-1');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'vacant' | 'maintenance' | 'expiring'>('all');
  const [activeUnitModal, setActiveUnitModal] = useState<Unit | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  // Available floors for selected property
  const propertyUnits = units.filter((u) => u.property_id === selectedPropertyId);
  const floors = Array.from(new Set(propertyUnits.map((u) => u.floor))).sort((a, b) => a - b);

  // Filtered units
  const displayedUnits = propertyUnits.filter((u) => {
    const matchFloor = selectedFloor === 'all' || u.floor === selectedFloor;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchFloor && matchStatus;
  });

  const getStatusBadge = (status: Unit['status']) => {
    switch (status) {
      case 'occupied':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500 text-emerald-700',
          dot: 'bg-emerald-500',
          label_ar: 'مؤجرة',
          label_en: 'Occupied',
        };
      case 'vacant':
        return {
          bg: 'bg-rose-500/10 border-rose-500 text-rose-700',
          dot: 'bg-rose-500',
          label_ar: 'شاغرة متاح',
          label_en: 'Vacant',
        };
      case 'maintenance':
        return {
          bg: 'bg-amber-500/10 border-amber-500 text-amber-700',
          dot: 'bg-amber-500',
          label_ar: 'قيد الصيانة',
          label_en: 'Maintenance',
        };
      case 'reserved':
        return {
          bg: 'bg-blue-500/10 border-blue-500 text-blue-700',
          dot: 'bg-blue-500',
          label_ar: 'محجوزة',
          label_en: 'Reserved',
        };
    }
  };

  const occupiedCount = propertyUnits.filter((u) => u.status === 'occupied').length;
  const occupancyRate = propertyUnits.length > 0 ? Math.round((occupiedCount / propertyUnits.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Property Selector & Architectural Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F5A47] to-[#147a61] flex items-center justify-center text-white shadow-md">
            <Layers className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {lang === 'ar' ? 'المخطط البصري التفاعلي للأدوار (Floor Matrix)' : 'Interactive Visual Floor Map'}
              </h2>
              <span className="text-[10px] font-bold bg-[#0F5A47] text-white px-2 py-0.5 rounded-full">
                {occupancyRate}% إشغال
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'معاينة معمارية فورية لحالة كل وحدة، المستأجر، والإيجار الشهري' : 'Instant visual architectural view of occupancy, rent and maintenance'}
            </p>
          </div>
        </div>

        {/* Property Picker */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {properties.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPropertyId(p.id);
                setSelectedFloor('all');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedPropertyId === p.id
                  ? 'bg-[#0F5A47] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {lang === 'ar' ? p.name_ar : p.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Floor filter + Status legend */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Floors */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-500 font-semibold me-1">{lang === 'ar' ? 'الأدوار:' : 'Floors:'}</span>
          <button
            onClick={() => setSelectedFloor('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              selectedFloor === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'ar' ? 'كافة الأدوار' : 'All Floors'}
          </button>
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedFloor === floor ? 'bg-[#0F5A47] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {floor === 0 ? 'الدور الأرضي' : floor === 22 ? 'البنتهاوس (22)' : `الدور ${floor}`}
            </button>
          ))}
        </div>

        {/* Status Legend Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter(statusFilter === 'occupied' ? 'all' : 'occupied')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
              statusFilter === 'occupied' ? 'bg-emerald-100 border-emerald-500 text-emerald-900' : 'border-slate-200 text-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>مؤجرة ({propertyUnits.filter(u => u.status === 'occupied').length})</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'vacant' ? 'all' : 'vacant')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
              statusFilter === 'vacant' ? 'bg-rose-100 border-rose-500 text-rose-900' : 'border-slate-200 text-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>شاغرة ({propertyUnits.filter(u => u.status === 'vacant').length})</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'maintenance' ? 'all' : 'maintenance')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
              statusFilter === 'maintenance' ? 'bg-amber-100 border-amber-500 text-amber-900' : 'border-slate-200 text-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>صيانة ({propertyUnits.filter(u => u.status === 'maintenance').length})</span>
          </button>
        </div>

      </div>

      {/* Visual Architectural Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedUnits.map((unit) => {
          const badge = getStatusBadge(unit.status);
          return (
            <div
              key={unit.id}
              onClick={() => setActiveUnitModal(unit)}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer bg-white hover:shadow-lg hover:-translate-y-0.5 space-y-3 relative group ${badge.bg}`}
            >
              {/* Card Top: Unit Number & Status Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                    {unit.unit_number}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {unit.floor === 0 ? 'أرضي' : `الدور ${unit.floor}`}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {unit.type === '3br' ? '٣ غرف وصالة' : unit.type === '2br' ? 'غرفتان وصالة' : unit.type === 'penthouse' ? 'بنتهاوس فاخر' : 'مكتب تنفيذي'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold">
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                  <span>{lang === 'ar' ? badge.label_ar : badge.label_en}</span>
                </div>
              </div>

              {/* Middle Metrics */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">المساحة</span>
                  <strong className="text-slate-800">{unit.area_sqm} م²</strong>
                </div>

                <div className="text-end">
                  <span className="text-[10px] text-slate-400 block font-sans">الإيجار الشهري</span>
                  <strong className="text-[#0F5A47] font-bold">{unit.monthly_rent.toLocaleString()} ر.س</strong>
                </div>
              </div>

              {/* Tenant or Action Quick Bar */}
              <div className="pt-1 flex items-center justify-between text-xs">
                {unit.status === 'occupied' ? (
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <User className="w-3.5 h-3.5 text-[#0F5A47]" />
                    <span className="truncate font-semibold">مستأجر نشط</span>
                  </div>
                ) : unit.status === 'maintenance' ? (
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>تذكرة تكييف جارية</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                    <Key className="w-3.5 h-3.5" />
                    <span>جاهزة للمعاينة والتأجير</span>
                  </div>
                )}

                <span className="text-[10px] text-[#0F5A47] font-bold group-hover:underline">
                  التفاصيل ←
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Unit Detail Modal */}
      {activeUnitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0F5A47] text-white flex items-center justify-center font-mono font-bold text-sm">
                  {activeUnitModal.unit_number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedProperty.name_ar} - وحدة {activeUnitModal.unit_number}
                  </h3>
                  <span className="text-xs text-slate-500">الدور {activeUnitModal.floor} · {activeUnitModal.area_sqm} متر مربع</span>
                </div>
              </div>

              <button
                onClick={() => setActiveUnitModal(null)}
                className="text-slate-400 hover:text-slate-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">الإيجار السنوي المقدر:</span>
                <strong className="text-[#0F5A47] font-mono font-bold">{(activeUnitModal.monthly_rent * 12).toLocaleString()} ر.س</strong>
              </div>

              <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-500">حالة الوحدة:</span>
                <span className="font-bold text-slate-800">
                  {activeUnitModal.status === 'occupied' ? 'مؤجرة بعقد ساري' : activeUnitModal.status === 'vacant' ? 'شاغرة متاحة للتأجير' : 'تحت أعمال الصيانة'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  if (onOpenWhatsApp) onOpenWhatsApp(activeUnitModal.unit_number);
                  setActiveUnitModal(null);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>إرسال واتساب</span>
              </button>

              <button
                onClick={() => setActiveUnitModal(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
