import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Building2,
  Layers,
  MessageSquare,
  FileCheck,
  Wrench,
  Download,
  ShieldCheck,
  Coins,
  ChevronRight,
  Printer,
  X,
  HelpCircle,
  ExternalLink,
  Crown
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface GuideSection {
  id: string;
  icon: any;
  title_ar: string;
  title_en: string;
  badge_ar: string;
  badge_en: string;
  summary_ar: string;
  summary_en: string;
  steps_ar: { title: string; desc: string }[];
  steps_en: { title: string; desc: string }[];
  proTip_ar: string;
  proTip_en: string;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  lang: initialLang,
}) => {
  const [guideLang, setGuideLang] = useState<'ar' | 'en'>(initialLang === 'en' ? 'en' : 'ar');
  const [activeSectionId, setActiveSectionId] = useState<string>('quickstart');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const sections: GuideSection[] = [
    {
      id: 'quickstart',
      icon: BookOpen,
      title_ar: '١. دليل البدء السريع وإعداد المنشأة',
      title_en: '1. Quick Start & Company Setup',
      badge_ar: 'الأساسيات',
      badge_en: 'Basics',
      summary_ar: 'كيف تبدأ باستخدام منصة مَحْفَظَتِي العَقَارِيَّة لإدارة محفظتك العقارية في أقل من 5 دقائق.',
      summary_en: 'How to get started managing your real estate portfolio in under 5 minutes.',
      steps_ar: [
        {
          title: 'اختيار العملة واللغة المناسبة',
          desc: 'من أعلى شريط التنقل، يمكنك التبديل بين الريال السعودي (SAR)، الدرهم الإماراتي (AED)، الريال القطري (QAR)، أو الدولار (USD)، وتغيير الواجهة بين العربية والإنجليزية.',
        },
        {
          title: 'تحديد صلاحية الدخول',
          desc: 'يتيح لك النظام التبديل السلس بين الصلاحيات: مدير المنشأة العقارية (Admin)، المستثمر الشريك (Investor VIP)، الفني الميداني (Technician)، والمستأجر (Tenant).',
        },
        {
          title: 'تخصيص الهوية والشعار',
          desc: 'يتم دمج اسم منشأتك وسجلها التجاري وبيانات الاتصال تلقائياً في جميع الفواتير وسندات القبض ورسائل الواتساب الصادرة.',
        },
      ],
      steps_en: [
        {
          title: 'Select Currency & Language',
          desc: 'From the top navbar, toggle between SAR, AED, QAR, or USD, and switch instantly between Arabic and English UI.',
        },
        {
          title: 'Switch User Persona & Role',
          desc: 'The platform provides role-based access: Property Manager (Admin), Partner Investor (VIP), Field Technician, and Tenant.',
        },
        {
          title: 'Corporate Identity Branding',
          desc: 'Your company name, commercial registration (CR), and contact numbers are automatically populated on all invoices and WhatsApp notices.',
        },
      ],
      proTip_ar: 'نصيحة ذهبية: قم بتثبيت التطبيق على سطح المكتب عبر زر "تثبيت التطبيق" لفتحه كبرنامج مستقل وسريع بدون متصفح.',
      proTip_en: 'Pro Tip: Click "Install App" to add Mulki directly to your desktop or mobile home screen as a standalone application.',
    },
    {
      id: 'properties',
      icon: Building2,
      title_ar: '٢. إدارة العقارات والوحدات السكنية والتجارية',
      title_en: '2. Properties & Units Management',
      badge_ar: 'الأصول',
      badge_en: 'Assets',
      summary_ar: 'إضافة الأبراج والمجمعات والعمائر، وتفصيل الشقق والمحلات والمكاتب مع أسعار الإيجار.',
      summary_en: 'Adding towers, compounds, buildings, and structuring units with annual rental values.',
      steps_ar: [
        {
          title: 'إضافة عقار جديد',
          desc: 'انتقل إلى تبويب «العقارات»، اضغط على زر «إضافة عقار جديد»، وحدد اسم المبنى، موقعه (المدينة والحي)، نوع العقار (سكني / تجاري)، وعدد الطوابق والوحدات.',
        },
        {
          title: 'توزيع الوحدات حسب الطوابق',
          desc: 'لكل وحدة رقم مميز، عدد الغرف، المساحة بالمتر المربع، والقيمة الإيجارية السنوية المحددة.',
        },
        {
          title: 'متابعة حالة الإشغال الفورية',
          desc: 'يتم تحديث حالة كل وحدة تلقائياً: مؤجرة (خضراء)، شاغرة جاهزة للتأجير (حمراء)، أو تحت الصيانة (صفراء).',
        },
      ],
      steps_en: [
        {
          title: 'Add a New Property',
          desc: 'Navigate to "Properties", click "Add Property", enter building name, location (city/district), property type, and floor count.',
        },
        {
          title: 'Configure Unit Inventory',
          desc: 'Assign each unit a distinct identifier, room count, square meter area, and target annual rent price.',
        },
        {
          title: 'Track Real-time Occupancy',
          desc: 'Units automatically update their status: Occupied (Green), Vacant ready for lease (Red), or Maintenance (Yellow).',
        },
      ],
      proTip_ar: 'يمكنك ترشيح العقارات حسب نسبة الإشغال الأعلى لمعرفة المباني الأكثر مردوداً استثمارياً.',
      proTip_en: 'Filter properties by highest occupancy rate to quickly spot your top-performing real estate assets.',
    },
    {
      id: 'floormap',
      icon: Layers,
      title_ar: '٣. المخطط المعماري البصري للأدوار (Floor Matrix)',
      title_en: '3. Architectural Floor Matrix',
      badge_ar: 'المخطط البصري',
      badge_en: 'Spatial View',
      summary_ar: 'شاشة معمارية مبتكرة تمنحك رؤية بانورامية لجميع الطوابق والشقق بضغطة زر.',
      summary_en: 'Innovative architectural layout providing a panoramic visual overview of all floors and apartments.',
      steps_ar: [
        {
          title: 'فهم دلالة الألوان',
          desc: 'اللون الأخضر يعني وحدة مؤجرة ومسددة، اللون الأحمر يشير إلى شقة شاغرة تحتاج تسويقاً فورياً، واللون الأصفر يعني وجود تذكرة صيانة جارية.',
        },
        {
          title: 'الضغط على أي شقة لمعاينة التفاصيل',
          desc: 'عند النقر على أي مربع شقة، تظهر بطاقة سريعة تتضمن: اسم المستأجر، رقم جواله، تاريخ استحقاق الدفعة القادمة، وزر مباشر للمراسلة.',
        },
        {
          title: 'التصفية الذكية حسب الدور',
          desc: 'يمكنك استعراض دور معين بضغطة واحدة لمعرفة توزيع الوحدات في الدور الأرضي أو الأدوار العليا والأسطح.',
        },
      ],
      steps_en: [
        {
          title: 'Color Code Legend',
          desc: 'Green indicates occupied and active, Red denotes a vacant unit ready for lease, and Yellow represents an ongoing maintenance job.',
        },
        {
          title: 'Click any Unit for Quick Details',
          desc: 'Clicking any unit block opens an instant modal with tenant name, phone number, next rent due date, and quick WhatsApp action.',
        },
        {
          title: 'Floor-by-Floor Filtering',
          desc: 'Isolate specific floors with a single click to review distribution on Ground Floors, Penthouse suites, or Commercial shops.',
        },
      ],
      proTip_ar: 'المخطط البصري ممتاز لعرضه في شاشات غرف الاجتماعات مع الملاك والمستثمرين لإعطاء انطباع احترافي فائق.',
      proTip_en: 'The Floor Matrix is ideal for boardroom presentations to property owners and VIP investors.',
    },
    {
      id: 'whatsapp',
      icon: MessageSquare,
      title_ar: '٤. أتمتة الواتساب وتسريع التحصيل بنقرة واحدة',
      title_en: '4. WhatsApp Automation & Rent Collection Hub',
      badge_ar: 'التحصيل الذكي',
      badge_en: 'Collections',
      summary_ar: 'إرسال تذكيرات الإيجار، روابط السداد المباشر بمدى وأبل باي، وإشعارات الصيانة عبر WhatsApp.',
      summary_en: 'Sending automated rent due reminders, Mada / Apple Pay checkout links, and maintenance notices.',
      steps_ar: [
        {
          title: 'تحديد المستأجرين المستحقين للدفع',
          desc: 'يقوم النظام بفرز العقود التي اقترب موعد سدادها (خلال 15 يوماً) أو المتأخرة عن السداد تلقائياً.',
        },
        {
          title: 'إرسال رسالة مجهزة ومخصصة',
          desc: 'اضغط على أيقونة «إرسال واتساب» لتوليد رسالة تتضمن: اسم المستأجر، رقم الشقة، المبلغ المستحق، ورابط السداد الإلكتروني.',
        },
        {
          title: 'إشعارات زيارة الفنيين',
          desc: 'يمكنك أيضاً إرسال إشعار فوري للمستأجر عند تعيين فني صيانة لإصلاح عطل في وحدته مع رقم الفني ووقت الزيارة المتوقع.',
        },
      ],
      steps_en: [
        {
          title: 'Identify Due & Overdue Tenants',
          desc: 'The system automatically highlights leases due within 15 days or past due dates with automated penalty calculations.',
        },
        {
          title: 'Dispatch Personalized Payment Notices',
          desc: 'Click "Send WhatsApp" to generate a tailored message with tenant name, unit number, amount due, and direct payment link.',
        },
        {
          title: 'Maintenance Dispatch Alerts',
          desc: 'Instantly notify tenants via WhatsApp when a technician is dispatched to inspect or repair their unit.',
        },
      ],
      proTip_ar: 'استخدام رسائل الواتساب يرفع سرعة تحصيل الإيجارات بنسبة تزيد عن 75% مقارنة بالاتصالات الهاتفية التقليدية.',
      proTip_en: 'WhatsApp collection alerts achieve over 75% faster payment turnarounds compared to traditional phone calls.',
    },
    {
      id: 'zatca',
      icon: FileCheck,
      title_ar: '٥. سندات القبض والفوترة الضريبية الإلكترونية',
      title_en: '5. Electronic Receipts & Tax Invoicing',
      badge_ar: 'المالية والفواتير',
      badge_en: 'Invoicing',
      summary_ar: 'إصدار سندات قبض وفواتير ضريبية إلكترونية مع احتساب ضريبة القيمة المضافة 15%.',
      summary_en: 'Issuing digital payment receipts and tax invoices with 15% VAT calculation.',
      steps_ar: [
        {
          title: 'تسجيل دفعة إيجار جديدة',
          desc: 'عند استلام مبلغ من المستأجر (نقداً، تحويل بنكي، أو مدى)، اضغط على «سند قبض رسمي» من قائمة الأدوات أو من جدول المالية.',
        },
        {
          title: 'توليد الرمز الإلكتروني (QR Code)',
          desc: 'يتم تضمين رمز QR في السند شاملاً: اسم المنشأة، الرقم الضريبي، تاريخ وتوقيت العملية، ومبلغ الضريبة.',
        },
        {
          title: 'الطباعة والتصدير الفوري',
          desc: 'يمكنك طباعة السند بضغطة زر واحدة بتنسيق رسمي، أو حفظه بصيغة PDF ومشاركته مباشرة مع المستأجر.',
        },
      ],
      steps_en: [
        {
          title: 'Record a Rent Payment',
          desc: 'Upon receiving rent via bank transfer, Mada, or cash, click "Official Receipt" from the Tools menu or Finance table.',
        },
        {
          title: 'Generate Digital QR Code',
          desc: 'The receipt automatically includes a QR code containing company name, VAT registration number, timestamp, and tax breakdown.',
        },
        {
          title: 'Direct Printing & PDF Sharing',
          desc: 'Print the receipt directly onto official A4 stationery or export as PDF to share instantly with the tenant.',
        },
      ],
      proTip_ar: 'تأكد من إدخال الرقم الضريبي للشركة من إعدادات المنشأة ليظهر على كافة سندات القبض الصادرة.',
      proTip_en: 'Ensure your corporate VAT number is configured so it displays automatically on all printed receipts.',
    },
    {
      id: 'maintenance',
      icon: Wrench,
      title_ar: '٦. إدارة تذاكر الصيانة والبلاغات الفنية',
      title_en: '6. Maintenance Tickets & Facility Operations',
      badge_ar: 'التشغيل',
      badge_en: 'Operations',
      summary_ar: 'استقبال بلاغات السباكة والكهرباء والتكييف، وتعيين الفنيين، وتتبع تكلفة الإصلاح.',
      summary_en: 'Handling plumbing, electrical, and HVAC requests, assigning technicians, and tracking repair costs.',
      steps_ar: [
        {
          title: 'تسجيل بلاغ صيانة جديد',
          desc: 'حدد الوحدة السكنية، نوع العطل (تكييف، كهرباء، سباكة، مصاعد)، ودرجة الأهمية (طارئ، متوسط، منخفض).',
        },
        {
          title: 'إسناد البلاغ للفني المختص',
          desc: 'اختر الفني المتاح في المبنى لتصل له تفاصيل التذكرة ورقم المستأجر للتوجه المباشر للموقع.',
        },
        {
          title: 'إغلاق التذكرة واحتساب التكلفة',
          desc: 'بعد إتمام الإصلاح، يتم تسجيل تكلفة قطع الغيار وأجرة اليد العاملة لحسمها تلقائياً من ميزانية العقار.',
        },
      ],
      steps_en: [
        {
          title: 'Log a Maintenance Request',
          desc: 'Select the unit, defect category (HVAC, plumbing, electrical, elevator), and priority level (Emergency, Normal, Low).',
        },
        {
          title: 'Assign Field Technician',
          desc: 'Designate the available technician, who receives unit details and tenant contact information.',
        },
        {
          title: 'Resolve Ticket & Record Expenses',
          desc: 'Upon completion, log spare parts and labor costs to record them automatically under property expense statements.',
        },
      ],
      proTip_ar: 'تحويل البلاغات الطارئة إلى تذاكر فورية يحافظ على قيمة أصولك العقارية ويمنع تفاقم أضرار التسريبات والأعطال.',
      proTip_en: 'Promptly logging emergency tickets protects property asset values and prevents costly water or electrical damage.',
    },
    {
      id: 'install',
      icon: Download,
      title_ar: '٧. تثبيت التطبيق على الكمبيوتر، الآيفون، والأندرويد',
      title_en: '7. Installing on Desktop, iPhone & Android (PWA)',
      badge_ar: 'التثبيت',
      badge_en: 'Offline & PWA',
      summary_ar: 'تشغيل المنصة كبرنامج مستقل وسريع بدون الحاجة لفتح المتصفح في كل مرة.',
      summary_en: 'Running the platform as a fast standalone software without opening a browser tab.',
      steps_ar: [
        {
          title: 'على جهاز الكمبيوتر (Windows / Mac)',
          desc: 'اضغط على زر «تثبيت التطبيق 📲» في الأعلى، ثم اضغط «تثبيت فوري الآن»، ليظهر التطبيق كأيقونة على سطح المكتب وشريط المهام.',
        },
        {
          title: 'على هواتف الآيفون (iPhone Safari)',
          desc: 'اضغط على أيقونة المشاركة (Share ⎋) في أسفل شاشة Safari، ثم اختر «إضافة إلى الشاشة الرئيسية (Add to Home Screen ⊞)».',
        },
        {
          title: 'على هواتف الأندرويد (Samsung / Xiaomi / Chrome)',
          desc: 'اضغط على زر «تثبيت التطبيق»، أو من خيارات المتصفح (⋮) اختر «تثبيت التطبيق (Install App)».',
        },
      ],
      steps_en: [
        {
          title: 'On Desktop Computers (Windows / Mac)',
          desc: 'Click "Install App" in the top navbar, then click "Install Now" to place a native desktop icon on your screen and taskbar.',
        },
        {
          title: 'On iPhone & iPad (Safari iOS)',
          desc: 'Tap the Share icon (⎋) at the bottom of Safari, scroll down and tap "Add to Home Screen (⊞)", then tap "Add".',
        },
        {
          title: 'On Android Devices (Chrome)',
          desc: 'Tap "Install App" or open Chrome menu (⋮) and tap "Install app" to launch in fullscreen mode.',
        },
      ],
      proTip_ar: 'التطبيق بعد التثبيت يفتح بسرعة مضاعفة ويمنحك شاشة كاملة ونظيفة للعمل اليومي المريح.',
      proTip_en: 'Installed PWA opens twice as fast and provides a clean fullscreen workspace for your daily operations.',
    },
  ];

  const filteredSections = sections.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title_ar.toLowerCase().includes(q) ||
      s.title_en.toLowerCase().includes(q) ||
      s.summary_ar.toLowerCase().includes(q) ||
      s.summary_en.toLowerCase().includes(q)
    );
  });

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0F5A47] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-300 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">
                  {guideLang === 'ar' ? 'دليل الاستخدام والتشغيل السريع' : 'User Manual & Operation Guide'}
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {guideLang === 'ar' ? 'معتمد ومحدث' : 'Official Guide'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {guideLang === 'ar'
                  ? 'شرح تفصيلي خطوة بخطوة لكافة مزايا وإجراءات منصة مَحْفَظَتِي العَقَارِيَّة العقارية'
                  : 'Comprehensive step-by-step instructions for all My Real Estate Portfolio features'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/20 text-xs">
              <button
                onClick={() => setGuideLang('ar')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  guideLang === 'ar' ? 'bg-white text-slate-950 shadow-xs' : 'text-white hover:bg-white/10'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => setGuideLang('en')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  guideLang === 'en' ? 'bg-white text-slate-950 shadow-xs' : 'text-white hover:bg-white/10'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={guideLang === 'ar' ? 'ابحث عن ميزة (الواتساب، الفواتير، الوحدات، الصيانة)...' : 'Search features (WhatsApp, Invoices, Floor Matrix, Maintenance)...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F5A47]"
            />
          </div>
        </div>

        {/* Content Layout: Sidebar + Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-e border-slate-200 bg-slate-50/50 p-2 overflow-y-auto space-y-1">
            {filteredSections.map((section) => {
              const IconComp = section.icon;
              const isActive = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full text-start p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-white text-[#0F5A47] border border-slate-200 shadow-xs font-black'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0F5A47]' : 'text-slate-400'}`} />
                    <span className="truncate">
                      {guideLang === 'ar' ? section.title_ar : section.title_en}
                    </span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0F5A47]' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Main Chapter Content */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
            
            {/* Chapter Header */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  {guideLang === 'ar' ? activeSection.badge_ar : activeSection.badge_en}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {guideLang === 'ar' ? activeSection.title_ar : activeSection.title_en}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {guideLang === 'ar' ? activeSection.summary_ar : activeSection.summary_en}
              </p>
            </div>

            {/* Action Steps */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {guideLang === 'ar' ? 'خطوات التنفيذ المباشرة:' : 'Operational Execution Steps:'}
              </h4>
              
              <div className="space-y-3">
                {(guideLang === 'ar' ? activeSection.steps_ar : activeSection.steps_en).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {step.title}
                      </div>
                      <p className="text-slate-600 text-xs leading-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-xs block mb-0.5">
                  {guideLang === 'ar' ? 'ملاحظة تشغيلية هامة:' : 'Operational Best Practice:'}
                </span>
                <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                  {guideLang === 'ar' ? activeSection.proTip_ar : activeSection.proTip_en}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>
              {guideLang === 'ar'
                ? 'فريق الدعم الفني متاح للمساعدة السريعة على مدار 24/7'
                : 'Enterprise support team available 24/7 for technical assistance'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{guideLang === 'ar' ? 'طباعة الدليل' : 'Print Manual'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold transition-all shadow-xs"
            >
              {guideLang === 'ar' ? 'فهمت، إغلاق الدليل' : 'Got it, Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
