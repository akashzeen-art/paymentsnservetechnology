export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', flag: '🇺🇸' },
  // Corridor markets
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', country: 'Algeria', flag: '🇩🇿' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', country: 'Egypt', flag: '🇪🇬' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco', flag: '🇲🇦' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan', flag: '🇵🇰' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', country: 'Cameroon', flag: '🇨🇲' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', country: 'Côte d’Ivoire', flag: '🇨🇮' },
];

/** Markets highlighted in Presence & Forex coverage (other FX on request). */
export const forexPresence = ['DZD', 'EGP', 'MAD', 'PKR', 'XAF', 'ETB', 'XOF'];

/** Fallback mid-market rates vs USD if open.er-api.com is unavailable. */
export const exchangeRates = {
  USD: 1,
  DZD: 134.5,
  EGP: 48.5,
  MAD: 9.95,
  PKR: 280.5,
  XAF: 605,
  ETB: 57.2,
  XOF: 605,
};

export const transferFees = { base: 0.00125, min: 2.5, max: 50 };
