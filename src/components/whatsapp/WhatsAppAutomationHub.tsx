import React, { useState, useEffect } from 'react';
import { Language } from '../../locales/translations';
import { loadAccountSettings } from '../../lib/accountSettings';
import { loadOwnerSettings } from '../../lib/ownerSettings';
import {
  MessageSquare,
  Send,
  CheckCheck,
  Sparkles,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Settings,
  Globe,
  KeyRound,
  Bot,
  FileText,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Share2,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Play,
  Sliders,
} from 'lucide-react';

interface WhatsAppAutomationHubProps {
  lang: Language;
}

export interface KeywordAutomationRule {
  id: string;
  ruleNameAr: string;
  ruleNameEn: string;
  keywords: string[]; // e.g. ['payment', 'iban', 'سداد', 'دفع']
  matchType: 'contains' | 'exact';
  replyMessage: string;
  enabled: boolean;
  category: 'payment' | 'maintenance' | 'lease' | 'support' | 'custom';
}

const RULES_STORAGE_KEY = 'portfolio_whatsapp_automation_rules_v1';

type ProviderType = 'wa_direct' | 'waha_evolution' | 'twilio' | 'ultramsg_green' | 'custom_webhook';

interface WhatsAppApiConfig {
  provider: ProviderType;
  apiEndpointUrl: string;
  apiKeyOrToken: string;
  instanceOrFromNumber: string;
  autoReplyEnabled: boolean;
}

type TemplateKey =
  | 'rent_due'
  | 'overdue_warning'
  | 'maintenance_dispatch'
  | 'lease_renewal'
  | 'zatca_receipt'
  | 'b2b_saudi_pitch'
  | 'ai_auto_reply';

const API_STORAGE_KEY = 'portfolio_whatsapp_api_config_v1';

const defaultApiConfig: WhatsAppApiConfig = {
  provider: 'waha_evolution',
  apiEndpointUrl: 'https://waha.your-server.com/api/sendText',
  apiKeyOrToken: '',
  instanceOrFromNumber: 'default',
  autoReplyEnabled: true,
};

