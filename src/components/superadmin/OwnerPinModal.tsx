import React, { useState } from 'react';
import { Lock, ShieldCheck, X, KeyRound } from 'lucide-react';
import { loadOwnerSettings } from '../../lib/ownerSettings';
import { Language } from '../../locales/translations';

interface OwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: Language;
}

export const OwnerPinModal: React.FC<OwnerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = loadOwnerSettings();
    const expectedPin = settings.ownerPin || '2026';

    if (pinInput.trim() === expectedPin) {
      setError('');
      setPinInput('');
      onSuccess();
    } else {
      setError(
        lang === 'ar'
          ? 'رمز الدخول السري غير صحيح. هذه اللوحة مخصصة لمالك منصة مَحْفَظَتِي العَقَارِيَّة فقط.'
          : 'Invalid Owner PIN. This console is restricted to the platform owner.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0F5A47] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {lang === 'ar' ? 'بوابة دخول مالك المنصة 👑' : 'Platform Owner Security Gate 👑'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'ar'
                  ? 'أدخل الرمز السري للمالك للدخول إلى إدارة المشتركين والمدفوعات'
                  : 'Enter Owner PIN to access subscriber & payment management'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {lang === 'ar' ? 'الرمز السري لمالك المنصة (Owner PIN):' : 'Owner Security PIN:'}
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#0F5A47] focus:outline-none text-center font-mono text-xl font-black tracking-widest text-slate-900"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-4" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#0F5A47] hover:bg-[#0c4839] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>{lang === 'ar' ? 'فتح لوحة تحكم المالك 👑' : 'Unlock Owner Console 👑'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
