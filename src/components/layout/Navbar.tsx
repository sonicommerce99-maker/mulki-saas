import React, { useState, useRef, useEffect } from 'react';
import { UserRole, Currency } from '../../types';
import { Language, translations } from '../../locales/translations';
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
  Gift
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
  onOpenTermsModal: () => void;
  isTestingSuspendedView?: boolean;
  onToggleSuspendedView?: () => void;
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
  onOpenTermsModal,
  isTestingSuspendedView,
  onToggleSuspendedView,
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* 1. BRAND LOGO + MOBILE HAMBURGER */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 focus:outline-none group text-start"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0F5A47] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                  <span>{lang === 'ar' ? 'مُلكي' : 'Mulki'}</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                    SAAS
                  </span>
                </span>
              </div>
            </button>
          </div>

          {/* 2. CORE NAVIGATION TABS (Clean, Spacious, No Overflow) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto text-xs font-bold text-slate-600">
            
            {/* If Super Admin, show its tab clearly */}
            {currentRole === 'super_admin' && (
              <button
                onClick={() => setCurrentTab('superadmin')}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                  currentTab === 'superadmin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>👑</span>
                <span>{lang === 'ar' ? 'المشتركين' : 'SaaS Clients'}</span>
              </button>
            )}

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.navDashboard}
            </button>

            <button
              onClick={() => setCurrentTab('properties')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'properties'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.navProperties}
            </button>

            <button
              onClick={() => setCurrentTab('floormap')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
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
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
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
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                currentTab === 'maintenance'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{t.navMaintenance}</span>
            </button>

            <button
              onClick={() => setCurrentTab('leases')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'leases'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.navLeases}
            </button>

            <button
              onClick={() => setCurrentTab('finance')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'finance'
                  ? 'bg-slate-100 text-[#0F5A47] font-black'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.navFinance}
            </button>
          </nav>

          {/* 3. RIGHT CONTROLS: ORGANIZED, COMPACT, NEVER OVERFLOWING */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Limited-time Free Adopter Badge */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Gift className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>{lang === 'ar' ? 'مجاني لأول 50 شركة (متبقي 7)' : 'Free for first 50 firms (7 left)'}</span>
            </div>

            {/* User Guide Button (Aide d'utilisation) */}
            <button
              onClick={onOpenGuideModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
              title="دليل الاستخدام والتشغيل السريع (User Guide)"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'دليل الاستخدام 📖' : 'User Guide 📖'}</span>
              <span className="sm:hidden">📖 دليل</span>
            </button>

            {/* PWA Install Button */}
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="تثبيت التطبيق على الكمبيوتر، الآيفون أو الأندرويد"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">{lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
            </button>

            {/* ORGANIZED "MORE TOOLS" DROPDOWN (Prevents clutter) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="أدوات متقدمة"
              >
                <span>{lang === 'ar' ? 'الأدوات' : 'Tools'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Popover */}
              {toolsDropdownOpen && (
                <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 space-y-1 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    أدوات وإجراءات سريعة
                  </div>

                  <button
                    onClick={() => {
                      onOpenGuideModal();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">دليل الاستخدام والتشغيل</div>
                      <div className="text-[10px] text-slate-400">شرح تفصيلي بالعربية والإنجليزية</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenReceiptModal();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">سند قبض ZATCA الرسمي</div>
                      <div className="text-[10px] text-slate-400">إصدار سند بختم مشفر QR</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenAiScanner();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-bold">فحص عقد بالذكاء الاصطناعي</div>
                      <div className="text-[10px] text-slate-400">تفريغ تلقائي للعقود بالـ AI</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenDeployModal();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Rocket className="w-4 h-4 text-[#0F5A47]" />
                    <div>
                      <div className="font-bold">رابط النشر والمشاركة المباشر</div>
                      <div className="text-[10px] text-slate-400">مشاركة المنصة مع المستثمرين</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenTermsModal();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-bold">ميثاق وشروط الاستخدام (Charte)</div>
                      <div className="text-[10px] text-slate-400">العقد القانوني وسياسة الخصوصية</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('schema');
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Database className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold">هندسة قاعدة البيانات (Schema)</div>
                      <div className="text-[10px] text-slate-400">جداول ومخطط الـ SQL</div>
                    </div>
                  </button>

                  {onToggleSuspendedView && (
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onToggleSuspendedView();
                          setToolsDropdownOpen(false);
                        }}
                        className="w-full text-start px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-2 transition-colors"
                      >
                        <Lock className="w-4 h-4 text-rose-600" />
                        <span>{isTestingSuspendedView ? 'إغلاق شاشة الحظر' : 'معاينة شاشة العميل الموقوف'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CURRENCY & LANGUAGE (Compact & Neat) */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-slate-700 font-bold py-1 px-1.5 focus:outline-none cursor-pointer"
                title={t.currencyLabel}
              >
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="QAR">QAR</option>
                <option value="USD">USD</option>
              </select>

              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="px-2 py-1 font-bold text-slate-700 hover:text-slate-900"
                title="تبديل اللغة"
              >
                {lang === 'ar' ? 'EN' : 'عربي'}
              </button>
            </div>

            {/* ROLE SWITCHER DROPDOWN (Clean & Unified) */}
            <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
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
                className="bg-transparent text-xs font-bold text-slate-800 py-1 px-2 focus:outline-none cursor-pointer"
                title={t.switchRole}
              >
                <option value="super_admin">👑 مالك المنصة (Super Admin)</option>
                <option value="admin">🏢 {t.adminRole} (شركة إتقان)</option>
                <option value="investor">💼 المستثمر (VIP Investor)</option>
                <option value="technician">🔧 {t.technicianRole}</option>
                <option value="tenant">👤 {t.tenantRole}</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION (Accès mn telephone - Highly Organized) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl text-xs">
          
          {/* Limited Free Tier Alert on Mobile */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-600 shrink-0" />
              <span>عرض الإطلاق: مجاني لأول 50 شركة</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-mono">متبقي 7</span>
          </div>

          {/* Quick Action Buttons for Phone */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onOpenGuideModal(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>دليل الاستخدام</span>
            </button>

            <button
              onClick={() => { onOpenInstallModal(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 rounded-xl bg-[#0F5A47] text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت التطبيق</span>
            </button>
          </div>

          {/* Core Navigation Items */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-2">أقسام المنصة</div>
            
            {currentRole === 'super_admin' && (
              <button
                onClick={() => { setCurrentTab('superadmin'); setMobileMenuOpen(false); }}
                className={`w-full text-start px-3 py-2 font-black rounded-xl flex items-center gap-2 ${
                  currentTab === 'superadmin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                <span>👑</span>
                <span>لوحة تحكم مالك المنصة (المشتركين)</span>
              </button>
            )}

            <button
              onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold ${
                currentTab === 'dashboard' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              {t.navDashboard}
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
              <span>مخطط الأدوار التفاعلي</span>
            </button>

            <button
              onClick={() => { setCurrentTab('whatsapp'); setMobileMenuOpen(false); }}
              className={`w-full text-start px-3 py-2 rounded-xl font-bold flex items-center gap-2 ${
                currentTab === 'whatsapp' ? 'bg-slate-100 text-[#0F5A47]' : 'text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>أتمتة الواتساب للتحصيل</span>
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
            <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1.5">الأدوات والمستندات</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenReceiptModal(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold flex items-center gap-2 text-start"
              >
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>سند ZATCA</span>
              </button>

              <button
                onClick={() => { onOpenAiScanner(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold flex items-center gap-2 text-start"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>فحص عقد AI</span>
              </button>

              <button
                onClick={() => { onOpenDeployModal(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold flex items-center gap-2 text-start"
              >
                <Rocket className="w-4 h-4 text-[#0F5A47] shrink-0" />
                <span>رابط النشر</span>
              </button>

              <button
                onClick={() => { onOpenTermsModal(); setMobileMenuOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold flex items-center gap-2 text-start"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
                <span>الميثاق (Charte)</span>
              </button>
            </div>
          </div>

          {/* Language & Currency on Phone */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>العملة واللغة:</span>
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

              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="py-1 px-3 rounded-lg bg-slate-100 border border-slate-200"
              >
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>

        </div>
      )}

    </header>
  );
};
