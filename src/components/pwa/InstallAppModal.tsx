import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { usePWAInstall } from './usePWAInstall';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  X, 
  Zap, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  
  // Set default active tab based on detected device
  const defaultTab = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
  const [activeTab, setActiveTab] = useState<'desktop' | 'ios' | 'android'>(defaultTab);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-[#0F5A47] to-[#147a61] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-[#0F5A47]">
              <img
                src="/app-logo.jpg"
                alt="Mulki App Icon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono">
                  PWA APP
                </span>
                <span className="text-xs text-emerald-200">تثبيت بدون متجر (Zero Store Download)</span>
              </div>
              <h2 className="text-base sm:text-lg font-black">
                {lang === 'ar' ? 'تثبيت منصة مُلكي كتطبيق أصلي' : 'Install Mulki as a Native App'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Icon Mobile Preview Badge */}
        <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-600/30 shrink-0 bg-[#0F5A47]">
            <img
              src="/app-logo.jpg"
              alt="Mulki"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-900">مُلكي | Mulki PropTech</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                أيقونة الشاشة الرئيسية
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              الشعار الفاخر ثلاثي الأبعاد سيظهر فوراً كأيقونة تطبيق حقيقية على شاشة هاتفك
            </p>
          </div>
        </div>

        {/* Device Switcher Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-[#0F5A47]" />
            <span>كمبيوتر / PC & Mac</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-800" />
            <span>آيفون / iPhone & iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>أندرويد / Android</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Quick Native Install Button if browser supports 1-click */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-black text-sm">متصفحك يدعم التثبيت الفوري بنقرة واحدة!</h4>
                  <p className="text-[11px] text-emerald-800">
                    اضغط الزر لتنزيل الأيقونة مباشرة على سطح المكتب أو شاشة الهاتف
                  </p>
                </div>
              </div>

              <button
                onClick={handleNativeInstall}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 shrink-0"
              >
                تثبيت فوري الآن ⬇️
              </button>
            </div>
          )}

          {/* TAB 1: DESKTOP (PC & MAC) */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    من خلال شريط العنوان في المتصفح (Chrome / Edge / Brave):
                  </h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    ستجد أيقونة تثبيت صغيرة <strong className="text-[#0F5A47] font-mono">⊕</strong> في أقصى يمين أو يسار شريط الروابط العلوي بجانب زر النجمة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    أو من خلال قائمة المتصفح الثلاث نقاط (⋮):
                  </h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    اضغط على <strong className="text-slate-900">المزيد من الأدوات (More Tools)</strong> ثم اختر <strong className="text-[#0F5A47]">"إنشاء اختصار (Create Shortcut)"</strong> أو <strong className="text-[#0F5A47]">"تثبيت مُلكي (Install Mulki)"</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  سيعمل التطبيق كنافذة مستقلة وسريعة على جهازك مثل برامج Windows و macOS الرسمية بدون شريط المتصفح!
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: IPHONE & IPAD (IOS SAFARI) */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 text-indigo-950 font-bold text-xs flex items-center gap-2">
                <Apple className="w-4 h-4 text-indigo-700" />
                <span>طريقة التثبيت على أجهزة iPhone و iPad في 10 ثوانٍ عبر Safari:</span>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>اضغط على زر المشاركة (Share) في متصفح Safari:</span>
                    <Share className="w-4 h-4 text-blue-600 inline" />
                  </h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    ستجد أيقونة المشاركة في شريط الأدوات السفلي لمتصفح سفاري (المربع الذي يخرج منه سهم للأعلى ⎋).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>اختر "إضافة إلى الشاشة الرئيسية":</span>
                    <PlusSquare className="w-4 h-4 text-emerald-600 inline" />
                  </h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    اسحب القائمة للأعلى قليلاً واضغط على خيار <strong className="text-[#0F5A47]">"Add to Home Screen (إضافة إلى الشاشة الرئيسية)"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    اضغط على "إضافة (Add)" في أعلى اليمين
                  </h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    ستظهر أيقونة تطبيق "مُلكي" الفاخرة على شاشة الآيفون وتفتح كتطبيق كامل بدون متصفح!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    من خلال خيارات متصفح Google Chrome:
                  </h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    اضغط على أيقونة الثلاث نقاط الرأسية (⋮) في أعلى زاوية المتصفح.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية":
                  </h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    اضغط على خيار <strong className="text-[#0F5A47]">"تثبيت التطبيق (Install App)"</strong> وسيتم تنزيله فوراً كأي تطبيق أندرويد عادي!
                  </p>
                </div>
              </div>

              {/* In-App Browser (WhatsApp / Messenger) Tip */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <span className="font-bold shrink-0">💡 ملاحظة هامة:</span>
                <span>
                  إذا كنت تفتح الرابط من داخل <strong>WhatsApp</strong> أو تطبيق تواصل، اضغط أولاً على <strong>"Ouvrir dans le navigateur" (فتح في المتصفح)</strong> من قائمة الثلاث نقاط، ثم اضغط على "تثبيت التطبيق".
                </span>
              </div>
            </div>
          )}

          {/* Success message */}
          {installSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>تم بدء تثبيت التطبيق بنجاح على جهازك!</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            تطبيق PWA خفيف، فائق السرعة، ولا يستهلك مساحة التخزين
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-bold transition-all shadow-xs"
          >
            حسناً، فهمت
          </button>
        </div>

      </div>
    </div>
  );
};
