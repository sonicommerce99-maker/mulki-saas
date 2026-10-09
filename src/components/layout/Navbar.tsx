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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
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
                            link.download = 'mahfadati-logo-1024x1024.png';
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                          }
                        };
                        img.src = '/portfolio-logo.jpg?v=13';
                      }}
                      className="w-full text-start px-3 py-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-[#0F5A47] font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#0F5A47] shrink-0" />
                      <div>
                        <div className="font-black">
                          {lang === 'ar' ? 'تحميل شعار الموقع (Logo PNG) 🖼️' : 'Download Official Logo (PNG) 🖼️'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {lang === 'ar' ? 'صورة عالية الدقة 1024×1024 للواتساب والتسويق' : 'High-res 1024×1024 PNG for WhatsApp & branding'}
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
                      link.download = 'mahfadati-logo-1024x1024.png';
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }
                  };
                  img.src = '/portfolio-logo.jpg?v=13';
                }}
                className="col-span-2 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#0F5A47] font-black flex items-center justify-center gap-2 text-start cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0F5A47] shrink-0" />
                <span>
                  {lang === 'ar' ? 'تحميل شعار الموقع الجديد (Logo PNG) 🖼️' : 'Download Official Logo (PNG) 🖼️'}
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

    </header>
  );
};
