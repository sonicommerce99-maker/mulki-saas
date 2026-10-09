import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../../locales/translations';
import { MulkiAppIcon } from '../layout/MulkiLogo';
import { loadOwnerSettings } from '../../lib/ownerSettings';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Building2,
  CreditCard,
  FileText,
  Wrench,
  Smartphone,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Bot,
  User,
} from 'lucide-react';

export interface FaqChatbotWidgetProps {
  lang: Language;
  onOpenPricingModal: () => void;
  onOpenAiScanner: () => void;
  onOpenInstallModal: () => void;
  onOpenGuideModal: () => void;
  onOpenReceiptModal: () => void;
  onNavigateTab: (tab: string) => void;
}

type FaqCategory = 'all' | 'pricing' | 'leases' | 'finance' | 'maintenance' | 'tech';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'all'>;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  keywords: string[];
  actionLabel_ar?: string;
  actionLabel_en?: string;
  actionType?: 'pricing' | 'ai_scanner' | 'install' | 'guide' | 'receipt' | 'tab_floormap' | 'tab_whatsapp' | 'whatsapp_human';
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionLabel?: string;
  actionType?: FaqItem['actionType'];
  relatedFaqs?: FaqItem[];
}

const FAQ_DATABASE: FaqItem[] = [
  {
    id: 'faq-what-is',
    category: 'tech',
    question_ar: 'ما هي منصة «مَحْفَظَتِي العَقَارِيَّة» وما الذي يميزها؟',
    question_en: 'What is "My Real Estate Portfolio" and what makes it unique?',
    answer_ar:
      'منصة «مَحْفَظَتِي العَقَارِيَّة | My Real Estate Portfolio» هي نظام سحابي متكامل لإدارة الأملاك والعقارات والمكاتب العقارية في دول الخليج والعالم العربي.\n\nتجمع المنصة في شاشة واحدة:\n• إدارة العقارات والوحدات والمخطط الهندسي التفاعلي\n• قارئ عقود الإيجار بالذكاء الاصطناعي (Ejar AI)\n• تحصيل الإيجارات وتذكيرات الواتساب الآلية\n• إصدار الفواتير الضريبية الإلكترونية (مع رمز QR) وسندات القبض\n• إدارة تذاكر الصيانة وبوابة المستأجر وبوابة المستثمر VIP.',
    answer_en:
      '"My Real Estate Portfolio" is an all-in-one cloud PropTech platform for managing properties, leases, maintenance workflows, electronic tax invoicing, WhatsApp rent reminders, and VIP investor portfolios.',
    keywords: ['ما هي', 'منصة', 'محفظتي', 'مميزات', 'شرح', 'what', 'about', 'portfolio'],
    actionLabel_ar: '📖 فتح دليل الاستخدام الشامل',
    actionLabel_en: '📖 Open Complete User Guide',
    actionType: 'guide',
  },
  {
    id: 'faq-pricing',
    category: 'pricing',
    question_ar: 'ما هي أسعار باقات الاشتراك؟ وهل توجد فترة تجربة مجانية؟',
    question_en: 'What are the subscription plans? Is there a free trial period?',
    answer_ar:
      'نعم! جميع الباقات تتضمن **فترة تجربة مجانية شاملة لمدة 7 أيام (7-Day Free Trial)** لتجربة النظام بالكامل:\n\n1️⃣ **باقة الانطلاقة (Starter):** 99 ر.س / شهرياً (أو 79 ر.س سنوياً) — حتى 35 وحدة عقارية.\n2️⃣ **🔥 باقة النمو الاحترافية (Growth Pro):** 249 ر.س / شهرياً (أو 199 ر.س سنوياً) — حتى 200 وحدة عقارية شاملة قارئ العقود بالذكاء الاصطناعي وأتمتة الواتساب.\n3️⃣ **باقة الشركات القابضة (Enterprise):** 499 ر.س / شهرياً (أو 399 ر.س سنوياً) لعدد غير محدود من العقارات والوحدات وبوابة المستثمر VIP.',
    answer_en:
      'All plans include a **7-Day Full Free Trial**:\n1. Starter Plan: 99 SAR/month (up to 35 units).\n2. 🔥 Growth Pro Plan: 249 SAR/month (up to 200 units + AI Scanner + WhatsApp Hub).\n3. Enterprise Plan: 499 SAR/month for unlimited units & VIP Investor Portal.',
    keywords: ['سعر', 'اسعار', 'باقات', 'اشتراك', 'تجربة', 'مجانية', 'كم', 'تمن', 'ثمن', 'price', 'pricing', 'trial', 'cost', '99', '199', '249'],
    actionLabel_ar: '💎 عرض الباقات وبدء تجربة 7 أيام مجاناً',
    actionLabel_en: '💎 View Plans & Start 7-Day Free Trial',
    actionType: 'pricing',
  },
  {
    id: 'faq-payment-methods',
    category: 'pricing',
    question_ar: 'كيف يمكنني الدفع وتفعيل اشتراك شركتي العقارية فوراً؟',
    question_en: 'How can I pay and activate my real estate company subscription?',
    answer_ar:
      'عملية الاشتراك والتفعيل سريعة ومؤمنة 100%:\n\n1. اضغط على زر **«الباقات والأسعار»** واختر الباقة المناسبة.\n2. أدخل بيانات مكتبك أو شركتك العقارية.\n3. يمكنك السداد عبر **البطاقة البنكية (مدى / فيزا / ماستركارد)**، **Apple Pay**، أو **التحويل البنكي المباشر (IBAN / SWIFT / RIB)**.\n4. فور التأكيد، يصدر لك النظام مفتاح الترخيص الرسمي (`License Key`) والفاتورة الضريبية، ويفتح لك محادثة واتساب مباشرة مع الإدارة لتفعيل حسابك فوراً.',
    answer_en:
      'Click "Pricing Plans", choose your plan, fill in your company details, and complete checkout via Card, Apple Pay, or Direct Bank Transfer (IBAN/SWIFT). Your license key is generated immediately.',
    keywords: ['دفع', 'تحويل', 'بنك', 'فيزا', 'مدى', 'تفعيل', 'شراء', 'خلص', 'iban', 'rib', 'swift', 'pay', 'payment', 'bank'],
    actionLabel_ar: '💳 الانتقال لبوابة الدفع والتفعيل',
    actionLabel_en: '💳 Go to Payment Checkout',
    actionType: 'pricing',
  },
  {
    id: 'faq-ai-scanner',
    category: 'leases',
    question_ar: 'كيف يعمل قارئ عقود الإيجار بالذكاء الاصطناعي (AI Scanner)؟',
    question_en: 'How does the AI Lease Contract Scanner work?',
    answer_ar:
      'بدلاً من إدخال بيانات المستأجر والعقد يدوياً في 10 دقائق، يقوم **قارئ العقود الذكي (AI Scanner)** بقراءة ملف عقد إيجار (PDF أو صورة) خلال 3 ثوانٍ فقط!\n\nيستخرج النظام تلقائياً:\n• اسم المستأجر ورقم الهوية والجوال\n• رقم عقد إيجار الموحد ورقم الوحدة\n• قيمة الإيجار السنوي وجدول الدفعات وتواريخ الاستحقاق\nوبضغطة زر واحدة يتم حفظ العقد في جدول التحصيل!',
    answer_en:
      'Instead of manual data entry, upload your Ejar contract PDF or image and our AI Scanner extracts tenant details, contract number, unit, and annual rent in 3 seconds!',
    keywords: ['ذكاء', 'عقد', 'عقود', 'قارئ', 'ايجار', 'ماسح', 'ai', 'scanner', 'lease', 'ejar', 'pdf'],
    actionLabel_ar: '✨ تجربة قارئ العقود الذكي الآن',
    actionLabel_en: '✨ Try AI Lease Scanner Now',
    actionType: 'ai_scanner',
  },
  {
    id: 'faq-zatca-invoices',
    category: 'finance',
    question_ar: 'كيف تعمل الفواتير الضريبية وسندات القبض الإلكترونية في المنصة؟',
    question_en: 'How do electronic tax invoices and payment receipts work?',
    answer_ar:
      'تدعم المنصة إصدار:\n• **فواتير ضريبية إلكترونية** تحتوي على رمز الاستجابة السريع (`QR Code`) وحساب تلقائي لضريبة القيمة المضافة (15%).\n• **سندات قبض إلكترونية رسمية (PDF)** موثقة بالختم الرقمي للمنشأة وجاهزة للطباعة أو الإرسال للمستأجر عبر واتساب.\n• **تقرير التدقيق المالي والضريبي الشامل** بصيغة PDF و Excel/CSV للمحاسب المالي.',
    answer_en:
      'The platform generates electronic tax invoices with QR codes and 15% VAT calculation, official PDF payment receipts with digital stamps, and full financial audit reports.',
    keywords: ['فاتورة', 'فواتير', 'ضريبة', 'سند', 'قبض', 'مالية', 'محاسبة', 'vat', 'invoice', 'receipt', 'tax'],
    actionLabel_ar: '🧾 معاينة سند قبض وفاتورة ضريبية',
    actionLabel_en: '🧾 Preview Official Tax Receipt',
    actionType: 'receipt',
  },
  {
    id: 'faq-whatsapp-automation',
    category: 'leases',
    question_ar: 'كيف تعمل تذكيرات تحصيل الإيجار الآلية عبر الواتساب؟',
    question_en: 'How do automated WhatsApp rent collection reminders work?',
    answer_ar:
      'تتوفر في المنصة **محطة أتمتة الواتساب (WhatsApp Automation Hub)**:\n\n• يقوم النظام بفرز العقود التي اقترب موعد استحقاقها أو المتأخرة في السداد.\n• يمكنك اختيار قالب الرسالة (تذكير ودي قبل الاستحقاق، إشعار يوم الاستحقاق مع رقم الحساب البنكي IBAN، أو إنذار تأخير رسمي).\n• بضغطة زر يتم إرسال الرسالة مخصصة باسم المستأجر والمبلغ المستحق مباشرة إلى رقم جواله في واتساب!',
    answer_en:
      'Our WhatsApp Automation Hub automatically identifies upcoming and overdue leases and lets you send personalized rent reminders with IBAN details in one click.',
    keywords: ['واتساب', 'تذكير', 'تحصيل', 'متأخر', 'رسائل', 'whatsapp', 'reminder', 'collection', 'rent'],
    actionLabel_ar: '💬 فتح مركز رسائل الواتساب الآلي',
    actionLabel_en: '💬 Open WhatsApp Automation Hub',
    actionType: 'tab_whatsapp',
  },
  {
    id: 'faq-floormap-maintenance',
    category: 'maintenance',
    question_ar: 'كيف أتابع حالة الشقق والصيانة والمخطط الهندسي للعقار؟',
    question_en: 'How do I track unit occupancy, floor maps, and maintenance tickets?',
    answer_ar:
      'توفر لك المنصة أدوات بصرية وميدانية متقدمة:\n\n1. **المخطط الهندسي التفاعلي (Visual Floor Map):** يعرض كل طابق ووحدة عقارية بألوان واضحة (أخضر: مؤجرة، أزرق: شاغرة، أحمر: متأخرة السداد، برتقالي: تحت الصيانة).\n2. **نظام الصيانة الذكي:** متابعة التذاكر من لحظة طلب المستأجر، تعيين الفني المختص (تكييف، سباكة، كهرباء)، توثيق صور الإصلاح، وحتى تحويل التكلفة لفاتورة مالية.\n3. **بوابات مستقلة:** واجهة خاصة للفني الميداني، واجهة للمستأجر، وواجهة للمستثمر/المالك.',
    answer_en:
      'Use the interactive Visual Floor Map to inspect every floor and unit status in real time, and manage end-to-end maintenance tickets across dedicated Technician, Tenant, and Investor portals.',
    keywords: ['صيانة', 'فني', 'مخطط', 'شقق', 'وحدات', 'شاغرة', 'مؤجرة', 'مستأجر', 'maintenance', 'floor', 'map', 'units', 'ticket'],
    actionLabel_ar: '🏢 استعراض المخطط الهندسي للوحدات',
    actionLabel_en: '🏢 View Interactive Floor Map',
    actionType: 'tab_floormap',
  },
  {
    id: 'faq-install-cleanmode',
    category: 'tech',
    question_ar: 'هل يمكن تثبيت التطبيق على الجوال والكمبيوتر؟ وكيف أبدأ ببياناتي الخاصة؟',
    question_en: 'Can I install the app on my phone/PC? How do I start with a clean workspace?',
    answer_ar:
      'بكل تأكيد!\n\n📱 **التثبيت كتطبيق (PWA):** يمكنك تثبيت منصة «مَحْفَظَتِي العَقَارِيَّة» مباشرة على شاشة هاتفك (iPhone / Android) أو جهاز الكمبيوتر بضغطة زر بدون الحاجة لمتجر التطبيقات.\n\n🧹 **وضع مساحة العمل النظيفة (Clean Mode):** يمكنك الضغط على زر **«وضع جديد فارغ»** في الشريط العلوي لإخفاء البيانات التوضيحية فوراً والبدء بإدخال عقاراتك الحقيقية من الصفر!',
    answer_en:
      'Yes! You can install the platform directly on iOS, Android, or Desktop as a native PWA, and toggle "Clean Mode" in the top bar to start with a fresh empty workspace.',
    keywords: ['تثبيت', 'جوال', 'ايفون', 'اندرويد', 'تطبيق', 'فارغ', 'نظيف', 'بياناتي', 'install', 'app', 'iphone', 'android', 'clean'],
    actionLabel_ar: '📲 تثبيت التطبيق على جهازك الآن',
    actionLabel_en: '📲 Install App on Your Device',
    actionType: 'install',
  },
];

