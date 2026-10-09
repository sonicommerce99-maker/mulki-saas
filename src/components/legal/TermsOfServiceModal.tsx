import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { ShieldCheck, FileText, Lock, CheckCircle2, X, Download, Printer, Globe } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [docLang, setDocLang] = useState<'ar' | 'fr' | 'en'>('ar');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-[#0F5A47] to-[#147a61] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                {docLang === 'ar' ? 'ميثاق وشروط الاستخدام وسياسة الخصوصية (Charte d\'Utilisation)' : docLang === 'fr' ? 'Charte d\'Utilisation & Conditions Générales (CGU)' : 'Terms of Service & Usage Charter'}
              </h2>
              <p className="text-xs text-emerald-200">
                {docLang === 'ar' ? 'المعايير القانونية والتنظيمية لمنصة مَحْفَظَتِي العَقَارِيَّة العقارية السحابية (SaaS)' : docLang === 'fr' ? 'Cadre légal et réglementaire de la plateforme cloud My Real Estate Portfolio' : 'Legal & regulatory governance for My Real Estate Portfolio Cloud Platform'}
              </p>
            </div>
          </div>

          {/* Language Switcher for Charter */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20 text-xs">
            <button
              onClick={() => setDocLang('ar')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${docLang === 'ar' ? 'bg-white text-slate-900 shadow-xs' : 'text-white hover:bg-white/10'}`}
            >
              عربي
            </button>
            <button
              onClick={() => setDocLang('fr')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${docLang === 'fr' ? 'bg-white text-slate-900 shadow-xs' : 'text-white hover:bg-white/10'}`}
            >
              Français
            </button>
            <button
              onClick={() => setDocLang('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${docLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-white hover:bg-white/10'}`}
            >
              English
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/70 hover:text-white ms-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
          
          {/* ARABIC CHARTER */}
          {docLang === 'ar' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>وثيقة معتمدة ومطابقة للأنظمة المعمول بها في المملكة العربية السعودية ودول مجلس التعاون الخليجي.</span>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">١. نطاق الخدمة وترخيص الاستخدام (SaaS License)</h3>
                <p>
                  تمنح منصة «مَحْفَظَتِي العَقَارِيَّة» للشركات والمؤسسات العقارية المشتركة ترخيصاً سحابياً غير حصري وقابلاً للتجديد لاستخدام النظام في إدارة العقارات، متابعة عقود الإيجار، تسجيل تذاكر الصيانة، وإصدار الفواتير الإلكترونية وسندات القبض وفق باقة الاشتراك المعتمدة.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">٢. حماية البيانات والسرية المصرفية (Data Protection & Privacy)</h3>
                <p>
                  يلتزم مزود الخدمة بأعلى معايير التشفير (AES-256) لكافة بيانات المستأجرين، العقود، والأرقام البنكية. لا يتم بيع أو مشاركة أي بيانات تخص عملاء المنشأة العقارية مع أي طرف ثالث لأي غرض تجاري.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">٣. إصدار الفواتير الضريبية وسندات القبض الإلكترونية (Tax Invoicing)</h3>
                <p>
                  توفر المنصة أدوات محاسبية لإصدار سندات القبض والفواتير الضريبية الإلكترونية المزودة برمز استجابة سريع (QR Code) وحساب ضريبة القيمة المضافة (15%) والختم الرقمي للمنشأة لتنظيم الحسابات الداخلية للمشترك.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">٤. اتفاقية مستوى الخدمة واستمرارية التشغيل (SLA 99.9%)</h3>
                <p>
                  يضمن المشغل استقرار عمل المنصة بنسبة لا تقل عن 99.9% على مدار العام مع عمل نسخ احتياطية دورية مشفرة لضمان استرجاع البيانات الفوري في حال حدوث أي طارئ.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">٥. سياسة السداد، التجديد، والتعليق (Payment & Suspension)</h3>
                <p>
                  تستحق رسوم الاشتراك الدورية (شهرية أو سنوية) في تاريخ الاستحقاق المحدد. يحق لإدارة المنصة تعليق الحساب مؤقتاً في حال تأخر السداد لمدة تتجاوز 7 أيام بعد إرسال الإشعارات التذكيرية التلقائية.
                </p>
              </section>
            </div>
          )}

          {/* FRENCH CHARTER (CHARTE D'UTILISATION) */}
          {docLang === 'fr' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-950 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Charte d'utilisation contractuelle conforme aux standards internationaux B2B SaaS.</span>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">1. Objet et Octroi de Licence SaaS</h3>
                <p>
                  La plateforme Mulki accorde au client un droit d'accès et d'utilisation non exclusif, personnel et temporaire à sa solution logicielle en mode Cloud (SaaS) pour la gestion locative, le suivi technique et la facturation immobilière.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">2. Sécurité et Confidentialité des Données (RGPD / Standards Golfe)</h3>
                <p>
                  Toutes les données relatives aux locataires, aux baux et aux transactions financières sont cryptées de bout en bout (AES-256). Mulki s'engage à ne jamais céder, louer ou commercialiser les données hébergées.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">3. Facturation Fiscale & Quittances Électroniques</h3>
                <p>
                  Les modules de facturation et de quittances électroniques génèrent des factures avec calcul automatique de la TVA (15%) et QR codes numériques pour le suivi comptable interne.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">4. Garantie de Disponibilité (SLA 99.9%)</h3>
                <p>
                  L'opérateur s'engage à maintenir une disponibilité opérationnelle de 99,9% annuelle, assortie de sauvegardes cloud redondantes quotidiennes.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">5. Modalités de Paiement et Suspension de Compte</h3>
                <p>
                  Les abonnements sont payables d'avance selon la périodicité convenue (mensuelle ou annuelle). En cas de non-paiement au-delà d'un préavis de 7 jours, l'accès à la plateforme peut être temporairement suspendu jusqu'à régularisation.
                </p>
              </section>
            </div>
          )}

          {/* ENGLISH CHARTER */}
          {docLang === 'en' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Enterprise SaaS Master Services Agreement & Terms of Service.</span>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">1. SaaS Subscription License</h3>
                <p>
                  Mulki grants the subscriber a non-exclusive, non-transferable cloud license to access and operate the property management platform across authorized portfolios.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">2. Data Privacy & Zero-Trust Security</h3>
                <p>
                  All tenant information, contracts, and banking details are encrypted with military-grade AES-256 protocols. Customer data will never be sold or disclosed to third parties.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">3. Electronic Tax Invoicing & Receipts</h3>
                <p>
                  Rent payment receipts and tax invoices include automated 15% VAT calculation, digital QR codes, and corporate stamps for internal accounting and tenant documentation.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">4. Service Level Agreement (99.9% Uptime)</h3>
                <p>
                  We guarantee 99.9% platform availability with daily automated multi-region backup failovers.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm text-[#0F5A47]">5. Billing, Renewal & Account Suspension</h3>
                <p>
                  Accounts must maintain active subscription standing. Delinquent accounts past 7 days grace period are automatically locked pending payment settlement.
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>تاريخ التحديث الأخير: أكتوبر 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{docLang === 'fr' ? 'Imprimer CGU' : docLang === 'en' ? 'Print' : 'طباعة الميثاق'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold transition-all shadow-xs"
            >
              {docLang === 'fr' ? 'J\'accepte les conditions' : docLang === 'en' ? 'Accept & Close' : 'موافق وإغلاق'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
