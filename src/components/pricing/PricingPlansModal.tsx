import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { Currency } from '../../types';
import { 
  Check, 
  Sparkles, 
  Building2, 
  Crown, 
  Zap, 
  Gift, 
  MessageSquare, 
  FileCheck, 
  ShieldCheck, 
  Layers, 
  X, 
  PhoneCall,
  ArrowRight
} from 'lucide-react';

interface PricingPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  onClaimFreeTier: () => void;
}

export const PricingPlansModal: React.FC<PricingPlansModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  onClaimFreeTier,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      popular: false,
      badge_ar: 'عرض الإطلاق الحصري (متبقي 7 مقاعد)',
      badge_en: 'Exclusive Launch Offer (7 Slots Left)',
      name_ar: 'باقة الرواد المجانية',
      name_en: 'Early Adopter Free',
      description_ar: 'مثالية للشركات الناشئة والمكاتب العقارية الراغبة في تجربة قوة منصة مُلكي بدون أي تكلفة.',
      description_en: 'Ideal for emerging property managers testing the power of Mulki with zero financial commitment.',
      monthly_price: 0,
      annual_price: 0,
      units_limit_ar: 'حتى 50 وحدة عقارية',
      units_limit_en: 'Up to 50 property units',
      features_ar: [
        'إدارة العقارات والوحدات السكنية والتجارية',
        'متابعة عقود الإيجار واستحقاقات الدفعات',
        'لوحة القيادة والمؤشرات المالية الأساسية',
        'سندات قبض وفواتير متوافقة مع ZATCA',
        'تتبع تذاكر الصيانة الأساسية',
        'دعم فني عبر البريد الإلكتروني',
      ],
      features_en: [
        'Residential & commercial property management',
        'Lease tracking & rent schedule alerts',
        'Core executive dashboard & financial KPIs',
        'ZATCA certified e-invoicing receipts',
        'Basic maintenance ticket logging',
        'Email technical support',
      ],
      cta_ar: 'حجز المقعد المجاني الآن (0 ر.س)',
      cta_en: 'Claim Free Slot Now (0 SAR)',
      highlight: false,
    },
    {
      id: 'growth',
      popular: true,
      badge_ar: 'الأكثر طلباً واختياراً للشركات ⭐️',
      badge_en: 'Most Popular & Best Value ⭐️',
      name_ar: 'باقة النمو الاحترافي (Growth Pro)',
      name_en: 'Growth Professional',
      description_ar: 'الحل الشامل والمفضل للشركات العقارية التي تدير عمارات وأبراج ومجمعات متوسطة وتبحث عن أتمتة التحصيل.',
      description_en: 'Complete solution for property management firms seeking automated collections and visual spatial control.',
      monthly_price: 499,
      annual_price: 399, // billed annually (approx 4,790 / year)
      units_limit_ar: 'حتى 250 وحدة عقارية',
      units_limit_en: 'Up to 250 property units',
      features_ar: [
        'جميع مزايا الباقة المجانية بالكامل',
        'أتمتة الواتساب الشاملة (روابط سداد مدى و Apple Pay)',
        'المخطط المعماري البصري للأدوار (Floor Matrix)',
        'بوابة خاصة للمستثمرين الشركاء (VIP Investor Portal)',
        'تطبيق ميداني مخصص لفنيي الصيانة',
        'تصدير التقارير المالية والضريبية بنقرة واحدة (Excel / PDF)',
        'دعم فني مخصص وسريع عبر WhatsApp 24/7',
      ],
      features_en: [
        'Everything in Free Plan included',
        'Complete WhatsApp automation with Mada & Apple Pay checkout',
        'Architectural Floor Matrix visual overview',
        'Dedicated VIP Investor Portal with ROI statements',
        'Field technician dispatch interface',
        'One-click financial & tax export (Excel / PDF)',
        'Priority 24/7 dedicated WhatsApp support',
      ],
      cta_ar: 'بدء الاشتراك الاحترافي (تجربة 14 يوماً مجاناً)',
      cta_en: 'Start Professional Plan (14-Day Free Trial)',
      highlight: true,
    },
    {
      id: 'enterprise',
      popular: false,
      badge_ar: 'للمحافظ العقارية الكبرى',
      badge_en: 'For Enterprise Real Estate Portfolios',
      name_ar: 'باقة كبار الملاك والشركات (Enterprise)',
      name_en: 'Enterprise Corporate',
      description_ar: 'مصممة للشركات القابضة والمطورين والمحافظ الضخمة التي تحتاج تخصيصاً وربطاً متقدماً وفحصاً ذكياً.',
      description_en: 'Engineered for real estate holdings and developers requiring unlimited units and dedicated support.',
      monthly_price: 999,
      annual_price: 799,
      units_limit_ar: 'وحدات وعقارات غير محدودة (Unlimited)',
      units_limit_en: 'Unlimited properties and units',
      features_ar: [
        'جميع مزايا باقة النمو الاحترافي بلا حدود',
        'فحص عقود الإيجار بالذكاء الاصطناعي (AI Lease Scanner)',
        'تخصيص الهوية والشعار المؤسسي بالكامل (White Label)',
        'ربط برمجي مباشر (API & Webhooks) مع أنظمة المحاسبة',
        'تقارير تحليلية مخصصة للعائد الاستثماري لمجالس الإدارة',
        'مدير حساب تنفيذي مخصص ومباشر',
        'تدريب حضوري أو عن بعد لفريق العمل كاملاً',
      ],
      features_en: [
        'Everything in Growth Pro with unlimited scale',
        'AI Lease Scanner & automated data extraction',
        'Full corporate branding & White Label custom styling',
        'Direct API & Webhook integrations with ERPs',
        'Custom executive ROI analytics for board meetings',
        'Dedicated Senior Account Manager',
        'Comprehensive team onboarding & training',
      ],
      cta_ar: 'طلب اشتراك الشركات الكبرى',
      cta_en: 'Request Enterprise Access',
      highlight: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto w-full max-w-full">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-2 sm:my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0F5A47] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shrink-0">
              💎
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black">
                  {lang === 'ar' ? 'باقات الاشتراك وأسعار منصة مُلكي' : 'Mulki Subscription Plans & Pricing'}
                </h2>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  {lang === 'ar' ? 'عروض خاصة' : 'Special Rates'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                {lang === 'ar'
                  ? 'أسعار شفافة ومدروسة لجذب الملاك والشركات العقارية مع إمكانية البدء مجاناً 100%'
                  : 'Transparent, conversion-focused plans to attract property owners with zero upfront risk'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Monthly / Annual Toggle */}
            <div className="bg-white/10 p-1 rounded-2xl border border-white/20 flex items-center text-xs font-bold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  billingCycle === 'monthly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'دفع شهري' : 'Monthly'}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-[#0F5A47] text-white shadow-xs border border-emerald-400/40' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{lang === 'ar' ? 'سنوي (خصم 20%)' : 'Annual (Save 20%)'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-slate-50/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const price = billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                    plan.highlight
                      ? 'bg-white border-2 border-[#0F5A47] shadow-xl ring-4 ring-[#0F5A47]/10'
                      : 'bg-white border border-slate-200/90 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Top Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        plan.highlight
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black'
                          : plan.id === 'free'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'bg-slate-100 text-slate-700 font-bold'
                      }`}>
                        {lang === 'ar' ? plan.badge_ar : plan.badge_en}
                      </span>
                      {plan.id === 'free' && (
                        <Gift className="w-4 h-4 text-amber-500 animate-bounce" />
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-1">
                      {lang === 'ar' ? plan.name_ar : plan.name_en}
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal mb-4 min-h-[36px]">
                      {lang === 'ar' ? plan.description_ar : plan.description_en}
                    </p>

                    {/* Price Display */}
                    <div className="mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 font-mono">
                          {price.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {currency} / {billingCycle === 'annual' ? (lang === 'ar' ? 'شهر (تدفع سنوياً)' : 'mo (billed annually)') : (lang === 'ar' ? 'شهرياً' : 'month')}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-emerald-700 mt-1">
                        {lang === 'ar' ? plan.units_limit_ar : plan.units_limit_en}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-6 text-xs text-slate-700">
                      {(lang === 'ar' ? plan.features_ar : plan.features_en).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-[#0F5A47] font-bold' : 'text-emerald-600'}`} />
                          <span className="leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <button
                      onClick={() => {
                        if (plan.id === 'free') {
                          onClaimFreeTier();
                          onClose();
                        } else {
                          onClaimFreeTier();
                          onClose();
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                        plan.highlight
                          ? 'bg-[#0F5A47] hover:bg-[#0c4839] text-white shadow-md active:scale-98'
                          : plan.id === 'free'
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black active:scale-98'
                          : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                      }`}
                    >
                      <span>{lang === 'ar' ? plan.cta_ar : plan.cta_en}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Money Back & No Risk Guarantee */}
          <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                {lang === 'ar'
                  ? 'ضمان استرداد كامل للأموال خلال 30 يوماً بدون أي شروط مع دعم فني مستمر'
                  : '30-day no-questions-asked money-back guarantee with dedicated support'}
              </span>
            </div>
            <div className="flex items-center gap-3 font-bold text-slate-700">
              <span>💳 سداد إلكتروني آمن</span>
              <span>·</span>
              <span>🔒 تشفير بنكي 256-bit</span>
              <span>·</span>
              <span>📄 فواتير ضريبية رسمية</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