export const FaqChatbotWidget: React.FC<FaqChatbotWidgetProps> = ({
  lang,
  onOpenPricingModal,
  onOpenAiScanner,
  onOpenInstallModal,
  onOpenGuideModal,
  onOpenReceiptModal,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ownerSettings = loadOwnerSettings();

  const getInitialMessage = (): ChatMessage => ({
    id: 'welcome-msg',
    sender: 'bot',
    text:
      lang === 'ar'
        ? 'مرحباً بك في المساعد الذكي لمنصة «مَحْفَظَتِي العَقَارِيَّة» 👋\nأنا هنا للإجابة فوراً على كافة استفساراتك حول إدارة العقارات، العقود الذكية، الفواتير الضريبية، وباقات الاشتراك.\n\nاختر أي سؤال شائع بالأسفل أو اكتب سؤالك مباشرة:'
        : 'Welcome to the "My Real Estate Portfolio" Smart FAQ Assistant 👋\nAsk me anything about property management, AI lease scanning, tax invoicing, or subscription plans.\n\nClick any question below or type your question:',
    timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    actionLabel: lang === 'ar' ? '💎 استعراض الباقات وتجربة 7 أيام مجاناً' : '💎 View Plans & 7-Day Free Trial',
    actionType: 'pricing',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const categories: { id: FaqCategory; label_ar: string; label_en: string; icon: React.ReactNode }[] = [
    { id: 'all', label_ar: '🔥 الأكثر شيوعاً', label_en: '🔥 Popular', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'pricing', label_ar: '💎 الباقات والدفع', label_en: '💎 Pricing & Pay', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'leases', label_ar: '📄 العقود والواتساب', label_en: '📄 Leases & AI', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'finance', label_ar: '🧾 الفواتير والمالية', label_en: '🧾 Invoices & Finance', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'maintenance', label_ar: '🔧 الصيانة والوحدات', label_en: '🔧 Maintenance', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'tech', label_ar: '📱 التثبيت والنظام', label_en: '📱 App & Setup', icon: <Smartphone className="w-3.5 h-3.5" /> },
  ];

  const filteredFaqs =
    selectedCategory === 'all'
      ? FAQ_DATABASE
      : FAQ_DATABASE.filter((item) => item.category === selectedCategory);

  const handleTriggerAction = (actionType?: FaqItem['actionType']) => {
    if (!actionType) return;
    if (actionType === 'pricing') {
      setIsOpen(false);
      onOpenPricingModal();
    } else if (actionType === 'ai_scanner') {
      setIsOpen(false);
      onOpenAiScanner();
    } else if (actionType === 'install') {
      setIsOpen(false);
      onOpenInstallModal();
    } else if (actionType === 'guide') {
      setIsOpen(false);
      onOpenGuideModal();
    } else if (actionType === 'receipt') {
      setIsOpen(false);
      onOpenReceiptModal();
    } else if (actionType === 'tab_floormap') {
      setIsOpen(false);
      onNavigateTab('floormap');
    } else if (actionType === 'tab_whatsapp') {
      setIsOpen(false);
      onNavigateTab('whatsapp');
    } else if (actionType === 'whatsapp_human') {
      const url = `https://wa.me/${ownerSettings.whatsappNumber}?text=${encodeURIComponent(
        'مرحباً إدارة منصة مَحْفَظَتِي العَقَارِيَّة، لدي استفسار بخصوص الاشتراك في المنصة:'
      )}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSelectFaq = (faq: FaqItem) => {
    const now = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: lang === 'ar' ? faq.question_ar : faq.question_en,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: lang === 'ar' ? faq.answer_ar : faq.answer_en,
        timestamp: now,
        actionLabel: lang === 'ar' ? faq.actionLabel_ar : faq.actionLabel_en,
        actionType: faq.actionType,
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 380);
  };

  const handleSendCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    const lower = trimmed.toLowerCase();
    // Find best matching FAQ based on keywords or question substring
    let bestMatch: FaqItem | null = null;
    let bestScore = 0;

    for (const item of FAQ_DATABASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          score += 2;
        }
      }
      if (item.question_ar.includes(trimmed) || item.answer_ar.includes(trimmed)) {
        score += 3;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      if (bestMatch && bestScore > 0) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: lang === 'ar' ? bestMatch.answer_ar : bestMatch.answer_en,
          timestamp: now,
          actionLabel: lang === 'ar' ? bestMatch.actionLabel_ar : bestMatch.actionLabel_en,
          actionType: bestMatch.actionType,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const fallbackMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text:
            lang === 'ar'
              ? `شكراً لتواصلك معنا! بخصوص استفسارك: "${trimmed}"\n\nتوفر منصة «مَحْفَظَتِي العَقَارِيَّة» إدارة شاملة للعقارات، العقود، الصيانة، والفواتير الضريبية وسندات القبض، مع فترة تجربة مجانية لمدة 7 أيام وباقات اشتراك تبدأ من 99 ر.س/شهرياً.\n\nهل ترغب في التحدث مباشرة مع مستشار المبيعات عبر الواتساب أو استعراض الباقات؟`
              : `Thank you for your inquiry regarding "${trimmed}".\n\n"My Real Estate Portfolio" provides complete property, lease, maintenance, and tax invoicing management with a 7-Day Free Trial and plans starting at 99 SAR/mo.\n\nWould you like to chat directly with our sales desk on WhatsApp?`,
          timestamp: now,
          actionLabel:
            lang === 'ar'
              ? `💬 التحدث مع المبيعات عبر واتساب (${ownerSettings.whatsappDisplay})`
              : `💬 Chat on WhatsApp (${ownerSettings.whatsappDisplay})`,
          actionType: 'whatsapp_human',
          relatedFaqs: FAQ_DATABASE.slice(0, 3),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    }, 450);
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom Corner) */}
      {!isOpen && (
        <div className="fixed bottom-4 end-4 sm:bottom-6 sm:end-6 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 pl-4 pr-3 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0A4A35] via-[#0F5A47] to-[#16785D] hover:from-[#083A2A] hover:to-[#0F5A47] text-white shadow-2xl border-2 border-amber-300/80 transition-all hover:scale-105 cursor-pointer"
          >
            {/* Pulse Indicator */}
            <span className="absolute -top-1 -start-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-slate-900"></span>
            </span>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D2EBD4] flex items-center justify-center text-[#0F5A47] shadow-inner shrink-0">
              <Bot className="w-5 h-5 text-[#0A4A35]" />
            </div>

            <div className="text-start pe-1">
              <div className="text-[10px] text-amber-300 font-extrabold leading-none mb-0.5">
                {lang === 'ar' ? 'لديك استفسار؟ 24/7' : 'Need Help? 24/7'}
              </div>
              <div className="text-xs sm:text-sm font-black tracking-tight leading-none">
                {lang === 'ar' ? 'المساعد الذكي والأسئلة الشائعة' : 'Smart FAQ Assistant'}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Interactive FAQ Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-white border-2 border-[#0F5A47]/30 shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-6 rounded-3xl max-w-4xl mx-auto my-auto h-[90vh]'
              : 'bottom-3 end-3 sm:bottom-5 sm:end-5 w-[calc(100vw-1.5rem)] sm:w-[430px] h-[82vh] sm:h-[650px] max-h-[calc(100vh-1.5rem)] rounded-3xl'
          }`}
        >
          {/* 1. Chatbot Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#083A2A] via-[#0F5A47] to-[#157359] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <MulkiAppIcon className="w-10 h-10 rounded-xl" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-xs sm:text-sm text-white">
                    {lang === 'ar' ? 'مساعد «مَحْفَظَتِي العَقَارِيَّة» الذكي' : 'Portfolio Smart FAQ Bot'}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {lang === 'ar' ? 'متصل' : 'Online'}
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/90 mt-0.5">
                  {lang === 'ar'
                    ? 'إجابات فورية حول العقارات، العقود، الفواتير، والاشتراكات'
                    : 'Instant answers on Properties, Ejar AI, Invoices & Plans'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([getInitialMessage()])}
                title={lang === 'ar' ? 'بدء محادثة جديدة' : 'Reset Chat'}
                className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={lang === 'ar' ? 'تكبير / تصغير' : 'Expand / Minimize'}
                className="hidden sm:flex p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Category Filter Bar */}
          <div className="bg-[#F2F9F3] border-b border-emerald-900/10 px-3 py-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0F5A47] text-amber-300 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                  }`}
                >
                  <span>{ lang === 'ar' ? cat.label_ar : cat.label_en }</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Chat Messages & Interactive FAQ Chips Area */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                    msg.sender === 'bot'
                      ? 'bg-[#D2EBD4] text-[#0A4A35] border border-[#0F5A47]/20'
                      : 'bg-slate-900 text-amber-300'
                  }`}
                >
                  {msg.sender === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[84%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'bot'
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-ts-none'
                      : 'bg-[#0F5A47] text-white font-bold rounded-te-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Direct Action Button inside Bot Reply */}
                  {msg.actionLabel && msg.actionType && (
                    <button
                      type="button"
                      onClick={() => handleTriggerAction(msg.actionType)}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{msg.actionLabel}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 ${
                      msg.sender === 'bot' ? 'text-slate-400' : 'text-emerald-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-7 h-7 rounded-xl bg-[#D2EBD4] text-[#0A4A35] flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl text-[11px] font-bold text-[#0F5A47]">
                  {lang === 'ar' ? 'جاري كتابة الإجابة...' : 'Typing answer...'}
                </div>
              </div>
            )}

            {/* Interactive FAQ Question Cards */}
            <div className="pt-2 border-t border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-700 px-1">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#0F5A47]" />
                  <span>
                    {lang === 'ar'
                      ? 'اضغط على أي سؤال للحصول على إجابة فورية:'
                      : 'Click any FAQ for an instant answer:'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {filteredFaqs.length} {lang === 'ar' ? 'أسئلة' : 'FAQs'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {filteredFaqs.map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => handleSelectFaq(faq)}
                    className="w-full text-start p-2.5 rounded-xl bg-white hover:bg-[#F2F9F3] border border-slate-200 hover:border-[#0F5A47]/40 transition-all flex items-center justify-between gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#0A4A35] leading-snug">
                      {lang === 'ar' ? faq.question_ar : faq.question_en}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 group-hover:text-[#0F5A47] shrink-0 transition-transform ${
                        lang === 'ar' ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* 4. Quick Direct WhatsApp Sales Bar + Input Form */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                onClick={() => handleTriggerAction('whatsapp_human')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {lang === 'ar'
                    ? `تحدث مع الإدارة عبر واتساب (${ownerSettings.whatsappDisplay})`
                    : `Chat with Human Support (${ownerSettings.whatsappDisplay})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('pricing')}
                className="text-[11px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>💎 {lang === 'ar' ? 'الباقات والأسعار' : 'Pricing Plans'}</span>
              </button>
            </div>

            <form onSubmit={handleSendCustomQuery} className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'اكتب سؤالك هنا (مثلاً: كيف أشترك؟ أو كيف يعمل قارئ العقود؟)...'
                    : 'Type your question here (e.g. Pricing, Ejar AI, Invoices)...'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0F5A47] text-xs font-medium text-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#0F5A47] hover:bg-[#0A4A35] text-amber-300 shadow-xs transition-colors cursor-pointer shrink-0"
                title={lang === 'ar' ? 'إرسال' : 'Send'}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
