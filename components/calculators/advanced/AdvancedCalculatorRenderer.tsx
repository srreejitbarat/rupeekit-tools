'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { Tool } from '@/lib/tools';
import SalaryInHandCalculatorV2 from './SalaryInHandCalculatorV2';
import GstCalculatorV2 from './GstCalculatorV2';
import IncomeTaxCalculatorV2 from './IncomeTaxCalculatorV2';
import PersonalLoanAprCalculator from './PersonalLoanAprCalculator';
import EighthPayCommissionCalculator from './EighthPayCommissionCalculator';
import EighthPayCommissionArrearsCalculator from './EighthPayCommissionArrearsCalculator';
import EighthPayCommissionPensionCalculator from './EighthPayCommissionPensionCalculator';
import GoldLoanCalculatorV2 from './GoldLoanCalculatorV2';
import PersonalLoanEligibilityCalculatorV2 from './PersonalLoanEligibilityCalculatorV2';
import SsyCalculatorV2 from './SsyCalculatorV2';
import LabourCodeTakeHomeCalculator from './LabourCodeTakeHomeCalculator';
import NewWageGratuityCalculator from './NewWageGratuityCalculator';
import RoomRentDeductionCalculator from './RoomRentDeductionCalculator';
import NotionalIncrementCalculator from './NotionalIncrementCalculator';
import PensionCommutationCalculator from './PensionCommutationCalculator';
import Rule9dEpfInterestCalculator from './Rule9dEpfInterestCalculator';
import InheritedPropertyGainsCalculator from './InheritedPropertyGainsCalculator';
import JobOfferComparisonCalculator from './JobOfferComparisonCalculator';
import { ADVANCED_CALCULATORS } from '@/lib/advanced-calculators';

const NoCostEmiCalculator = dynamic(() => import('@/components/micro-tools/NoCostEmiCalculator'));
const RemittanceCalculator = dynamic(() => import('@/components/micro-tools/RemittanceCalculator'));
const CarLeaseCalculator = dynamic(() => import('@/components/micro-tools/CarLeaseCalculator'));

export default function AdvancedCalculatorRenderer({ tool }: { tool: Tool }) {
  if (tool.slug === ADVANCED_CALCULATORS.NO_COST_EMI) return <NoCostEmiCalculator />;
  if (tool.slug === ADVANCED_CALCULATORS.REMITTANCE_FEES) return <RemittanceCalculator />;
  if (tool.slug === ADVANCED_CALCULATORS.CAR_LEASE_EXIT) return <CarLeaseCalculator />;
  if (tool.slug === ADVANCED_CALCULATORS.SALARY) {
    return <SalaryInHandCalculatorV2 tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.GST) {
    return <GstCalculatorV2 tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.INCOME_TAX) {
    return <IncomeTaxCalculatorV2 tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.PERSONAL_LOAN_APR) {
    return <PersonalLoanAprCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.EIGHTH_PAY_COMMISSION) {
    return <EighthPayCommissionCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.EIGHTH_PAY_COMMISSION_ARREARS) {
    return <EighthPayCommissionArrearsCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.EIGHTH_PAY_COMMISSION_PENSION) {
    return <EighthPayCommissionPensionCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.GOLD_LOAN) {
    return <GoldLoanCalculatorV2 tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.PERSONAL_LOAN_ELIGIBILITY) {
    return <PersonalLoanEligibilityCalculatorV2 tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.SSY) {
    return <SsyCalculatorV2 tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.LABOUR_CODE_TAKE_HOME) {
    return <LabourCodeTakeHomeCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.NEW_WAGE_GRATUITY) {
    return <NewWageGratuityCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.ROOM_RENT_DEDUCTION) {
    return <RoomRentDeductionCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.NOTIONAL_INCREMENT) {
    return <NotionalIncrementCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.PENSION_COMMUTATION) {
    return <PensionCommutationCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.RULE_9D_EPF_INTEREST) {
    return <Rule9dEpfInterestCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.INHERITED_PROPERTY_GAINS) {
    return <InheritedPropertyGainsCalculator tool={tool} />;
  }

  if (tool.slug === ADVANCED_CALCULATORS.JOB_OFFER_COMPARISON) {
    return <JobOfferComparisonCalculator tool={tool} />;
  }

  return null;
}
