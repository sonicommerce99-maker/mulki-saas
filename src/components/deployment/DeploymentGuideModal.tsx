import React, { useState } from 'react';
import { Language, translations } from '../../locales/translations';
import { getSupabaseConfigStatus, testSupabaseConnection } from '../../lib/supabaseClient';
import { supabaseSqlFullMigration } from '../../data/schemaDefinition';
import { 
  Rocket, 
  Copy, 
  Check, 
  ExternalLink, 
  Github, 
  Database, 
  Globe, 
  X, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'supabase' | 'github' | 'vercel' | 'branding'>('supabase');

  // Supabase test connection state
  const [testingConn, setTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    tablesFound: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentHost = window.location.origin;
  const sharedPreviewUrl = 'https://ais-pre-l44f7mvupnnfphawxnd5sp-292547141757.europe-west2.run.app';
  const supabaseStatus = getSupabaseConfigStatus();

  const gitCommands = `# 1. إعداد مستودع Git محلي
git init
git add .
git commit -m "feat: launch Mulki PropTech GCC SaaS platform"

# 2. الربط مع مستودع GitHub
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mulki-saas.git
git push -u origin main`;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlFullMigration);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    const res = await testSupabaseConnection();
    setTestingConn(false);
    setTestResult({
      tested: true,
      success: res.success,
      tablesFound: res.tablesFound,
      message: res.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F5A47] to-[#147a61] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Rocket className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <span>{lang === 'ar' ? 'دليل إطلاق منصة مُلكي (Mulki)' : 'Launch & Deploy Mulki PropTech'}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">GCC Ready</span>
              </h2>
              <p className="text-xs text-emerald-100">
                {lang === 'ar' ? 'رابط التطبيق المباشر + خطوات النشر على Supabase و GitHub و Vercel' : 'Live links & cloud deployment workflow'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-[#0F5A47] text-[#0F5A47]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase (مشروعك متصل)</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'links'
                ? 'border-[#0F5A47] text-[#0F5A47]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'رابط التطبيق الشغال' : 'Live App Links'}</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'branding'
                ? 'border-[#0F5A47] text-[#0F5A47]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'ar' ? 'الاسم الجديد (مُلكي)' : 'Brand Name (Mulki)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'border-[#0F5A47] text-[#0F5A47]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'border-[#0F5A47] text-[#0F5A47]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-indigo-600" />
            <span>Vercel</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          
          {/* TAB: Supabase Guide with Live Connected Credentials */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              
              {/* Status Header */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-extrabold text-emerald-950 text-sm">
                      {lang === 'ar' ? 'تم ربط مشروعك بنجاح في المنصة!' : 'Your Supabase Project is Connected!'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {supabaseStatus.projectId}
                  </span>
                </div>

                <div className="text-xs text-emerald-900 font-mono space-y-0.5 bg-white/70 p-2.5 rounded-xl border border-emerald-200">
                  <div className="truncate">URL: <strong>{supabaseStatus.url}</strong></div>
                  <div>Key: <span className="text-slate-500">sb_publishable_Z1S8Bk3b...WwcBaXxB (محمي ومُفعّل)</span></div>
                </div>

                {/* Connection Test Action */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConn}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] transition-all disabled:opacity-70 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConn ? 'animate-spin' : ''}`} />
                    <span>{testingConn ? (lang === 'ar' ? 'جاري الفحص...' : 'Testing...') : (lang === 'ar' ? 'فحص الاتصال الحي بسوبابيز' : 'Test Live Connection')}</span>
                  </button>

                  <a
                    href={`https://supabase.com/dashboard/project/${supabaseStatus.projectId}/sql/new`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-[#0F5A47] hover:underline"
                  >
                    <span>فتح SQL Editor لمشروعك</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    testResult.tablesFound
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {testResult.tablesFound ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Direct SQL Migration with Seed Data */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {lang === 'ar' ? 'كود الـ SQL لتعبئة الجداول بالبيانات (Seed Data):' : 'SQL Migration Script with Seed Data:'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'ar' ? 'انسخ هذا الكود والصقه في الـ SQL Editor لتعبئة قاعدة بياناتك فوراً' : 'Copy and run in your SQL Editor to populate all 7 tables'}
                    </p>
                  </div>

                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] transition-colors shrink-0"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'تم نسخ الـ SQL!' : 'نسخ كود SQL كامل'}</span>
                  </button>
                </div>

                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto">
                  <pre>{supabaseSqlFullMigration.slice(0, 500)}... (تم تجهيز 7 جداول + بيانات الإدخال)</pre>
                </div>
              </div>

            </div>
          )}

          {/* TAB: Live Links */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-900 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'ar' ? 'التطبيق شغال ومرتفع أونلاين دابا!' : 'Your application is live right now!'}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {lang === 'ar' 
                    ? 'يمكنك مشاركة هذا الرابط مع أي مستثمر أو عميل لمعاينة المنصة كاملة بدون أي تثبيت:'
                    : 'Share this live preview link with partners, clients, or investors:'}
                </p>
              </div>

              {/* Shared Link Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{lang === 'ar' ? 'رابط المعاينة المباشر (Public Shared Link):' : 'Public Production Preview:'}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">HTTPS Online</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 break-all select-all">
                  <span className="flex-1">{sharedPreviewUrl}</span>
                  <button
                    onClick={() => handleCopyLink(sharedPreviewUrl)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? t.linkCopied : t.copyLink}</span>
                  </button>
                </div>
              </div>

              {/* Current Session Link */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">
                  {lang === 'ar' ? 'رابط بيئة التطوير الحالية (Dev Environment):' : 'Current Dev Session:'}
                </span>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 break-all">
                  <span className="flex-1">{currentHost}</span>
                  <a
                    href={currentHost}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'فتح في نافذة جديدة' : 'Open Tab'}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Branding (Why Mulki) */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-base font-extrabold">{lang === 'ar' ? 'الاسم الجديد: "مُلكي" (Mulki)' : 'New Brand: "Mulki"'}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {lang === 'ar'
                    ? 'علاش اخترنا ليك "مُلكي" في بلاصة "عقار فلو"؟ لأنه اسم تجاري ذكي وكيضرب في الصميم ديال السوق الخليجي:'
                    : 'Why "Mulki" is 10x more attractive and memorable than "AqarFlow":'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">١. معنى فخم وسهل الحفظ</h4>
                  <p className="text-slate-600">
                    "مُلكي" من 4 حروف فقط. كتعني "الملك ديالي" (Ownership). كتعطي إحساس قوي بالسيطرة، الأمان والفخامة عند الملاك والمستثمرين.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">٢. على وزن يونيكورنز الخليج</h4>
                  <p className="text-slate-600">
                    بحال (جاهز، تمارا، سلة، مرسول، نون). اسم سلس وسريع في الحملات التسويقية وعلى السوشيال ميديا.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">٣. دومينات سهلة وقصيرة</h4>
                  <p className="text-slate-600">
                    يمكن حجز دومينات مميزة بحال: <strong className="font-mono text-[#0F5A47]">mulki.sa</strong> أو <strong className="font-mono text-[#0F5A47]">mulki.io</strong> أو <strong className="font-mono text-[#0F5A47]">mulki.app</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">٤. مقترحات بديلة متاحة</h4>
                  <p className="text-slate-600">
                    إذا بغيتي خيارات إضافية: <strong>صرح (Sarh)</strong>، <strong>دارك (Daark)</strong>، أو <strong>أملاك برو (AmlakPro)</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GitHub Push */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                {lang === 'ar' 
                  ? 'باش ترفع الكود ديالك على GitHub، نفّذ هاد الأوامر في التيرمينال (Terminal) ديال المشروع:'
                  : 'Run these commands in your local project terminal to push to GitHub:'}
              </p>

              <div className="relative bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{gitCommands}</pre>
                <button
                  onClick={handleCopyGit}
                  className="absolute top-3 end-3 flex items-center gap-1 px-2.5 py-1 rounded bg-[#0F5A47] hover:bg-[#0c4839] text-white text-[11px] font-bold shadow-xs"
                >
                  {copiedGit ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGit ? 'تم النسخ' : 'نسخ الأوامر'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: Vercel Deploy */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Rocket className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'ar' ? 'نشر الموقع في دقيقة واحدة عبر Vercel:' : '1-Minute Vercel Deployment:'}</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
                  <li>
                    {lang === 'ar' ? 'ادخل على ' : 'Go to '}
                    <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">vercel.com/new</a>
                    {lang === 'ar' ? ' واضغط على "Import" للمستودع ديالك في GitHub.' : ' and import your GitHub repository.'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'Vercel كيتعرف تلقائياً على ' : 'Vercel auto-detects '}
                    <strong className="text-slate-900 font-mono">Vite / React</strong>
                    {lang === 'ar' ? ' بدون أي تعديل في الإعدادات.' : ' with zero extra configuration.'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'في خانة ' : 'In the '}
                    <strong>Environment Variables</strong>
                    {lang === 'ar' ? ' أضف القيم الخاصة بك:' : ' section, add:'}
                    <div className="mt-1.5 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                      <div>VITE_SUPABASE_URL = {supabaseStatus.url}</div>
                      <div>VITE_SUPABASE_ANON_KEY = sb_publishable_Z1S8Bk3bJILfKF9fAe57FQ_WwcBaXxB</div>
                    </div>
                  </li>
                  <li>
                    {lang === 'ar' ? 'اضغط ' : 'Click '}
                    <strong className="text-emerald-700">Deploy</strong>
                    {lang === 'ar' ? '، ومبروك الموقع ديالك غادي يكون أونلاين برابط رسمي!' : ' and your platform will be live on custom domain!'}
                  </li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {lang === 'ar' ? 'منصة مُلكي (Mulki) · جاهزة للإطلاق التجاري' : 'Mulki SaaS · Turnkey GCC PropTech'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0F5A47] hover:bg-[#0c4839] rounded-xl shadow-xs transition-colors"
          >
            {lang === 'ar' ? 'حسناً، فهمت' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
