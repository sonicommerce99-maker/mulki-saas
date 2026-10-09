import React, { useState } from 'react';
import { MaintenanceTicket, Unit, Technician, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { Language, translations } from '../../locales/translations';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  Send, 
  AlertOctagon, 
  Phone, 
  MessageSquare, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  Coins
} from 'lucide-react';

interface MaintenanceWorkflowProps {
  tickets: MaintenanceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
  units: Unit[];
  technicians: Technician[];
  lang: Language;
  currency: string;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  preselectedUnitId?: string;
}

export const MaintenanceWorkflow: React.FC<MaintenanceWorkflowProps> = ({
  tickets,
  setTickets,
  units,
  technicians,
  lang,
  currency,
  isCreateModalOpen,
  setIsCreateModalOpen,
  preselectedUnitId,
}) => {
  const t = translations[lang];
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Multi-step modal state
  const [step, setStep] = useState<number>(1);
  const [newUnitId, setNewUnitId] = useState<string>(preselectedUnitId || units[0]?.id || '');
  const [newCategory, setNewCategory] = useState<TicketCategory>('hvac_ac');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('high');
  const [newTechnicianId, setNewTechnicianId] = useState<string>('');
  const [selectedPhotoPreset, setSelectedPhotoPreset] = useState<string>('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');

  // Status advance modal state
  const [statusModalTicket, setStatusModalTicket] = useState<MaintenanceTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [actualCostInput, setActualCostInput] = useState<string>('');

  const filteredTickets = tickets.filter((tkt) => {
    if (filterCategory !== 'all' && tkt.category !== filterCategory) return false;
    if (filterStatus !== 'all' && tkt.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.statusRequested}</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Wrench className="w-3.5 h-3.5" />
            <span>{t.statusInProgress}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.statusCompleted}</span>
          </span>
        );
      case 'invoiced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <FileCheck className="w-3.5 h-3.5" />
            <span>{t.statusInvoiced}</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-3 h-3" />
            <span>{t.priorityUrgent}</span>
          </span>
        );
      case 'high':
        return <span className="text-[11px] font-semibold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50">{t.priorityHigh}</span>;
      case 'medium':
        return <span className="text-[11px] font-semibold text-amber-600 px-1.5 py-0.5 rounded bg-amber-50">{t.priorityMedium}</span>;
      case 'low':
        return <span className="text-[11px] font-medium text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">{t.priorityLow}</span>;
    }
  };

  // Submit new ticket
  const handleCreateTicket = () => {
    const unit = units.find((u) => u.id === newUnitId) || units[0];
    const tech = technicians.find((t) => t.id === newTechnicianId) || technicians[0];
    const newId = `ticket_${Date.now()}`;
    const ticketNo = `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: MaintenanceTicket = {
      id: newId,
      ticket_number: ticketNo,
      property_id: unit.property_id,
      property_name_ar: unit.property_name_ar,
      property_name_en: unit.property_name_en,
      unit_id: unit.id,
      unit_number: unit.unit_number,
      tenant_id: unit.current_tenant_id || 'ten_guest',
      tenant_name: unit.current_tenant_name || 'سلطان عبدالله الدوسري',
      tenant_phone: '+966501234567',
      category: newCategory,
      title_ar: newTitle || 'بلاغ صيانة عاجل',
      title_en: newTitle || 'Maintenance Request',
      description_ar: newDesc || 'يرجى المعاينة والإصلاح العاجل.',
      description_en: newDesc || 'Inspection and repair needed.',
      priority: newPriority,
      status: 'requested',
      assigned_technician_name: tech.name,
      assigned_technician_phone: tech.phone,
      is_internal_tech: tech.is_internal,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estimated_cost: newCategory === 'hvac_ac' ? 500 : 250,
      actual_cost: 0,
      photos: selectedPhotoPreset ? [selectedPhotoPreset] : [],
      logs: [
        {
          id: `log_${Date.now()}`,
          status: 'requested',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor_name: unit.current_tenant_name || 'المستأجر',
          actor_role: 'المستأجر',
          note_ar: 'تم تسجيل الطلب في النظام وتعيين الفني المختص.',
          note_en: 'Ticket logged and specialist assigned.',
        },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setIsCreateModalOpen(false);
    setSelectedTicket(newTicket);
    setStep(1);
    setNewTitle('');
    setNewDesc('');
  };

  // Status advancement
  const handleAdvanceStatus = (ticket: MaintenanceTicket) => {
    let nextStatus: TicketStatus = 'in_progress';
    if (ticket.status === 'requested') nextStatus = 'in_progress';
    else if (ticket.status === 'in_progress') nextStatus = 'completed';
    else if (ticket.status === 'completed') nextStatus = 'invoiced';

    setStatusModalTicket(ticket);
    setActualCostInput(ticket.estimated_cost ? ticket.estimated_cost.toString() : '350');
  };

  const confirmStatusAdvance = () => {
    if (!statusModalTicket) return;

    let nextStatus: TicketStatus = 'in_progress';
    if (statusModalTicket.status === 'requested') nextStatus = 'in_progress';
    else if (statusModalTicket.status === 'in_progress') nextStatus = 'completed';
    else if (statusModalTicket.status === 'completed') nextStatus = 'invoiced';

    const costNum = parseFloat(actualCostInput) || 0;
    const invNo = nextStatus === 'invoiced' ? `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : statusModalTicket.invoice_number;

    const updatedLogs = [
      ...statusModalTicket.logs,
      {
        id: `log_${Date.now()}`,
        status: nextStatus,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor_name: statusModalTicket.assigned_technician_name,
        actor_role: 'فني الصيانة',
        note_ar: resolutionNote || (nextStatus === 'in_progress' ? 'بدء أعمال المعاينة والفحص الميداني' : nextStatus === 'completed' ? 'تم إنهاء الصيانة واختبار التشغيل' : 'تم إصدار الفاتورة الضريبية'),
        note_en: resolutionNote || 'Status transitioned successfully',
      },
    ];

    const updatedTickets = tickets.map((tkt) => {
      if (tkt.id === statusModalTicket.id) {
        return {
          ...tkt,
          status: nextStatus,
          actual_cost: costNum > 0 ? costNum : tkt.actual_cost,
          invoice_number: invNo,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          resolved_at: nextStatus === 'completed' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : tkt.resolved_at,
          logs: updatedLogs,
        };
      }
      return tkt;
    });

    setTickets(updatedTickets);
    if (selectedTicket && selectedTicket.id === statusModalTicket.id) {
      setSelectedTicket({
        ...selectedTicket,
        status: nextStatus,
        actual_cost: costNum > 0 ? costNum : selectedTicket.actual_cost,
        invoice_number: invNo,
        logs: updatedLogs,
      });
    }

    setStatusModalTicket(null);
    setResolutionNote('');
  };

  const getWhatsAppLink = (ticket: MaintenanceTicket) => {
    const phoneClean = ticket.assigned_technician_phone.replace(/[^0-9]/g, '');
    const msg = `مرحبا ${ticket.assigned_technician_name}،
لديك تذكرة صيانة جديدة في منصة عقار فلو:
رقم التذكرة: ${ticket.ticket_number}
العقار: ${ticket.property_name_ar}
الوحدة: ${ticket.unit_number}
نوع العطل: ${ticket.title_ar}
الأولوية: ${ticket.priority}
يرجى المتابعة والتوجه للموقع.`;
    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#0F5A47]" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t.maintenanceTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.maintenanceSubtitle}
          </p>
        </div>

        <button
          onClick={() => {
            setStep(1);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newTicketBtn}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{lang === 'ar' ? 'الحالة:' : 'Status:'}</span>
          {(['all', 'requested', 'in_progress', 'completed', 'invoiced'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterStatus === st
                  ? 'bg-[#0F5A47] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? (lang === 'ar' ? 'الكل' : 'All') :
               st === 'requested' ? t.statusRequested :
               st === 'in_progress' ? t.statusInProgress :
               st === 'completed' ? t.statusCompleted : t.statusInvoiced}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{lang === 'ar' ? 'التصنيف:' : 'Category:'}</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg p-1.5 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">{lang === 'ar' ? 'جميع التصنيفات' : 'All Categories'}</option>
            <option value="hvac_ac">{t.categoryAc}</option>
            <option value="plumbing">{t.categoryPlumbing}</option>
            <option value="electrical">{t.categoryElectrical}</option>
            <option value="carpentry">{t.categoryCarpentry}</option>
            <option value="appliances">{t.categoryAppliances}</option>
            <option value="general">{t.categoryGeneral}</option>
          </select>
        </div>
      </div>

      {/* Tickets List & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tickets Cards Column */}
        <div className="lg:col-span-7 space-y-3.5">
          {filteredTickets.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">
                {lang === 'ar' ? 'لا توجد تذاكر تطابق هذا الفلتر' : 'No tickets match the selected filters'}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#0F5A47] ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-mono font-bold text-slate-700">{ticket.ticket_number}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-800">{ticket.unit_number}</span>
                        <span>·</span>
                        <span>{lang === 'ar' ? ticket.property_name_ar : ticket.property_name_en}</span>
                      </div>
                      
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {lang === 'ar' ? ticket.title_ar : ticket.title_en}
                      </h3>
                      
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {lang === 'ar' ? ticket.description_ar : ticket.description_en}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>

                  {/* Footer info: Technician & Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span>{t.techAssigned}:</span>
                      <strong className="text-slate-800">{ticket.assigned_technician_name}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.status !== 'invoiced' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvanceStatus(ticket);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] transition-colors"
                        >
                          {ticket.status === 'requested' ? (lang === 'ar' ? 'بدء العمل' : 'Start') :
                           ticket.status === 'in_progress' ? (lang === 'ar' ? 'إتمام الصيانة' : 'Complete') :
                           (lang === 'ar' ? 'إصدار الفاتورة' : 'Invoice')}
                        </button>
                      )}

                      <a
                        href={getWhatsAppLink(ticket)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        title={t.technicianContact}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Interactive Detail & Progression Panel */}
        <div className="lg:col-span-5">
          {selectedTicket ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm sticky top-20 space-y-4">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{selectedTicket.ticket_number}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-900">{selectedTicket.unit_number}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {lang === 'ar' ? selectedTicket.title_ar : selectedTicket.title_en}
                  </h2>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* 4-Stage Lifecycle Progress Bar */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  {lang === 'ar' ? 'مراحل سير العمل الآلي (Workflow):' : 'Automated Progression Lifecycle:'}
                </span>
                <div className="grid grid-cols-4 text-center gap-1 text-[11px] font-semibold">
                  <div className={`p-1.5 rounded-lg border ${
                    ['requested', 'in_progress', 'completed', 'invoiced'].includes(selectedTicket.status)
                      ? 'bg-emerald-50 text-[#0F5A47] border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {t.statusRequested}
                  </div>
                  <div className={`p-1.5 rounded-lg border ${
                    ['in_progress', 'completed', 'invoiced'].includes(selectedTicket.status)
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {t.statusInProgress}
                  </div>
                  <div className={`p-1.5 rounded-lg border ${
                    ['completed', 'invoiced'].includes(selectedTicket.status)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {t.statusCompleted}
                  </div>
                  <div className={`p-1.5 rounded-lg border ${
                    selectedTicket.status === 'invoiced'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {t.statusInvoiced}
                  </div>
                </div>
              </div>

              {/* Photos Preview */}
              {selectedTicket.photos.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    {lang === 'ar' ? 'صور ومعاينة العطل:' : 'Photos & Visual Evidence:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTicket.photos.map((ph, idx) => (
                      <div key={idx} className="relative h-28 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={ph}
                          alt="Evidence"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technician & Tenant Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-500 block">{lang === 'ar' ? 'المستأجر مقدم البلاغ:' : 'Tenant:'}</span>
                  <strong className="text-slate-900 block mt-0.5">{selectedTicket.tenant_name}</strong>
                  <span className="text-slate-600 tabular-numbers">{selectedTicket.tenant_phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{lang === 'ar' ? 'الفني المعين:' : 'Assigned Tech:'}</span>
                  <strong className="text-slate-900 block mt-0.5">{selectedTicket.assigned_technician_name}</strong>
                  <a
                    href={getWhatsAppLink(selectedTicket)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#0F5A47] font-semibold hover:underline mt-0.5"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'مراسلة واتساب' : 'WhatsApp'}</span>
                  </a>
                </div>
              </div>

              {/* Financial cost summary */}
              <div className="flex items-center justify-between text-xs p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
                <div>
                  <span className="text-slate-600 block">{lang === 'ar' ? 'التكلفة المقدرة / الفعلية:' : 'Estimated / Actual Cost:'}</span>
                  <span className="font-bold text-slate-900 text-sm tabular-numbers">
                    {selectedTicket.actual_cost > 0 ? selectedTicket.actual_cost : selectedTicket.estimated_cost} {currency}
                  </span>
                </div>
                {selectedTicket.invoice_number && (
                  <div className="text-end">
                    <span className="text-slate-600 block">{t.invoiceNumber}</span>
                    <span className="font-mono font-bold text-purple-800">{selectedTicket.invoice_number}</span>
                  </div>
                )}
              </div>

              {/* Audit Timeline Logs */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">{t.timeline}</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pe-1">
                  {selectedTicket.logs.map((log) => (
                    <div key={log.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                      <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                        <span>{log.actor_name} ({log.actor_role})</span>
                        <span className="tabular-numbers text-[11px]">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-700">{lang === 'ar' ? log.note_ar : log.note_en}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {selectedTicket.status !== 'invoiced' ? (
                  <button
                    onClick={() => handleAdvanceStatus(selectedTicket)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-xs transition-colors text-center"
                  >
                    {selectedTicket.status === 'requested' ? (lang === 'ar' ? 'بدء العمل الميداني (In Progress)' : 'Start Work') :
                     selectedTicket.status === 'in_progress' ? (lang === 'ar' ? 'توثيق الإنجاز والتكلفة (Completed)' : 'Mark Completed') :
                     (lang === 'ar' ? 'إصدار الفاتورة الضريبية (Invoiced)' : 'Generate Tax Invoice')}
                  </button>
                ) : (
                  <div className="w-full py-2 bg-purple-50 text-purple-800 text-xs font-bold rounded-xl text-center border border-purple-200">
                    {lang === 'ar' ? 'تمت الفوترة وتسوية التذكرة بنجاح' : 'Ticket invoiced and settled'}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">
                {lang === 'ar' ? 'اختر أي تذكرة من القائمة لمعاينة التفاصيل وتحديث مسار الإنجاز' : 'Select any ticket from the list to manage and inspect'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Multi-Step Ticket Submission Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {lang === 'ar' ? 'تقديم بلاغ صيانة جديد (معالج من ٤ خطوات)' : 'New Maintenance Ticket Wizard (4 Steps)'}
                </h3>
                <span className="text-xs text-slate-500">
                  {step === 1 ? t.stepCategory : step === 2 ? t.stepDetails : step === 3 ? t.stepAssignment : t.stepConfirm}
                </span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* STEP 1: Unit & Category */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'اختر الوحدة الإيجارية:' : 'Select Leased Unit:'}
                    </label>
                    <select
                      value={newUnitId}
                      onChange={(e) => setNewUnitId(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-[#0F5A47]"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unit_number} - {lang === 'ar' ? u.property_name_ar : u.property_name_en} ({u.current_tenant_name || 'شاغرة'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      {lang === 'ar' ? 'تصنيف العطل الأساسي:' : 'Issue Category:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'hvac_ac', label: t.categoryAc, icon: '❄️' },
                        { id: 'plumbing', label: t.categoryPlumbing, icon: '🚰' },
                        { id: 'electrical', label: t.categoryElectrical, icon: '⚡' },
                        { id: 'carpentry', label: t.categoryCarpentry, icon: '🚪' },
                        { id: 'appliances', label: t.categoryAppliances, icon: '🍳' },
                        { id: 'general', label: t.categoryGeneral, icon: '🛠️' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setNewCategory(cat.id as TicketCategory)}
                          className={`p-3 rounded-xl border text-start flex flex-col justify-between transition-all ${
                            newCategory === cat.id
                              ? 'border-[#0F5A47] bg-emerald-50/50 text-[#0F5A47] ring-1 ring-[#0F5A47]'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="text-xl mb-1">{cat.icon}</span>
                          <span className="text-xs font-bold">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Issue Details & Photos */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'عنوان المشكلة أو العطل:' : 'Problem Headline:'}
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={newCategory === 'hvac_ac' ? 'عطل في التكييف المركزي - هواء حار' : 'تسريب مياه في محبس المغسلة'}
                      className="w-full text-sm border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-[#0F5A47]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'تفاصيل المشكلة والوصف الدقيق:' : 'Comprehensive Description:'}
                    </label>
                    <textarea
                      rows={3}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder={lang === 'ar' ? 'صف متى بدأ العطل ومكانه بالتحديد لتسهيل عمل الفني...' : 'Describe when the issue began and exact location...'}
                      className="w-full text-sm border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-[#0F5A47]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'إرفاق صورة العطل (نماذج توضيحية سريعة):' : 'Attach Photo of the Issue:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', label: 'تكييف / HVAC' },
                        { url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', label: 'سباكة / صنبور' },
                        { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', label: 'قواطع كهربائية' },
                      ].map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedPhotoPreset(img.url)}
                          className={`relative h-20 rounded-xl overflow-hidden border cursor-pointer ${
                            selectedPhotoPreset === img.url ? 'ring-2 ring-[#0F5A47] border-[#0F5A47]' : 'border-slate-200 opacity-70'
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                            {img.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Assignment & Priority */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'درجة الأولوية والإلحاح:' : 'Priority Tier:'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['low', 'medium', 'high', 'urgent'] as const).map((pri) => (
                        <button
                          key={pri}
                          type="button"
                          onClick={() => setNewPriority(pri)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                            newPriority === pri
                              ? pri === 'urgent'
                                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400'
                                : 'bg-emerald-50 text-[#0F5A47] border-[#0F5A47] ring-1 ring-[#0F5A47]'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {pri === 'urgent' ? t.priorityUrgent :
                           pri === 'high' ? t.priorityHigh :
                           pri === 'medium' ? t.priorityMedium : t.priorityLow}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'تعيين الفني المختص (داخلي أو مقاول معتمد):' : 'Assign Specialist (Internal or Contractor):'}
                    </label>
                    <div className="space-y-2">
                      {technicians.map((tech) => (
                        <div
                          key={tech.id}
                          onClick={() => setNewTechnicianId(tech.id)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                            newTechnicianId === tech.id
                              ? 'border-[#0F5A47] bg-emerald-50/40 text-slate-900 ring-1 ring-[#0F5A47]'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div>
                            <span className="font-bold block text-slate-900">{tech.name}</span>
                            <span className="text-slate-500">
                              {tech.is_internal ? (lang === 'ar' ? 'فريق الصيانة الداخلي' : 'Internal Staff') : (lang === 'ar' ? 'شركة مقاولات معتمدة' : 'Contractor')}
                            </span>
                          </div>
                          <div className="text-end">
                            <span className="font-bold text-amber-600 block">★ {tech.rating}</span>
                            <span className="text-slate-400">{tech.active_tickets_count} {lang === 'ar' ? 'تذاكر نشطة' : 'active'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Dispatch */}
              {step === 4 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">{lang === 'ar' ? 'مراجعة بيانات التذكرة قبل الإرسال:' : 'Review Maintenance Ticket Details:'}</h4>
                  
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'ar' ? 'الوحدة:' : 'Unit:'}</span>
                    <strong className="text-slate-900">
                      {units.find(u => u.id === newUnitId)?.unit_number} - {units.find(u => u.id === newUnitId)?.property_name_ar}
                    </strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'ar' ? 'التصنيف:' : 'Category:'}</span>
                    <strong className="text-[#0F5A47]">{newCategory}</strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'ar' ? 'الأولوية:' : 'Priority:'}</span>
                    <strong className={newPriority === 'urgent' ? 'text-rose-600' : 'text-slate-900'}>{newPriority}</strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'ar' ? 'الفني المعين:' : 'Assigned Specialist:'}</span>
                    <strong className="text-slate-900">
                      {technicians.find(t => t.id === newTechnicianId)?.name || technicians[0].name}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] font-medium">
                    {lang === 'ar' 
                      ? '✓ سيتم إرسال إشعار فوري للفني عبر WhatsApp ورسائل SMS فور الضغط على تأكيد.'
                      : '✓ Instant SMS & WhatsApp notification will be dispatched to the technician upon confirmation.'}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'السابق' : 'Previous'}</span>
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl"
                >
                  <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateTicket}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.submitTicket}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Advance Status Modal */}
      {statusModalTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'ar' ? 'تحديث حالة تذكرة الصيانة' : 'Advance Ticket Workflow Status'}
              </h3>
              <button
                onClick={() => setStatusModalTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              <span>{lang === 'ar' ? 'رقم التذكرة:' : 'Ticket:'} </span>
              <strong className="font-mono text-slate-900">{statusModalTicket.ticket_number}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'ملاحظة الفحص أو الإنجاز:' : 'Resolution / Inspection Note:'}
              </label>
              <textarea
                rows={2}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder={lang === 'ar' ? 'تم استبدال القطعة واختبار عمل الوحدة بنجاح...' : 'Details of work completed...'}
                className="w-full text-xs border border-slate-300 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-[#0F5A47]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? `تكلفة الصيانة وقطع الغيار الفعلية (${currency}):` : `Actual Labor & Parts Expense (${currency}):`}
              </label>
              <input
                type="number"
                value={actualCostInput}
                onChange={(e) => setActualCostInput(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalTicket(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmStatusAdvance}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-lg shadow-xs"
              >
                {lang === 'ar' ? 'تأكيد التحديث والفوترة' : 'Confirm Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