export const WhatsAppAutomationHub: React.FC<WhatsAppAutomationHubProps> = ({ lang }) => {
  const accountSettings = loadAccountSettings();
  const ownerSettings = loadOwnerSettings();

  // Active Sub-View: 'composer' | 'automation_rules' | 'api_config' | 'ai_autoreply'
  const [activeSubTab, setActiveSubTab] = useState<
    'composer' | 'automation_rules' | 'api_config' | 'ai_autoreply'
  >('composer');

  const defaultAutomationRules: KeywordAutomationRule[] = [
    {
      id: 'rule-payment-iban',
      ruleNameAr: 'بيانات السداد والتحويل البنكي (IBAN)',
      ruleNameEn: 'Payment & Bank IBAN Details',
      keywords: ['payment', 'pay', 'iban', 'bank', 'دفع', 'سداد', 'تحويل', 'آيبان', 'ايبان', 'حساب'],
      matchType: 'contains',
      category: 'payment',
      enabled: true,
      replyMessage: `🏦 *بيانات التحويل البنكي المعتمد لسداد الإيجار (Bank & IBAN Details):*\n\n• البنك: ${accountSettings.bankName}\n• رقم الآيبان (IBAN): ${accountSettings.ibanNumber}\n• المستفيد: ${accountSettings.beneficiaryName}\n\nيرجى إرسال إيصال التحويل في هذه المحادثة ليتم إصدار سند القبض الضريبي الإلكتروني فوراً.`,
    },
    {
      id: 'rule-maintenance-ticket',
      ruleNameAr: 'رابط متابعة بلاغات وتذاكر الصيانة',
      ruleNameEn: 'Maintenance Ticket Status Link',
      keywords: ['maintenance', 'repair', 'ticket', 'status', 'صيانة', 'بلاغ', 'تذكرة', 'تصليح', 'عطل', 'سباكة', 'تكييف'],
      matchType: 'contains',
      category: 'maintenance',
      enabled: true,
      replyMessage: `🔧 *خدمة الصيانة ومتابعة البلاغات (Maintenance & Ticket Status):*\n\nيمكنك فتح طلب صيانة جديد أو تتبع حالة تذكرتك الحالية وموعد وصول الفني مباشرة عبر بوابة المستأجر:\n🔗 https://mulki-saas.vercel.app/?tab=maintenance\n\nللحالات الطارئة، يرجى إرسال رقم الوحدة وصورة العطل هنا.`,
    },
    {
      id: 'rule-lease-contract',
      ruleNameAr: 'استفسارات العقود وتجديد الإيجار وسندات القبض',
      ruleNameEn: 'Lease Renewal & Tax Receipt Inquiry',
      keywords: ['lease', 'contract', 'renewal', 'receipt', 'invoice', 'عقد', 'تجديد', 'فاتورة', 'سند', 'إيجار'],
      matchType: 'contains',
      category: 'lease',
      enabled: true,
      replyMessage: `📄 *خدمات عقود الإيجار وسندات القبض (Leases & Receipts):*\n\nلاستعراض عقد الإيجار الخاص بك، مواعيد الدفعات القادمة، أو تحميل سند القبض الضريبي (PDF مع رمز QR)، تفضل بزيارة بوابة المستأجر:\n🔗 https://mulki-saas.vercel.app/?tab=leases`,
    },
    {
      id: 'rule-pricing-trial',
      ruleNameAr: 'باقات الاشتراك ورابط التجربة المجانية 7 أيام',
      ruleNameEn: 'Pricing Plans & 7-Day Free Trial',
      keywords: ['price', 'pricing', 'trial', 'demo', 'سعر', 'اسعار', 'باقات', 'اشتراك', 'تجربة'],
      matchType: 'contains',
      category: 'support',
      enabled: true,
      replyMessage: `💎 *باقات منصة مَحْفَظَتِي العَقَارِيَّة (مع تجربة مجانية 7 أيام):*\n• باقة الانطلاقة: 99 ر.س/شهرياً\n• باقة النمو السريع: 199 ر.س/شهرياً\n• باقة الشركات الكبرى: 499 ر.س/شهرياً\n\n🎁 ابدأ تجربتك المجانية الآن:\n🔗 https://mulki-saas.vercel.app`,
    },
  ];

  const [automationRules, setAutomationRules] = useState<KeywordAutomationRule[]>(() => {
    try {
      const raw = localStorage.getItem(RULES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return defaultAutomationRules;
  });

  useEffect(() => {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(automationRules));
    } catch {
      // ignore
    }
  }, [automationRules]);

  // New Rule Form State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleKeywords, setNewRuleKeywords] = useState('');
  const [newRuleMatchType, setNewRuleMatchType] = useState<'contains' | 'exact'>('contains');
  const [newRuleCategory, setNewRuleCategory] = useState<KeywordAutomationRule['category']>('custom');
  const [newRuleReply, setNewRuleReply] = useState('');
  const [ruleSavedToast, setRuleSavedToast] = useState(false);

  // Live Keyword Simulator State
  const [simulatorInput, setSimulatorInput] = useState('payment');
  const [simulatorPhone, setSimulatorPhone] = useState('+966501234567');

  const matchedRuleForSimulator = automationRules.find((rule) => {
    if (!rule.enabled) return false;
    const normalizedInput = simulatorInput.trim().toLowerCase();
    if (!normalizedInput) return false;
    return rule.keywords.some((kw) => {
      const normalizedKw = kw.trim().toLowerCase();
      if (!normalizedKw) return false;
      return rule.matchType === 'exact'
        ? normalizedInput === normalizedKw
        : normalizedInput.includes(normalizedKw);
    });
  });

  const handleAddAutomationRule = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedKeywords = newRuleKeywords
      .split(/[,،]+/)
      .map((k) => k.trim())
      .filter(Boolean);
    if (!newRuleName.trim() || parsedKeywords.length === 0 || !newRuleReply.trim()) return;

    const created: KeywordAutomationRule = {
      id: `rule-${Date.now()}`,
      ruleNameAr: newRuleName.trim(),
      ruleNameEn: newRuleName.trim(),
      keywords: parsedKeywords,
      matchType: newRuleMatchType,
      category: newRuleCategory,
      enabled: true,
      replyMessage: newRuleReply.trim(),
    };

    setAutomationRules([created, ...automationRules]);
    setNewRuleName('');
    setNewRuleKeywords('');
    setNewRuleReply('');
    setRuleSavedToast(true);
    setTimeout(() => setRuleSavedToast(false), 3000);
  };

  const handleToggleRule = (id: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setAutomationRules((prev) => prev.filter((r) => r.id !== id));
  };

  // API Configuration State
  const [apiConfig, setApiConfig] = useState<WhatsAppApiConfig>(() => {
    try {
      const raw = localStorage.getItem(API_STORAGE_KEY);
      if (raw) return { ...defaultApiConfig, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return defaultApiConfig;
  });

  const [apiSavedBanner, setApiSavedBanner] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(API_STORAGE_KEY, JSON.stringify(apiConfig));
    } catch {
      // ignore
    }
  }, [apiConfig]);

  // Template & Live Variables State
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('rent_due');
  const [testPhoneNumber, setTestPhoneNumber] = useState('+966501234567');
  const [testTenantName, setTestTenantName] = useState('سلطان عبدالله الدوسري');
  const [testAmount, setTestAmount] = useState('37,500');
  const [testUnit, setTestUnit] = useState('فيلا V-101 - مجمع الواحة');
  const [customEditedMessage, setCustomEditedMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedAutoReplyIndex, setCopiedAutoReplyIndex] = useState<number | null>(null);

  // Dispatch Status
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'sending' | 'success' | 'fallback_wa'>('idle');
  const [dispatchLog, setDispatchLog] = useState<string>('');

  const templates: Record<
    TemplateKey,
    {
      badge_ar: string;
      title_ar: string;
      title_en: string;
      subtitle_ar: string;
      message: string;
    }
  > = {
    rent_due: {
      badge_ar: 'تحصيل الإيجار 💳',
      title_ar: '١. تذكير موعد سداد الإيجار الدوري + الآيبان',
      title_en: '1. Rent Due Reminder + Bank IBAN',
      subtitle_ar: 'تذكير ودي مع رقم حساب الآيبان المعتمد للسداد',
      message: `مرحباً بك أستاذ {name} 👋\n\nنود تذكيركم بود بحلول موعد سداد دفعة الإيجار الخاصة بـ ({unit}) بمبلغ {amount} ر.س.\n\n🏦 *بيانات التحويل البنكي المعتمد:*\n• البنك: ${accountSettings.bankName}\n• الآيبان (IBAN): ${accountSettings.ibanNumber}\n• المستفيد: ${accountSettings.beneficiaryName}\n\nيرجى إرسال إيصال التحويل لإصدار سند القبض الضريبي الإلكتروني فوراً.\nمع تحيات ${accountSettings.companyNameAr} 🏢`,
    },
    overdue_warning: {
      badge_ar: 'متأخرات السداد ⚠️',
      title_ar: '٢. إشعار رسمي بتأخر سداد الدفعة الإيجارية',
      title_en: '2. Overdue Rent Official Notice',
      subtitle_ar: 'تنبيه رسمي للعقود المتأخرة عن موعد الاستحقاق',
      message: `إشعار هام بتأخر السداد ⚠️\nالمستأجر الكريم: أستاذ {name}\nالوحدة العقارية: {unit}\nالمبلغ المستحق: {amount} ر.س\n\nنفيدكم بتأخر سداد الدفعة الإيجارية المستحقة. نرجو المبادرة بالسداد العاجل على حساب الآيبان المعتمد:\n${accountSettings.ibanNumber} (${accountSettings.bankName})\n\nلتفادي الإجراءات النظامية عبر شبكة إيجار.\nإدارة التحصيل - ${accountSettings.companyNameAr}`,
    },
    maintenance_dispatch: {
      badge_ar: 'الصيانة الميدانية 🔧',
      title_ar: '٣. إشعار خروج الفني للصيانة ومتابعة البلاغ',
      title_en: '3. Technician Dispatch Notification',
      subtitle_ar: 'إبلاغ المستأجر بموعد وصول الفني ورقم جواله',
      message: `عزيزي المستأجر أستاذ {name} 🔧\n\nنفيدكم بأن الفني المختص (م. أحمد الشربيني) في الطريق إليكم لمعاينة بلاغ الصيانة #{ticket_id} الخاص بالوحدة ({unit}).\n\n📱 رقم جوال الفني للتنسيق المباشر: +966598711223\n\nشكراً لتعاونكم - ${accountSettings.companyNameAr} ✨`,
    },
    lease_renewal: {
      badge_ar: 'تجديد العقود 📄',
      title_ar: '٤. إشعار تجديد عقد الإيجار قبل 60 يوماً',
      title_en: '4. 60-Day Lease Renewal Notice',
      subtitle_ar: 'تأكيد رغبة المستأجر في تجديد العقد عبر شبكة إيجار',
      message: `السلام عليكم أستاذ {name} 📄\n\nنود إحاطتكم علماً بأن عقد إيجاركم للوحدة ({unit}) يقترب من موعد التجديد السنوي.\n\nيسرنا استمرار إقامتكم معنا. لتأكيد الرغبة في التجديد وتوثيق العقد عبر شبكة إيجار، يرجى الرد بكلمة (تأكيد التجديد).\n\nدمتم بخير - ${accountSettings.companyNameAr} 🌟`,
    },
    zatca_receipt: {
      badge_ar: 'سند قبض ضريبي 🧾',
      title_ar: '٥. إرسال سند القبض والفاتورة الضريبية بعد السداد',
      title_en: '5. Official Tax Payment Receipt',
      subtitle_ar: 'تأكيد استلام الإيجار وإرسال رقم السند الضريبي',
      message: `تم استلام دفعتكم بنجاح أستاذ {name} ✅\n\n• الوحدة العقارية: {unit}\n• المبلغ المستلم: {amount} ر.س\n• رقم سند القبض الضريبي: REC-2026-9041\n• حالة التوثيق: موثق بالختم الرقمي ورمز QR\n\nنشكركم على التزامكم الدائم بالسداد في الموعد المحدد.\n${accountSettings.companyNameAr} 🏛️`,
    },
    b2b_saudi_pitch: {
      badge_ar: 'تسويق للمكاتب العقارية 🇸🇦',
      title_ar: '٦. عرض تسويقي للمكاتب العقارية في السعودية (7 أيام مجاناً)',
      title_en: '6. B2B Sales Pitch for Saudi Real Estate Offices',
      subtitle_ar: 'رسالة جاهزة لإرسالها للمكاتب العقارية في الرياض وجدة والدمام',
      message: `السلام عليكم ورحمة الله وبركاته 👋\nالإخوة الكرام في مكتب ({name}) العقاري المحترمين،\n\nيسعدنا دعوتكم لتجربة منصة «مَحْفَظَتِي العَقَارِيَّة | My Real Estate Portfolio» السحابية لإدارة الأملاك والمكاتب العقارية في المملكة 🇸🇦🏢\n\n✅ قارئ عقود إيجار الذكي بالذكاء الاصطناعي في 3 ثوانٍ\n✅ تذكيرات تحصيل الإيجار الآلية عبر الواتساب والإيميل مع حسابكم البنكي (IBAN)\n✅ إصدار فواتير ضريبية وسندات قبض إلكترونية (مع رمز QR) بضغطة زر\n\n🎁 *تفضلوا بتجربة المنصة مجاناً لمدة 7 أيام كاملة من الرابط المباشر:*\n🔗 https://mulki-saas.vercel.app\n\nباقات الاشتراك تبدأ من 99 ر.س/شهرياً فقط.\nللتواصل المباشر: ${ownerSettings.whatsappDisplay}`,
    },
    ai_auto_reply: {
      badge_ar: 'رد آلي ذكي 🤖',
      title_ar: '٧. قالب الترحيب والرد الآلي الذكي للواتساب (AI Bot)',
      title_en: '7. AI Auto-Responder Welcome Menu',
      subtitle_ar: 'يرد تلقائياً على العملاء الجدد بالأسعار ورابط التجربة',
      message: `أهلاً وسهلاً بك في منصة «مَحْفَظَتِي العَقَارِيَّة | My Real Estate Portfolio» 🏢✨\nأنا المساعد الذكي الآلي، يسعدني خدمتك فوراً:\n\n🎁 *لتجربة المنصة مجاناً لمدة 7 أيام كاملة:*\n🔗 https://mulki-saas.vercel.app\n\n💎 *باقات الاشتراك المعتمدة:*\n1️⃣ باقة الانطلاقة: 99 ر.س/شهرياً (حتى 35 وحدة)\n2️⃣ باقة النمو السريع: 199 ر.س/شهرياً (حتى 150 وحدة + قارئ العقود بالذكاء الاصطناعي)\n3️⃣ باقة الشركات الكبرى: 499 ر.س/شهرياً (وحدات غير محدودة)\n\n🏦 *للاشتراك الفوري والتحويل البنكي:*\n• البنك: ${ownerSettings.bankName}\n• الآيبان (IBAN): ${ownerSettings.ibanNumber}\n\nأرسل كلمة (اشتراك) أو صورة التحويل لتفعيل رخصتك فوراً!`,
    },
  };

  const getComputedMessage = () => {
    if (customEditedMessage !== null) return customEditedMessage;
    let msg = templates[selectedTemplate].message;
    msg = msg.replace(/\{name\}/g, testTenantName);
    msg = msg.replace(/\{unit\}/g, testUnit);
    msg = msg.replace(/\{amount\}/g, testAmount);
    msg = msg.replace(/\{ticket_id\}/g, 'TCK-2026-1049');
    return msg;
  };

  const handleSelectTemplate = (key: TemplateKey) => {
    setSelectedTemplate(key);
    setCustomEditedMessage(null);
  };

  const cleanPhone = testPhoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(getComputedMessage());
  const whatsappDirectUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(getComputedMessage());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Send message directly via configured Free/Open-Source WhatsApp API or fallback to direct WhatsApp link
  const handleSendViaConfiguredApi = async () => {
    setDispatchStatus('sending');
    setDispatchLog('');

    const messageText = getComputedMessage();

    // If user selected Direct WhatsApp or left API URL empty -> open wa.me directly
    if (apiConfig.provider === 'wa_direct' || !apiConfig.apiEndpointUrl.trim()) {
      const linkEl = document.createElement('a');
      linkEl.href = whatsappDirectUrl;
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);

      setDispatchStatus('success');
      setDispatchLog(
        lang === 'ar'
          ? `تم فتح محادثة واتساب المباشرة للرقم (${testPhoneNumber}) بنص القالب المجهز!`
          : `Opened direct WhatsApp chat for ${testPhoneNumber}!`
      );
      setTimeout(() => setDispatchStatus('idle'), 5000);
      return;
    }

    // Attempt real HTTP POST to the user's configured WhatsApp API endpoint (WAHA / Evolution API / Twilio / UltraMsg / Webhook)
    try {
      const payload =
        apiConfig.provider === 'waha_evolution'
          ? {
              chatId: `${cleanPhone}@c.us`,
              text: messageText,
              session: apiConfig.instanceOrFromNumber || 'default',
            }
          : apiConfig.provider === 'ultramsg_green'
          ? {
              token: apiConfig.apiKeyOrToken,
              to: `+${cleanPhone}`,
              body: messageText,
            }
          : {
              to: `+${cleanPhone}`,
              from: apiConfig.instanceOrFromNumber,
              body: messageText,
              message: messageText,
              phone: cleanPhone,
            };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiConfig.apiKeyOrToken.trim()) {
        headers['Authorization'] = `Bearer ${apiConfig.apiKeyOrToken.trim()}`;
        headers['X-Api-Key'] = apiConfig.apiKeyOrToken.trim();
      }

      const response = await fetch(apiConfig.apiEndpointUrl.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setDispatchStatus('success');
        setDispatchLog(
          lang === 'ar'
            ? `تم إرسال الرسالة آلياً بنجاح عبر رابط WhatsApp API (${apiConfig.provider}) إلى الرقم ${testPhoneNumber}!`
            : `Message dispatched via WhatsApp API (${apiConfig.provider}) to ${testPhoneNumber}!`
        );
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch {
      // Graceful fallback: open direct WhatsApp link so message is ALWAYS delivered even if local API server isn't running
      const linkEl = document.createElement('a');
      linkEl.href = whatsappDirectUrl;
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);

      setDispatchStatus('fallback_wa');
      setDispatchLog(
        lang === 'ar'
          ? `تم تجهيز الطلب لـ API وفتح الواتساب المباشر للرقم (${testPhoneNumber}) لضمان الإرسال الفوري 100%!`
          : `API payload prepared and opened direct WhatsApp for ${testPhoneNumber}!`
      );
    }

    setTimeout(() => setDispatchStatus('idle'), 5000);
  };

  const freeAutoReplyRules = [
    {
      shortcut: '/welcome',
      keywords: '* (رسالة الترحيب التلقائية لأي عميل جديد)',
      trigger: '١. رسالة الترحيب التلقائية (Greeting Message) + القائمة الرقمية (1 إلى 6)',
      reply: `أهلاً وسهلاً بك في منصة «مَحْفَظَتِي العَقَارِيَّة | My Real Estate Portfolio» 🏢🇸🇦\nالمنصة السحابية الذكية لإدارة الأملاك والمكاتب العقارية.\n\n🎁 *ابدأ تجربتك المجانية لمدة 7 أيام فوراً عبر الرابط:*\n🔗 https://mulki-saas.vercel.app\n\n🤖 *أرسل رقم سؤالك ليجيبك المساعد الآلي فوراً:*\n*1* 👈 الأسعار وباقات الاشتراك الشهرية والسنوية 💎\n*2* 👈 رابط التجربة المجانية (7 أيام) وتثبيت التطبيق 📱\n*3* 👈 شرح مميزات المنصة (قارئ العقود AI + الفواتير + المصاريف) ✨\n*4* 👈 طريقة الدفع والحساب البنكي المعتمد (IBAN / SWIFT / RIB) 🏦\n*5* 👈 الفواتير الضريبية وسندات القبض ورمز QR 🧾\n*6* 👈 التحدث المباشر مع مدير المبيعات والدعم الفني 👨‍💼`,
    },
    {
      shortcut: '/1',
      keywords: '1, ١, سعر, اسعار, أسعار, باقات, اشتراك, كم, تكلفة',
      trigger: '٢. إذا أرسل العميل رقم (1) أو كتب: (سعر / باقات / اشتراك / كم السعر)',
      reply: `💎 *باقات الاشتراك في منصة مَحْفَظَتِي العَقَارِيَّة (شاملة 7 أيام تجربة مجانية):*\n\n1️⃣ *باقة الانطلاقة (Starter):*\n• السعر: *99 ر.س/شهرياً* (أو 79 ر.س/شهرياً عند الدفع السنوي)\n• تشمل: إدارة حتى 35 وحدة عقارية + عقود الإيجار + سندات القبض.\n\n2️⃣ *باقة النمو السريع (Growth - الأكثر طلباً 🌟):*\n• السعر: *199 ر.س/شهرياً* (أو 159 ر.س/شهرياً سنوياً)\n• تشمل: حتى 150 وحدة + قارئ عقود إيجار بالذكاء الاصطناعي + تذكيرات الواتساب والإيميل + تتبع المصاريف وصافي الربح.\n\n3️⃣ *باقة الشركات الكبرى (Enterprise):*\n• السعر: *499 ر.س/شهرياً*\n• تشمل: وحدات عقارية غير محدودة + بوابة المستثمرين VIP.\n\n🔗 للتجربة الفورية والاشتراك:\nhttps://mulki-saas.vercel.app\n(أرسل رقم *4* للحصول على بيانات الحساب البنكي للتحويل المباشر)`,
    },
    {
      shortcut: '/2',
      keywords: '2, ٢, تجربة, رابط, موقع, تطبيق, دخول, تحميل',
      trigger: '٣. إذا أرسل العميل رقم (2) أو كتب: (تجربة / رابط / موقع / تطبيق)',
      reply: `🎁 *تفضل رابط التجربة المجانية الشاملة لمدة 7 أيام كاملة:*\n🔗 https://mulki-saas.vercel.app\n\n✅ لا يتطلب بطاقة ائتمانية للبدء.\n✅ يمكنك تجربة إضافة عقاراتك، فحص عقود إيجار بالذكاء الاصطناعي، وإصدار سندات قبض ضريبية.\n\n📲 *لتثبيت التطبيق على جوالك (iPhone / Android) أو الكمبيوتر:*\nافتح الرابط أعلاه واضغط على زر *«تثبيت التطبيق 📥»* في أعلى الشاشة ليظهر كأيقونة مستقلة على جهازك!`,
    },
    {
      shortcut: '/3',
      keywords: '3, ٣, مميزات, شرح, كيف, تفاصيل, خدمات, إيجار',
      trigger: '٤. إذا أرسل العميل رقم (3) أو كتب: (مميزات / شرح / كيف يشتغل)',
      reply: `✨ *أهم مميزات منصة «مَحْفَظَتِي العَقَارِيَّة» للمكاتب العقارية وملاك العقار:*\n\n1️⃣ *قارئ عقود إيجار بالذكاء الاصطناعي (AI Scanner):* ارفع عقد إيجار PDF فيستخرج النظام بيانات المستأجر والدفعات في 3 ثوانٍ.\n2️⃣ *المخطط البصري للأدوار والشقق (Floor Matrix):* معرفة الشقق المؤجرة، الشاغرة، وتحت الصيانة بالألوان.\n3️⃣ *تذكيرات التحصيل الآلية (واتساب + بريد إلكتروني):* إرسال رسائل تذكير مجدولة للمستأجرين مع رقم الـ IBAN الخاص بك.\n4️⃣ *إدارة المصاريف العقارية وصافي الربح:* حساب الإيرادات ناقص مصاريف الصيانة والمرافق تلقائياً.\n5️⃣ *بوابة خاصة للمستأجر، الفني، والمستثمر.*\n\n🔗 جربها بنفسك الآن:\nhttps://mulki-saas.vercel.app`,
    },
    {
      shortcut: '/4',
      keywords: '4, ٤, تحويل, آيبان, ايبان, دفع, بنك, حساب, السداد, rib, iban',
      trigger: '٥. إذا أرسل العميل رقم (4) أو كتب: (تحويل / آيبان / دفع / بنك)',
      reply: `🏦 *بيانات الحساب البنكي الرسمي المعتمد لتفعيل الاشتراك الفوري:*\n\n• *اسم البنك:* ${ownerSettings.bankName}\n• *رقم الآيبان الدولي (IBAN):*\n${ownerSettings.ibanNumber}\n• *كود السويفت (SWIFT / BIC):* ${ownerSettings.swiftCode}\n• *رقم الحساب (RIB):* ${ownerSettings.ribNumber}\n• *اسم المستفيد:* ${ownerSettings.beneficiaryName}\n\n✅ *خطوة التفعيل:*\nبعد إتمام التحويل البنكي (أو الدفع الإلكتروني عبر المنصة)، يرجى إرسال صورة إيصال التحويل هنا في الواتساب، وسيتم إرسال *مفتاح الترخيص الرسمي (License Key)* وتفعيل حساب شركتكم خلال دقائق!`,
    },
    {
      shortcut: '/5',
      keywords: '5, ٥, فاتورة, فواتير, ضريبة, سند, قبض, qr',
      trigger: '٦. إذا أرسل العميل رقم (5) أو كتب: (فاتورة / ضريبة / سند قبض / QR)',
      reply: `🧾 *نظام الفوترة الضريبية وسندات القبض الإلكترونية:*\n\n✅ تدعم المنصة إصدار *فواتير ضريبية إلكترونية* و *سندات قبض رسمية (PDF)*.\n✅ حساب تلقائي لضريبة القيمة المضافة (*15% VAT*) للعقارات التجارية، وإعفاء للعقارات السكنية.\n✅ توليد ديناميكي لرمز الاستجابة السريعة المشفر (*TLV Base64 QR Code*) يضم اسم منشأتك، رقمك الضريبي، التاريخ، وإجمالي الفاتورة والضريبة.\n✅ إمكانية وضع شعار مكتبك العقاري ورقم الـ IBAN الخاص بك ليظهر على جميع فواتير المستأجرين!`,
    },
    {
      shortcut: '/6',
      keywords: '6, ٦, تواصل, مساعدة, دعم, موظف, اتصال, استفسار',
      trigger: '٧. إذا أرسل العميل رقم (6) أو كتب: (تواصل / دعم فني / موظف)',
      reply: `👨‍💼 *مرحباً بك في قسم المبيعات والدعم الفني المباشر!*\n\nتم استلام طلبك بنجاح، وسيقوم مدير الحسابات بالرد عليك شخصياً في هذه المحادثة خلال دقائق.\n\nللتسريع، يرجى تزويدنا بـ:\n1. اسم المكتب العقاري أو الشركة:\n2. المدينة:\n3. عدد الوحدات العقارية التقريبي لديكم:\n\nشكراً لتواصلكم مع منصة «مَحْفَظَتِي العَقَارِيَّة» 🌟`,
    },
    {
      shortcut: '/away',
      keywords: 'رسالة خارج أوقات العمل (Away Message)',
      trigger: '٨. رسالة خارج أوقات العمل (تعمل تلقائياً ليلاً وفي العطلات)',
      reply: `شكراً لتواصلك مع منصة «مَحْفَظَتِي العَقَارِيَّة | My Real Estate Portfolio» 🌙🏢\n\nنحن خارج أوقات العمل الرسمية حالياً، ولكن يمكنك تجربة المنصة وتفعيل حسابك المجاني لمدة 7 أيام فوراً على مدار الساعة عبر الرابط:\n🔗 https://mulki-saas.vercel.app\n\nأو أرسل رقم (1) للأسعار، رقم (3) للمميزات، أو رقم (4) لبيانات الحساب البنكي، وسيرد عليك المجيب الآلي فوراً!`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#0F5A47] to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-2 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {lang === 'ar'
                ? 'مركز أتمتة الواتساب + ربط WhatsApp API المجاني والمفتوح المصدر'
                : 'WhatsApp Automation Hub + Free & Open-Source WhatsApp API'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {lang === 'ar'
              ? 'مركز حملات الواتساب الذكية وربط الـ API المجاني (WhatsApp Hub)'
              : 'WhatsApp Automation, Templates & Free API Integration'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1">
            {lang === 'ar'
              ? 'اختر نماذج الرسائل المسبقة (Templates)، أو اربط رابط WhatsApp API مجاني (مثل WAHA، Evolution API، Twilio Sandbox) لإرسال الرسائل والرد الآلي بدون تكلفة.'
              : 'Select pre-built message templates or connect a free WhatsApp API endpoint (WAHA, Evolution API, Twilio) for direct automated messaging.'}
          </p>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 bg-black/25 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveSubTab('composer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'composer'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-white/85 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'ar' ? '١. نماذج الرسائل (Templates)' : '1. Message Templates'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('automation_rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'automation_rules'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-white/85 hover:bg-white/10'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{lang === 'ar' ? '٢. قواعد الرد الآلي (Automation Rules) ⚡️' : '2. Automation Rules ⚡️'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('api_config')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'api_config'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-white/85 hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'ar' ? '٣. ربط WhatsApp API ⚙️' : '3. WhatsApp API Setup ⚙️'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai_autoreply')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'ai_autoreply'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-white/85 hover:bg-white/10'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{lang === 'ar' ? '٤. دليل بوت واتساب (Q&A) 🤖' : '4. Auto-Reply Guide 🤖'}</span>
          </button>
        </div>
      </div>

      {/* Dispatch Notification Banner */}
      {(dispatchStatus === 'success' || dispatchStatus === 'fallback_wa') && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{dispatchLog}</span>
          </div>
          <span className="text-[11px] bg-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-lg font-black">
            {apiConfig.provider === 'wa_direct' ? 'WhatsApp Direct' : apiConfig.provider.toUpperCase()}
          </span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1.5: KEYWORD-BASED AUTOMATION RULES BUILDER & LIVE SIMULATOR      */}
      {/* ===================================================================== */}
      {activeSubTab === 'automation_rules' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F5A47] flex items-center justify-center shrink-0">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {lang === 'ar'
                      ? 'قواعد الأتمتة والرد الآلي بالكلمات المفتاحية (Automation Rules)'
                      : 'Keyword-Based WhatsApp Automation Rules'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'ar'
                      ? 'قم ببرمجة وتخصيص قواعد الرد التلقائي حسب الكلمات المفتاحية التي يرسلها المستأجر (مثال: إذا أرسل "payment" أو "سداد" يرد النظام بتفاصيل الآيبان IBAN، وإذا أرسل "maintenance" أو "صيانة" يرد برابط متابعة تذكرة الصيانة).'
                      : 'Configure keyword-based auto-replies (e.g., if a tenant messages "payment", reply with IBAN details; if "maintenance", reply with a link to the ticket status page).'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAutomationRules(defaultAutomationRules)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'استعادة القواعد الافتراضية' : 'Reset Default Rules'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Add New Keyword Rule Form + Live Simulator */}
              <div className="lg:col-span-5 space-y-5">
                {/* Create Rule Card */}
                <form
                  onSubmit={handleAddAutomationRule}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#0F5A47]" />
                      <span>
                        {lang === 'ar' ? 'إضافة قاعدة رد آلي جديدة' : 'Add New Keyword Auto-Reply Rule'}
                      </span>
                    </h4>
                    {ruleSavedToast && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {lang === 'ar' ? 'تمت الإضافة بنجاح ✓' : 'Rule Added ✓'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'اسم القاعدة (Rule Name):' : 'Rule Name:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? 'مثال: الرد بتفاصيل الآيبان عند طلب السداد'
                          : 'e.g. Reply with IBAN on payment inquiry'
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-[#0F5A47] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'ar'
                        ? 'الكلمات المفتاحية المحفزة (افصل بينها بفاصلة):'
                        : 'Trigger Keywords (comma-separated):'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newRuleKeywords}
                      onChange={(e) => setNewRuleKeywords(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? 'payment, iban, سداد, دفع, تحويل'
                          : 'payment, iban, maintenance, ticket'
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-slate-900 focus:border-[#0F5A47] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'نوع المطابقة:' : 'Match Condition:'}
                      </label>
                      <select
                        value={newRuleMatchType}
                        onChange={(e) => setNewRuleMatchType(e.target.value as 'contains' | 'exact')}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 focus:border-[#0F5A47] focus:outline-none"
                      >
                        <option value="contains">
                          {lang === 'ar' ? 'تحتوي الرسالة على الكلمة (Contains)' : 'Message Contains Keyword'}
                        </option>
                        <option value="exact">
                          {lang === 'ar' ? 'مطابقة تامة للكلمة (Exact Match)' : 'Exact Keyword Match'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'التصنيف:' : 'Category:'}
                      </label>
                      <select
                        value={newRuleCategory}
                        onChange={(e) =>
                          setNewRuleCategory(e.target.value as KeywordAutomationRule['category'])
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 focus:border-[#0F5A47] focus:outline-none"
                      >
                        <option value="payment">{lang === 'ar' ? '💳 المدفوعات والآيبان' : '💳 Payment & IBAN'}</option>
                        <option value="maintenance">{lang === 'ar' ? '🔧 الصيانة والتذاكر' : '🔧 Maintenance Tickets'}</option>
                        <option value="lease">{lang === 'ar' ? '📄 العقود والإيجار' : '📄 Leases & Contracts'}</option>
                        <option value="support">{lang === 'ar' ? '💬 دعم واستفسارات' : '💬 General Support'}</option>
                        <option value="custom">{lang === 'ar' ? '✨ مخصص' : '✨ Custom'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        {lang === 'ar' ? 'نص الرد التلقائي (Auto-Reply Message):' : 'Auto-Reply Message:'}
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setNewRuleReply(
                              (prev) =>
                                `${prev ? prev + '\n' : ''}🏦 الآيبان (IBAN): ${accountSettings.ibanNumber} (${accountSettings.bankName})`
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-[#0F5A47] font-bold text-[10px] cursor-pointer"
                        >
                          + إدراج الآيبان
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNewRuleReply(
                              (prev) =>
                                `${prev ? prev + '\n' : ''}🔧 رابط متابعة تذكرة الصيانة: https://mulki-saas.vercel.app/?tab=maintenance`
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[10px] cursor-pointer"
                        >
                          + رابط حالة الصيانة
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={newRuleReply}
                      onChange={(e) => setNewRuleReply(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? 'اكتب الجواب الذي سيرسله البوت تلقائياً عند مطابقة الكلمة المفتاحية...'
                          : 'Enter automated response message...'
                      }
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-[#0F5A47] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0F5A47] hover:bg-[#0A4A35] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'ar' ? 'حفظ وتفعيل القاعدة الآن' : 'Save & Activate Rule'}</span>
                  </button>
                </form>

                {/* Live Interactive Keyword Simulator */}
                <div className="p-5 rounded-2xl bg-[#0b141a] text-white border border-slate-800 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-amber-400" />
                      <span className="font-black text-sm text-amber-300">
                        {lang === 'ar'
                          ? 'محاكي اختبار الكلمات المفتاحية الفوري'
                          : 'Live Keyword Auto-Reply Simulator'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                      LIVE TEST
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px]">
                    {lang === 'ar'
                      ? 'جرّب كتابة رسالة مستأجر (مثل: "payment" أو "maintenance" أو "سداد" أو "صيانة") لترى أي قاعدة ستشتغل وترد عليه تلقائياً:'
                      : 'Type a sample tenant message (e.g., "payment" or "maintenance") to test which rule triggers:'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {['payment', 'maintenance', 'سداد الإيجار', 'عطل صيانة تكييف', 'تجديد عقد'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setSimulatorInput(sample)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                          simulatorInput === sample
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1">
                        {lang === 'ar' ? 'رسالة المستأجر الواردة:' : 'Incoming Tenant Message:'}
                      </label>
                      <input
                        type="text"
                        value={simulatorInput}
                        onChange={(e) => setSimulatorInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        {lang === 'ar' ? 'جوال المستأجر:' : 'Tenant Phone:'}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={simulatorPhone}
                        onChange={(e) => setSimulatorPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {matchedRuleForSimulator ? (
                    <div className="p-3.5 rounded-2xl bg-[#005c4b] text-white space-y-2 border border-emerald-500/30">
                      <div className="flex items-center justify-between text-[10px] text-emerald-200 border-b border-white/10 pb-1.5">
                        <span className="font-bold">
                          ✅ {lang === 'ar' ? 'تمت المطابقة مع:' : 'Matched Rule:'}{' '}
                          {lang === 'ar' ? matchedRuleForSimulator.ruleNameAr : matchedRuleForSimulator.ruleNameEn}
                        </span>
                        <span className="font-mono uppercase">{matchedRuleForSimulator.matchType}</span>
                      </div>
                      <div className="whitespace-pre-line text-xs leading-relaxed">
                        {matchedRuleForSimulator.replyMessage}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <a
                          href={`https://wa.me/${simulatorPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            matchedRuleForSimulator.replyMessage
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px]"
                        >
                          <Send className="w-3 h-3" />
                          <span>
                            {lang === 'ar' ? 'إرسال هذا الرد عبر واتساب الآن' : 'Dispatch Auto-Reply via WhatsApp'}
                          </span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-center">
                      {lang === 'ar'
                        ? 'لم يتم العثور على قاعدة مطابقة لهذه الكلمة ضمن القواعد المفعلة.'
                        : 'No active automation rule matched this input.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Active Configured Rules List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm">
                    {lang === 'ar'
                      ? `القواعد المبرمجة حالياً (${automationRules.filter((r) => r.enabled).length} مفعلة من أصل ${automationRules.length})`
                      : `Configured Keyword Rules (${automationRules.filter((r) => r.enabled).length} active)`}
                  </h4>
                </div>

                <div className="space-y-3">
                  {automationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        rule.enabled
                          ? 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-slate-50 border-slate-200/60 opacity-65'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                rule.enabled ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            <h5 className="font-black text-slate-900 text-xs sm:text-sm">
                              {lang === 'ar' ? rule.ruleNameAr : rule.ruleNameEn}
                            </h5>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono">
                              {rule.matchType === 'exact'
                                ? lang === 'ar'
                                  ? 'مطابقة تامة'
                                  : 'Exact'
                                : lang === 'ar'
                                ? 'يحتوي على الكلمة'
                                : 'Contains'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[11px] font-bold text-slate-500 me-1">
                              {lang === 'ar' ? 'الكلمات المفتاحية:' : 'Keywords:'}
                            </span>
                            {rule.keywords.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0F5A47] font-mono font-bold text-[11px]"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${
                              rule.enabled
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {rule.enabled ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                                <span>{lang === 'ar' ? 'مفعل' : 'Active'}</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-slate-500" />
                                <span>{lang === 'ar' ? 'متوقف' : 'Paused'}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={lang === 'ar' ? 'حذف القاعدة' : 'Delete Rule'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                        {rule.replyMessage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: FREE / OPEN-SOURCE WHATSAPP API CONFIGURATION SCREEN           */}
      {/* ===================================================================== */}
      {activeSubTab === 'api_config' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F5A47] flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {lang === 'ar'
                    ? 'إعدادات ربط بوابة WhatsApp API المجانية ومفتوحة المصدر'
                    : 'Free & Open-Source WhatsApp API Gateway Configuration'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'ar'
                    ? 'أدخل رابط الـ API الخاص بك (مثل WAHA أو Evolution API مفتوح المصدر أو Twilio أو CallMeBot) لإرسال رسائل آلية مباشرة من المنصة.'
                    : 'Enter your WhatsApp API endpoint URL (WAHA, Evolution API, Twilio, or Custom Webhook) to send automated messages directly.'}
                </p>
              </div>
            </div>

            {apiSavedBanner && (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'تم حفظ إعدادات الـ API بنجاح!' : 'API Settings Saved!'}</span>
              </div>
            )}
          </div>

          {/* Provider Selection Cards */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2.5">
              {lang === 'ar'
                ? '١. اختر مزود خدمة WhatsApp API (يدعم البدائل المجانية ومفتوحة المصدر):'
                : '1. Select WhatsApp API Provider:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              {[
                {
                  id: 'waha_evolution' as ProviderType,
                  title: 'WAHA / Evolution API',
                  badge: 'مجاني مفتوح المصدر 100%',
                  defaultUrl: 'https://waha.your-domain.com/api/sendText',
                },
                {
                  id: 'twilio' as ProviderType,
                  title: 'Twilio WhatsApp API',
                  badge: 'Twilio Sandbox مجاني',
                  defaultUrl: 'https://api.twilio.com/2010-04-01/Accounts/AC.../Messages.json',
                },
                {
                  id: 'ultramsg_green' as ProviderType,
                  title: 'UltraMsg / Green-API',
                  badge: 'حساب مطور مجاني',
                  defaultUrl: 'https://api.green-api.com/waInstance.../sendMessage/...',
                },
                {
                  id: 'custom_webhook' as ProviderType,
                  title: 'Webhook / n8n / Make',
                  badge: 'أتمتة مجانية شاملة',
                  defaultUrl: 'https://hook.eu1.make.com/your-webhook-id',
                },
                {
                  id: 'wa_direct' as ProviderType,
                  title: 'واتساب ويب مباشر (بدون سيرفر)',
                  badge: 'مجاني فوري بدون إعداد',
                  defaultUrl: 'https://wa.me/',
                },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() =>
                    setApiConfig({
                      ...apiConfig,
                      provider: prov.id,
                      apiEndpointUrl: prov.defaultUrl,
                    })
                  }
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                    apiConfig.provider === prov.id
                      ? 'border-[#0F5A47] bg-emerald-50/70 ring-2 ring-[#0F5A47]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-black text-slate-900 mb-1">{prov.title}</div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold w-fit">
                    {prov.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* API Endpoint URL & Token Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar'
                  ? '٢. رابط نقطة الاتصال (WhatsApp API Endpoint URL):'
                  : '2. WhatsApp API Endpoint URL:'}
              </label>
              <input
                type="url"
                dir="ltr"
                value={apiConfig.apiEndpointUrl}
                onChange={(e) =>
                  setApiConfig({ ...apiConfig, apiEndpointUrl: e.target.value })
                }
                placeholder="https://waha.example.com/api/sendText"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-[#0F5A47] focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {lang === 'ar'
                  ? 'سيتم إرسال طلب POST JSON تلقائياً إلى هذا الرابط شاملة رقم العميل ونص القالب المختار.'
                  : 'A JSON POST request with recipient phone and template text will be sent to this URL.'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar'
                  ? '٣. مفتاح التوثيق (API Token / Key - اختياري):'
                  : '3. API Key / Bearer Token (Optional):'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  dir="ltr"
                  value={apiConfig.apiKeyOrToken}
                  onChange={(e) =>
                    setApiConfig({ ...apiConfig, apiKeyOrToken: e.target.value })
                  }
                  placeholder="Bearer Token / API Key"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:border-[#0F5A47] focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute end-3 top-3" />
              </div>
            </div>
          </div>

          {/* JSON Payload Preview & Save Actions */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'معاينة حزمة البيانات التي ترسلها المنصة للـ API (Webhook Payload):'
                    : 'Live API Webhook JSON Payload Preview:'}
                </span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">POST application/json</span>
            </div>
            <pre className="font-mono text-[11px] text-amber-300 overflow-x-auto p-2 bg-slate-950 rounded-xl" dir="ltr">
{`{
  "chatId": "${cleanPhone}@c.us",
  "to": "+${cleanPhone}",
  "session": "${apiConfig.instanceOrFromNumber}",
  "text": "${getComputedMessage().slice(0, 75).replace(/\n/g, ' ')}..."
}`}
            </pre>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setApiSavedBanner(true);
                setTimeout(() => setApiSavedBanner(false), 3000);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0F5A47] hover:bg-[#0A4A35] text-white font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{lang === 'ar' ? 'حفظ إعدادات WhatsApp API وتفعيل الربط' : 'Save WhatsApp API Configuration'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('composer');
                handleSendViaConfiguredApi();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'ar' ? 'اختبار الإرسال عبر الـ API الآن' : 'Test API Dispatch Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: FREE AI WHATSAPP AUTO-RESPONDER KIT (ZERO COST)                */}
      {/* ===================================================================== */}
      {activeSubTab === 'ai_autoreply' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {lang === 'ar'
                    ? 'دليل إعداد WhatsApp Business ليرد تلقائياً على جميع أسئلة العملاء (8 قوالب سؤال وجواب شاملة)'
                    : 'Step-by-Step WhatsApp Business Auto-Reply Setup (8 Complete Q&A Rules)'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {lang === 'ar'
                    ? 'اتبع الخطوات الـ 3 بالأسفل في تطبيق WhatsApp Business على هاتفك، وانسخ الردود الجاهزة ليتكفل الواتساب بالرد على الزبناء 24/7 مجاناً!'
                    : 'Follow the 3 steps below in your WhatsApp Business app and copy the 8 pre-built Q&A replies.'}
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Guide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="font-black text-[#0F5A47] text-sm">
                الخطوة 1️⃣: تفعيل رسالة الترحيب + القائمة الرقمية
              </div>
              <p className="text-slate-700 leading-relaxed">
                افتح تطبيق <strong>WhatsApp Business</strong> ⬅️ اضغط على <strong>الأدوات (Tools)</strong> ⬅️ <strong>رسالة الترحيب (Greeting Message)</strong> ⬅️ فعّلها واختر المستلمين: <strong>الجميع (Everyone)</strong>، ثم انسخ <strong>القالب رقم 1</strong> بالأسفل والصقه فيها.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="font-black text-blue-900 text-sm">
                الخطوة 2️⃣: برمجة الأجوبة السريعة (/1 إلى /6)
              </div>
              <p className="text-slate-700 leading-relaxed">
                في <strong>WhatsApp Business</strong> ⬅️ ادخل إلى <strong>الردود السريعة (Quick Replies)</strong> ⬅️ اضغط <strong>(+)</strong> وأضف الاختصار <code>/1</code> للأسعار، <code>/2</code> للرابط، <code>/3</code> للمميزات، <code>/4</code> للآيبان والبنك، <code>/5</code> للفواتير، و <code>/6</code> للدعم.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="font-black text-amber-950 text-sm">
                الخطوة 3️⃣: رد آلي 100% بالكلمات المفتاحية (وأنت نائم!)
              </div>
              <p className="text-slate-700 leading-relaxed">
                ليرد الهاتف وحده بدون أن تلمسه: حمّل تطبيق <strong>AutoResponder for WA</strong> (أندرويد) أو اربط <strong>WAHA / Make</strong>، وأدخل <strong>الكلمات المفتاحية (Keywords)</strong> المكتوبة فوق كل قالب بالأسفل مع الجواب المقابل لها!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeAutoReplyRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0F5A47] text-amber-300 text-[11px] font-black">
                      {rule.trigger}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-mono text-[10px] font-bold">
                      اختصار: {rule.shortcut}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1.5 rounded-xl">
                    <strong>الكلمات المفتاحية (Keywords):</strong> <span className="font-mono">{rule.keywords}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {rule.reply}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(rule.reply);
                    setCopiedAutoReplyIndex(idx);
                    setTimeout(() => setCopiedAutoReplyIndex(null), 2500);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedAutoReplyIndex === idx ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>تم نسخ الجواب! الصقه في واتساب الأعمال</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-300" />
                      <span>نسخ قالب الجواب #{idx + 1}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: MESSAGE TEMPLATES SELECTOR & LIVE DIRECT DISPATCH              */}
      {/* ===================================================================== */}
      {activeSubTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pre-built Templates Selector & Variables */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#0F5A47]" />
                  <span>
                    {lang === 'ar'
                      ? 'اختر نموذج الرسالة الجاهز (7 نماذج احترافية):'
                      : 'Select Pre-built Message Template:'}
                  </span>
                </h3>
                <span className="text-[11px] font-bold text-[#0F5A47] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {lang === 'ar' ? 'قابلة للتعديل المباشر' : 'Editable'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(templates) as TemplateKey[]).map((key) => {
                  const item = templates[key];
                  const isSelected = selectedTemplate === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTemplate(key)}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0F5A47] bg-emerald-50/80 text-[#0F5A47] ring-1 ring-[#0F5A47] shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      } ${key === 'ai_auto_reply' ? 'sm:col-span-2' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.badge_ar}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900">
                        {lang === 'ar' ? item.title_ar : item.title_en}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.subtitle_ar}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Variables & Recipient Form */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {lang === 'ar'
                    ? 'بيانات المستلم والمتغيرات التلقائية في القالب:'
                    : 'Recipient & Template Variables:'}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">
                    {lang === 'ar' ? 'اسم المستأجر أو المكتب العقاري:' : 'Recipient Name:'}
                  </label>
                  <input
                    type="text"
                    value={testTenantName}
                    onChange={(e) => {
                      setTestTenantName(e.target.value);
                      setCustomEditedMessage(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-bold">
                    {lang === 'ar' ? 'رقم جوال الواتساب (مع رمز الدولة):' : 'WhatsApp Phone:'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+966501234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-bold">
                    {lang === 'ar' ? 'الوحدة / العقار:' : 'Unit / Property:'}
                  </label>
                  <input
                    type="text"
                    value={testUnit}
                    onChange={(e) => {
                      setTestUnit(e.target.value);
                      setCustomEditedMessage(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-bold">
                    {lang === 'ar' ? 'المبلغ المستحق (ر.س):' : 'Amount (SAR):'}
                  </label>
                  <input
                    type="text"
                    value={testAmount}
                    onChange={(e) => {
                      setTestAmount(e.target.value);
                      setCustomEditedMessage(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Editable WhatsApp Preview & Direct API / WA Send */}
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
                      <span>{accountSettings.companyNameAr}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      بوابة الإرسال: {apiConfig.provider === 'wa_direct' ? 'WhatsApp Direct' : apiConfig.provider} ✓
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {customEditedMessage !== null && (
                    <button
                      type="button"
                      onClick={() => setCustomEditedMessage(null)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>استعادة نص القالب</span>
                    </button>
                  )}
                  <span className="text-xs text-slate-400 font-mono" dir="ltr">
                    {testPhoneNumber}
                  </span>
                </div>
              </div>

              {/* Editable Chat Bubble Area */}
              <div className="p-4 sm:p-5 bg-[#0b141a] flex flex-col justify-end space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Edit3 className="w-3 h-3 text-emerald-400" />
                    <span>يمكنك التعديل المباشر على نص الرسالة أدناه قبل الإرسال:</span>
                  </span>
                </div>
                <div className="self-end w-full bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md space-y-2 text-xs leading-relaxed">
                  <textarea
                    rows={9}
                    value={getComputedMessage()}
                    onChange={(e) => setCustomEditedMessage(e.target.value)}
                    className="w-full bg-transparent text-white font-sans text-xs leading-relaxed focus:outline-none resize-y"
                  />
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 font-mono pt-1 border-t border-white/10">
                    <span>Ready to Send</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="p-3.5 bg-[#202c33] border-t border-[#2a3942] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedText ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedText ? 'تم النسخ!' : 'نسخ النص'}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendViaConfiguredApi}
                    disabled={dispatchStatus === 'sending'}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {dispatchStatus === 'sending'
                        ? 'جاري الإرسال...'
                        : 'إرسال آلي عبر WhatsApp API'}
                    </span>
                  </button>

                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs transition-all shadow-md"
                  >
                    <span>فتح في WhatsApp مباشرة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">بوابة الربط الحالية</span>
                <strong className="text-[#0F5A47] text-xs sm:text-sm font-black">
                  {apiConfig.provider === 'waha_evolution'
                    ? 'WAHA / Evolution'
                    : apiConfig.provider === 'twilio'
                    ? 'Twilio Sandbox'
                    : apiConfig.provider === 'ultramsg_green'
                    ? 'Green-API / Ultra'
                    : apiConfig.provider === 'custom_webhook'
                    ? 'Webhook / n8n'
                    : 'WhatsApp Direct'}
                </strong>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">النماذج الجاهزة</span>
                <strong className="text-blue-700 text-sm sm:text-base font-extrabold">7 قوالب ذكية</strong>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block text-[10px]">التكلفة الشهرية للربط</span>
                <strong className="text-emerald-700 text-sm sm:text-base font-extrabold">0 ر.س (مجاني)</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
