export const filingDeadlines = [
  { label: 'Original return (non-audit)', date: '31 Jul 2026*', type: 'original' },
  { label: 'Belated return u/s 139(4)', date: '31 Dec 2026', type: 'belated' },
  { label: 'Revised return u/s 139(5)', date: '31 Dec 2026', type: 'revised' }
];

export const lateFees = [
  { income: 'Income up to ₹5L', fee: '₹1,000' },
  { income: 'Income above ₹5L', fee: '₹5,000' }
];

export const capitalGainsShift = [
  { label: 'STCG u/s 111A', before: 15, after: 20 },
  { label: 'LTCG listed u/s 112A', before: 10, after: 12.5 },
  { label: 'General LTCG rate', before: 20, after: 12.5 }
];

export const capitalGainsThreshold = {
  before: '₹1,00,000',
  after: '₹1,25,000'
};

export const taxSlabs = {
  oldRegime: [
    { range: 'Up to ₹2.5L', rate: 0 },
    { range: '₹2.5L–₹5L', rate: 5 },
    { range: '₹5L–₹10L', rate: 20 },
    { range: 'Above ₹10L', rate: 30 },
  ],
  newRegime: [
    { range: 'Up to ₹4L', rate: 0 },
    { range: '₹4L–₹8L', rate: 5 },
    { range: '₹8L–₹12L', rate: 10 },
    { range: '₹12L–₹16L', rate: 15 },
    { range: '₹16L–₹20L', rate: 20 },
    { range: '₹20L–₹24L', rate: 25 },
    { range: 'Above ₹24L', rate: 30 },
  ]
};

export const rebates = {
  newRegime: { amount: '₹60,000', limit: '₹12,00,000' },
  oldRegime: { amount: '₹12,500', limit: '₹5,00,000' }
};

export const triggerMatrix = [
  'Director in company',
  'Short-term capital gains',
  'LTCG u/s 112A above ₹1.25L',
  'Unlisted shares held',
  'Foreign assets/income/signing authority',
  'Total income above ₹50 lakh'
];
