import React, { useState, useEffect } from 'react';
import { UserRole, Currency, Property, Unit, Lease, MaintenanceTicket, FinancialTransaction, ClientCompany } from './types';
import { Language, translations } from './locales/translations';
import { mockOrganization, mockProperties, mockUnits, mockLeases, mockMaintenanceTickets, mockTransactions, mockTechnicians } from './data/mockData';
import { mockClientCompanies } from './data/mockClients';
import { Navbar } from './components/layout/Navbar';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { MaintenanceWorkflow } from './components/maintenance/MaintenanceWorkflow';
import { RentCollection } from './components/leases/RentCollection';
import { InvoicingView } from './components/finance/InvoicingView';
import { PropertiesView } from './components/properties/PropertiesView';
import { DatabaseSchemaView } from './components/schema/DatabaseSchemaView';
import { TechnicianView } from './components/technician/TechnicianView';
import { TenantPortalView } from './components/tenant/TenantPortalView';
import { DeploymentGuideModal } from './components/deployment/DeploymentGuideModal';
import { WhatsAppAutomationHub } from './components/whatsapp/WhatsAppAutomationHub';
import { VisualFloorMap } from './components/properties/VisualFloorMap';
import { InvestorPortalView } from './components/investor/InvestorPortalView';
import { OfficialReceiptModal } from './components/finance/OfficialReceiptModal';
import { AiLeaseScannerModal } from './components/ai/AiLeaseScannerModal';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { SuspendedAccountNotice } from './components/superadmin/SuspendedAccountNotice';
import { InstallAppModal } from './components/pwa/InstallAppModal';
import { UserGuideModal } from './components/help/UserGuideModal';
import { TermsOfServiceModal } from './components/legal/TermsOfServiceModal';
import { Building2, User, Wrench, Shield, CheckCircle2, MessageSquare, Layers, Briefcase, Sparkles, FileCheck, Crown, Lock, Download, Smartphone, Play, ShieldCheck, BookOpen, Gift } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [currentTab, setCurrentTab] = useState<string>('superadmin');
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  // SaaS Clients State (Managed by Super Admin)
  const [clients, setClients] = useState<ClientCompany[]>(mockClientCompanies);
  const [isTestingSuspendedView, setIsTestingSuspendedView] = useState<boolean>(false);

  // New Modals for high-ticket features
  const [isAiScannerOpen, setIsAiScannerOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [activeTransactionForReceipt, setActiveTransactionForReceipt] = useState<FinancialTransaction | null>(null);

  // Core Data States
  const [properties] = useState<Property[]>(mockProperties);
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [leases, setLeases] = useState<Lease[]>(mockLeases);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(mockMaintenanceTickets);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockTransactions);
  const [technicians] = useState(mockTechnicians);

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      
      {/* Single Unified Responsive Navbar (Vue unique, propre et ultra-organisée) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currency={currency}
        setCurrency={setCurrency}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenAiScanner={() => setIsAiScannerOpen(true)}
        onOpenReceiptModal={() => handleOpenReceiptForTx()}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
        isTestingSuspendedView={isTestingSuspendedView}
        onToggleSuspendedView={() => setIsTestingSuspendedView(!isTestingSuspendedView)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* Limited-time Free Adopter Banner (مجاني لعدد محدود من المستخدمين) */}
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50/60 to-amber-50 rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs text-base">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-black text-slate-900 text-sm">
                  {lang === 'ar' ? 'عرض الإطلاق الحصري: اشتراك مجاني كامل لأول 50 شركة عقارية' : 'Launch Offer: 100% Free Full License for First 50 Real Estate Firms'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  {lang === 'ar' ? 'متبقي 7 مقاعد مجانية فقط' : 'Only 7 Free Slots Left'}
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                {lang === 'ar'
                  ? 'تم حجز 43 مقعداً حتى الآن · يشمل كافة مزايا إدارة العقارات، الفوترة ZATCA، وأتمتة الواتساب مدى الحياة مجاناً.'
                  : '43 licenses claimed · Full access to property management, ZATCA e-invoicing, and WhatsApp automation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'ar' ? 'دليل الاستخدام 📖' : 'User Guide 📖'}</span>
            </button>
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold shadow-xs transition-colors"
            >
              {lang === 'ar' ? 'حجز المقعد المجاني' : 'Claim Free License'}
            </button>
          </div>
        </div>

        {/* VIEW 0: TESTING SUSPENDED ACCOUNT SCREEN */}
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
        ) : currentRole === 'super_admin' || currentTab === 'superadmin' ? (
          /* VIEW 1: SUPER ADMIN SAAS OWNER DASHBOARD */
          <SuperAdminDashboard
            lang={lang}
            clients={clients}
            setClients={setClients}
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

            {currentTab === 'finance' && (
              <InvoicingView
                transactions={transactions}
                setTransactions={setTransactions}
                org={mockOrganization}
                units={units}
                currency={currency}
                lang={lang}
              />
            )}

            {currentTab === 'schema' && (
              <DatabaseSchemaView lang={lang} />
            )}
          </>
        )}

      </main>

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
      <OfficialReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        lang={lang}
        transaction={activeTransactionForReceipt}
      />

      {/* FEATURE 3: AI Smart Lease Parser Modal */}
      <AiLeaseScannerModal
        isOpen={isAiScannerOpen}
        onClose={() => setIsAiScannerOpen(false)}
        lang={lang}
        onLeaseCreated={handleLeaseExtractedByAi}
      />

      {/* Deployment & Live Link Modal */}
      <DeploymentGuideModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        lang={lang}
      />

      {/* PWA Install App on PC / iPhone / Android Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        lang={lang}
      />

      {/* User Guide & Operation Manual (Arabic & English) */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={lang}
      />

      {/* Terms of Service & Usage Charter Modal (Charte d'utilisation) */}
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#0F5A47] flex items-center justify-center text-white text-[10px] font-bold">
              م
            </div>
            <span className="font-semibold text-slate-800">
              {lang === 'ar' ? 'مُلكي (Mulki) · المنصة الذكية لإدارة الأملاك والعقارات' : 'Mulki · GCC PropTech Cloud Management Platform'}
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
              <span>ميثاق وشروط الاستخدام (Charte)</span>
            </button>
            <span>·</span>
            <span>الرياض · دبي · الدوحة · الكويت · المنامة · مسقط</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
