import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  Zap, 
  Check, 
  Copy, 
  ExternalLink, 
  Users, 
  Filter, 
  PhoneCall,
  BellRing
} from 'lucide-react';

interface WhatsAppAutomationHubProps {
  lang: Language;
}

interface WhatsAppCampaign {
  id: string;
  type: 'rent_reminder' | 'maintenance_update' | 'lease_renewal' | 'zatca_receipt';
  title_ar: string;
  title_en: string;
  recipients_count: number;
  scheduled_for: string;
  status: 'sent' | 'scheduled' | 'draft';
  template_ar: string;
}

export const WhatsAppAutomationHub: React.FC<WhatsAppAutomationHubProps> = ({ lang }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'rent' | 'maintenance' | 'renewal' | 'receipt'>('rent');
  const [testPhoneNumber, setTestPhoneNumber] = useState('+966501234567');
  const [testTenantName, setTestTenantName] = useState('سلطان عبدالله الدوسري');
  const [testAmount, setTestAmount] = useState('37,500');
  const [testUnit, setTestUnit] = useState('فيلا V-101');
  const [copiedText, setCopiedText] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const templates = {
    rent: {
      title_ar: 'تذكير موعد سداد الإيجار الدوري (Mada / Apple Pay)',
      title_en: 'Rent Due Payment Reminder',
      message: `مرحباً بك أستاذ {name} 👋\n\nنود تذكيرك بحلول موعد سداد دفعة الإيجار الخاصة بـ ({unit}) بمبلغ {amount} ر.س.\n\nيمكنك السداد الفوري والآمن بضغطة واحدة عبر مدى أو Apple Pay من خلال الرابط التالي:\nhttps://mulki.sa/pay/EJ-2026-9041\n\nمع تحيات إدارة الأملاك - شركة إتقان العقارية 🏢`,
    },
    maintenance: {
      title_ar: 'إشعار خروج الفني للصيانة ومتابعة البلاغ',
      title_en: 'Maintenance Dispatch Notification',
      message: `عزيزي المستأجر أستاذ {name} 🔧\n\nنفيدكم بأن الفني المختص (م. أحمد الشربيني) في الطريق إليكم لمعاينة بلاغ الصيانة #{ticket_id} الخاص بالتكييف.\n\nرقم جوال الفني للتنسيق المباشر: +966598711223\n\nشكراً لتعاونكم - منصة مُلكي لإدارة الأملاك ✨`,
    },
    renewal: {
      title_ar: 'إشعار تجديد عقد الإيجار قبل 60 يوماً (شبكة إيجار)',
      title_en: '60-Day Lease Renewal Notice',
      message: `السلام عليكم أستاذ {name} 📄\n\nنود إحاطتكم علماً بأن عقد إيجاركم للوحدة ({unit}) ينتهي بتاريخ 31-12-2026.\n\nيسرنا تجديد إقامتكم معنا. لتأكيد الرغبة في التجديد وإصدار العقد الموحد عبر شبكة إيجار، يرجى الضغط هنا:\nhttps://mulki.sa/renew/EJ-2026-9041\n\nدمتم بخير 🌟`,
    },
    receipt: {
      title_ar: 'إرسال سند القبض وفاتورة ZATCA بعد السداد',
      title_en: 'Official Payment Receipt & ZATCA Invoice',
      message: `تم استلام دفعتكم بنجاح أستاذ {name} ✅\n\nمبلغ الدفعة: {amount} ر.س\nرقم السند: REC-2026-9041\n\nيمكنكم تحميل سند القبض الرسمي المعتمد مع الختم الرقمي ورمز QR لهيئة الزكاة والضريبة والجمارك من الرابط التالي:\nhttps://mulki.sa/receipt/REC-2026-9041.pdf\n\nشركة إتقان العقارية 🏛️`,
    },
  };

  const getComputedMessage = () => {
    let msg = templates[selectedTemplate].message;
    msg = msg.replace('{name}', testTenantName);
    msg = msg.replace('{unit}', testUnit);
    msg = msg.replace('{amount}', testAmount);
    msg = msg.replace('{ticket_id}', 'TCK-2026-1049');
    return msg;
  };

  const cleanPhone = testPhoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(getComputedMessage());
  const whatsappDirectUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(getComputedMessage());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleSimulateDispatch = () => {
    setDispatchStatus('sending');
    setTimeout(() => {
      setDispatchStatus('success');
      setTimeout(() => setDispatchStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-[#0F5A47] text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-2 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'ar' ? 'أتمتة الواتساب بنسبة 95% للتحصيل والصيانة' : 'WhatsApp Automation 95% Delivery'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {lang === 'ar' ? 'مركز حملات وتنبيهات الواتساب الذكية (WhatsApp Hub)' : 'WhatsApp Automation & Campaign Hub'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mt-1">
            {lang === 'ar'
              ? 'تذكير المستأجرين تلقائياً بمواعيد السداد عبر WhatsApp مع روابط دفع سريعة، وإرسال تحديثات الصيانة وسندات ZATCA مباشرة.'
              : 'Automated rent payment reminders, technician dispatch alerts, and official ZATCA receipt links via WhatsApp.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateDispatch}
            disabled={dispatchStatus === 'sending'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-70"
          >
            <Send className="w-4 h-4" />
            <span>{dispatchStatus === 'sending' ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إطلاق حملة جماعية (Bulk Send)' : 'Bulk Campaign')}</span>
          </button>
        </div>
      </div>

      {dispatchStatus === 'success' && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-700" />
            <span>{lang === 'ar' ? 'تم إرسال 48 رسالة تذكير بنجاح عبر بوابة WhatsApp API الرسمية!' : '48 automated WhatsApp reminders dispatched successfully!'}</span>
          </div>
          <span className="text-xs bg-emerald-200 px-2.5 py-1 rounded-lg">معدل التسليم: 100%</span>
        </div>
      )}

      {/* Main Grid: Template Selector + Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Template Selector & Settings */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0F5A47]" />
              <span>{lang === 'ar' ? 'اختر قالب الرسالة الذكية:' : 'Select Message Template:'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedTemplate('rent')}
                className={`p-3 rounded-xl border text-start transition-all ${
                  selectedTemplate === 'rent'
                    ? 'border-[#0F5A47] bg-emerald-50/70 text-[#0F5A47] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">١. تذكير سداد الإيجار</div>
                <div className="text-[11px] text-slate-500 mt-0.5">قبل 15 يوم + رابط مدى السريع</div>
              </button>

              <button
                onClick={() => setSelectedTemplate('maintenance')}
                className={`p-3 rounded-xl border text-start transition-all ${
                  selectedTemplate === 'maintenance'
                    ? 'border-[#0F5A47] bg-emerald-50/70 text-[#0F5A47] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">٢. خروج فني الصيانة</div>
                <div className="text-[11px] text-slate-500 mt-0.5">تحديث فوري لبيانات الفني</div>
              </button>

              <button
                onClick={() => setSelectedTemplate('renewal')}
                className={`p-3 rounded-xl border text-start transition-all ${
                  selectedTemplate === 'renewal'
                    ? 'border-[#0F5A47] bg-emerald-50/70 text-[#0F5A47] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">٣. إشعار تجديد العقد</div>
                <div className="text-[11px] text-slate-500 mt-0.5">قبل 60 يوماً من الانتهاء</div>
              </button>

              <button
                onClick={() => setSelectedTemplate('receipt')}
                className={`p-3 rounded-xl border text-start transition-all ${
                  selectedTemplate === 'receipt'
                    ? 'border-[#0F5A47] bg-emerald-50/70 text-[#0F5A47] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">٤. سند وسند ZATCA</div>
                <div className="text-[11px] text-slate-500 mt-0.5">إشعار فوري بعد نجاح الدفع</div>
              </button>
            </div>
          </div>

          {/* Test Parameters inputs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{lang === 'ar' ? 'تخصيص بيانات التذكير (التجربة الحية):' : 'Customize Live Variables:'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">اسم المستأجر:</label>
                <input
                  type="text"
                  value={testTenantName}
                  onChange={(e) => setTestTenantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">رقم الجوال (WhatsApp):</label>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F5A47]"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">رقم الوحدة:</label>
                <input
                  type="text"
                  value={testUnit}
                  onChange={(e) => setTestUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">المبلغ المطلوب (ر.س):</label>
                <input
                  type="text"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F5A47]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Simulated WhatsApp Chat Screen with Real Direct Send */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b141a] text-white rounded-3xl shadow-xl overflow-hidden border border-slate-800 flex flex-col">
            
            {/* WhatsApp Chat Header */}
            <div className="bg-[#202c33] p-3.5 flex items-center justify-between border-b border-[#2a3942]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                  م
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>مُلكي - إدارة الأملاك (شركة إتقان)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">حساب أعمال رسمي موثق ✓</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {testPhoneNumber}
              </div>
            </div>

            {/* Chat Bubble Area */}
            <div className="p-4 sm:p-6 bg-[#0b141a] bg-opacity-95 flex flex-col justify-end space-y-2 min-h-[220px]">
              <div className="self-end max-w-[88%] bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md space-y-2 text-xs leading-relaxed">
                <p className="whitespace-pre-line font-sans">{getComputedMessage()}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 font-mono pt-1">
                  <span>12:45 PM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="p-3 bg-[#202c33] border-t border-[#2a3942] flex items-center justify-between gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'تم النسخ' : 'نسخ نص الرسالة'}</span>
              </button>

              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs transition-all shadow-md"
              >
                <span>إرسال تجريبي حي في WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 block text-[10px]">معدل القراءة والتفاعل</span>
              <strong className="text-emerald-700 text-base font-extrabold">98.4%</strong>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 block text-[10px]">سرعة التحصيل</span>
              <strong className="text-blue-700 text-base font-extrabold">3.2 أيام</strong>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 block text-[10px]">التحصيل التلقائي</span>
              <strong className="text-amber-700 text-base font-extrabold">87% مدى</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
