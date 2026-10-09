import React, { useState, useEffect, Suspense, lazy } from 'react';
import { UserRole, Currency, Property, Unit, Lease, MaintenanceTicket, FinancialTransaction, ClientCompany } from './types';
import { Language, translations } from './locales/translations';
import { mockOrganization, mockProperties, mockUnits, mockLeases, mockMaintenanceTickets, mockTransactions, mockTechnicians } from './data/mockData';
import { mockClientCompanies } from './data/mockClients';
import { Navbar } from './components/layout/Navbar';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { ShieldCheck, BookOpen, Gift } from 'lucide-react';

const MaintenanceWorkflow = lazy(() => import('./components/maintenance/MaintenanceWorkflow').then((m) => ({ default: m.MaintenanceWorkflow })));
const RentCollection = lazy(() => import('./components/leases/RentCollection').then((m) => ({ default: m.RentCollection })));
const InvoicingView = lazy(() => import('./components/finance/InvoicingView').then((m) => ({ default: m.InvoicingView })));
const PropertiesView = lazy(() => import('./components/properties/PropertiesView').then((m) => ({ default: m.PropertiesView })));
const DatabaseSchemaView = lazy(() => import('./components/schema/DatabaseSchemaView').then((m) => ({ default: m.DatabaseSchemaView })));
const TechnicianView = lazy(() => import('./components/technician/TechnicianView').then((m) => ({ default: m.TechnicianView })));
const TenantPortalView = lazy(() => import('./components/tenant/TenantPortalView').then((m) => ({ default: m.TenantPortalView })));
const DeploymentGuideModal = lazy(() => import('./components/deployment/DeploymentGuideModal').then((m) => ({ default: m.DeploymentGuideModal })));
const WhatsAppAutomationHub = lazy(() => import('./components/whatsapp/WhatsAppAutomationHub').then((m) => ({ default: m.WhatsAppAutomationHub })));
const VisualFloorMap = lazy(() => import('./components/properties/VisualFloorMap').then((m) => ({ default: m.VisualFloorMap })));
const InvestorPortalView = lazy(() => import('./components/investor/InvestorPortalView').then((m) => ({ default: m.InvestorPortalView })));
const OfficialReceiptModal = lazy(() => import('./components/finance/OfficialReceiptModal').then((m) => ({ default: m.OfficialReceiptModal })));
const AiLeaseScannerModal = lazy(() => import('./components/ai/AiLeaseScannerModal').then((m) => ({ default: m.AiLeaseScannerModal })));
const SuperAdminDashboard = lazy(() => import('./components/superadmin/SuperAdminDashboard').then((m) => ({ default: m.SuperAdminDashboard })));
const SuspendedAccountNotice = lazy(() => import('./components/superadmin/SuspendedAccountNotice').then((m) => ({ default: m.SuspendedAccountNotice })));
const OwnerPinModal = lazy(() => import('./components/superadmin/OwnerPinModal').then((m) => ({ default: m.OwnerPinModal })));
const InstallAppModal = lazy(() => import('./components/pwa/InstallAppModal').then((m) => ({ default: m.InstallAppModal })));
const UserGuideModal = lazy(() => import('./components/help/UserGuideModal').then((m) => ({ default: m.UserGuideModal })));
const PricingPlansModal = lazy(() => import('./components/pricing/PricingPlansModal').then((m) => ({ default: m.PricingPlansModal })));
const TermsOfServiceModal = lazy(() => import('./components/legal/TermsOfServiceModal').then((m) => ({ default: m.TermsOfServiceModal })));
const FaqChatbotWidget = lazy(() => import('./components/chatbot/FaqChatbotWidget').then((m) => ({ default: m.FaqChatbotWidget })));
const AccountSettingsModal = lazy(() => import('./components/settings/AccountSettingsModal').then((m) => ({ default: m.AccountSettingsModal })));
const ExpensesView = lazy(() => import('./components/expenses/ExpensesView').then((m) => ({ default: m.ExpensesView })));

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(false);
  const [isOwnerPinModalOpen, setIsOwnerPinModalOpen] = useState<boolean>(false);
  const [openPaymentSettingsTrigger, setOpenPaymentSettingsTrigger] = useState<number>(0);
  const [pendingOpenPaymentSettings, setPendingOpenPaymentSettings] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>('SAR');

  const handleOpenOwnerPaymentSettings = () => {
    setIsTestingSuspendedView(false);
    if (!isOwnerUnlocked) {
      setPendingOpenPaymentSettings(true);
      setIsOwnerPinModalOpen(true);
      return;
    }
    setCurrentRole('super_admin');
    setCurrentTab('superadmin');
    setOpenPaymentSettingsTrigger((prev) => prev + 1);
  };

  const handleProtectedRoleChange = (role: UserRole) => {
    setIsTestingSuspendedView(false);
    if (role === 'super_admin' && !isOwnerUnlocked) {
      setIsOwnerPinModalOpen(true);
      return;
    }
    setCurrentRole(role);
    if (role === 'super_admin') {
      setCurrentTab('superadmin');
    } else if (role === 'admin' && currentTab === 'superadmin') {
      setCurrentTab('dashboard');
    }
  };

  const handleProtectedTabChange = (tab: string) => {
    setIsTestingSuspendedView(false);
    if (tab === 'superadmin') {
      if (!isOwnerUnlocked) {
        setIsOwnerPinModalOpen(true);
        return;
      }
      setCurrentRole('super_admin');
      setCurrentTab('superadmin');
      return;
    }
    if (currentRole !== 'admin') {
      setCurrentRole('admin');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState<boolean>(false);
  const loadPersisted = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isCleanWorkspace, setIsCleanWorkspace] = useState<boolean>(() =>
    loadPersisted('portfolio_clean_mode_v1', false)
  );

  // SaaS Clients State (Managed by Super Admin)
  const [clients, setClients] = useState<ClientCompany[]>(() =>
    loadPersisted('portfolio_clients_v1', mockClientCompanies)
  );
  const [isTestingSuspendedView, setIsTestingSuspendedView] = useState<boolean>(false);

  // New Modals for high-ticket features
  const [isAiScannerOpen, setIsAiScannerOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [activeTransactionForReceipt, setActiveTransactionForReceipt] = useState<FinancialTransaction | null>(null);

  // Core Data States (Auto-Saved in localStorage)
  const [properties, setProperties] = useState<Property[]>(() =>
    loadPersisted('portfolio_properties_v1', mockProperties)
  );
  const [units, setUnits] = useState<Unit[]>(() =>
    loadPersisted('portfolio_units_v1', mockUnits)
  );
  const [leases, setLeases] = useState<Lease[]>(() =>
    loadPersisted('portfolio_leases_v1', mockLeases)
  );
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() =>
    loadPersisted('portfolio_tickets_v1', mockMaintenanceTickets)
  );
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() =>
    loadPersisted('portfolio_transactions_v1', mockTransactions)
  );
  const [technicians] = useState(mockTechnicians);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('portfolio_clean_mode_v1', JSON.stringify(isCleanWorkspace));
      localStorage.setItem('portfolio_clients_v1', JSON.stringify(clients));
      localStorage.setItem('portfolio_properties_v1', JSON.stringify(properties));
      localStorage.setItem('portfolio_units_v1', JSON.stringify(units));
      localStorage.setItem('portfolio_leases_v1', JSON.stringify(leases));
      localStorage.setItem('portfolio_tickets_v1', JSON.stringify(tickets));
      localStorage.setItem('portfolio_transactions_v1', JSON.stringify(transactions));
    } catch {
      // ignore storage quota errors
    }
  }, [isCleanWorkspace, clients, properties, units, leases, tickets, transactions]);

  // Toggle between Rich Demo Use Case and Clean Empty Workspace
  const handleToggleCleanMode = () => {
    if (!isCleanWorkspace) {
      setProperties([]);
      setUnits([]);
      setLeases([]);
      setTickets([]);
      setTransactions([]);
      setIsCleanWorkspace(true);
    } else {
      setProperties(mockProperties);
      setUnits(mockUnits);
      setLeases(mockLeases);
      setTickets(mockMaintenanceTickets);
      setTransactions(mockTransactions);
      setIsCleanWorkspace(false);
    }
  };

  // Explicit Restore Demo Data handler (always resets to rich demo data)
  const handleRestoreDemoData = () => {
    setProperties(mockProperties);
    setUnits(mockUnits);
    setLeases(mockLeases);
    setTickets(mockMaintenanceTickets);
    setTransactions(mockTransactions);
    setIsCleanWorkspace(false);
  };

  // Modals & Navigation triggers
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [preselectedUnitForTicket, setPreselectedUnitForTicket] = useState<string | undefined>(undefined);
  const [selectedLeaseForReminder, setSelectedLeaseForReminder] = useState<Lease | null>(null);

  const t = translations[lang];

  // Sync HTML dir & lang attributes on change
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleAddTransaction = (newTx: FinancialTransaction) => {
    setTransactions([newTx, ...transactions]);
  };

  const handleOpenTicketForUnit = (unitId: string) => {
    setPreselectedUnitForTicket(unitId);
    setCurrentTab('maintenance');
    setIsCreateTicketModalOpen(true);
  };

  const handleOpenLeaseReminder = (lease: Lease) => {
    setSelectedLeaseForReminder(lease);
    setCurrentTab('leases');
  };

  const handleOpenReceiptForTx = (tx?: FinancialTransaction) => {
    setActiveTransactionForReceipt(tx || transactions[0] || null);
    setIsReceiptModalOpen(true);
  };

  const handleLeaseExtractedByAi = (extracted: any) => {
    const newLease: Lease = {
      id: `lease-${Date.now()}`,
      property_id: 'prop-1',
      property_name_ar: 'مجمع الواحة السكني الفاخر',
      property_name_en: 'Al Waha Luxury Compound',
      unit_id: 'unit-1',
      unit_number: extracted.unitNumber || 'V-104',
      tenant_id: 'tenant-1',
      tenant_name_ar: extracted.tenantName,
      tenant_name_en: extracted.tenantName,
      tenant_phone: extracted.phone,
      tenant_national_id: extracted.tenantId,
      lease_number: extracted.ejarContractNumber,
      start_date: extracted.startDate,
      end_date: extracted.endDate,
      annual_rent: extracted.annualRent,
      installment_amount: Math.round(extracted.annualRent / 4),
      payment_frequency: (extracted.paymentFrequency || 'quarterly') as any,
      deposit_amount: extracted.depositAmount,
      status: 'active',
      next_due_date: '2026-06-01',
      days_until_due: 45,
      is_overdue: false,
    };
    setLeases([newLease, ...leases]);
    setCurrentTab('leases');
  };

  // Simulating quick instant payment collection from tenant
  const handleSimulatePayment = (lease: Lease) => {
    const periodAmount = lease.annual_rent / (lease.payment_frequency === 'quarterly' ? 4 : lease.payment_frequency === 'semi_annual' ? 2 : 12);
    const vat = periodAmount * 0.15;
    const total = periodAmount + vat;

    const newTx: FinancialTransaction = {
      id: `tx-pay-${Date.now()}`,
      org_id: 'org-1',
      property_id: 'prop-1',
      property_name_ar: 'مجمع الواحة السكني الفاخر',
      property_name_en: 'Al Waha Luxury Compound',
      unit_id: lease.unit_id,
      unit_number: lease.unit_number,
      type: 'income',
      category: 'rent_payment',
      category_ar: 'تحصيل دفعة إيجار',
      category_en: 'Rent Collection',
      amount: periodAmount,
      base_amount: periodAmount,
      vat_rate: 0.15,
      vat_amount: vat,
      total_amount: total,
      currency: currency,
      payment_method: 'mada',
      reference_number: `MADA-EJAR-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      description_ar: `سداد دفعة إيجار وحدة ${lease.lease_number} عبر مدى`,
      description_en: `Rent collection for lease ${lease.lease_number} via Mada`,
    };

    handleAddTransaction(newTx);

    setLeases(
      leases.map((l) => {
        if (l.id === lease.id) {
          return {
            ...l,
            is_overdue: false,
            days_until_due: 90,
            next_due_date: '2027-01-05',
          };
        }
        return l;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 overflow-x-hidden w-full max-w-full">
      
      {/* Single Unified Responsive Navbar (Vue unique, propre et ultra-organisée) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleProtectedTabChange}
        lang={lang}
        setLang={setLang}
        currentRole={currentRole}
        setCurrentRole={handleProtectedRoleChange}
        currency={currency}
        setCurrency={setCurrency}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenAiScanner={() => setIsAiScannerOpen(true)}
        onOpenReceiptModal={() => handleOpenReceiptForTx()}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
        onOpenOwnerPaymentSettings={handleOpenOwnerPaymentSettings}
        isTestingSuspendedView={isTestingSuspendedView}
        onToggleSuspendedView={() => setIsTestingSuspendedView(!isTestingSuspendedView)}
        isCleanMode={isCleanWorkspace}
        onToggleCleanMode={handleToggleCleanMode}
        onRestoreDemo={handleRestoreDemoData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 overflow-x-hidden">

        {/* High-Conversion Subscription & 7-Day Free Trial Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50/60 to-amber-50 rounded-2xl p-3.5 sm:p-4 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs overflow-hidden">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs text-sm sm:text-base">
              🎁
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  {lang === 'ar'
                    ? 'ابدأ الآن فترة تجربة مجانية شاملة لمدة 7 أيام — باقات اشتراك مرنة تبدأ من 99 ر.س/شهرياً!'
                    : 'Start Your 7-Day Full Free Trial Today — Flexible Subscriptions Starting at 99 SAR/mo!'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  {lang === 'ar' ? '7 أيام تجربة مجانية ⚡️' : '7-Day Free Trial ⚡️'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] sm:text-xs">
                {lang === 'ar'
                  ? 'جرّب كافة مزايا المنصة مجاناً لمدة 7 أيام، واشترك شهرياً أو سنوياً (بخصم 20%) مع إصدار فاتورة ضريبية ومفتاح الترخيص فوراً.'
                  : 'Test all platform features free for 7 days, then subscribe monthly or annually (save 20%) with instant tax invoice.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="flex-1 md:flex-initial px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer text-xs"
            >
              <span>💎</span>
              <span>{lang === 'ar' ? 'الباقات والأسعار' : 'Pricing Plans'}</span>
            </button>
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="w-full sm:w-auto md:flex-initial px-4 py-1.5 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold shadow-xs transition-colors cursor-pointer text-center text-xs"
            >
              {lang === 'ar' ? 'ابدأ تجربة 7 أيام مجاناً 🚀' : 'Start 7-Day Free Trial 🚀'}
            </button>
          </div>
        </div>

        {/* VIEW 0: TESTING SUSPENDED ACCOUNT SCREEN */}
        <Suspense
          fallback={
            <div className="py-12 text-center text-xs font-bold text-slate-500 animate-pulse">
              {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          }
        >
        {isTestingSuspendedView ? (
          <SuspendedAccountNotice
            lang={lang}
            companyName="دار الخليج للاستثمار العقاري"
            onReturnToSuperAdmin={() => {
              setIsTestingSuspendedView(false);
              setCurrentRole('super_admin');
              setCurrentTab('superadmin');
            }}
          />
        ) : currentTab === 'superadmin' && isOwnerUnlocked ? (
          /* VIEW 1: SUPER ADMIN SAAS OWNER DASHBOARD */
          <SuperAdminDashboard
            lang={lang}
            clients={clients}
            setClients={setClients}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
            openPaymentSettingsTrigger={openPaymentSettingsTrigger}
            onLockConsole={() => {
              setIsOwnerUnlocked(false);
              setCurrentRole('admin');
              setCurrentTab('dashboard');
            }}
          />
        ) : currentRole === 'technician' ? (
          /* VIEW 2: FIELD TECHNICIAN PORTAL */
          <TechnicianView
            tickets={tickets}
            setTickets={setTickets}
            lang={lang}
            currency={currency}
          />
        ) : currentRole === 'tenant' ? (
          /* VIEW 3: RESIDENT TENANT PORTAL */
          <TenantPortalView
            leases={leases}
            tickets={tickets}
            units={units}
            lang={lang}
            currency={currency}
            onOpenNewTicket={() => {
              setPreselectedUnitForTicket('unit-1');
              setIsCreateTicketModalOpen(true);
            }}
            onPayRent={handleSimulatePayment}
          />
        ) : currentRole === 'investor' || currentTab === 'investor' ? (
          /* VIEW 4: VIP PROPERTY OWNER / INVESTOR PORTAL */
          <InvestorPortalView
            lang={lang}
            properties={properties}
            transactions={transactions}
          />
        ) : (
          /* VIEW 5: PROPERTY MANAGER / ADMIN DASHBOARD (CLIENT PERSPECTIVE) */
          <>
            {currentTab === 'dashboard' && (
              <OverviewTab
                properties={properties}
                units={units}
                tickets={tickets}
                leases={leases}
                transactions={transactions}
                currency={currency}
                lang={lang}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenNewTicket={() => {
                  setPreselectedUnitForTicket(undefined);
                  setIsCreateTicketModalOpen(true);
                }}
                onOpenLeaseReminder={handleOpenLeaseReminder}
              />
            )}

            {currentTab === 'properties' && (
              <PropertiesView
                properties={properties}
                setProperties={setProperties}
                units={units}
                setUnits={setUnits}
                currency={currency}
                lang={lang}
                onOpenNewTicketForUnit={handleOpenTicketForUnit}
              />
            )}

            {/* FEATURE 4: Visual Floor Matrix */}
            {currentTab === 'floormap' && (
              <VisualFloorMap
                lang={lang}
                properties={properties}
                units={units}
                onOpenWhatsApp={(unitNum) => setCurrentTab('whatsapp')}
              />
            )}

            {/* FEATURE 1: WhatsApp Automation Hub */}
            {currentTab === 'whatsapp' && (
              <WhatsAppAutomationHub
                lang={lang}
              />
            )}

            {currentTab === 'maintenance' && (
              <MaintenanceWorkflow
                tickets={tickets}
                setTickets={setTickets}
                units={units}
                technicians={technicians}
                lang={lang}
                currency={currency}
                isCreateModalOpen={isCreateTicketModalOpen}
                setIsCreateModalOpen={setIsCreateTicketModalOpen}
                preselectedUnitId={preselectedUnitForTicket}
              />
            )}

            {currentTab === 'leases' && (
              <RentCollection
                leases={leases}
                setLeases={setLeases}
                currency={currency}
                lang={lang}
                onAddTransaction={handleAddTransaction}
                selectedLeaseForReminder={selectedLeaseForReminder}
                setSelectedLeaseForReminder={setSelectedLeaseForReminder}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpensesView
                properties={properties}
                units={units}
                transactions={transactions}
                setTransactions={setTransactions}
                currency={currency}
                lang={lang}
              />
            )}

            {currentTab === 'finance' && (
              <InvoicingView
                transactions={transactions}
                setTransactions={setTransactions}
                org={mockOrganization}
                units={units}
                currency={currency}
                lang={lang}
                onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
              />
            )}

            {currentTab === 'schema' && (
              <DatabaseSchemaView lang={lang} />
            )}
          </>
        )}
        </Suspense>

      </main>

      <Suspense fallback={null}>
        {/* Global Interactive Ticket Modal trigger for Tenant/Global */}
        {isCreateTicketModalOpen && currentRole !== 'admin' && (
          <MaintenanceWorkflow
            tickets={tickets}
            setTickets={setTickets}
            units={units}
            technicians={technicians}
            lang={lang}
            currency={currency}
            isCreateModalOpen={isCreateTicketModalOpen}
            setIsCreateModalOpen={setIsCreateTicketModalOpen}
            preselectedUnitId={preselectedUnitForTicket}
          />
        )}

        {/* FEATURE 2: Official ZATCA PDF Receipt Modal */}
        {isReceiptModalOpen && (
          <OfficialReceiptModal
            isOpen={isReceiptModalOpen}
            onClose={() => setIsReceiptModalOpen(false)}
            lang={lang}
            transaction={activeTransactionForReceipt}
            onOpenAccountSettings={() => {
              setIsReceiptModalOpen(false);
              setIsAccountSettingsOpen(true);
            }}
          />
        )}

        {/* Landlord Account & Bank IBAN Settings Modal */}
        {isAccountSettingsOpen && (
          <AccountSettingsModal
            isOpen={isAccountSettingsOpen}
            onClose={() => setIsAccountSettingsOpen(false)}
            lang={lang}
            onPreviewReceipt={() => handleOpenReceiptForTx()}
          />
        )}

        {/* FEATURE 3: AI Smart Lease Parser Modal */}
        {isAiScannerOpen && (
          <AiLeaseScannerModal
            isOpen={isAiScannerOpen}
            onClose={() => setIsAiScannerOpen(false)}
            lang={lang}
            onLeaseCreated={handleLeaseExtractedByAi}
          />
        )}

        {/* Deployment & Live Link Modal */}
        {isDeployModalOpen && (
          <DeploymentGuideModal
            isOpen={isDeployModalOpen}
            onClose={() => setIsDeployModalOpen(false)}
            lang={lang}
          />
        )}

        {/* PWA Install App on PC / iPhone / Android Modal */}
        {isInstallModalOpen && (
          <InstallAppModal
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
            lang={lang}
          />
        )}

        {/* User Guide & Operation Manual (Arabic & English) */}
        {isGuideModalOpen && (
          <UserGuideModal
            isOpen={isGuideModalOpen}
            onClose={() => setIsGuideModalOpen(false)}
            lang={lang}
          />
        )}

        {/* Pricing & Subscription Plans Modal with Real Payment Checkout */}
        {isPricingModalOpen && (
          <PricingPlansModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
            lang={lang}
            currency={currency}
            onSubscriptionCompleted={(newClient, newTx) => {
              setClients((prev) => [newClient, ...prev]);
              if (newTx) {
                setTransactions((prev) => [newTx, ...prev]);
              }
            }}
          />
        )}

        {/* Terms of Service & Usage Charter Modal (Charte d'utilisation) */}
        {isTermsModalOpen && (
          <TermsOfServiceModal
            isOpen={isTermsModalOpen}
            onClose={() => setIsTermsModalOpen(false)}
            lang={lang}
          />
        )}

        {/* Owner Security PIN Gate Modal */}
        {isOwnerPinModalOpen && (
          <OwnerPinModal
            isOpen={isOwnerPinModalOpen}
            onClose={() => {
              setIsOwnerPinModalOpen(false);
              setPendingOpenPaymentSettings(false);
            }}
            lang={lang}
            onSuccess={() => {
              setIsOwnerUnlocked(true);
              setIsOwnerPinModalOpen(false);
              setCurrentRole('super_admin');
              setCurrentTab('superadmin');
              if (pendingOpenPaymentSettings) {
                setPendingOpenPaymentSettings(false);
                setOpenPaymentSettingsTrigger((prev) => prev + 1);
              }
            }}
          />
        )}

        {/* Interactive PropTech FAQ Chatbot Widget */}
        <FaqChatbotWidget
          lang={lang}
          onOpenPricingModal={() => setIsPricingModalOpen(true)}
          onOpenAiScanner={() => setIsAiScannerOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          onOpenReceiptModal={() => handleOpenReceiptForTx()}
          onNavigateTab={(tab) => handleProtectedTabChange(tab)}
        />
      </Suspense>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-[#0F5A47] flex items-center justify-center text-amber-300 text-[10px] font-black">
              {lang === 'ar' ? 'مَحْفَظَتِي العَقَارِيَّة' : 'MY PORTFOLIO'}
            </div>
            <span className="font-semibold text-slate-800">
              {lang === 'ar'
                ? 'منصة مَحْفَظَتِي العَقَارِيَّة (My Real Estate Portfolio) لإدارة الأملاك والعقارات'
                : 'My Real Estate Portfolio · GCC PropTech Cloud Management Platform'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="text-slate-900 hover:text-[#0F5A47] font-bold hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'ar' ? 'دليل الاستخدام (User Guide)' : 'User Guide'}</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="hover:text-slate-900 font-medium hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {lang === 'ar'
                  ? 'ميثاق وشروط الاستخدام (Charte)'
                  : 'Terms of Service & Charter'}
              </span>
            </button>
            <span>·</span>
            <span>
              {lang === 'ar'
                ? 'الرياض · دبي · الدوحة · الكويت · المنامة · مسقط'
                : 'Riyadh · Dubai · Doha · Kuwait · Manama · Muscat'}
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
