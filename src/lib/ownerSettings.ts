export interface OwnerPaymentSettings {
  whatsappNumber: string; // '212772878384'
  whatsappDisplay: string; // '+212 772-878384'
  ownerPin: string; // '2026'
  growthMonthlyPaymentUrl: string;
  growthAnnualPaymentUrl: string;
  lifetimePaymentUrl: string;
  enterprisePaymentUrl: string;
  bankName: string;
  ibanNumber: string;
  ribNumber: string;
  swiftCode: string;
  beneficiaryName: string;
  autoOpenWhatsAppOnOrder: boolean;
}

const STORAGE_KEY = 'portfolio_owner_payment_settings_v3';

export const defaultOwnerSettings: OwnerPaymentSettings = {
  whatsappNumber: '212772878384',
  whatsappDisplay: '+212 772-878384',
  ownerPin: '2026',
  growthMonthlyPaymentUrl: '',
  growthAnnualPaymentUrl: '',
  lifetimePaymentUrl: '',
  enterprisePaymentUrl: '',
  bankName: 'Banque Populaire (BCP) - Agence AL MAHAJ',
  ibanNumber: 'MA64 1818 1521 1110 3891 6800 1392',
  ribNumber: '181 815 2111103891680013 92',
  swiftCode: 'BCPOMAMC',
  beneficiaryName: 'منصة مَحْفَظَتِي العَقَارِيَّة (My Real Estate Portfolio)',
  autoOpenWhatsAppOnOrder: true,
};

export function loadOwnerSettings(): OwnerPaymentSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOwnerSettings;
    const parsed = JSON.parse(raw);
    const normalizedBeneficiary =
      typeof parsed.beneficiaryName === 'string' && parsed.beneficiaryName.trim()
        ? parsed.beneficiaryName
            .replace(/مُحْفَظَتِي العَقَارِيَّة/g, 'مَحْفَظَتِي العَقَارِيَّة')
            .replace(/مُحْفَظَتِي/g, 'مَحْفَظَتِي')
            .replace(/محفظتي العقارية/g, 'مَحْفَظَتِي العَقَارِيَّة')
        : defaultOwnerSettings.beneficiaryName;
    return {
      ...defaultOwnerSettings,
      ...parsed,
      whatsappNumber:
        parsed.whatsappNumber && parsed.whatsappNumber !== '966500000000'
          ? parsed.whatsappNumber.replace(/[^0-9]/g, '')
          : defaultOwnerSettings.whatsappNumber,
      ibanNumber: parsed.ibanNumber || defaultOwnerSettings.ibanNumber,
      ribNumber: parsed.ribNumber || defaultOwnerSettings.ribNumber,
      swiftCode: parsed.swiftCode || defaultOwnerSettings.swiftCode,
      beneficiaryName: normalizedBeneficiary,
    };
  } catch {
    return defaultOwnerSettings;
  }
}

export function saveOwnerSettings(settings: OwnerPaymentSettings): void {
  try {
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '') || '212772878384';
    const updated: OwnerPaymentSettings = {
      ...settings,
      whatsappNumber: cleanPhone,
      whatsappDisplay: settings.whatsappDisplay || `+${cleanPhone}`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}
