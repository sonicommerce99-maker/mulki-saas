import React, { useState } from 'react';
import { MaintenanceTicket, Currency } from '../../types';
import { Language, translations } from '../../locales/translations';
import { 
  Wrench, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface TechnicianViewProps {
  tickets: MaintenanceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
  currency: Currency;
  lang: Language;
}

export const TechnicianView: React.FC<TechnicianViewProps> = ({
  tickets,
  setTickets,
  currency,
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [completeCostInput, setCompleteCostInput] = useState<{ [id: string]: string }>({});

  // Assume logged in as technician "م. أحمد الشربيني"
  const myTickets = tickets.filter(
    (t) => t.assigned_technician_name.includes('أحمد الشربيني') || t.assigned_technician_name.includes('سالم')
  );

  const pendingTickets = myTickets.filter((t) => t.status === 'requested' || t.status === 'in_progress');
  const completedTickets = myTickets.filter((t) => t.status === 'completed' || t.status === 'invoiced');

  const handleStartWork = (ticketId: string) => {
    setTickets(
      tickets.map((tkt) => {
        if (tkt.id === ticketId) {
          return {
            ...tkt,
            status: 'in_progress',
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
            logs: [
              ...tkt.logs,
              {
                id: `log_${Date.now()}`,
                status: 'in_progress',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                actor_name: 'م. أحمد الشربيني',
                actor_role: 'فني الصيانة',
                note_ar: 'وصل الفني إلى الموقع وبدأ الفحص والمعاينة.',
                note_en: 'Technician on-site, began repair.',
              },
            ],
          };
        }
        return tkt;
      })
    );
  };

  const handleFinishWork = (ticketId: string) => {
    const cost = parseFloat(completeCostInput[ticketId]) || 350;
    setTickets(
      tickets.map((tkt) => {
        if (tkt.id === ticketId) {
          return {
            ...tkt,
            status: 'completed',
            actual_cost: cost,
            resolved_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
            logs: [
              ...tkt.logs,
              {
                id: `log_${Date.now()}`,
                status: 'completed',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                actor_name: 'م. أحمد الشربيني',
                actor_role: 'فني الصيانة',
                note_ar: `تم إنهاء أعمال الإصلاح بنجاح واختبار التشغيل. التكلفة: ${cost} ${currency}.`,
                note_en: `Repair completed successfully. Expense: ${cost} ${currency}.`,
              },
            ],
          };
        }
        return tkt;
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      
      {/* Technician Profile Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-lg">
            <Wrench className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">م. أحمد الشربيني</h2>
            <p className="text-xs text-slate-500">فني تكييف وتبريد معتمد (فريق الصيانة الداخلي)</p>
          </div>
        </div>

        <div className="text-end">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ★ 4.9 ممتاز
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'ar' ? `المهام قيد التنفيذ (${pendingTickets.length})` : `Active Tasks (${pendingTickets.length})`}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'ar' ? `المهام المكتملة (${completedTickets.length})` : `Completed (${completedTickets.length})`}
        </button>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {(activeTab === 'pending' ? pendingTickets : completedTickets).map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{ticket.ticket_number}</span>
                <h3 className="font-bold text-slate-900 text-base mt-0.5">
                  {lang === 'ar' ? ticket.title_ar : ticket.title_en}
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                ticket.priority === 'urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800'
              }`}>
                {ticket.priority === 'urgent' ? t.priorityUrgent : t.priorityHigh}
              </span>
            </div>

            {/* Location & Unit */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-[#0F5A47]" />
                <span className="font-bold">{ticket.property_name_ar} - {ticket.unit_number}</span>
              </div>
              <span className="text-slate-500 font-semibold">{ticket.tenant_name}</span>
            </div>

            <p className="text-xs text-slate-600">
              {lang === 'ar' ? ticket.description_ar : ticket.description_en}
            </p>

            {/* Photos if any */}
            {ticket.photos.length > 0 && (
              <div className="flex gap-2">
                {ticket.photos.map((ph, idx) => (
                  <img
                    key={idx}
                    src={ph}
                    alt="Inspection"
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                  />
                ))}
              </div>
            )}

            {/* Contact tenant buttons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`tel:${ticket.tenant_phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'اتصال بالمستأجر' : 'Call'}</span>
              </a>

              <a
                href={`https://wa.me/${ticket.tenant_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ar' ? 'واتساب المستأجر' : 'WhatsApp'}</span>
              </a>
            </div>

            {/* Technician Workflow Actions */}
            {activeTab === 'pending' && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {ticket.status === 'requested' ? (
                  <button
                    onClick={() => handleStartWork(ticket.id)}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'بدء العمل والمعاينة (In Progress)' : 'Start Work'}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={lang === 'ar' ? 'تكلفة قطع الغيار والمصنعية (ر.س)' : 'Repair expense'}
                        value={completeCostInput[ticket.id] || ''}
                        onChange={(e) => setCompleteCostInput({ ...completeCostInput, [ticket.id]: e.target.value })}
                        className="flex-1 text-xs border border-slate-300 rounded-xl p-2 font-mono"
                      />
                      <button
                        onClick={() => handleFinishWork(ticket.id)}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                      >
                        {lang === 'ar' ? 'إتمام المهمة' : 'Complete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{lang === 'ar' ? 'التكلفة الإجمالية:' : 'Cost:'} <strong className="text-slate-900 font-mono">{ticket.actual_cost} {currency}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تم الفحص والتسليم' : 'Resolved'}</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
