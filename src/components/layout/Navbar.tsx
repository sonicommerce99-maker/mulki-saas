import React, { useState, useRef, useEffect } from 'react';
import { UserRole, Currency } from '../../types';
import { Language, translations } from '../../locales/translations';
import { MulkiLogo } from './MulkiLogo';
import { 
  Building2, 
  Globe2, 
  Coins,
  Rocket,
  MessageSquare,
  Layers,
  Briefcase,
  Sparkles,
  FileCheck,
  Download,
  ShieldCheck,
  ChevronDown,
  Database,
  Lock,
  Menu,
  X,
  Wrench,
  FileText,
  BookOpen,
  Gift,
  Crown,
  Landmark,
  Receipt,
  Settings
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenDeployModal: () => void;
  onOpenAiScanner: () => void;
  onOpenReceiptModal: () => void;
  onOpenInstallModal: () => void;
  onOpenGuideModal: () => void;
  onOpenPricingModal: () => void;
  onOpenTermsModal: () => void;
  onOpenAccountSettings?: () => void;
  onOpenOwnerPaymentSettings?: () => void;
  isTestingSuspendedView?: boolean;
  onToggleSuspendedView?: () => void;
  isCleanMode?: boolean;
  onToggleCleanMode?: () => void;
  onRestoreDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  currentRole,
  setCurrentRole,
  currency,
  setCurrency,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenDeployModal,
  onOpenAiScanner,
  onOpenReceiptModal,
  onOpenInstallModal,
  onOpenGuideModal,
  onOpenPricingModal,
  onOpenTermsModal,
  onOpenAccountSettings,
  onOpenOwnerPaymentSettings,
  isTestingSuspendedView,
  onToggleSuspendedView,
  isCleanMode,
  onToggleCleanMode,
  onRestoreDemo,
}) => {
  const t = translations[lang];
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [logoGalleryOpen, setLogoGalleryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allWebsiteLogos = [
    {
      id: 'v8-final',
      titleAr: '8. الشعار الرسمي الذهبي المعتمد (بفتح الميم - مَحْفَظَتِي العَقَارِيَّة)',
      titleEn: '8. Official Approved Gold Logo (Fatha on Mim)',
      subtitleAr: 'النسخة المعتمدة حالياً (v13) — كتابة ذهبية مشكّلة بفتح الميم',
      url: '/logos/8_mahfadati_official_fatha_final.jpg',
      filename: 'mahfadati-official-gold-fatha-v13.png',
      badgeAr: 'المعتمد حالياً ⭐',
    },
    {
      id: 'v5-gold-fatha',
      titleAr: '5. تصميم الشعار الذهبي الفاخر (نجمة إسلامية ذهبية - مَحْفَظَتِي)',
      titleEn: '5. Luxury Islamic Star Gold Logo (Fatha)',
      subtitleAr: 'تصميم إطار نجمة ثمانية مع كتابة ذهبية ثلاثية الأبعاد',
      url: '/logos/5_mahfadati_fatha_v5.jpg',
      filename: 'mahfadati-gold-star-logo-v5.png',
      badgeAr: 'تصميم ذهبي فاخر',
    },
    {
      id: 'v6-portfolio-fatha',
      titleAr: '6. شعار المحفظة العقارية الكلاسيكي الذهبي (بفتح الميم)',
      titleEn: '6. Classic Portfolio Gold Crest Logo',
      subtitleAr: 'أيقونة الأبراج الذهبية على خلفية زمردية داكنة',
      url: '/logos/6_mahfadati_fatha_v6.jpg',
      filename: 'mahfadati-portfolio-gold-v6.png',
      badgeAr: 'كلاسيكي ذهبي',
    },
    {
      id: 'v7-app-icon-fatha',
      titleAr: '7. أيقونة التطبيق المختصرة (App Icon - مَحْفَظَتِي)',
      titleEn: '7. Compact Mobile App Icon (Fatha)',
      subtitleAr: 'مخصصة لشاشة الهاتف الرئيسية وأيقونات المتجر',
      url: '/logos/7_mahfadati_fatha_v7.jpg',
      filename: 'mahfadati-app-icon-v7.png',
      badgeAr: 'أيقونة هاتف',
    },
    {
      id: 'v4-mahfadati-damma',
      titleAr: '4. الشعار الذهبي السابق (النسخة القديمة قبل تعديل حركة الميم)',
      titleEn: '4. Previous Gold Logo (Before Mim Correction)',
      subtitleAr: 'النسخة السابقة التي كانت بضم الميم (مُحفظتي)',
      url: '/logos/4_mahfadati_damma_v4.jpg',
      filename: 'mahfadati-previous-v4.png',
      badgeAr: 'نسخة سابقة',
    },
    {
      id: 'v3-portfolio-official',
      titleAr: '3. شعار محفظتي العقارية (النسخة الأولية)',
      titleEn: '3. Initial Portfolio Official Logo',
      subtitleAr: 'التصميم الأولي عند تحويل الهوية إلى محفظتي العقارية',
      url: '/logos/3_portfolio_v3.jpg',
      filename: 'portfolio-initial-logo-v3.png',
      badgeAr: 'نسخة أولية',
    },
    {
      id: 'v2-mulki-icon',
      titleAr: '2. شعار مُلكي العقاري (النسخة الثانية - Mulki v2)',
      titleEn: '2. Mulki Real Estate Logo v2',
      subtitleAr: 'شعار منصة مُلكي (أبراج ذهبية مع خط عربي)',
      url: '/logos/2_mulki_v2.jpg',
      filename: 'mulki-logo-v2.png',
      badgeAr: 'هوية مُلكي سابقاً',
    },
    {
      id: 'v1-mulki-first',
      titleAr: '1. شعار مُلكي الأول (النسخة التأسيسية الأولى - Mulki v1)',
      titleEn: '1. First Original Mulki App Icon v1',
      subtitleAr: 'أول شعار تم تصميمه للمشروع في البداية',
      url: '/logos/1_mulki_v1.jpg',
      filename: 'mulki-logo-v1.png',
      badgeAr: 'النسخة الأولى',
    },
    {
      id: 'v9-vector-svg',
      titleAr: '9. الشعار الشعاعي الشفاف (Vector SVG Icon)',
      titleEn: '9. Scalable Vector SVG Logo',
      subtitleAr: 'ملف فيكتور عالي الدقة للطباعة والتصميم',
      url: '/logos/9_vector_icon.svg',
      filename: 'mahfadati-vector-logo.svg',
      badgeAr: 'Vector SVG',
    },
  ];

  const downloadHighResLogo = (url: string, filename: string) => {
    if (url.endsWith('.svg')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1024, 1024);
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = url;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs w-full max-w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between py-2 sm:py-2.5 min-h-[4rem] gap-y-2 gap-x-1 sm:gap-1.5">
          
          {/* 1. BRAND LOGO + MOBILE HAMBURGER (+ Role Switcher on Vertical Phone Top Row) */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-1.5 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCurrentTab('dashboard')}
                className="focus:outline-none group text-start shrink-0 cursor-pointer"
              >
                <MulkiLogo lang={lang} size="md" showSubtitle={true} />
              </button>
            </div>

            {/* Role Switcher on Vertical Phone (< sm) right next to Logo */}
            <div className="flex sm:hidden items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 max-w-[125px] shrink-0">
              <select
                value={currentRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setCurrentRole(role);
                  if (role === 'super_admin') {
                    setCurrentTab('superadmin');
                  } else if (role === 'investor') {
                    setCurrentTab('investor');
                  }
                }}
                className="bg-transparent text-[11px] font-bold text-slate-800 py-1 px-1.5 focus:outline-none cursor-pointer truncate max-w-full"
                title={t.switchRole}
              >
                <option value="super_admin">
                  {lang === 'ar' ? '👑 مالك المنصة' : '👑 Platform Owner'}
                </option>
                <option value="admin">
                  {lang === 'ar' ? '🏢 إدارة الأملاك' : '🏢 Property Manager'}
                </option>
                <option value="investor">
                  {lang === 'ar' ? '💼 المستثمر' : '💼 Investor'}
                </option>
                <option value="technician">
                  {lang === 'ar' ? '🔧 فني صيانة' : '🔧 Technician'}
                </option>
                <option value="tenant">
                  {lang === 'ar' ? '👤 المستأجر' : '👤 Tenant'}
                </option>
              </select>
            </div>
          </div>

          {/* 2. CORE NAVIGATION TABS (Clean, Spacious, No Overflow) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 overflow-x-auto text-[11px] xl:text-xs font-bold text-slate-600">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'dashboard' && currentRole === 'admin'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? '🏠 الرئيسية' : '🏠 Overview'}
            </button>

            <button
              onClick={() => setCurrentTab('superadmin')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                currentTab === 'superadmin'
                  ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={lang === 'ar' ? 'لوحة تحكم المالك وإدارة المشتركين (رمز PIN)' : 'Owner Control Panel (PIN)'}
            >
              <span>👑</span>
              <span>{lang === 'ar' ? 'لوحة التحكم' : 'Control Panel'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('properties')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'properties'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.navProperties}
            </button>

            <button
              onClick={() => setCurrentTab('floormap')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                currentTab === 'floormap'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#0F5A47]" />
              <span>{lang === 'ar' ? 'مخطط الأدوار' : 'Floor Matrix'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('whatsapp')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                currentTab === 'whatsapp'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'ar' ? 'الواتساب' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('maintenance')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                currentTab === 'maintenance'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{t.navMaintenance}</span>
            </button>

            <button
              onClick={() => setCurrentTab('leases')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'leases'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.navLeases}
            </button>

            <button
              onClick={() => setCurrentTab('expenses')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                currentTab === 'expenses'
                  ? 'bg-rose-50 text-rose-700 font-black border border-rose-200'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-rose-600" />
              <span>{t.navExpenses}</span>
            </button>

            <button
              onClick={() => setCurrentTab('finance')}
              className={`px-2 xl:px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'finance'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.navFinance}
            </button>
          </nav>

          {/* 3. RIGHT CONTROLS: VISIBLE ON BOTH VERTICAL & HORIZONTAL MOBILE AND DESKTOP */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-1 sm:gap-1.5 pt-1.5 sm:pt-0 border-t border-slate-100 sm:border-t-0 shrink-0">
            
            {/* Subscription & 7-Day Free Trial Badge (Clickable to open Pricing modal) */}
            <button
              onClick={onOpenPricingModal}
              className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold transition-colors cursor-pointer"
              title="باقات الاشتراك وفترة التجربة المجانية 7 أيام"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{lang === 'ar' ? 'باقات 99 ر.س | 7 أيام مجاناً 🎁' : 'From 99 SAR | 7-Day Trial 🎁'}</span>
            </button>

            {/* User Guide Button (Visible on ALL screens including vertical mobile) */}
            <button
              onClick={onOpenGuideModal}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
              title="دليل الاستخدام والتشغيل السريع (User Guide)"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'دليل الاستخدام 📖' : 'User Guide 📖'}</span>
            </button>

            {/* PWA Install Button (Visible with text on ALL screens including vertical mobile) */}
            <button
              onClick={onOpenInstallModal}
              className="flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shrink-0 cursor-pointer"
              title="تثبيت التطبيق على الكمبيوتر، الآيفون أو الأندرويد"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
            </button>

            {/* ORGANIZED "MORE TOOLS" DROPDOWN (Visible on ALL screens including vertical mobile) */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="أدوات متقدمة"
              >
                <span>{lang === 'ar' ? 'الأدوات' : 'Tools'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Popover */}
              {toolsDropdownOpen && (
                <div className="absolute end-0 mt-2 w-64 max-w-[calc(100vw-1rem)] bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 space-y-1 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {lang === 'ar' ? 'أدوات وإجراءات سريعة' : 'Quick Tools & Actions'}
                  </div>

                  {!isCleanMode ? (
                    onToggleCleanMode && (
                      <button
                        onClick={() => {
                          onToggleCleanMode();
                          setToolsDropdownOpen(false);
                        }}
                        className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold">
                            {lang === 'ar' ? 'تصفير المنصة للبدء الفعلي (Clean) 🧹' : 'Clean Workspace (Start Fresh) 🧹'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {lang === 'ar' ? 'مسح البيانات التجريبية والبدء من الصفر' : 'Clear demo data and start from scratch'}
                          </div>
                        </div>
                      </button>
                    )
                  ) : (
                    onRestoreDemo && (
                      <button
                        onClick={() => {
                          onRestoreDemo();
                          setToolsDropdownOpen(false);
                        }}
                        className="w-full text-start px-3 py-2 rounded-xl bg-blue-50/70 text-blue-950 hover:bg-blue-100/80 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-bold text-blue-900">
                            {lang === 'ar' ? 'استعادة البيانات التجريبية (Restore Demo) 🔄' : 'Restore Demo Data 🔄'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {lang === 'ar' ? 'إرجاع كافة العمارات والعقود التوضيحية للعرض' : 'Restore sample properties, units & leases'}
                          </div>
                        </div>
                      </button>
                    )
                  )}

                  {onOpenOwnerPaymentSettings && (
                    <button
                      onClick={() => {
                        onOpenOwnerPaymentSettings();
                        setToolsDropdownOpen(false);
                      }}
                      className="w-full text-start px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-slate-950 border border-amber-200/80 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-black text-slate-900">
                          {lang === 'ar' ? 'إعدادات الدفع والواتساب للمالك ⚙️' : 'Owner Payment & WhatsApp Settings ⚙️'}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          {lang === 'ar' ? 'روابط الدفع، رقم الواتساب، وحساب استلام الاشتراكات' : 'Payment gateway URLs, WhatsApp & owner IBAN'}
                        </div>
                      </div>
                    </button>
                  )}

                  {onOpenAccountSettings && (
                    <button
                      onClick={() => {
                        onOpenAccountSettings();
                        setToolsDropdownOpen(false);
                      }}
                      className="w-full text-start px-3 py-2 rounded-xl bg-emerald-50/70 text-slate-900 hover:bg-emerald-100/80 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Landmark className="w-4 h-4 text-[#0F5A47]" />
                      <div>
                        <div className="font-bold text-[#0A4A35]">
                          {lang === 'ar' ? 'إعدادات الحساب والبنك (IBAN) 🏦' : 'Bank & IBAN Settings 🏦'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {lang === 'ar' ? 'تحديد البنك والآيبان لفواتير المستأجرين' : 'Configure Bank & IBAN for tenant invoices'}
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenReceiptModal();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">
                        {lang === 'ar' ? 'سند قبض ضريبي إلكتروني' : 'Official Tax Receipt'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'إصدار سند بختم مشفر QR' : 'Generate receipt with encrypted QR'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenAiScanner();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-bold">
                        {lang === 'ar' ? 'فحص عقد بالذكاء الاصطناعي' : 'AI Smart Lease Scanner'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'تفريغ تلقائي للعقود بالـ AI' : 'Automated lease extraction via AI'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenTermsModal();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-bold">
                        {lang === 'ar' ? 'ميثاق وشروط الاستخدام (Charte)' : 'Terms of Service & Charter'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'العقد القانوني وسياسة الخصوصية' : 'Legal agreement & privacy policy'}
                      </div>
                    </div>
                  </button>

                  {currentRole === 'super_admin' && (
                    <>
                      <button
                        onClick={() => {
                          onOpenDeployModal();
                          setToolsDropdownOpen(false);
                        }}
                        className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Rocket className="w-4 h-4 text-[#0F5A47]" />
                        <div>
                          <div className="font-bold">
                            {lang === 'ar' ? 'إعدادات النشر وقاعدة البيانات' : 'Deployment & Database Setup'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {lang === 'ar' ? 'خاص بمالك المنصة فقط' : 'Restricted to platform owner'}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab('schema');
                          setToolsDropdownOpen(false);
                        }}
                        className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Database className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-bold">
                            {lang === 'ar' ? 'هندسة قاعدة البيانات (Schema)' : 'Database Architecture (Schema)'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {lang === 'ar' ? 'جداول ومخطط الـ SQL' : 'SQL tables & schema blueprint'}
                          </div>
                        </div>
                      </button>

                      {onToggleSuspendedView && (
                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              onToggleSuspendedView();
                              setToolsDropdownOpen(false);
                            }}
                            className="w-full text-start px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Lock className="w-4 h-4 text-rose-600" />
                            <span>
                              {isTestingSuspendedView
                                ? lang === 'ar'
                                  ? 'إغلاق شاشة الحظر'
                                  : 'Close Suspended Screen'
                                : lang === 'ar'
                                ? 'معاينة شاشة العميل الموقوف'
                                : 'Preview Suspended Account'}
                            </span>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Download Official Logo Image (High-Res PNG / SVG) */}
                  <div className="pt-1 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        setLogoGalleryOpen(true);
                      }}
                      className="w-full text-start px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold flex items-center gap-2.5 transition-colors cursor-pointer border border-amber-200/80"
                    >
                      <Download className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <div className="font-black">
                          {lang === 'ar' ? 'معرض جميع شعارات الموقع (9 شعارات) 🎨' : 'All Website Logos Gallery (9 Logos) 🎨'}
                        </div>
                        <div className="text-[10px] text-amber-700">
                          {lang === 'ar' ? 'استعراض وتحميل جميع النسخ والتصاميم السابقة والحالية' : 'View & download all previous and current logo designs'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CURRENCY & LANGUAGE (Visible on both vertical & horizontal mobile and desktop) */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-[11px] sm:text-xs shrink-0">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-slate-700 font-bold py-1 px-1 sm:px-1.5 focus:outline-none cursor-pointer"
                title={t.currencyLabel}
              >
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="QAR">QAR</option>
                <option value="USD">USD</option>
              </select>

              {currentTab === 'dashboard' && currentRole === 'admin' && (
                <button
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="px-1.5 sm:px-2.5 py-1 font-black text-[#0F5A47] bg-white rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
                  title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                >
                  <span className="sm:hidden">{lang === 'ar' ? 'EN' : 'AR'}</span>
                  <span className="hidden sm:inline">{lang === 'ar' ? 'EN | English' : 'AR | العربية'}</span>
                </button>
              )}
            </div>

            {/* ROLE SWITCHER DROPDOWN (Desktop / Horizontal Mobile >= sm; Vertical Mobile < sm has it in Row 1) */}
            <div className="hidden sm:flex relative items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 max-w-none">
              <select
                value={currentRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setCurrentRole(role);
                  if (role === 'super_admin') {
                    setCurrentTab('superadmin');
                  } else if (role === 'investor') {
                    setCurrentTab('investor');
                  }
                }}
                className="bg-transparent text-xs font-bold text-slate-800 py-1 px-2 focus:outline-none cursor-pointer truncate max-w-full"
                title={t.switchRole}
              >
                <option value="super_admin">
                  {lang === 'ar' ? '👑 مالك المنصة' : '👑 Platform Owner'}
                </option>
                <option value="admin">
                  {lang === 'ar' ? '🏢 إدارة الأملاك' : '🏢 Property Manager'}
                </option>
                <option value="investor">
                  {lang === 'ar' ? '💼 المستثمر' : '💼 Investor'}
                </option>
                <option value="technician">
                  {lang === 'ar' ? '🔧 فني صيانة' : '🔧 Technician'}
                </option>
                <option value="tenant">
                  {lang === 'ar' ? '👤 المستأجر' : '👤 Tenant'}
                </option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION (Accès mn telephone - Highly Organized) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl text-xs">
          
          {/* Subscription & 7-Day Free Trial Alert on Mobile */}
          <button
            onClick={() => { onOpenPricingModal(); setMobileMenuOpen(false); }}
            className="w-full p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'باقات تبدأ من 99 ر.س | 7 أيام تجربة مجانية 🎁'
                  : 'Plans from 99 SAR | 7-Day Free Trial 🎁'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#0F5A47] text-white text-[10px] font-bold">
              {lang === 'ar' ? 'ابدأ الآن' : 'Start Now'}
            </span>
          </button>

          {/* Quick Action Buttons for Phone */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onOpenGuideModal(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'ar' ? 'دليل الاستخدام' : 'User Guide'}</span>
            </button>

            <button
              onClick={() => { onOpenInstallModal(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 rounded-xl bg-[#0F5A47] text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
            </button>
          </div>

          {/* Core Navigation Items */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-2">
              {lang === 'ar' ? 'أقسام المنصة' : 'Platform Sections'}
            </div>

            <button
              onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold ${
                currentTab === 'dashboard' && currentRole === 'admin' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              {lang === 'ar' ? '🏠 الرئيسية (نظرة عامة)' : '🏠 Overview'}
            </button>

            <button
              onClick={() => { setCurrentTab('superadmin'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 font-black rounded-xl flex items-center gap-2 ${
                currentTab === 'superadmin' ? 'bg-slate-900 text-amber-300' : 'bg-slate-100 text-slate-800'
              }`}
            >
              <span>👑</span>
              <span>
                {lang === 'ar'
                  ? 'لوحة التحكم (إدارة المالك والمشتركين)'
                  : 'Control Panel (Owner & Subscribers)'}
              </span>
            </button>

            <button
              onClick={() => { setCurrentTab('properties'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold ${
                currentTab === 'properties' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              {t.navProperties}
            </button>

            <button
              onClick={() => { setCurrentTab('floormap'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold flex items-center gap-2 ${
                currentTab === 'floormap' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4 text-[#0F5A47]" />
              <span>{lang === 'ar' ? 'مخطط الأدوار التفاعلي' : 'Interactive Floor Matrix'}</span>
            </button>

            <button
              onClick={() => { setCurrentTab('whatsapp'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold flex items-center gap-2 ${
                currentTab === 'whatsapp' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'ar' ? 'أتمتة الواتساب للتحصيل' : 'WhatsApp Automation Hub'}</span>
            </button>

            <button
              onClick={() => { setCurrentTab('maintenance'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold ${
                currentTab === 'maintenance' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              {t.navMaintenance}
            </button>

            <button
              onClick={() => { setCurrentTab('leases'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold ${
                currentTab === 'leases' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              {t.navLeases}
            </button>

            <button
              onClick={() => { setCurrentTab('expenses'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold flex items-center gap-2 ${
                currentTab === 'expenses' ? 'bg-rose-50 text-rose-700' : 'text-slate-700'
              }`}
            >
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>{t.navExpenses}</span>
            </button>

            <button
              onClick={() => { setCurrentTab('finance'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold ${
                currentTab === 'finance' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              {t.navFinance}
            </button>
          </div>

          {/* Quick Tools Grid on Phone */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1.5">
              {lang === 'ar' ? 'الأدوات والمستندات' : 'Tools & Documents'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {onOpenOwnerPaymentSettings && (
                <button
                  onClick={() => { onOpenOwnerPaymentSettings(); setMobileMenuOpen(false); }}
                  className="col-span-2 p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-slate-950 font-black flex items-center justify-center gap-2 text-start cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {lang === 'ar'
                      ? 'إعدادات الدفع والواتساب للمالك ⚙️'
                      : 'Owner Payment & WhatsApp Settings ⚙️'}
                  </span>
                </button>
              )}

              {onOpenAccountSettings && (
                <button
                  onClick={() => { onOpenAccountSettings(); setMobileMenuOpen(false); }}
                  className="col-span-2 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 text-[#0A4A35] font-black flex items-center justify-center gap-2 text-start cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-[#0F5A47] shrink-0" />
                  <span>
                    {lang === 'ar'
                      ? 'إعدادات الحساب البنكي (IBAN) لفواتير المستأجرين 🏦'
                      : 'Bank & IBAN Settings for Tenant Invoices 🏦'}
                  </span>
                </button>
              )}

              {!isCleanMode ? (
                onToggleCleanMode && (
                  <button
                    onClick={() => { onToggleCleanMode(); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold flex items-center gap-1.5 text-start cursor-pointer"
                  >
                    <span>🧹</span>
                    <span>{lang === 'ar' ? 'تصفير المنصة (Clean)' : 'Clean Workspace'}</span>
                  </button>
                )
              ) : (
                onRestoreDemo && (
                  <button
                    onClick={() => { onRestoreDemo(); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 font-bold flex items-center gap-1.5 text-start cursor-pointer"
                  >
                    <span>🔄</span>
                    <span>{lang === 'ar' ? 'استعادة الديمو (Restore)' : 'Restore Demo'}</span>
                  </button>
                )
              )}

              <button
                onClick={() => { onOpenReceiptModal(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold flex items-center gap-2 text-start"
              >
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'ar' ? 'سند قبض ضريبي' : 'Tax Receipt'}</span>
              </button>

              <button
                onClick={() => { onOpenAiScanner(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold flex items-center gap-2 text-start"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{lang === 'ar' ? 'فحص عقد AI' : 'AI Lease Scan'}</span>
              </button>

              <button
                onClick={() => { onOpenPricingModal(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-slate-900 font-bold flex items-center gap-2 text-start"
              >
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lang === 'ar' ? 'الباقات والأسعار 💎' : 'Pricing Plans 💎'}</span>
              </button>

              <button
                onClick={() => { onOpenTermsModal(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold flex items-center gap-2 text-start"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
                <span>{lang === 'ar' ? 'الميثاق (Charte)' : 'Terms & Charter'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLogoGalleryOpen(true);
                }}
                className="col-span-2 p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-black flex items-center justify-center gap-2 text-start cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {lang === 'ar' ? 'معرض جميع شعارات الموقع (9 شعارات للتحميل) 🎨' : 'All Website Logos Gallery (9 Logos) 🎨'}
                </span>
              </button>
            </div>
          </div>

          {/* Language & Currency on Phone (Language switcher only on main page) */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{lang === 'ar' ? 'العملة واللغة:' : 'Currency & Language:'}</span>
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-slate-100 rounded-lg py-1 px-2 border border-slate-200"
              >
                <option value="SAR">SAR (ر.س)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="QAR">QAR (ر.ق)</option>
                <option value="USD">USD ($)</option>
              </select>

              {currentTab === 'dashboard' && currentRole === 'admin' && (
                <button
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="py-1 px-3 rounded-lg bg-[#0F5A47] text-white font-black"
                >
                  {lang === 'ar' ? 'EN | English' : 'AR | العربية'}
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ALL WEBSITE LOGOS GALLERY MODAL */}
      {logoGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#09382C] to-[#0F5A47] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                  <span>🎨</span>
                  <span>
                    {lang === 'ar'
                      ? 'أرشيف ومعرض جميع شعارات الموقع (من البداية حتى الآن)'
                      : 'Complete Website Logos Archive & Gallery'}
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  {lang === 'ar'
                    ? 'جميع الـ 9 شعارات التي تم تصميمها للمنصة بدقة عالية 1024×1024 جاهزة للعرض والتحميل المباشر'
                    : 'All 9 high-resolution 1024×1024 logos created for the platform ready for preview and download'}
                </p>
              </div>
              <button
                onClick={() => setLogoGalleryOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50">
              {allWebsiteLogos.map((logo) => (
                <div
                  key={logo.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-square bg-[#07261E] flex items-center justify-center p-4 border-b border-slate-100">
                    <img
                      src={logo.url}
                      alt={logo.titleAr}
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-400 text-slate-950 shadow">
                      {logo.badgeAr}
                    </span>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug">
                        {lang === 'ar' ? logo.titleAr : logo.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {logo.subtitleAr}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadHighResLogo(logo.url, logo.filename)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#0F5A47] hover:bg-[#09382C] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تحميل PNG' : 'Download'}</span>
                      </button>
                      <a
                        href={logo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                      >
                        {lang === 'ar' ? 'فتح الصورة' : 'Open'}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
