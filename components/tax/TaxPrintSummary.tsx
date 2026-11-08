import React from 'react';
import { TaxInput, TaxResult } from '@/lib/tax/calculator';

interface TaxPrintSummaryProps {
  input: TaxInput;
  result: TaxResult | null;
  taxYear: string;
}

export function TaxPrintSummary({ input, result, taxYear }: TaxPrintSummaryProps) {
  if (!result) return null;

  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="tax-print-area hidden text-black bg-white">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-black">RupeeKit</h1>
        <h2 className="text-xl font-bold mt-1">Income Tax Calculator Result</h2>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Financial Year: {taxYear}</span>
          <span>Generated on: {generatedDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Input Summary */}
        <div>
          <h3 className="font-bold text-lg border-b border-gray-300 pb-1 mb-3">Input Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Gross Annual Income:</span>
              <span className="font-medium">₹{input.grossSalary.toLocaleString('en-IN')}</span>
            </div>
            {(input.hraExemption > 0) && (
              <div className="flex justify-between">
                <span>HRA Exemption:</span>
                <span className="font-medium">₹{input.hraExemption.toLocaleString('en-IN')}</span>
              </div>
            )}
            {(input.homeLoanInterest > 0) && (
              <div className="flex justify-between">
                <span>Home Loan Interest:</span>
                <span className="font-medium">₹{input.homeLoanInterest.toLocaleString('en-IN')}</span>
              </div>
            )}
            {(input.section80C > 0) && (
              <div className="flex justify-between">
                <span>Section 80C:</span>
                <span className="font-medium">₹{input.section80C.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Result Summary */}
        <div>
          <h3 className="font-bold text-lg border-b border-gray-300 pb-1 mb-3">Recommendation</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-bold text-base">
              <span>Recommended Regime:</span>
              <span className="uppercase">{result.recommendedRegime === 'Old' ? 'Old Regime' : result.recommendedRegime === 'New' ? 'New Regime' : 'Both Equal'}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Savings:</span>
              <span className="font-medium">₹{result.savingsAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Final Tax (Old Regime):</span>
              <span className="font-medium">₹{result.oldRegime.finalTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Final Tax (New Regime):</span>
              <span className="font-medium">₹{result.newRegime.finalTax.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <h3 className="font-bold text-lg border-b border-gray-300 pb-1 mb-3">Calculation Breakdown</h3>
      <table className="w-full text-sm text-left border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="p-2 font-bold">Component</th>
            <th className="p-2 font-bold text-right">Old Regime</th>
            <th className="p-2 font-bold text-right">New Regime</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-2">Total Deductions</td>
            <td className="p-2 text-right">₹{result.oldRegime.totalDeductions.toLocaleString('en-IN')}</td>
            <td className="p-2 text-right">₹{result.newRegime.totalDeductions.toLocaleString('en-IN')}</td>
          </tr>
          <tr className="border-b border-gray-200 font-medium">
            <td className="p-2">Taxable Income</td>
            <td className="p-2 text-right">₹{result.oldRegime.taxableIncome.toLocaleString('en-IN')}</td>
            <td className="p-2 text-right">₹{result.newRegime.taxableIncome.toLocaleString('en-IN')}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="p-2">Tax rebate</td>
            <td className="p-2 text-right">₹{result.oldRegime.rebate.toLocaleString('en-IN')}</td>
            <td className="p-2 text-right">₹{result.newRegime.rebate.toLocaleString('en-IN')}</td>
          </tr>
          {(result.oldRegime.surcharge > 0 || result.newRegime.surcharge > 0) && (
            <tr className="border-b border-gray-200">
              <td className="p-2">Surcharge after marginal relief</td>
              <td className="p-2 text-right">₹{result.oldRegime.surcharge.toLocaleString('en-IN')}</td>
              <td className="p-2 text-right">₹{result.newRegime.surcharge.toLocaleString('en-IN')}</td>
            </tr>
          )}
          <tr className="border-b border-gray-200">
            <td className="p-2">Health & Education Cess</td>
            <td className="p-2 text-right">₹{result.oldRegime.cess.toLocaleString('en-IN')}</td>
            <td className="p-2 text-right">₹{result.newRegime.cess.toLocaleString('en-IN')}</td>
          </tr>
          <tr className="border-b-2 border-black font-bold text-base">
            <td className="p-2">Final Tax Payable</td>
            <td className="p-2 text-right">₹{result.oldRegime.finalTax.toLocaleString('en-IN')}</td>
            <td className="p-2 text-right">₹{result.newRegime.finalTax.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer / Disclaimer */}
      <div className="text-xs text-gray-500 border-t border-gray-300 pt-4 mt-8">
        <p className="font-bold text-gray-700">Educational Estimate Only</p>
        <p>This is an educational estimate only. RupeeKit does not provide financial, tax, legal, or investment advice. Verify latest rules before acting.</p>
        <p className="mt-2">https://www.rupeekit.co.in/tools/income-tax-calculator-old-vs-new-regime-india</p>
      </div>
    </div>
  );
}
