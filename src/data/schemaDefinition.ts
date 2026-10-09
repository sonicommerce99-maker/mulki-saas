export interface SchemaTable {
  name: string;
  name_ar: string;
  description_ar: string;
  description_en: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    references?: string;
    nullable?: boolean;
    description_ar: string;
    description_en: string;
  }[];
  rlsPolicies: {
    name: string;
    command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
    rule: string;
  }[];
}

export const supabaseTables: SchemaTable[] = [
  {
    name: 'organizations',
    name_ar: 'المؤسسات / الشركات العقارية',
    description_ar: 'الكيان التجاري الرئيسي للمالك أو شركة إدارة الأملاك',
    description_en: 'Primary multi-tenant entity representing the property management firm or owner',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', isPrimary: true, description_ar: 'المعرف الفريد للمؤسسة', description_en: 'Unique organization ID' },
      { name: 'name', type: 'VARCHAR(255) NOT NULL', description_ar: 'اسم الشركة بالعربية / الإنجليزية', description_en: 'Organization legal trade name' },
      { name: 'cr_number', type: 'VARCHAR(50) UNIQUE NOT NULL', description_ar: 'رقم السجل التجاري (CR)', description_en: 'Commercial Registration number' },
      { name: 'vat_number', type: 'VARCHAR(50) UNIQUE NOT NULL', description_ar: 'الرقم الضريبي (15 رقماً)', description_en: '15-digit Tax Identification Number' },
      { name: 'country_code', type: 'VARCHAR(3) DEFAULT \'SA\'', description_ar: 'رمز الدولة (SA, AE, QA...)', description_en: 'ISO country code' },
      { name: 'currency', type: 'VARCHAR(5) DEFAULT \'SAR\'', description_ar: 'عملة الفوترة الافتراضية', description_en: 'Default billing currency' },
      { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description_ar: 'تاريخ الإنشاء', description_en: 'Record timestamp' },
    ],
    rlsPolicies: [
      { name: 'org_admin_manage', command: 'ALL', rule: 'auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = id AND role = \'admin\')' },
    ],
  },
  {
    name: 'properties',
    name_ar: 'العقارات والمجمعات',
    description_ar: 'الأبراج، المجمعات السكنية، الفلل والمراكز التجارية',
    description_en: 'Commercial & residential complexes, compounds, and towers',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', isPrimary: true, description_ar: 'معرف العقار', description_en: 'Primary key' },
      { name: 'organization_id', type: 'UUID NOT NULL', isForeign: true, references: 'organizations(id)', description_ar: 'معرف المؤسسة المالكة', description_en: 'Parent organization reference' },
      { name: 'name', type: 'VARCHAR(255) NOT NULL', description_ar: 'اسم العقار', description_en: 'Property title' },
      { name: 'type', type: 'VARCHAR(50) NOT NULL', description_ar: 'نوع العقار (compound, tower, plaza)', description_en: 'Property asset classification' },
      { name: 'city', type: 'VARCHAR(100) NOT NULL', description_ar: 'المدينة (الرياض، دبي، إلخ)', description_en: 'City location' },
      { name: 'district', type: 'VARCHAR(100)', description_ar: 'الحي السكني', description_en: 'District / neighborhood' },
      { name: 'national_address', type: 'VARCHAR(255)', description_ar: 'العنوان الوطني المعتمد', description_en: 'Official GCC national address' },
      { name: 'total_units_count', type: 'INT DEFAULT 0', description_ar: 'إجمالي عدد الوحدات', description_en: 'Total unit inventory' },
      { name: 'image_url', type: 'TEXT', nullable: true, description_ar: 'صورة الواجهة', description_en: 'Property facade photo' },
      { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description_ar: 'تاريخ الإضافة', description_en: 'Created timestamp' },
    ],
    rlsPolicies: [
      { name: 'property_tenant_read', command: 'SELECT', rule: 'auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = properties.organization_id)' },
    ],
  },
  {
    name: 'units',
    name_ar: 'الوحدات الإيجارية',
    description_ar: 'الشقق، الفلل، المكاتب والمحلات التجارية التابعة للعقار',
    description_en: 'Apartments, villas, offices, and retail shop spaces',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', isPrimary: true, description_ar: 'معرف الوحدة', description_en: 'Unit ID' },
      { name: 'property_id', type: 'UUID NOT NULL', isForeign: true, references: 'properties(id) ON DELETE CASCADE', description_ar: 'معرف العقار التابع له', description_en: 'Parent property reference' },
      { name: 'unit_number', type: 'VARCHAR(50) NOT NULL', description_ar: 'رقم الوحدة (مثال: V-101)', description_en: 'Unit door/code number' },
      { name: 'floor', type: 'INT DEFAULT 0', description_ar: 'الدور / الطابق', description_en: 'Floor level' },
      { name: 'type', type: 'VARCHAR(50) NOT NULL', description_ar: 'نوع الوحدة (1br, 2br, 3br, office...)', description_en: 'Unit layout typology' },
      { name: 'area_sqm', type: 'NUMERIC(8,2)', description_ar: 'المساحة بالمتر المربع (م²)', description_en: 'Floor area in square meters' },
      { name: 'monthly_rent', type: 'NUMERIC(12,2) NOT NULL', description_ar: 'الإيجار الشهري الأساسي', description_en: 'Base monthly rent amount' },
      { name: 'status', type: 'VARCHAR(20) DEFAULT \'vacant\'', description_ar: 'حالة الوحدة (occupied, vacant, maintenance)', description_en: 'Operational status' },
      { name: 'electricity_meter_no', type: 'VARCHAR(50)', nullable: true, description_ar: 'رقم عداد الكهرباء (سكيكو/ديوا)', description_en: 'Utility meter reference' },
    ],
    rlsPolicies: [
      { name: 'units_view_org', command: 'SELECT', rule: 'EXISTS (SELECT 1 FROM properties WHERE properties.id = units.property_id)' },
    ],
  },
  {
    name: 'tenants',
    name_ar: 'المستأجرين',
    description_ar: 'بيانات المستأجرين الأفراد والشركات متضمنة الهوية ورقم الجوال',
    description_en: 'Individual and corporate tenant directory with verified GCC IDs',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', isPrimary: true, description_ar: 'معرف المستأجر', description_en: 'Tenant ID' },
      { name: 'organization_id', type: 'UUID NOT NULL', isForeign: true, references: 'organizations(id)', description_ar: 'المؤسسة التابع لها', description_en: 'Organization owner' },
      { name: 'full_name', type: 'VARCHAR(255) NOT NULL', description_ar: 'الاسم الكامل', description_en: 'Legal full name' },
      { name: 'phone', type: 'VARCHAR(30) NOT NULL', description_ar: 'رقم الجوال لتنبيهات الواتساب', description_en: 'Mobile phone for WhatsApp triggers' },
      { name: 'email', type: 'VARCHAR(255)', nullable: true, description_ar: 'البريد الإلكتروني', description_en: 'Email contact' },
      { name: 'national_id_iqama', type: 'VARCHAR(50) NOT NULL', description_ar: 'رقم الهوية الوطنية / الإقامة / الرقم الموحد', description_en: 'National ID / Iqama / GCC Civil ID' },
      { name: 'emergency_contact', type: 'VARCHAR(100)', nullable: true, description_ar: 'رقم اتصال الطوارئ', description_en: 'Emergency alternate contact' },
    ],
    rlsPolicies: [
      { name: 'tenant_self_view', command: 'SELECT', rule: 'auth.uid() = id OR auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = tenants.organization_id)' },
    ],
  },
  {
    name: 'leases',
    name_ar: 'عقود الإيجار (إيجار Ejar Ready)',
    description_ar: 'سجلات عقود الإيجار الرقمية، فترات السداد، والتواريخ الحاسمة',
    description_en: 'Digital lease agreements, payment cycles, and expiration trackers',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', isPrimary: true, description_ar: 'معرف العقد', description_en: 'Lease ID' },
      { name: 'unit_id', type: 'UUID NOT NULL', isForeign: true, references: 'units(id)', description_ar: 'معرف الوحدة المستأجرة', description_en: 'Target leased unit' },
      { name: 'tenant_id', type: 'UUID NOT NULL', isForeign: true, references: 'tenants(id)', description_ar: 'معرف المستأجر', description_en: 'Contracted tenant' },
      { name: 'lease_number', type: 'VARCHAR(100) UNIQUE NOT NULL', description_ar: 'رقم العقد الموحد (شبكة إيجار)', description_en: 'Ejar contract unified registration code' },
      { name: 'start_date', type: 'DATE NOT NULL', description_ar: 'تاريخ بداية العقد', description_en: 'Commencement date' },
      { name: 'end_date', type: 'DATE NOT NULL', description_ar: 'تاريخ نهاية العقد', description_en: 'Termination date' },
      { name: 'annual_rent', type: 'NUMERIC(12,2) NOT NULL', description_ar: 'القيمة الإيجارية السنوية', description_en: 'Total gross annual rent' },
      { name: 'payment_frequency', type: 'VARCHAR(20) NOT NULL', description_ar: 'دورية السداد (monthly, quarterly, semi_annual)', description_en: 'Installment schedule cycle' },
      { name: 'deposit_amount', type: 'NUMERIC(12,2) DEFAULT 0', description_ar: 'مبلغ التأمين المسترد', description_en: 'Refundable security deposit' },
      { name: 'status', type: 'VARCHAR(30) DEFAULT \'active\'', description_ar: 'حالة العقد (active, expiring_soon, terminated)', description_en: 'Contract status' },
    ],
    rlsPolicies: [
      { name: 'leases_access_rule', command: 'SELECT', rule: 'EXISTS (SELECT 1 FROM units JOIN properties ON units.property_id = properties.id WHERE units.id = leases.unit_id)' },
    ],
  },
  {
    name: 'maintenance_tickets',
    name_ar: 'تذاكر الصيانة والبلاغات',
    description_ar: 'بلاغات الأعطال، صور وفيديوهات المعاينة، ومسار الإنجاز التلقائي',
    description_en: 'Maintenance issue reports, photos, dispatcher logs, and resolution tracking',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', isPrimary: true, description_ar: 'معرف التذكرة', description_en: 'Ticket ID' },
      { name: 'unit_id', type: 'UUID NOT NULL', isForeign: true, references: 'units(id)', description_ar: 'معرف الوحدة المتضررة', description_en: 'Unit where issue occurred' },
      { name: 'tenant_id', type: 'UUID NOT NULL', isForeign: true, references: 'tenants(id)', description_ar: 'مقدم البلاغ', description_en: 'Reporting tenant' },
      { name: 'ticket_number', type: 'VARCHAR(50) UNIQUE NOT NULL', description_ar: 'رقم التذكرة التسلسلي', description_en: 'Human-readable ticket code' },
      { name: 'category', type: 'VARCHAR(50) NOT NULL', description_ar: 'تصنيف العطل (hvac_ac, plumbing, electrical...)', description_en: 'Category specialization' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL', description_ar: 'عنوان العطل الرئيسي', description_en: 'Issue headline' },
      { name: 'description', type: 'TEXT NOT NULL', description_ar: 'تفاصيل المشكلة والوصف', description_en: 'Comprehensive description' },
      { name: 'priority', type: 'VARCHAR(20) DEFAULT \'medium\'', description_ar: 'الأولوية (urgent, high, medium, low)', description_en: 'Urgency tier' },
      { name: 'status', type: 'VARCHAR(30) DEFAULT \'requested\'', description_ar: 'مرحلة التذكرة: requested -> in_progress -> completed -> invoiced', description_en: 'Workflow status progression' },
      { name: 'assigned_technician_id', type: 'UUID', nullable: true, description_ar: 'الفني المعين', description_en: 'Assigned specialist' },
      { name: 'actual_cost', type: 'NUMERIC(10,2) DEFAULT 0', description_ar: 'تكلفة قطع الغيار والمصنعية الفعلية', description_en: 'Total resolution expenses' },
      { name: 'photos', type: 'TEXT[] DEFAULT \'{}\'', description_ar: 'مصفوفة روابط صور العطل', description_en: 'Photo attachments array' },
      { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description_ar: 'وقت رفع الطلب', description_en: 'Submission timestamp' },
    ],
    rlsPolicies: [
      { name: 'ticket_tenant_crud', command: 'ALL', rule: 'auth.uid() = tenant_id OR auth.uid() IN (SELECT user_id FROM organization_members)' },
    ],
  },
  {
    name: 'financial_transactions',
    name_ar: 'المعاملات المالية والفواتير الضريبية',
    description_ar: 'سندات القبض، المصروفات، وحسابات ضريبة القيمة المضافة 15%',
    description_en: 'Income, OpEx ledger, and 15% GCC VAT tax accounting records',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', isPrimary: true, description_ar: 'معرف المعاملة', description_en: 'Transaction ID' },
      { name: 'organization_id', type: 'UUID NOT NULL', isForeign: true, references: 'organizations(id)', description_ar: 'المؤسسة', description_en: 'Organization ID' },
      { name: 'property_id', type: 'UUID NOT NULL', isForeign: true, references: 'properties(id)', description_ar: 'العقار المرتبط', description_en: 'Related property asset' },
      { name: 'unit_id', type: 'UUID', nullable: true, isForeign: true, references: 'units(id)', description_ar: 'الوحدة المرتبطة إن وجدت', description_en: 'Unit reference' },
      { name: 'type', type: 'VARCHAR(20) NOT NULL', description_ar: 'نوع المعاملة (income / expense)', description_en: 'Cashflow direction' },
      { name: 'category', type: 'VARCHAR(100) NOT NULL', description_ar: 'بند الصرف أو الإيراد', description_en: 'Category breakdown' },
      { name: 'base_amount', type: 'NUMERIC(12,2) NOT NULL', description_ar: 'المبلغ قبل احتساب الضريبة', description_en: 'Tax-exclusive base amount' },
      { name: 'vat_rate', type: 'NUMERIC(4,2) DEFAULT 0.15', description_ar: 'نسبة الضريبة (15% القياسية)', description_en: 'Standard VAT percentage rate' },
      { name: 'vat_amount', type: 'NUMERIC(12,2) NOT NULL', description_ar: 'قيمة ضريبة القيمة المضافة', description_en: 'Calculated VAT amount' },
      { name: 'total_amount', type: 'NUMERIC(12,2) NOT NULL', description_ar: 'المبلغ الإجمالي المستلم أو المدفوع', description_en: 'Grand total payable' },
      { name: 'payment_method', type: 'VARCHAR(50) NOT NULL', description_ar: 'طريقة الدفع (mada, apple_pay, bank_transfer)', description_en: 'Payment channel' },
      { name: 'reference_number', type: 'VARCHAR(100) UNIQUE NOT NULL', description_ar: 'رقم المرجع المصرفي / الفاتورة', description_en: 'Unique transaction or receipt reference' },
      { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description_ar: 'تاريخ المعاملة', description_en: 'Recorded timestamp' },
    ],
    rlsPolicies: [
      { name: 'finance_manager_only', command: 'ALL', rule: 'auth.uid() IN (SELECT user_id FROM organization_members WHERE role IN (\'admin\', \'finance_officer\'))' },
    ],
  },
];

