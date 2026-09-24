export type TaxSlab = {
  min: number;
  max: number | null;
  rate: number;
};

export type TaxRegimeConfig = {
  slabs: TaxSlab[];
  standardDeduction: number;
  rebateLimit: number;
  maxRebate: number;
  basicExemption: number;
  marginalReliefOnRebate?: boolean;
};

export type TaxYearConfig = {
  fy: string;
  ay: string;
  oldRegime: TaxRegimeConfig;
  newRegime: TaxRegimeConfig;
  cessRate: number;
};

export const indiaIncomeTaxRules: Record<string, TaxYearConfig> = {
  '2023-24': {
    fy: '2023-24',
    ay: '2024-25',
    cessRate: 0.04,
    oldRegime: {
      slabs: [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 },
      ],
      standardDeduction: 50000,
      rebateLimit: 500000,
      maxRebate: 12500,
      basicExemption: 250000,
      marginalReliefOnRebate: false,
    },
    newRegime: {
      slabs: [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 600000, rate: 0.05 },
        { min: 600000, max: 900000, rate: 0.10 },
        { min: 900000, max: 1200000, rate: 0.15 },
        { min: 1200000, max: 1500000, rate: 0.20 },
        { min: 1500000, max: null, rate: 0.30 },
      ],
      standardDeduction: 50000,
      rebateLimit: 700000,
      maxRebate: 25000,
      basicExemption: 300000,
      marginalReliefOnRebate: true, // Sec 87A marginal relief exists in new regime
    },
  },
  '2024-25': {
    fy: '2024-25',
    ay: '2025-26',
    cessRate: 0.04,
    oldRegime: {
      slabs: [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 },
      ],
      standardDeduction: 50000,
      rebateLimit: 500000,
      maxRebate: 12500,
      basicExemption: 250000,
      marginalReliefOnRebate: false,
    },
    newRegime: {
      // Budget 2024 introduced new slabs for FY 24-25 New Regime
      slabs: [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 700000, rate: 0.05 },
        { min: 700000, max: 1000000, rate: 0.10 },
        { min: 1000000, max: 1200000, rate: 0.15 },
        { min: 1200000, max: 1500000, rate: 0.20 },
        { min: 1500000, max: null, rate: 0.30 },
      ],
      standardDeduction: 75000, // Budget 2024 increased to 75k for FY 24-25 New Regime
      rebateLimit: 700000,
      maxRebate: 25000,
      basicExemption: 300000,
      marginalReliefOnRebate: true,
    },
  },
  '2025-26': {
    fy: '2025-26',
    ay: '2026-27',
    cessRate: 0.04,
    oldRegime: {
      slabs: [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 },
      ],
      standardDeduction: 50000,
      rebateLimit: 500000,
      maxRebate: 12500,
      basicExemption: 250000,
      marginalReliefOnRebate: false,
    },
    newRegime: {
      // Budget 2025 (Finance Act, 2025) slabs for FY 2025-26 / AY 2026-27
      slabs: [
        { min: 0, max: 400000, rate: 0 },
        { min: 400000, max: 800000, rate: 0.05 },
        { min: 800000, max: 1200000, rate: 0.10 },
        { min: 1200000, max: 1600000, rate: 0.15 },
        { min: 1600000, max: 2000000, rate: 0.20 },
        { min: 2000000, max: 2400000, rate: 0.25 },
        { min: 2400000, max: null, rate: 0.30 },
      ],
      standardDeduction: 75000,
      rebateLimit: 1200000,
      maxRebate: 60000,
      basicExemption: 400000,
      marginalReliefOnRebate: true,
    },
  },
  '2026-27': {
    fy: '2026-27',
    ay: '2027-28',
    cessRate: 0.04,
    oldRegime: {
      slabs: [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 },
      ],
      standardDeduction: 50000,
      rebateLimit: 500000,
      maxRebate: 12500,
      basicExemption: 250000,
      marginalReliefOnRebate: false,
    },
    newRegime: {
      // Budget 2026 announced no change to the slabs, the Section 87A rebate or the
      // standard deduction, so the Finance Act 2025 structure carries into FY 2026-27.
      slabs: [
        { min: 0, max: 400000, rate: 0 },
        { min: 400000, max: 800000, rate: 0.05 },
        { min: 800000, max: 1200000, rate: 0.10 },
        { min: 1200000, max: 1600000, rate: 0.15 },
        { min: 1600000, max: 2000000, rate: 0.20 },
        { min: 2000000, max: 2400000, rate: 0.25 },
        { min: 2400000, max: null, rate: 0.30 },
      ],
      standardDeduction: 75000,
      rebateLimit: 1200000,
      maxRebate: 60000,
      basicExemption: 400000,
      marginalReliefOnRebate: true,
    },
  },
};

export const availableTaxYears = Object.keys(indiaIncomeTaxRules).sort((a, b) => b.localeCompare(a));
