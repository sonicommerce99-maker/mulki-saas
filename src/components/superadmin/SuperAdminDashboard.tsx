import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { ClientCompany, Currency } from '../../types';
import { loadOwnerSettings, saveOwnerSettings, OwnerPaymentSettings } from '../../lib/ownerSettings';
import { MonthlyRevenueExpenseChart } from '../dashboard/MonthlyRevenueExpenseChart';
import { 
  ShieldAlert, 
  Users, 
  DollarSign, 
  Lock, 
  Unlock, 
  Key, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  Building, 
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Send,
  Settings,
  MessageSquare,
  Rocket,
  X
} from 'lucide-react';

interface SuperAdminDashboardProps {
  lang: Language;
  clients: ClientCompany[];
  setClients: React.Dispatch<React.SetStateAction<ClientCompany[]>>;
  onLoginAsClient?: (client: ClientCompany) => void;
  onOpenDeployModal?: () => void;
  onLockConsole?: () => void;
  openPaymentSettingsTrigger?: number;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  lang,
  clients,
  setClients,
  onLoginAsClient,
  onOpenDeployModal,
  onLockConsole,
  openPaymentSettingsTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'trial'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'monthly' | 'annual' | 'trial' | 'free_adopter'>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOwnerSettingsOpen, setIsOwnerSettingsOpen] = useState(false);
  const [ownerSettingsForm, setOwnerSettingsForm] = useState<OwnerPaymentSettings>(() => loadOwnerSettings());

  React.useEffect(() => {
    if (openPaymentSettingsTrigger && openPaymentSettingsTrigger > 0) {
      setOwnerSettingsForm(loadOwnerSettings());
      setIsOwnerSettingsOpen(true);
    }
  }, [openPaymentSettingsTrigger]);
  const [settingsSavedBanner, setSettingsSavedBanner] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientCompany | null>(null);
  const [passwordModalClient, setPasswordModalClient] = useState<ClientCompany | null>(null);
  const [shareCredentialsClient, setShareCredentialsClient] = useState<ClientCompany | null>(null);
  const [previewSuspendedModal, setPreviewSuspendedModal] = useState<ClientCompany | null>(null);

  // Password editing state
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Client Form State
  const [newClientForm, setNewClientForm] = useState({
    name_ar: '',
    name_en: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_phone: '+9665',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    plan_type: 'monthly' as 'monthly' | 'annual' | 'trial' | 'free_adopter',
    subscription_fee: 799,
    currency: 'SAR' as Currency,
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    max_units: 100,
    notes: '',
  });

  // Calculate High-Level Metrics
  const activeClients = clients.filter((c) => c.status === 'active');
  const suspendedClients = clients.filter((c) => c.status === 'suspended');
  const trialClients = clients.filter((c) => c.status === 'trial');

  // MRR: monthly subscriptions + annual subscriptions divided by 12
  const mrr = clients.reduce((acc, c) => {
    if (c.status !== 'active') return acc;
    if (c.plan_type === 'monthly') return acc + c.subscription_fee;
    if (c.plan_type === 'annual') return acc + Math.round(c.subscription_fee / 12);
    return acc;
  }, 0);

  const arr = mrr * 12;

  // Filtered Clients
  const filteredClients = clients.filter((c) => {
    const matchSearch =
      c.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.admin_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchPlan = planFilter === 'all' || c.plan_type === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  // Generate random strong password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Mulki#';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Toggle Account Freeze / Suspend for non-payment
  const handleToggleSuspend = (client: ClientCompany) => {
    const updatedStatus = client.status === 'suspended' ? 'active' : 'suspended';
    setClients(
      clients.map((c) => (c.id === client.id ? { ...c, status: updatedStatus } : c))
    );
  };

  // Renew subscription by +1 month or +1 year
  const handleRenewSubscription = (client: ClientCompany, duration: 'month' | 'year') => {
    const currentExpiry = new Date(client.expiry_date);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = new Date(baseDate);
    if (duration === 'month') {
      newExpiry.setMonth(newExpiry.getMonth() + 1);
    } else {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    }

    setClients(
      clients.map((c) =>
        c.id === client.id
          ? {
              ...c,
              status: 'active',
              expiry_date: newExpiry.toISOString().split('T')[0],
            }
          : c
      )
    );
  };

  // Save new password
  const handleSavePassword = (clientId: string) => {
    if (!newPasswordInput.trim()) return;
    setClients(
      clients.map((c) =>
        c.id === clientId ? { ...c, admin_password: newPasswordInput.trim() } : c
      )
    );
    setPasswordModalClient(null);
    setNewPasswordInput('');
  };

  // Delete client
  const handleDeleteClient = (clientId: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا العميل نهائياً من المنصة؟' : 'Are you sure you want to delete this client?')) {
      setClients(clients.filter((c) => c.id !== clientId));
    }
  };

  // Add new client submit
  const handleAddNewClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: ClientCompany = {
      id: `client-${Date.now()}`,
      name_ar: newClientForm.name_ar,
      name_en: newClientForm.name_en || newClientForm.name_ar,
      admin_name: newClientForm.admin_name,
      admin_email: newClientForm.admin_email,
      admin_password: newClientForm.admin_password || generateStrongPassword(),
      admin_phone: newClientForm.admin_phone,
      city: newClientForm.city,
      country: newClientForm.country,
      plan_type: newClientForm.plan_type,
      subscription_fee: Number(newClientForm.subscription_fee),
      currency: newClientForm.currency,
      start_date: newClientForm.start_date,
      expiry_date: newClientForm.expiry_date,
      status: newClientForm.plan_type === 'trial' ? 'trial' : 'active',
      max_units: Number(newClientForm.max_units),
      total_units_used: 0,
      created_at: new Date().toISOString().split('T')[0],
      notes: newClientForm.notes,
    };

    setClients([newClient, ...clients]);
    setIsAddModalOpen(false);
    // Show credentials modal so owner can copy & send immediately
    setShareCredentialsClient(newClient);
  };

  // Edit existing client submit
  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setClients(
      clients.map((c) => (c.id === editingClient.id ? editingClient : c))
    );
    setEditingClient(null);
  };

  // Copy credentials message for WhatsApp
  const handleCopyCredentialsMessage = (client: ClientCompany) => {
    const msg = `مرحباً أستاذ ${client.admin_name} 👋\nتم تفعيل حسابكم بنجاح في منصة مَحْفَظَتِي العَقَارِيَّة لإدارة الأملاك والعقارات (${client.name_ar}) 🏢\n\n🔗 رابط تسجيل الدخول:\nhttps://mulki-saas.vercel.app\n\n📧 البريد الإلكتروني: ${client.admin_email}\n🔑 كلمة المرور المؤقتة: ${client.admin_password}\n\nنوع الاشتراك: ${client.plan_type === 'annual' ? 'سنوي معتمد' : client.plan_type === 'monthly' ? 'شهري' : 'فترة تجريبية'}\nتاريخ الصلاحية: حتى ${client.expiry_date}\n\nيرجى حفظ البيانات وتغيير كلمة المرور عند أول دخول.\nنتمنى لكم تجربة موفقة ✨`;
    navigator.clipboard.writeText(msg);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Super Admin Top Banner (Calm, Elegant Slate & Emerald) */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xl flex items-center justify-center shrink-0">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                إدارة المنصة المركزية
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] text-emerald-400 font-medium">نظام المشتركين B2B SaaS</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              {lang === 'ar' ? 'لوحة تحكم مالك المنصة (إدارة الشركات والمشتركين)' : 'SaaS Owner & Client Subscription Center'}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-1">
              {lang === 'ar'
                ? 'إدارة الشركات العقارية المستأجرة للمنصة: إضافة عملاء، تجديد وتجميد الاشتراكات، وإعادة تعيين كلمات المرور.'
                : 'Manage real estate clients: provision accounts, freeze delinquent subscriptions, and reset credentials.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setOwnerSettingsForm(loadOwnerSettings());
              setIsOwnerSettingsOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إعدادات الدفع والواتساب ⚙️' : 'Payment & WhatsApp Settings ⚙️'}</span>
          </button>

          {onOpenDeployModal && (
            <button
              onClick={onOpenDeployModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'النشر وقاعدة البيانات' : 'Deploy & DB'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setNewClientForm({
                name_ar: '',
                name_en: '',
                admin_name: '',
                admin_email: '',
                admin_password: generateStrongPassword(),
                admin_phone: '+9665',
                city: 'الرياض',
                country: 'المملكة العربية السعودية',
                plan_type: 'monthly',
                subscription_fee: 199,
                currency: 'SAR',
                start_date: new Date().toISOString().split('T')[0],
                expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                max_units: 100,
                notes: '',
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة مشترك جديد' : 'Add Client'}</span>
          </button>

          {onLockConsole && (
            <button
              onClick={onLockConsole}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/60 font-bold text-xs transition-colors cursor-pointer"
              title="قفل لوحة المالك والخروج لوضع العرض العام"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'قفل اللوحة' : 'Lock'}</span>
            </button>
          )}
        </div>
      </div>

      {/* B2B Sales Pitch & 7-Day Free Trial Quick Share Bar */}
      <div className="bg-gradient-to-r from-[#F2F9F3] via-white to-amber-50/50 border-2 border-[#0F5A47]/25 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#0F5A47] text-amber-300 font-black text-[10px]">
              GO-TO-MARKET PITCH
            </span>
            <h3 className="font-black text-sm text-slate-900">
              {lang === 'ar'
                ? 'أداة التسويق السريع وإرسال عرض التجربة المجانية (7 أيام) للمكاتب العقارية'
                : 'Quick B2B Sales Pitch & 7-Day Free Trial Share Tool'}
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            {lang === 'ar'
              ? 'انسخ رسالة العرض التسويقي الجاهزة (مع رابط المنصة وتجربة 7 أيام مجاناً) لإرسالها للمكاتب العقارية عبر واتساب أو LinkedIn.'
              : 'Copy the ready-made B2B sales pitch with your live platform link and 7-day free trial offer.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const pitchText = `السلام عليكم ورحمة الله 👋\nيسعدنا دعوتكم لتجربة منصة «مَحْفَظَتِي العَقَارِيَّة | My Real Estate Portfolio» لإدارة الأملاك والمكاتب العقارية السحابية 🏢✨\n\n✅ إدارة شاملة للعقارات والوحدات وعقود الإيجار\n✅ قارئ عقود إيجار الذكي بالذكاء الاصطناعي في 3 ثوانٍ\n✅ تذكيرات تحصيل الإيجار الآلية عبر الواتساب مع حسابكم البنكي (IBAN)\n✅ إصدار فواتير ضريبية وسندات قبض إلكترونية (مع رمز QR) بضغطة زر\n\n🎁 *ابدأ الآن فترة تجربة مجانية شاملة لمدة 7 أيام بدون أي التزام:*\n🔗 https://mulki-saas.vercel.app\n\nباقات اشتراك مرنة تبدأ من 99 ر.س/شهرياً فقط.\nللاستفسار والتفعيل المباشر عبر واتساب: ${loadOwnerSettings().whatsappDisplay}`;
              navigator.clipboard.writeText(pitchText);
              setCopiedId('pitch-msg');
              setTimeout(() => setCopiedId(null), 3000);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0F5A47] hover:bg-[#0A4A35] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            {copiedId === 'pitch-msg' ? (
              <>
                <Check className="w-4 h-4 text-amber-300" />
                <span>{lang === 'ar' ? 'تم نسخ رسالة العرض التسويقي!' : 'Pitch Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-300" />
                <span>{lang === 'ar' ? 'نسخ رسالة العرض + تجربة 7 أيام 📋' : 'Copy 7-Day Trial Pitch 📋'}</span>
              </>
            )}
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `السلام عليكم ورحمة الله 👋\nيسعدنا دعوتكم لتجربة منصة «مَحْفَظَتِي العَقَارِيَّة | My Real Estate Portfolio» لإدارة الأملاك والمكاتب العقارية السحابية 🏢✨\n\n✅ قارئ عقود إيجار الذكي بالذكاء الاصطناعي\n✅ تذكيرات تحصيل الإيجار الآلية عبر الواتساب\n✅ فواتير ضريبية وسندات قبض إلكترونية (مع رمز QR)\n\n🎁 *ابدأ الآن فترة تجربة مجانية شاملة لمدة 7 أيام:*\n🔗 https://mulki-saas.vercel.app`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مشاركة مباشرة عبر واتساب 💬' : 'Share via WhatsApp 💬'}</span>
          </a>
        </div>
      </div>

      {/* 4 Financial & Subscription KPIs (Clean, Readable Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: MRR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{lang === 'ar' ? 'الدخل الشهري (MRR)' : 'Monthly Revenue'}</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {mrr.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">ر.س / شهر</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>ARR السنوي: {(arr).toLocaleString()} ر.س</span>
          </div>
        </div>

        {/* KPI 2: Active Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{lang === 'ar' ? 'الشركات النشطة المسددة' : 'Active Paying Clients'}</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {activeClients.length} <span className="text-xs font-sans text-slate-500 font-normal">شركات</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            حسابات نشطة ومسددة بالكامل
          </div>
        </div>

        {/* KPI 3: Suspended Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{lang === 'ar' ? 'موقوفة لعدم السداد' : 'Suspended for Overdue'}</span>
            <Lock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono">
            {suspendedClients.length} <span className="text-xs font-sans text-slate-500 font-normal">حسابات</span>
          </div>
          <div className="text-[11px] text-rose-600 font-medium">
            معلقة حتى تأكيد سداد الفاتورة
          </div>
        </div>

        {/* KPI 4: Trial Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{lang === 'ar' ? 'فترات تجريبية' : 'Free Trials'}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {trialClients.length} <span className="text-xs font-sans text-slate-500 font-normal">شركات</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            فترة تجربة مجانية (7 أيام)
          </div>
        </div>

      </div>

      {/* Interactive Recharts Monthly Revenue vs Expenses & Previous Month Comparison */}
      <MonthlyRevenueExpenseChart
        lang={lang}
        currency="SAR"
        variant="saas"
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث باسم الشركة، المسؤول، أو الإيميل...' : 'Search by company, admin, or email...'}
            className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({clients.length})
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            النشطة ({activeClients.length})
          </button>

          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'suspended' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            الموقوفة لعدم السداد ({suspendedClients.length})
          </button>

          <button
            onClick={() => setStatusFilter('trial')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'trial' ? 'bg-amber-500 text-slate-950' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            التجريبية ({trialClients.length})
          </button>
        </div>

      </div>

      {/* Clients Management Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#0F5A47]" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {lang === 'ar' ? 'قائمة المشتركين والشركات العقارية المؤجرة للمنصة' : 'Client Subscription Directory'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {filteredClients.length} عميل مسجل
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-start">الشركة العقارية</th>
                <th className="py-3.5 px-4 text-start">المسؤول وبيانات الدخول</th>
                <th className="py-3.5 px-4 text-center">الباقة وقيمة الاشتراك</th>
                <th className="py-3.5 px-4 text-center">الصلاحية والانتهاء</th>
                <th className="py-3.5 px-4 text-center">الحالة الحالية</th>
                <th className="py-3.5 px-4 text-end">إجراءات التحكم السريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredClients.map((client) => {
                const isSuspended = client.status === 'suspended';
                const isTrial = client.status === 'trial';
                const showPassword = showPasswordMap[client.id] || false;

                const daysRemaining = Math.ceil(
                  (new Date(client.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr key={client.id} className={`hover:bg-slate-50/80 transition-colors ${isSuspended ? 'bg-rose-50/30' : ''}`}>
                    
                    {/* Column 1: Company Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>{client.name_ar}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{client.city} · {client.country}</span>
                        <span>·</span>
                        <span className="text-[#0F5A47] font-semibold">{client.max_units} وحدة كحد أقصى</span>
                      </div>
                      {client.notes && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded-md mt-1 max-w-xs font-mono">
                          {client.notes}
                        </div>
                      )}
                    </td>

                    {/* Column 2: Admin & Password */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{client.admin_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{client.admin_email}</span>
                      </div>
                      
                      {/* Password pill with reveal & edit */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px] text-slate-700 flex items-center gap-1 border border-slate-200">
                          <Key className="w-3 h-3 text-slate-400" />
                          <span>{showPassword ? client.admin_password : '••••••••••'}</span>
                          <button
                            onClick={() =>
                              setShowPasswordMap({
                                ...showPasswordMap,
                                [client.id]: !showPassword,
                              })
                            }
                            className="text-slate-400 hover:text-slate-700 ms-1"
                            title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                          >
                            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setPasswordModalClient(client);
                            setNewPasswordInput(client.admin_password);
                          }}
                          className="text-[10px] text-indigo-700 hover:underline font-bold"
                        >
                          تغيير
                        </button>
                      </div>
                    </td>

                    {/* Column 3: Plan & Fee */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        client.plan_type === 'annual'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : client.plan_type === 'monthly'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {client.plan_type === 'annual' ? 'سنوي (مسبق الدفع)' : client.plan_type === 'monthly' ? 'شهري دوري' : client.plan_type === 'free_adopter' ? 'باقة الرواد (مجاني)' : 'فترة تجريبية'}
                      </span>
                      <div className="font-mono font-bold text-slate-900 mt-1 text-xs">
                        {client.subscription_fee.toLocaleString()} {client.currency}
                      </div>
                    </td>

                    {/* Column 4: Expiry & Days Left */}
                    <td className="py-4 px-4 text-center font-mono">
                      <div className="text-slate-800 font-semibold">{client.expiry_date}</div>
                      <div className="mt-1">
                        {daysRemaining <= 0 ? (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                            منتهي منذ {Math.abs(daysRemaining)} يوم
                          </span>
                        ) : daysRemaining <= 7 ? (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded animate-pulse">
                            ينتهي خلال {daysRemaining} أيام!
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            باقي {daysRemaining} يوم
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 5: Status Badge */}
                    <td className="py-4 px-4 text-center">
                      {isSuspended ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 text-[10px] font-black border border-rose-300">
                          <Lock className="w-3 h-3 text-rose-700" />
                          <span>موقوف لعدم السداد</span>
                        </div>
                      ) : isTrial ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>تجريبي</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>نشط ومسدد</span>
                        </div>
                      )}
                    </td>

                    {/* Column 6: Quick Owner Actions */}
                    <td className="py-4 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* 1. Toggle Freeze / Suspend for non-payment */}
                        <button
                          onClick={() => handleToggleSuspend(client)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          }`}
                          title={isSuspended ? 'تفعيل الحساب (تم السداد)' : 'تجميد الحساب فوراً (لم يسدد)'}
                        >
                          {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        {/* 2. Copy Credentials for WhatsApp */}
                        <button
                          onClick={() => setShareCredentialsClient(client)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                          title="إرسال بيانات الدخول للعميل عبر WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Renew Subscription (+1 Month / +1 Year) */}
                        <button
                          onClick={() => handleRenewSubscription(client, client.plan_type === 'annual' ? 'year' : 'month')}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                          title={client.plan_type === 'annual' ? 'تجديد الاشتراك +سنة' : 'تجديد الاشتراك +شهر'}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* 4. Edit Client */}
                        <button
                          onClick={() => setEditingClient(client)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="تعديل بيانات العميل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* 5. Delete Client */}
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 transition-colors"
                          title="حذف العميل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW CLIENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4">
            
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-[#0F5A47] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-300" />
                <h3 className="font-black text-sm sm:text-base">إضافة شركة عقارية / عميل جديد للمنصة</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewClientSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">اسم الشركة العقارية:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة إتقان العقارية"
                    value={newClientForm.name_ar}
                    onChange={(e) => setNewClientForm({ ...newClientForm, name_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">اسم المدير المسؤول:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: م. أحمد المنصور"
                    value={newClientForm.admin_name}
                    onChange={(e) => setNewClientForm({ ...newClientForm, admin_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">رقم الجوال (WhatsApp):</label>
                  <input
                    type="text"
                    required
                    placeholder="+966501234567"
                    value={newClientForm.admin_phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, admin_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">البريد الإلكتروني (لتسجيل الدخول):</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    value={newClientForm.admin_email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, admin_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold block">كلمة المرور المؤقتة:</label>
                    <button
                      type="button"
                      onClick={() => setNewClientForm({ ...newClientForm, admin_password: generateStrongPassword() })}
                      className="text-[10px] text-indigo-700 font-bold hover:underline"
                    >
                      توليد عشوائي
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newClientForm.admin_password}
                    onChange={(e) => setNewClientForm({ ...newClientForm, admin_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">نوع الاشتراك:</label>
                  <select
                    value={newClientForm.plan_type}
                    onChange={(e) => {
                      const p = e.target.value as 'monthly' | 'annual' | 'trial';
                      setNewClientForm({
                        ...newClientForm,
                        plan_type: p,
                        subscription_fee: p === 'annual' ? 7990 : p === 'monthly' ? 799 : 0,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
                  >
                    <option value="monthly">شهري (799 ر.س / شهر)</option>
                    <option value="annual">سنوي (7,990 ر.س / سنة)</option>
                    <option value="trial">فترة تجريبية (14 يوماً مجاناً)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">قيمة الاشتراك المتفق عليها:</label>
                  <input
                    type="number"
                    value={newClientForm.subscription_fee}
                    onChange={(e) => setNewClientForm({ ...newClientForm, subscription_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">المدينة والدولة:</label>
                  <input
                    type="text"
                    value={newClientForm.city}
                    onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">الحد الأقصى للوحدات:</label>
                  <input
                    type="number"
                    value={newClientForm.max_units}
                    onChange={(e) => setNewClientForm({ ...newClientForm, max_units: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">ملاحظات خاصة بالعميل:</label>
                  <input
                    type="text"
                    placeholder="مثال: تم الاتفاق على الدفع عبر تحويل بنكي في بنك الراجحي"
                    value={newClientForm.notes}
                    onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F5A47]"
                  />
                </div>

              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">سيتم حفظ وتفعيل الحساب فوراً</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold transition-all shadow-md"
                  >
                    حفظ وإصدار بيانات الدخول
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PASSWORD */}
      {passwordModalClient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Key className="w-4 h-4 text-[#0F5A47]" />
                <span>تغيير كلمة المرور لـ {passwordModalClient.name_ar}</span>
              </div>
              <button
                onClick={() => setPasswordModalClient(null)}
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                أدخل كلمة المرور الجديدة للمدير ({passwordModalClient.admin_email}):
              </p>

              <div>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:border-[#0F5A47]"
                  placeholder="كلمة المرور الجديدة"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPasswordInput(generateStrongPassword())}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                >
                  توليد كلمة سر قوية تلقائياً
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setPasswordModalClient(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleSavePassword(passwordModalClient.id)}
                className="px-4 py-2 rounded-xl bg-[#0F5A47] text-white font-bold text-xs hover:bg-[#0c4839] transition-colors shadow-xs"
              >
                حفظ كلمة المرور
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SHARE CREDENTIALS VIA WHATSAPP */}
      {shareCredentialsClient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>إرسال بيانات الدخول للعميل ({shareCredentialsClient.admin_name})</span>
              </div>
              <button
                onClick={() => setShareCredentialsClient(null)}
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                هذه الرسالة الجاهزة يمكنك نسخها بضغطة زر وإرسالها مباشرة للمشترك في WhatsApp أو الإيميل:
              </p>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-sans text-xs leading-relaxed space-y-2 border border-slate-800">
                <p>مرحباً أستاذ <strong>{shareCredentialsClient.admin_name}</strong> 👋</p>
                <p>تم تفعيل حسابكم بنجاح في منصة مَحْفَظَتِي العَقَارِيَّة لإدارة الأملاك والعقارات ({shareCredentialsClient.name_ar}) 🏢</p>
                <div className="p-2.5 rounded-xl bg-slate-800 space-y-1 font-mono text-[11px] text-emerald-300">
                  <div>🔗 الرابط: https://mulki-saas.vercel.app</div>
                  <div>📧 الإيميل: {shareCredentialsClient.admin_email}</div>
                  <div>🔑 كلمة المرور: {shareCredentialsClient.admin_password}</div>
                  <div>📅 الصلاحية: حتى {shareCredentialsClient.expiry_date}</div>
                </div>
                <p className="text-[11px] text-slate-400">يرجى حفظ البيانات وتغيير كلمة المرور بعد أول دخول.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-emerald-700 font-bold">
                {copiedId === shareCredentialsClient.id ? 'تم النسخ للحافظة بنجاح ✓' : ''}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCredentialsMessage(shareCredentialsClient)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ النص كامل</span>
                </button>

                <a
                  href={`https://wa.me/${shareCredentialsClient.admin_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${shareCredentialsClient.admin_name}، إليكم بيانات الدخول لمنصة مَحْفَظَتِي العَقَارِيَّة: https://mulki-saas.vercel.app | الإيميل: ${shareCredentialsClient.admin_email} | كلمة السر: ${shareCredentialsClient.admin_password}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs transition-all shadow-md"
                >
                  <span>فتح WhatsApp والإرسال</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: EDIT CLIENT DETAILS */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-4">
            
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">تعديل بيانات العميل ({editingClient.name_ar})</h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">اسم الشركة:</label>
                <input
                  type="text"
                  value={editingClient.name_ar}
                  onChange={(e) => setEditingClient({ ...editingClient, name_ar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">اسم المدير:</label>
                  <input
                    type="text"
                    value={editingClient.admin_name}
                    onChange={(e) => setEditingClient({ ...editingClient, admin_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">رقم الجوال:</label>
                  <input
                    type="text"
                    value={editingClient.admin_phone}
                    onChange={(e) => setEditingClient({ ...editingClient, admin_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">نوع الاشتراك:</label>
                  <select
                    value={editingClient.plan_type}
                    onChange={(e) => setEditingClient({ ...editingClient, plan_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="monthly">شهري</option>
                    <option value="annual">سنوي</option>
                    <option value="trial">تجريبي</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">قيمة الاشتراك:</label>
                  <input
                    type="number"
                    value={editingClient.subscription_fee}
                    onChange={(e) => setEditingClient({ ...editingClient, subscription_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">تاريخ الانتهاء:</label>
                  <input
                    type="date"
                    value={editingClient.expiry_date}
                    onChange={(e) => setEditingClient({ ...editingClient, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">حالة الحساب:</label>
                  <select
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="active">نشط ومسدد</option>
                    <option value="suspended">موقوف لعدم السداد</option>
                    <option value="trial">فترة تجريبية</option>
                    <option value="expired">منتهي الصلاحية</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5A47] text-white font-bold"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 6: OWNER PAYMENT, WHATSAPP & PIN SETTINGS */}
      {isOwnerSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4">
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0F5A47] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    إعدادات استلام الأموال، الواتساب، وحماية المالك 👑
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    تحكم في رقم الواتساب الخاص بك (+212772878384)، روابط الدفع المباشر، والرمز السري للوحة المالك
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOwnerSettingsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveOwnerSettings(ownerSettingsForm);
                setSettingsSavedBanner(true);
                setTimeout(() => {
                  setSettingsSavedBanner(false);
                  setIsOwnerSettingsOpen(false);
                }, 1200);
              }}
              className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto"
            >
              {settingsSavedBanner && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-center">
                  ✅ تم حفظ إعدادات الدفع ورقم الواتساب بنجاح!
                </div>
              )}

              {/* Section 1: WhatsApp & PIN */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-sm border-b border-slate-200 pb-2">
                  1. رقم الواتساب لاستقبال طلبات الشراء والرمز السري للمالك
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      رقم الواتساب الرسمي (بدون + أو أصفار دولية):
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerSettingsForm.whatsappNumber}
                      onChange={(e) =>
                        setOwnerSettingsForm({
                          ...ownerSettingsForm,
                          whatsappNumber: e.target.value,
                          whatsappDisplay: `+${e.target.value.replace(/[^0-9]/g, '')}`,
                        })
                      }
                      placeholder="212772878384"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      الرمز السري لدخول لوحة المالك (Owner PIN):
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerSettingsForm.ownerPin}
                      onChange={(e) =>
                        setOwnerSettingsForm({ ...ownerSettingsForm, ownerPin: e.target.value })
                      }
                      placeholder="2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Direct Payment Gateway Links (Stripe / LemonSqueezy / PayPal) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-sm border-b border-slate-200 pb-2">
                  2. روابط الدفع الإلكتروني المباشر (اختياري: Stripe / LemonSqueezy / PayPal / Tap)
                </div>
                <p className="text-[11px] text-slate-500">
                  إذا وضعت رابط دفع هنا، سينتقل الزبون مباشرة لصفحة الدفع بالبطاقة عند الضغط على "إتمام الدفع". وإذا تركتها فارغة، سيفتح له محادثة واتساب مباشرة معك (+212772878384) بكامل تفاصيل الفاتورة لإتمام البيع!
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      رابط دفع باقة النمو السريع (199 ر.س / شهرياً):
                    </label>
                    <input
                      type="url"
                      value={ownerSettingsForm.growthMonthlyPaymentUrl}
                      onChange={(e) =>
                        setOwnerSettingsForm({
                          ...ownerSettingsForm,
                          growthMonthlyPaymentUrl: e.target.value,
                        })
                      }
                      placeholder="https://buy.stripe.com/... أو اتركه فارغاً للتحويل للواتساب"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      رابط دفع باقة الانطلاقة (99 ر.س / شهرياً):
                    </label>
                    <input
                      type="url"
                      value={ownerSettingsForm.lifetimePaymentUrl}
                      onChange={(e) =>
                        setOwnerSettingsForm({
                          ...ownerSettingsForm,
                          lifetimePaymentUrl: e.target.value,
                        })
                      }
                      placeholder="https://buy.stripe.com/... أو اتركه فارغاً للتحويل للواتساب"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      رابط دفع باقة الشركات الكبرى (499 ر.س / شهرياً):
                    </label>
                    <input
                      type="url"
                      value={ownerSettingsForm.enterprisePaymentUrl}
                      onChange={(e) =>
                        setOwnerSettingsForm({
                          ...ownerSettingsForm,
                          enterprisePaymentUrl: e.target.value,
                        })
                      }
                      placeholder="https://buy.stripe.com/... أو اتركه فارغاً للتحويل للواتساب"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Bank Transfer Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-sm border-b border-slate-200 pb-2">
                  3. بيانات التحويل البنكي التي تظهر للعملاء
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم البنك / طريقة التحويل:</label>
                    <input
                      type="text"
                      value={ownerSettingsForm.bankName}
                      onChange={(e) =>
                        setOwnerSettingsForm({ ...ownerSettingsForm, bankName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم المستفيد:</label>
                    <input
                      type="text"
                      value={ownerSettingsForm.beneficiaryName}
                      onChange={(e) =>
                        setOwnerSettingsForm({ ...ownerSettingsForm, beneficiaryName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">رقم الآيبان الدولي (IBAN):</label>
                    <input
                      type="text"
                      value={ownerSettingsForm.ibanNumber}
                      onChange={(e) =>
                        setOwnerSettingsForm({ ...ownerSettingsForm, ibanNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رمز السويفت (Code SWIFT):</label>
                    <input
                      type="text"
                      value={ownerSettingsForm.swiftCode}
                      onChange={(e) =>
                        setOwnerSettingsForm({ ...ownerSettingsForm, swiftCode: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم الحساب المحلي (N° RIB):</label>
                    <input
                      type="text"
                      value={ownerSettingsForm.ribNumber}
                      onChange={(e) =>
                        setOwnerSettingsForm({ ...ownerSettingsForm, ribNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOwnerSettingsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-black shadow-md cursor-pointer"
                >
                  حفظ الإعدادات وتطبيقها فوراً ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
