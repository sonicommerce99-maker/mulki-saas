export interface LandlordAccountSettings {
  companyNameAr: string;
  companyNameEn: string;
  crNumber: string;
  vatNumber: string;
  cityAddress: string;
  bankName: string;
  ibanNumber: string;
  beneficiaryName: string;
  accountNotes: string;
  financialManagerName: string;
}

const STORAGE_KEY = 'portfolio_landlord_account_settings_v1';

export const defaultLandlordAccountSettings: LandlordAccountSettings = {
  companyNameAr: 'شركة إتقان العقارية لإدارة الأملاك ذ.م.م',
  companyNameEn: 'ITQAN REAL ESTATE & PROPERTY MANAGEMENT CO. L.L.C',
  crNumber: '1010789456',
  vatNumber: '310458923400003',
  cityAddress: 'الرياض · المملكة العربية السعودية',
  bankName: 'مصرف الراجحي (Al Rajhi Bank)',
  ibanNumber: 'SA44 8000 0000 6080 1016 7519',
  beneficiaryName: 'شركة إتقان العقارية لإدارة الأملاك ذ.م.م',
  accountNotes: 'يرجى كتابة رقم العقد أو الوحدة العقارية في بيان التحويل البنكي وإرسال الإيصال عبر واتساب.',
  financialManagerName: 'A. Al-Mansoor',
};

export function loadAccountSettings(): LandlordAccountSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultLandlordAccountSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultLandlordAccountSettings,
      ...parsed,
    };
  } catch {
    return defaultLandlordAccountSettings;
  }
}

export function saveAccountSettings(settings: LandlordAccountSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('account-settings-updated', { detail: settings }));
  } catch {
    // ignore storage errors
  }
}