export const supabaseSqlFullMigration = `-- ==============================================================================
-- AQARFLOW (عقار فلو) - GCC MULTI-TENANT PROPERTY MANAGEMENT SAAS SCHEMA
-- Target Database: PostgreSQL 15+ / Supabase
-- Features: Multi-tenancy, Row Level Security (RLS), 15% VAT Ledger, Realtime enabled
-- ==============================================================================

-- 1. Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations Table (الكيانات العقارية متعددة المستأجرين)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cr_number VARCHAR(50) UNIQUE NOT NULL,
    vat_number VARCHAR(50) UNIQUE NOT NULL,
    country_code VARCHAR(3) DEFAULT 'SA',
    currency VARCHAR(5) DEFAULT 'SAR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Properties Table (العقارات والمجمعات)
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('residential_compound', 'tower', 'commercial_plaza', 'villa')),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    national_address VARCHAR(255),
    total_units_count INT DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Units Table (الوحدات والشقق والمكاتب)
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    floor INT DEFAULT 0,
    type VARCHAR(50) NOT NULL CHECK (type IN ('studio', '1br', '2br', '3br', 'penthouse', 'office', 'shop')),
    area_sqm NUMERIC(8,2) NOT NULL,
    monthly_rent NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
    electricity_meter_no VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, unit_number)
);

-- 5. Tenants Table (دليل المستأجرين)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    national_id_iqama VARCHAR(50) NOT NULL,
    emergency_contact VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leases Table (عقود الإيجار والتحصيل)
CREATE TABLE public.leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
    lease_number VARCHAR(100) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    annual_rent NUMERIC(12,2) NOT NULL,
    payment_frequency VARCHAR(20) NOT NULL CHECK (payment_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
    deposit_amount NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Maintenance Tickets Table (سير عمل الصيانة الآلي)
CREATE TABLE public.maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('hvac_ac', 'plumbing', 'electrical', 'carpentry', 'appliances', 'general')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'requested' CHECK (status IN ('requested', 'in_progress', 'completed', 'invoiced')),
    assigned_technician_name VARCHAR(255),
    assigned_technician_phone VARCHAR(50),
    estimated_cost NUMERIC(10,2) DEFAULT 0,
    actual_cost NUMERIC(10,2) DEFAULT 0,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Financial Transactions Table (المالية وضريبة القيمة المضافة 15%)
CREATE TABLE public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    base_amount NUMERIC(12,2) NOT NULL,
    vat_rate NUMERIC(4,2) DEFAULT 0.15,
    vat_amount NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'SAR',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('mada', 'apple_pay', 'bank_transfer', 'cash', 'credit_card')),
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Optimization Indexes for High Performance
CREATE INDEX idx_properties_org ON public.properties(organization_id);
CREATE INDEX idx_units_property ON public.units(property_id);
CREATE INDEX idx_units_status ON public.units(status);
CREATE INDEX idx_leases_dates ON public.leases(end_date, status);
CREATE INDEX idx_tickets_status_priority ON public.maintenance_tickets(status, priority);
CREATE INDEX idx_financial_org_date ON public.financial_transactions(organization_id, date);

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- 11. Allow public read/write for prototype demo (or customize with auth.uid())
CREATE POLICY "Public Read All" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Public Read Properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public Read Units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Public Read Tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Public Read Leases" ON public.leases FOR SELECT USING (true);
CREATE POLICY "Public Read Tickets" ON public.maintenance_tickets FOR SELECT USING (true);
CREATE POLICY "Public Read Transactions" ON public.financial_transactions FOR SELECT USING (true);

-- 12. Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leases;

-- ==============================================================================
-- 13. SEED DATA (بيانات تجريبية خليجية جاهزة للتعبئة الفورية)
-- ==============================================================================

-- إضافة المؤسسة
INSERT INTO public.organizations (id, name, cr_number, vat_number, country_code, currency)
VALUES ('e7b8c1a0-1234-4567-89ab-cdef01234567', 'شركة إتقان العقارية لإدارة الأملاك ذ.م.م', '1010789456', '310458923400003', 'SA', 'SAR')
ON CONFLICT (id) DO NOTHING;

-- إضافة العقارات
INSERT INTO public.properties (id, organization_id, name, type, city, district, national_address, total_units_count)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'e7b8c1a0-1234-4567-89ab-cdef01234567', 'مجمع الواحة السكني الفاخر', 'residential_compound', 'الرياض', 'حي الملقا', 'طريق الملك فهد 13524', 48),
  ('a2222222-2222-2222-2222-222222222222', 'e7b8c1a0-1234-4567-89ab-cdef01234567', 'برج مارينا كريسنت الفاخر', 'tower', 'دبي', 'دبي مارينا', 'شارع الممشى 4402', 80),
  ('a3333333-3333-3333-3333-333333333333', 'e7b8c1a0-1234-4567-89ab-cdef01234567', 'بلازا الخبر للأعمال والمكاتب', 'commercial_plaza', 'الخبر', 'الكورنيش الشمالي', 'طريق الأمير تركي', 26)
ON CONFLICT (id) DO NOTHING;

-- إضافة الوحدات
INSERT INTO public.units (id, property_id, unit_number, floor, type, area_sqm, monthly_rent, status)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'V-101', 1, '3br', 280, 12500, 'occupied'),
  ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'V-102', 1, '3br', 280, 12500, 'occupied'),
  ('b3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'V-103', 1, '2br', 195, 9500, 'maintenance'),
  ('b4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'A-1402', 14, '2br', 140, 11000, 'occupied'),
  ('b5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'P-2201', 22, 'penthouse', 420, 24000, 'occupied'),
  ('b6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 'OFF-304', 3, 'office', 210, 16000, 'occupied')
ON CONFLICT (id) DO NOTHING;

-- إضافة المستأجرين
INSERT INTO public.tenants (id, organization_id, full_name, phone, email, national_id_iqama)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'e7b8c1a0-1234-4567-89ab-cdef01234567', 'سلطان عبدالله الدوسري', '+966501234567', 'sultan.dossary@gmail.com', '1098452310'),
  ('c2222222-2222-2222-2222-222222222222', 'e7b8c1a0-1234-4567-89ab-cdef01234567', 'د. طارق خالد المنصور', '+966559876543', 'tariq.mansoor@health.sa', '1087412589'),
  ('c3333333-3333-3333-3333-333333333333', 'e7b8c1a0-1234-4567-89ab-cdef01234567', 'عمر فهد القحطاني', '+971509871234', 'omar.qahtani@invest.ae', '784198512345678')
ON CONFLICT (id) DO NOTHING;

-- إضافة عقود الإيجار
INSERT INTO public.leases (id, unit_id, tenant_id, lease_number, start_date, end_date, annual_rent, payment_frequency, deposit_amount, status)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'EJ-2026-9041', '2026-01-01', '2026-12-31', 150000, 'quarterly', 10000, 'active'),
  ('d2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'EJ-2026-8812', '2025-10-01', '2026-10-31', 150000, 'quarterly', 10000, 'expiring_soon')
ON CONFLICT (id) DO NOTHING;

-- إضافة تذاكر صيانة
INSERT INTO public.maintenance_tickets (id, unit_id, tenant_id, ticket_number, category, title, description, priority, status, assigned_technician_name, assigned_technician_phone, estimated_cost)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'TCK-2026-1049', 'hvac_ac', 'عطل في التكييف المركزي بالصالة الرئيسية', 'التبريد ضعيف وصوت مروحة عالية في المكثف الخارجي', 'urgent', 'in_progress', 'م. أحمد الشربيني', '+966598711223', 650)
ON CONFLICT (id) DO NOTHING;
`;
