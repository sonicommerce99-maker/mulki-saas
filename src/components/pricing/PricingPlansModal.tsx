import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { Currency, ClientCompany, FinancialTransaction, PaymentMethod } from '../../types';
import { loadOwnerSettings } from '../../lib/ownerSettings';
import {
  Check,
  Crown,
  Zap,
  ShieldCheck,
  X,
  ArrowRight,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  Copy,
  FileCheck,
  Flame,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

interface PricingPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  onClaimFreeTier?: () => void;
  onSubscriptionCompleted?: (newClient: ClientCompany, transaction?: FinancialTransaction) => void;
}

interface PricingPlan {
  id: 'starter' | 'growth' | 'enterprise';
  popular: boolean;
  isOneTime?: boolean;
  badge_ar: string;
  badge_en: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  monthly_price: number;
  annual_price: number;
  original_price?: number;
  units_limit_ar: string;
  units_limit_en: string;
  max_units: number;
  features_ar: string[];
  features_en: string[];
  cta_ar: string;
  cta_en: string;
  highlight: boolean;
}

export const PricingPlansModal: React.FC<PricingPlansModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  onSubscriptionCompleted,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isTrialCheckout, setIsTrialCheckout] = useState<boolean>(false);

  // Checkout Form States
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [city, setCity] = useState('الرياض');
  const [paymentMethod, setPaymentMethod] = useState<'mada_card' | 'apple_stc' | 'bank_iban'>('mada_card');

  // Card inputs
  const [cardNumber, setCardNumber] = useState('4456 •••• •••• 8892');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [stcPhone, setStcPhone] = useState('050XXXXXXX');

  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  const [generatedLicenseKey, setGeneratedLicenseKey] = useState('');
  const [generatedInvoiceRef, setGeneratedInvoiceRef] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      popular: false,
      badge_ar: 'للملاك الأفراد والمكاتب الناشئة ⚡️',
      badge_en: 'For Landlords & Starter Offices ⚡️',
      name_ar: 'باقة الانطلاقة (Starter Plan)',
      name_en: 'Starter Plan',
      description_ar: 'خيار اقتصادي مثالي لملاك العمارات السكنية والمكاتب الناشئة لتنظيم العقود والتحصيل والفواتير.',
      description_en: 'Ideal affordable subscription for individual landlords and emerging property offices.',
      monthly_price: 99,
      annual_price: 79,
      original_price: 149,
      units_limit_ar: 'حتى 35 وحدة عقارية · + 7 أيام تجربة مجانية',
      units_limit_en: 'Up to 35 property units · + 7-Day Free Trial',
      max_units: 35,
      features_ar: [
        'فترة تجربة مجانية شاملة لمدة 7 أيام قبل الالتزام',
        'إدارة العقارات والوحدات وعقود الإيجار',
        'إصدار فواتير ضريبية وسندات قبض إلكترونية (مع رمز QR)',
        'تذكيرات تحصيل الإيجار عبر الواتساب',
        'المخطط الهندسي التفاعلي للشقق (Floor Matrix)',
        'متابعة تذاكر الصيانة الأساسية',
        'تصدير التقارير المحاسبية (PDF / CSV)',
      ],
      features_en: [
        '7-Day Full Free Trial included',
        'Property, unit & lease management',
        'Electronic tax invoices & payment receipts (with QR)',
        'WhatsApp rent collection reminders',
        'Interactive Floor Matrix view',
        'Core maintenance ticket tracking',
        'PDF & CSV accounting exports',
      ],
      cta_ar: 'اشترك الآن (أو ابدأ تجربة 7 أيام) 🚀',
      cta_en: 'Subscribe Now (or Start 7-Day Trial) 🚀',
      highlight: false,
    },
    {
      id: 'growth',
      popular: true,
      badge_ar: 'الأكثر طلباً للمكاتب والشركات العقارية 🔥',
      badge_en: 'Most Popular for Real Estate Agencies 🔥',
      name_ar: 'باقة النمو الاحترافية (Growth Pro)',
      name_en: 'Growth Pro Plan',
      description_ar: 'الباقة المتكاملة للمكاتب العقارية النشطة مع قارئ العقود بالذكاء الاصطناعي وأتمتة الواتساب الكاملة.',
      description_en: 'Complete power suite for active real estate agencies with AI Lease Scanner & full WhatsApp automation.',
      monthly_price: 249,
      annual_price: 199,
      original_price: 399,
      units_limit_ar: 'حتى 200 وحدة عقارية · + 7 أيام تجربة مجانية',
      units_limit_en: 'Up to 200 units · + 7-Day Free Trial',
      max_units: 200,
      features_ar: [
        'فترة تجربة مجانية شاملة لمدة 7 أيام بدون التزام',
        'جميع مزايا باقة الانطلاقة حتى 200 وحدة عقارية',
        'قارئ العقود الذكي بالذكاء الاصطناعي (AI Lease Scanner)',
        'أتمتة الواتساب المتقدمة لتحصيل المتأخرات مع IBAN',
        'بوابة المستأجر وبوابة الفني الميداني',
        'إصدار تقارير التدقيق المالي والضريبي الشاملة (15% VAT)',
        'أولوية في الدعم الفني المباشر عبر الواتساب',
      ],
      features_en: [
        '7-Day Full Free Trial with zero risk',
        'All Starter features up to 200 units',
        'AI Lease Scanner for 3-second contract extraction',
        'Advanced WhatsApp rent collection with IBAN',
        'Dedicated Tenant & Field Technician Portals',
        'Comprehensive Financial & 15% VAT Audit Reports',
        'Priority WhatsApp technical support',
      ],
      cta_ar: 'تفعيل باقة النمو الاحترافية 🔥',
      cta_en: 'Activate Growth Pro Plan 🔥',
      highlight: true,
    },
    {
      id: 'enterprise',
      popular: false,
      badge_ar: 'للشركات العقارية والمحافظ الكبرى 👑',
      badge_en: 'For Large Real Estate Holdings 👑',
      name_ar: 'باقة الشركات القابضة (Enterprise)',
      name_en: 'Enterprise Corporate',
      description_ar: 'مصممة للشركات العقارية الكبرى والمطورين الذين يديرون أبراجاً ومجمعات سكنية وتجارية غير محدودة.',
      description_en: 'Designed for real estate holdings managing unlimited towers and residential/commercial compounds.',
      monthly_price: 499,
      annual_price: 399,
      original_price: 799,
      units_limit_ar: 'وحدات وعقارات غير محدودة · + 7 أيام تجربة مجانية',
      units_limit_en: 'Unlimited properties & units · + 7-Day Free Trial',
      max_units: 9999,
      features_ar: [
        'فترة تجربة مجانية لمدة 7 أيام للشركات',
        'عدد غير محدود من العقارات والوحدات والمستخدمين',
        'فحص غير محدود للعقود بالذكاء الاصطناعي (AI Scanner)',
        'بوابة المستثمرين الشركاء (VIP Investor Portal)',
        'تخصيص الهوية البصرية والحساب البنكي (IBAN) على الفواتير',
        'ربط برمجي مباشر (API) وتقارير مجلس الإدارة',
        'مدير حساب مخصص وتدريب شامل لفريق العمل',
      ],
      features_en: [
        '7-Day Corporate Free Trial included',
        'Unlimited properties, units, and staff accounts',
        'Unlimited AI Lease Scanner usage',
        'VIP Investor & Partner ROI Portal',
        'Custom company branding & IBAN on all invoices',
        'Direct API access & board-level ROI reports',
        'Dedicated account manager & full team training',
      ],
      cta_ar: 'تفعيل باقة الشركات القابضة 👑',
      cta_en: 'Activate Enterprise Plan 👑',
      highlight: false,
    },
  ];

  const getPlanPrice = (plan: PricingPlan) => {
    if (isTrialCheckout) return 0;
    return billingCycle === 'annual' ? plan.annual_price * 12 : plan.monthly_price;
  };

  const getDisplayUnitPrice = (plan: PricingPlan) => {
    return billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;
  };

  const ownerSettings = loadOwnerSettings();

  const getPlanPaymentUrl = (plan: PricingPlan) => {
    if (isTrialCheckout) return '';
    if (plan.id === 'enterprise') return ownerSettings.enterprisePaymentUrl;
    return billingCycle === 'annual'
      ? ownerSettings.growthAnnualPaymentUrl || ownerSettings.growthMonthlyPaymentUrl
      : ownerSettings.growthMonthlyPaymentUrl;
  };

  const buildWhatsAppOrderUrl = (plan: PricingPlan, refCode?: string, licKey?: string) => {
    const base = getPlanPrice(plan);
    const total = Math.round(base * 1.15);
    const methodLabel =
      paymentMethod === 'mada_card'
        ? 'بطاقة بنكية (مدى / فيزا / ماستركارد)'
        : paymentMethod === 'apple_stc'
        ? 'Apple Pay / محفظة إلكترونية'
        : 'تحويل بنكي مباشر (IBAN)';

    const text = `مرحباً إدارة منصة مَحْفَظَتِي العَقَارِيَّة (My Real Estate Portfolio) 👋
أرغب في تفعيل اشتراك رسمي وإتمام الدفع:

🏢 *اسم الشركة / المكتب:* ${companyName || 'غير محدد'}
👤 *اسم المسؤول:* ${adminName || 'غير محدد'}
📱 *رقم الجوال:* ${adminPhone || 'غير محدد'}
🏙️ *المدينة:* ${city || 'الرياض'}
💎 *الباقة المختارة:* ${plan.name_ar}
💰 *المبلغ الإجمالي (شامل الضريبة):* ${total.toLocaleString()} ${currency}
💳 *وسيلة الدفع المطلوبة:* ${methodLabel}
${refCode ? `🧾 *رقم الطلب:* ${refCode}\n🔑 *رقم الترخيص:* ${licKey}` : ''}

🏦 *بيانات التحويل البنكي المعتمدة:*
• البنك: ${ownerSettings.bankName}
• IBAN: ${ownerSettings.ibanNumber}
• SWIFT: ${ownerSettings.swiftCode}
• RIB: ${ownerSettings.ribNumber}

يرجى تأكيد التفعيل أو تزويدي برابط الدفع المباشر وشكراً!`;

    return `https://wa.me/${ownerSettings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleSelectPlanForCheckout = (plan: PricingPlan, trialMode = false) => {
    setSelectedPlan(plan);
    setIsTrialCheckout(trialMode);
    setFormError('');
    setStep('checkout');
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!companyName.trim() || !adminName.trim() || !adminPhone.trim()) {
      setFormError(
        lang === 'ar'
          ? 'يرجى إدخال اسم الشركة العقارية واسم المسؤول ورقم الجوال لإصدار الفاتورة والترخيص.'
          : 'Please enter your company name, contact name, and phone number to issue the license.'
      );
      return;
    }

    setFormError('');
    setIsProcessing(true);

    const baseAmount = getPlanPrice(selectedPlan);
    const vatAmount = Math.round(baseAmount * 0.15);
    const totalAmount = baseAmount + vatAmount;

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const licenseKey = isTrialCheckout
      ? `TRIAL-7D-${selectedPlan.id.toUpperCase()}-${randomCode}`
      : `PORTFOLIO-${selectedPlan.id.toUpperCase()}-${randomCode}`;
    const invoiceRef = isTrialCheckout ? `TRIAL-REQ-${randomCode}` : `INV-SUB-${randomCode}`;

    setGeneratedLicenseKey(licenseKey);
    setGeneratedInvoiceRef(invoiceRef);

    const today = new Date().toISOString().split('T')[0];
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newClient: ClientCompany = {
      id: `client-${Date.now()}`,
      name_ar: companyName.trim(),
      name_en: companyName.trim(),
      admin_name: adminName.trim(),
      admin_email: adminEmail.trim() || `info@company-${randomCode}.sa`,
      admin_password: `Portfolio@${randomCode}`,
      admin_phone: adminPhone.trim(),
      city: city,
      country: 'السعودية / الخليج',
      plan_type: billingCycle === 'annual' ? 'annual' : 'monthly',
      subscription_fee: isTrialCheckout ? selectedPlan.monthly_price : totalAmount,
      currency: currency,
      start_date: today,
      expiry_date: isTrialCheckout ? next7Days : billingCycle === 'annual' ? nextYear : nextMonth,
      status: 'active',
      max_units: selectedPlan.max_units,
      total_units_used: 1,
      created_at: today,
      notes: isTrialCheckout
        ? `فترة تجربة مجانية (7 أيام) تنتهي في ${next7Days} - باقة ${selectedPlan.name_ar} - رمز: ${licenseKey}`
        : `طلب اشتراك مدفوع (${
            paymentMethod === 'mada_card'
              ? 'بطاقة مدى / فيزا'
              : paymentMethod === 'apple_stc'
              ? 'Apple Pay'
              : 'تحويل بنكي'
          }) - رقم الترخيص: ${licenseKey}`,
    };

    const mappedMethod: PaymentMethod =
      paymentMethod === 'mada_card'
        ? 'mada'
        : paymentMethod === 'apple_stc'
        ? 'apple_pay'
        : 'bank_transfer';

    const newTx: FinancialTransaction = {
      id: `tx-sub-${Date.now()}`,
      org_id: 'org-1',
      property_id: 'prop-saas',
      property_name_ar: `اشتراك منصة مَحْفَظَتِي العَقَارِيَّة (${selectedPlan.name_ar})`,
      property_name_en: `My Real Estate Portfolio Subscription (${selectedPlan.name_en})`,
      type: 'income',
      category_ar: 'اشتراك رخصة منصة مَحْفَظَتِي العَقَارِيَّة (My Real Estate Portfolio SaaS)',
      category_en: 'My Real Estate Portfolio SaaS License Subscription',
      amount: baseAmount,
      base_amount: baseAmount,
      vat_rate: 0.15,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      currency: currency,
      date: today,
      reference_number: invoiceRef,
      tenant_name: companyName.trim(),
      payment_method: mappedMethod,
      description_ar: `طلب اشتراك ${selectedPlan.name_ar} لصالح ${companyName.trim()} (${adminName.trim()} - ${adminPhone.trim()})`,
      description_en: `Subscription order ${selectedPlan.name_en} for ${companyName.trim()}`,
    };

    if (onSubscriptionCompleted) {
      onSubscriptionCompleted(newClient, newTx);
    }

    // Check if Owner configured a direct Stripe/LemonSqueezy/PayPal link, otherwise open WhatsApp order directly
    const directPaymentUrl = getPlanPaymentUrl(selectedPlan);
    const targetUrl =
      directPaymentUrl && paymentMethod !== 'bank_iban'
        ? directPaymentUrl
        : buildWhatsAppOrderUrl(selectedPlan, invoiceRef, licenseKey);

    if (ownerSettings.autoOpenWhatsAppOnOrder || directPaymentUrl) {
      const linkEl = document.createElement('a');
      linkEl.href = targetUrl;
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);
    }

    setIsProcessing(false);
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('plans');
    setSelectedPlan(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto w-full max-w-full">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-2 sm:my-4 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0F5A47] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shrink-0">
              {step === 'checkout' ? '💳' : step === 'success' ? '✅' : '💎'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black">
                  {step === 'checkout'
                    ? lang === 'ar'
                      ? 'بوابة الدفع الإلكتروني وتفعيل رخصة مَحْفَظَتِي العَقَارِيَّة (My Real Estate Portfolio)'
                      : 'My Real Estate Portfolio Secure Payment & License Activation'
                    : step === 'success'
                    ? lang === 'ar'
                      ? 'تم الدفع وتفعيل اشتراكك بنجاح!'
                      : 'Payment Confirmed & License Activated!'
                    : lang === 'ar'
                    ? 'باقات الاشتراك والشراء الفوري لمنصة مَحْفَظَتِي العَقَارِيَّة (My Real Estate Portfolio)'
                    : 'My Real Estate Portfolio Subscription & Instant Purchase Plans'}
                </h2>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  {lang === 'ar' ? 'تفعيل فوري آلي' : 'Instant Activation'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                {step === 'checkout'
                  ? lang === 'ar'
                    ? 'اختر وسيلة الدفع المناسبة (مدى، فيزا، Apple Pay، أو تحويل بنكي) لاستلام مفتاح التفعيل والفاتورة الضريبية فوراً'
                    : 'Select your preferred payment method to receive your license key and tax invoice immediately'
                  : lang === 'ar'
                  ? 'باقات اشتراك مرنة (شهري / سنوي) مع فترة تجربة مجانية شاملة لمدة 7 أيام'
                  : 'Flexible monthly & annual subscription plans with a 7-day full free trial'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            {step === 'plans' && (
              <div className="bg-white/10 p-1 rounded-2xl border border-white/20 flex items-center text-xs font-bold">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    billingCycle === 'monthly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'دفع شهري' : 'Monthly'}
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-[#0F5A47] text-white shadow-xs border border-emerald-400/40'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{lang === 'ar' ? 'سنوي (خصم 20%)' : 'Annual (Save 20%)'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                </button>
              </div>
            )}

            {step === 'checkout' && (
              <button
                onClick={() => setStep('plans')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تغيير الباقة' : 'Change Plan'}</span>
              </button>
            )}

            <button
              onClick={resetAndClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEP 1: PRICING PLANS SELECTION */}
        {step === 'plans' && (
          <div className="p-4 sm:p-7 overflow-y-auto flex-1 bg-slate-50/60">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const displayPrice = getDisplayUnitPrice(plan);
                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all relative ${
                      plan.highlight
                        ? 'bg-gradient-to-b from-white via-white to-amber-50/40 border-2 border-[#0F5A47] shadow-xl ring-4 ring-[#0F5A47]/10'
                        : 'bg-white border border-slate-200/90 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            plan.highlight
                              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                              : 'bg-emerald-50 text-[#0F5A47] border border-emerald-200 font-bold'
                          }`}
                        >
                          {lang === 'ar' ? plan.badge_ar : plan.badge_en}
                        </span>
                        {plan.isOneTime && <Flame className="w-5 h-5 text-amber-500 shrink-0" />}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                        {lang === 'ar' ? plan.name_ar : plan.name_en}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {lang === 'ar' ? plan.description_ar : plan.description_en}
                      </p>

                      {/* Price Display */}
                      <div className="mb-4 pb-4 border-b border-slate-100">
                        {plan.original_price && (
                          <div className="text-xs text-slate-400 line-through font-mono mb-0.5">
                            {lang === 'ar' ? `السعر السابق: ${plan.original_price.toLocaleString()} ${currency}` : `Was ${plan.original_price.toLocaleString()} ${currency}`}
                          </div>
                        )}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-slate-900 font-mono tabular-numbers">
                            {displayPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {currency}{' '}
                            {billingCycle === 'annual'
                              ? lang === 'ar'
                                ? '/ شهرياً (فوترة سنوية)'
                                : '/ mo (billed annually)'
                              : lang === 'ar'
                              ? '/ شهرياً'
                              : '/ month'}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-[#0F5A47] mt-1.5 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{lang === 'ar' ? plan.units_limit_ar : plan.units_limit_en}</span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5 mb-6 text-xs text-slate-700">
                        {(lang === 'ar' ? plan.features_ar : plan.features_en).map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                plan.highlight ? 'text-[#0F5A47] font-bold' : 'text-emerald-600'
                              }`}
                            />
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Direct Checkout & 7-Day Free Trial Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectPlanForCheckout(plan, false)}
                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                          plan.highlight
                            ? 'bg-gradient-to-r from-[#0F5A47] to-[#147a61] hover:from-[#0c4839] hover:to-[#0F5A47] text-white shadow-md ring-2 ring-amber-400/50 active:scale-98'
                            : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{lang === 'ar' ? plan.cta_ar : plan.cta_en}</span>
                      </button>

                      <button
                        onClick={() => handleSelectPlanForCheckout(plan, true)}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-[#0A4A35] bg-[#D2EBD4]/60 hover:bg-[#D2EBD4] border border-[#0F5A47]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#0F5A47]" />
                        <span>
                          {lang === 'ar'
                            ? 'بدء فترة تجربة مجانية لمدة 7 أيام (بدون بطاقة)'
                            : 'Start 7-Day Free Trial (No Card Required)'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security & Instant Delivery Footer Bar */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F5A47] shrink-0" />
                <span className="font-bold text-slate-800">
                  {lang === 'ar'
                    ? 'تفعيل فوري لرخصة شركتك العقارية فور الدفع + فاتورة ضريبية إلكترونية + ضمان استرداد 30 يوماً'
                    : 'Instant license activation upon payment + electronic tax invoice + 30-day money-back guarantee'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-bold text-slate-700">
                <span>💳 مدى Mada</span>
                <span>·</span>
                <span>💳 Visa / MasterCard</span>
                <span>·</span>
                <span>🍎 Apple Pay</span>
                <span>·</span>
                <span>🏦 تحويل بنكي</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INTERACTIVE PAYMENT & CHECKOUT GATEWAY */}
        {step === 'checkout' && selectedPlan && (
          <form onSubmit={handleProcessPayment} className="p-4 sm:p-7 overflow-y-auto flex-1 bg-slate-50/60">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left/Main Column: Subscriber Info & Payment Method (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Company & Subscriber Information */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Building2 className="w-5 h-5 text-[#0F5A47]" />
                    <h3 className="font-black text-sm text-slate-900">
                      {lang === 'ar' ? '1. بيانات الشركة أو المكتب العقاري (لإصدار الرخصة والفاتورة)' : '1. Real Estate Company Information'}
                    </h3>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'اسم الشركة أو المكتب العقاري *' : 'Company / Office Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={lang === 'ar' ? 'مثال: شركة الرؤية العقارية' : 'e.g. Al-Roya Real Estate'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F5A47] focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'اسم المدير / المسؤول *' : 'Manager Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder={lang === 'ar' ? 'مثال: محمد العتيبي' : 'e.g. Mohammed Al-Otaibi'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F5A47] focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'رقم الجوال (الواتساب لتسليم الرخصة) *' : 'Mobile / WhatsApp Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="+966 50 000 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F5A47] focus:outline-none font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'البريد الإلكتروني الرسمي' : 'Official Email'}
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@company.sa"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F5A47] focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method Selection */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#0F5A47]" />
                      <h3 className="font-black text-sm text-slate-900">
                        {lang === 'ar' ? '2. اختر وسيلة الدفع الإلكتروني' : '2. Select Payment Method'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>دفع آمن ومشفر SSL</span>
                    </span>
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mada_card')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'mada_card'
                          ? 'border-2 border-[#0F5A47] bg-emerald-50/50 text-[#0F5A47]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>مدى / فيزا / ماستر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_stc')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'apple_stc'
                          ? 'border-2 border-[#0F5A47] bg-emerald-50/50 text-[#0F5A47]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>Apple Pay / STC Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_iban')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'bank_iban'
                          ? 'border-2 border-[#0F5A47] bg-emerald-50/50 text-[#0F5A47]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>تحويل بنكي (IBAN)</span>
                    </button>
                  </div>

                  {/* Method 1: Mada / Visa / MasterCard Fields */}
                  {paymentMethod === 'mada_card' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {lang === 'ar' ? 'رقم البطاقة (مدى / Visa / MasterCard)' : 'Card Number'}
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4456 •••• •••• ••••"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0F5A47] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="block font-bold text-slate-700 mb-1">
                            {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry'}
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-center font-bold focus:border-[#0F5A47] focus:outline-none"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block font-bold text-slate-700 mb-1">
                            {lang === 'ar' ? 'رمز الأمان CVV' : 'CVV'}
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-center font-bold focus:border-[#0F5A47] focus:outline-none"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block font-bold text-slate-700 mb-1">
                            {lang === 'ar' ? 'المدينة' : 'City'}
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-bold focus:border-[#0F5A47] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Method 2: Apple Pay / STC Pay */}
                  {paymentMethod === 'apple_stc' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <p className="font-bold text-slate-800">
                        {lang === 'ar'
                          ? 'أدخل رقم المحفظة أو الجوال المربوط بـ Apple Pay / STC Pay للتصديق الفوري:'
                          : 'Enter your mobile number linked to Apple Pay / STC Pay for instant verification:'}
                      </p>
                      <input
                        type="tel"
                        value={stcPhone}
                        onChange={(e) => setStcPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900"
                      />
                    </div>
                  )}

                  {/* Method 3: Bank Transfer IBAN / RIB / SWIFT */}
                  {paymentMethod === 'bank_iban' && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <span className="font-black text-slate-900">
                          {lang === 'ar' ? 'الحساب البنكي الرسمي المعتمد (RIB / IBAN / SWIFT):' : 'Official Bank Account (IBAN / SWIFT / RIB):'}
                        </span>
                        <span className="text-[11px] font-bold text-[#0F5A47]">{ownerSettings.bankName}</span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[11px]">
                        <div className="p-2 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-slate-400 font-sans text-[10px] block">IBAN (للتحويل الدولي والخليجي):</span>
                            <span className="font-black text-slate-900 select-all">{ownerSettings.ibanNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(ownerSettings.ibanNumber.replace(/\s+/g, ''))}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold text-[10px] shrink-0 cursor-pointer"
                          >
                            نسخ IBAN
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <div className="p-2 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-slate-400 font-sans text-[10px] block">Code SWIFT / BIC:</span>
                              <span className="font-black text-[#0F5A47] select-all">{ownerSettings.swiftCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(ownerSettings.swiftCode)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold text-[10px] shrink-0 cursor-pointer"
                            >
                              نسخ
                            </button>
                          </div>

                          <div className="p-2 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-slate-400 font-sans text-[10px] block">N° RIB (24 أرقام):</span>
                              <span className="font-black text-slate-900 select-all">{ownerSettings.ribNumber}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(ownerSettings.ribNumber.replace(/\s+/g, ''))}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold text-[10px] shrink-0 cursor-pointer"
                            >
                              نسخ RIB
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600">
                        {lang === 'ar'
                          ? 'اضغط على زر التأكيد بالأسفل لتسجيل طلبك وإرسال إشعار التحويل عبر واتساب الإدارة للتفعيل الفوري.'
                          : 'Click confirm below to register your license and send transfer confirmation via WhatsApp.'}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Order Summary & Final Pay Button (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#0F5A47]/20 shadow-md space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-black text-sm text-slate-900">
                      {lang === 'ar' ? 'ملخص الطلب والفاتورة الضريبية' : 'Order & Tax Invoice Summary'}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-[#0F5A47] px-2 py-0.5 rounded-md font-bold">
                      VAT 15%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-black text-[#0F5A47]">
                      {lang === 'ar' ? selectedPlan.name_ar : selectedPlan.name_en}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'ar' ? selectedPlan.units_limit_ar : selectedPlan.units_limit_en}
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  {(() => {
                    const base = getPlanPrice(selectedPlan);
                    const vat = Math.round(base * 0.15);
                    const total = base + vat;
                    return (
                      <div className="space-y-2.5 text-xs pt-2">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>{lang === 'ar' ? 'قيمة الباقة الأساسية:' : 'Base Plan Price:'}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {base.toLocaleString()} {currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {vat.toLocaleString()} {currency}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                          <span className="font-black text-sm text-slate-900">
                            {lang === 'ar' ? 'الإجمالي المستحق للدفع:' : 'Total Amount Due:'}
                          </span>
                          <span className="text-2xl font-black text-[#0F5A47] font-mono">
                            {total.toLocaleString()} {currency}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0F5A47] shrink-0" />
                      <span>ما الذي ستحصل عليه فور إتمام الدفع؟</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-700 space-y-0.5 ps-1">
                      <li>مفتاح تفعيل رسمي فوري لشركتك العقارية</li>
                      <li>فاتورة ضريبية إلكترونية قابلة للتحميل</li>
                      <li>تفعيل كامل الصلاحيات وإدراج شركتك في لوحة المشتركين</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#0F5A47] to-[#147a61] hover:from-[#0c4839] hover:to-[#0F5A47] text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>
                      {isProcessing
                        ? lang === 'ar'
                          ? 'جاري معالجة الطلب...'
                          : 'Processing Order...'
                        : lang === 'ar'
                        ? `إتمام الدفع وتفعيل الاشتراك الآن (${Math.round(getPlanPrice(selectedPlan) * 1.15).toLocaleString()} ${currency})`
                        : `Complete Payment & Activate Now (${Math.round(getPlanPrice(selectedPlan) * 1.15).toLocaleString()} ${currency})`}
                    </span>
                  </button>

                  <a
                    href={buildWhatsAppOrderUrl(selectedPlan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-emerald-400/50 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>
                      {lang === 'ar'
                        ? `تواصل مباشر مع واتساب المبيعات (${ownerSettings.whatsappDisplay})`
                        : `Direct WhatsApp Sales (${ownerSettings.whatsappDisplay})`}
                    </span>
                  </a>
                </div>
              </div>

            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT SUCCESS & LICENSE RECEIPT */}
        {step === 'success' && selectedPlan && (
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/60 flex flex-col items-center justify-center text-center">
            <div className="max-w-lg w-full bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#0F5A47] shadow-xl space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#0F5A47] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                  {generatedInvoiceRef} · ORDER REGISTERED
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {lang === 'ar'
                    ? `تم تسجيل طلب اشتراك "${companyName}" بنجاح!`
                    : `Subscription Order for "${companyName}" Registered!`}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {lang === 'ar'
                    ? 'تم إصدار رقم الترخيص والفاتورة الضريبية. اضغط على زر الواتساب بالأسفل لإرسال طلبك واستلام تأكيد الدفع الفوري من الإدارة.'
                    : 'Your license key and invoice are generated. Click the WhatsApp button below to finalize payment with our sales desk.'}
                </p>
              </div>

              {/* License Key Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="text-slate-400 text-[11px]">
                  {lang === 'ar' ? 'مفتاح الترخيص الرسمي الخاص بشركتك (License Key):' : 'Your Official License Key:'}
                </div>
                <div className="flex items-center justify-between bg-white/10 px-3.5 py-2.5 rounded-xl font-mono text-sm font-black text-amber-400">
                  <span>{generatedLicenseKey}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLicenseKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="text-xs text-white hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              {/* Summary Table & Official Bank Account */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-start">
                <div className="flex justify-between">
                  <span className="text-slate-500">الباقة المختارة:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.name_ar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المبلغ الإجمالي (شامل الضريبة):</span>
                  <span className="font-mono font-black text-[#0F5A47]">
                    {Math.round(getPlanPrice(selectedPlan) * 1.15).toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المسؤول ورقم التواصل:</span>
                  <span className="font-bold text-slate-900">{adminName} ({adminPhone})</span>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-[11px]">
                  <div className="font-sans font-bold text-slate-700">بيانات الحساب البنكي الرسمي للسداد ({ownerSettings.bankName}):</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IBAN:</span>
                    <span className="font-bold text-slate-900 select-all">{ownerSettings.ibanNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Code SWIFT:</span>
                    <span className="font-bold text-[#0F5A47] select-all">{ownerSettings.swiftCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RIB:</span>
                    <span className="font-bold text-slate-900 select-all">{ownerSettings.ribNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={buildWhatsAppOrderUrl(selectedPlan, generatedInvoiceRef, generatedLicenseKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {lang === 'ar'
                      ? `إرسال الفاتورة وإتمام السداد عبر واتساب الإدارة (${ownerSettings.whatsappDisplay}) 💬`
                      : `Send Order & Complete Payment via WhatsApp (${ownerSettings.whatsappDisplay}) 💬`}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full py-3 px-4 rounded-2xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  {lang === 'ar' ? 'العودة إلى لوحة التحكم 🚀' : 'Return to Dashboard 🚀'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
