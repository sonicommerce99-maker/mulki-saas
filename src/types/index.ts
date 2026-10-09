export type UserRole = 'super_admin' | 'admin' | 'technician' | 'tenant' | 'investor';

export type Currency = 'SAR' | 'AED' | 'USD' | 'QAR';

export interface ClientCompany {
  id: string;
  name_ar: string;
  name_en: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_phone: string;
  city: string;
  country: string;
  plan_type: 'monthly' | 'annual' | 'trial' | 'free_adopter';
  subscription_fee: number;
  currency: Currency;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'suspended' | 'expired' | 'trial';
  max_units: number;
  total_units_used: number;
  created_at: string;
  notes?: string;
}

export type PropertyType = 'residential_compound' | 'tower' | 'commercial_plaza' | 'villa';

export type UnitType = 'studio' | '1br' | '2br' | '3br' | 'penthouse' | 'office' | 'shop';

export type UnitStatus = 'occupied' | 'vacant' | 'maintenance' | 'reserved';

export type TicketStatus = 'requested' | 'in_progress' | 'completed' | 'invoiced';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory = 'hvac_ac' | 'plumbing' | 'electrical' | 'carpentry' | 'appliances' | 'general';

export type LeaseStatus = 'active' | 'expiring_soon' | 'expired' | 'pending';

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export type PaymentMethod = 'mada' | 'apple_pay' | 'bank_transfer' | 'cash' | 'credit_card';

export interface Organization {
  id: string;
  name_ar: string;
  name_en: string;
  cr_number: string; // Commercial Registration (السجل التجاري)
  vat_number: string; // 15-digit ZATCA VAT number
  country: string;
  currency: Currency;
  contact_phone: string;
  contact_email: string;
  address_ar: string;
  address_en: string;
}

export interface Property {
  id: string;
  org_id: string;
  name_ar: string;
  name_en: string;
  type: PropertyType;
  city_ar: string;
  city_en: string;
  district_ar: string;
  district_en: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  maintenance_units: number;
  image_url: string;
  monthly_revenue: number;
}

export interface Unit {
  id: string;
  property_id: string;
  property_name_ar: string;
  property_name_en: string;
  unit_number: string;
  floor: number;
  type: UnitType;
  rooms: number;
  bathrooms: number;
  area_sqm: number;
  monthly_rent: number;
  annual_rent: number;
  status: UnitStatus;
  current_tenant_id?: string;
  current_tenant_name?: string;
  current_lease_id?: string;
}

export interface Tenant {
  id: string;
  full_name_ar: string;
  full_name_en: string;
  phone: string;
  email: string;
  national_id_iqama: string;
  nationality_ar: string;
  nationality_en: string;
  unit_id: string;
  property_id: string;
  balance_due: number;
}

export interface Lease {
  id: string;
  lease_number: string;
  property_id: string;
  unit_id: string;
  tenant_id: string;
  tenant_name_ar: string;
  tenant_name_en: string;
  tenant_name?: string;
  tenant_national_id?: string;
  tenant_phone: string;
  tenant_email?: string;
  email_reminder_enabled?: boolean;
  unit_number: string;
  property_name_ar: string;
  property_name_en: string;
  start_date: string;
  end_date: string;
  annual_rent: number;
  payment_frequency: PaymentFrequency;
  installment_amount: number;
  next_due_date: string;
  days_until_due: number;
  status: LeaseStatus;
  deposit_amount: number;
  is_overdue: boolean;
  overdue_days?: number;
}

export interface MaintenanceLog {
  id: string;
  status: TicketStatus;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  note_ar: string;
  note_en: string;
}

export interface MaintenanceTicket {
  id: string;
  ticket_number: string;
  property_id: string;
  property_name_ar: string;
  property_name_en: string;
  unit_id: string;
  unit_number: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  category: TicketCategory;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_technician_name: string;
  assigned_technician_phone: string;
  is_internal_tech: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  estimated_cost: number;
  actual_cost: number;
  invoice_number?: string;
  photos: string[];
  logs: MaintenanceLog[];
}

export interface FinancialTransaction {
  id: string;
  org_id: string;
  property_id: string;
  property_name_ar: string;
  property_name_en: string;
  unit_id?: string;
  unit_number?: string;
  type: 'income' | 'expense';
  category_ar: string;
  category_en: string;
  category?: string;
  amount: number;
  base_amount?: number;
  vat_rate: number; // e.g. 0.15 (15%)
  vat_amount: number;
  total_amount: number;
  currency: Currency;
  date: string;
  reference_number: string;
  tenant_name?: string;
  payment_method: PaymentMethod;
  description_ar?: string;
  description_en?: string;
  notes_ar?: string;
  notes_en?: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialty: TicketCategory;
  rating: number;
  active_tickets_count: number;
  is_internal: boolean;
}
