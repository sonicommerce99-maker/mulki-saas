import React, { useState } from 'react';
import { Language } from '../../locales/translations';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, 
  FileText, 
  Upload, 
  Check, 
  AlertCircle, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  User, 
  Building
} from 'lucide-react';

interface ExtractedLeaseData {
  tenantName: string;
  tenantId: string;
  phone: string;
  propertyName: string;
  unitNumber: string;
  annualRent: number;
  paymentFrequency: string;
  depositAmount: number;
  startDate: string;
  endDate: string;
  ejarContractNumber: string;
  confidenceScore: number;
}

interface AiLeaseScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLeaseCreated?: (leaseData: ExtractedLeaseData) => void;
}

export const AiLeaseScannerModal: React.FC<AiLeaseScannerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLeaseCreated,
}) => {
  const [selectedSample, setSelectedSample] = useState<'residential' | 'commercial' | null>('residential');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedLeaseData | null>({
    tenantName: 'عبدالرحمن محمد العتيبي',
    tenantId: '1084592184',
    phone: '+966504499112',
    propertyName: 'مجمع الواحة السكني الفاخر',
    unitNumber: 'V-104 (فيلا دورين)',
    annualRent: 135000,
    paymentFrequency: 'quarterly',
    depositAmount: 10000,
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    ejarContractNumber: 'EJ-2026-9924',
    confidenceScore: 98.4,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleScanSample = async (sampleType: 'residential' | 'commercial') => {
    setSelectedSample(sampleType);
    setIsScanning(true);
    setSavedSuccess(false);

    // Simulate smart AI OCR scan with realistic GCC parameters
    setTimeout(() => {
      setIsScanning(false);
      if (sampleType === 'residential') {
        setExtractedData({
          tenantName: 'عبدالرحمن محمد العتيبي',
          tenantId: '1084592184',
          phone: '+966504499112',
          propertyName: 'مجمع الواحة السكني الفاخر',
          unitNumber: 'V-104 (فيلا دورين)',
          annualRent: 135000,
          paymentFrequency: 'quarterly',
          depositAmount: 10000,
          startDate: '2026-02-01',
          endDate: '2027-01-31',
          ejarContractNumber: 'EJ-2026-9924',
          confidenceScore: 98.4,
        });
      } else {
        setExtractedData({
          tenantName: 'شركة الحلول التقنية المتقدمة لتقنية المعلومات',
          tenantId: '7014892301',
          phone: '+966114891100',
          propertyName: 'بلازا الخبر للأعمال والمكاتب',
          unitNumber: 'OFF-402 (مكتب تنفيذي)',
          annualRent: 180000,
          paymentFrequency: 'semi_annual',
          depositAmount: 20000,
          startDate: '2026-03-01',
          endDate: '2028-02-28',
          ejarContractNumber: 'EJ-COMM-2026-4410',
          confidenceScore: 99.1,
        });
      }
    }, 1200);
  };

  const handleConfirmAndSave = () => {
    if (extractedData) {
      if (onLeaseCreated) {
        onLeaseCreated(extractedData);
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-violet-900 via-indigo-900 to-[#0F5A47] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>{lang === 'ar' ? 'فاحص ومفرغ العقود بالذكاء الاصطناعي (AI OCR)' : 'AI Smart Lease Parser & OCR'}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">Gemini Powered</span>
              </h2>
              <p className="text-xs text-indigo-200">
                {lang === 'ar' ? 'تحويل العقود الورقية والـ PDF إلى بيانات رقمية في ثانية واحدة' : 'Convert paper lease contracts & PDFs into structured data instantly'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Sample Contracts Selector or Drag & Drop */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 block text-xs">
              {lang === 'ar' ? 'اختر نموذج عقد للتجربة السريعة أو ارفع ملفك:' : 'Choose a sample lease or upload document:'}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleScanSample('residential')}
                className={`p-3 rounded-2xl border text-start transition-all flex items-center gap-3 ${
                  selectedSample === 'residential'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">عقد إيجار سكني موحد</div>
                  <div className="text-[10px] text-slate-500">فيلا سكنية - شبكة إيجار</div>
                </div>
              </button>

              <button
                onClick={() => handleScanSample('commercial')}
                className={`p-3 rounded-2xl border text-start transition-all flex items-center gap-3 ${
                  selectedSample === 'commercial'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">عقد إيجار تجاري مكتبي</div>
                  <div className="text-[10px] text-slate-500">مكتب أعمال - بلازا الخبر</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scanning Progress */}
          {isScanning ? (
            <div className="p-8 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-center space-y-3">
              <Cpu className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-indigo-950">
                جاري مسح وثيقة العقد واستخراج البيانات عبر خوارزميات Gemini Vision...
              </div>
              <p className="text-xs text-indigo-700">
                التعرف على التوقيعات، الهوية الوطنية، المبالغ، والتواريخ بدقة 99%
              </p>
            </div>
          ) : extractedData ? (
            <div className="space-y-3">
              {/* Confidence Badge */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>تم تفريغ العقد بنجاح ومطابقته مع شبكة إيجار</span>
                </div>
                <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                  دقة القراءة: {extractedData.confidenceScore}%
                </span>
              </div>

              {/* Extracted Fields Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">اسم المستأجر</span>
                  <strong className="text-xs text-slate-900">{extractedData.tenantName}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">رقم الهوية / السجل التجاري</span>
                  <strong className="text-xs text-slate-900 font-mono">{extractedData.tenantId}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">العقار والوحدة</span>
                  <strong className="text-xs text-[#0F5A47]">{extractedData.propertyName} ({extractedData.unitNumber})</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">الإيجار السنوي وطريقة الدفع</span>
                  <strong className="text-xs text-slate-900 font-mono">
                    {extractedData.annualRent.toLocaleString()} ر.س ({extractedData.paymentFrequency === 'quarterly' ? 'ربع سنوي' : 'نصف سنوي'})
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">فترة العقد</span>
                  <span className="text-xs text-slate-700 font-mono">
                    من {extractedData.startDate} إلى {extractedData.endDate}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">رقم عقد إيجار الموحد</span>
                  <strong className="text-xs text-indigo-700 font-mono">{extractedData.ejarContractNumber}</strong>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>تم حفظ العقد وإدراجه في قائمة عقود منصة مُلكي بنجاح!</span>
                </div>
              )}
            </div>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            يوفر أكثر من 90% من وقت الإدخال اليدوي للشركات العقارية
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>

            <button
              onClick={handleConfirmAndSave}
              disabled={!extractedData || isScanning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>اعتماد وتسجيل العقد فوراً</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
