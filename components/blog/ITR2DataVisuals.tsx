'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  filingDeadlines,
  lateFees,
  capitalGainsShift,
  capitalGainsThreshold,
  taxSlabs,
  rebates,
  triggerMatrix
} from '@/data/itr2-ay-2026-27-chart-data';

// Helper hook for intersection observer to trigger subtle animations
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    if (mediaQuery.matches) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView, reduceMotion };
}

// A) Filing Deadline Timeline
export function FilingDeadlineTimeline() {
  return (
    <div className="my-8 rounded-2xl border border-brandBorder bg-slate-50 p-6 shadow-sm" aria-label="ITR-2 Filing Deadline Timeline">
      <h3 className="text-lg font-bold text-brandDeepNavy mb-6">Key Deadlines & Late Fees</h3>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
        {filingDeadlines.map((deadline, idx) => (
          <div key={idx} className="flex-1 border-l-4 border-brandGrowthGreen pl-4">
            <p className="text-sm text-slate-500 font-medium">{deadline.label}</p>
            <p className="text-xl font-black text-brandNavy mt-1">{deadline.date}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        {lateFees.map((fee, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border border-brandBorder/60 flex-1">
            <p className="text-xs text-slate-500">Late fee u/s 234F</p>
            <p className="text-sm font-semibold text-brandDeepNavy">{fee.income}: <span className="text-red-600">{fee.fee}</span></p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Deadlines are subject to official CBDT extension notifications. Source: Income Tax Department / Finance (No.2) Act 2024 / PIB
      </p>
    </div>
  );
}

// B) Capital Gains Rate Shift
export function CapitalGainsRateShift() {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} className="my-8 rounded-2xl border border-brandBorder bg-white p-6 shadow-sm" aria-label="Capital Gains Rate Shift Comparison">
      <h3 className="text-lg font-bold text-brandDeepNavy mb-6">Capital Gains Rate Shift (Finance No.2 Act 2024)</h3>
      
      <div className="flex flex-col gap-6">
        {capitalGainsShift.map((item, idx) => {
          const maxRate = Math.max(item.before, item.after, 30); // scale up to 30% for width calculation
          const beforeWidth = (item.before / maxRate) * 100;
          const afterWidth = (item.after / maxRate) * 100;
          
          return (
            <div key={idx} className="group">
              <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>{item.label}</span>
                <span>{item.before}% → <span className={item.after > item.before ? 'text-red-600 font-bold' : 'text-brandGrowthGreen font-bold'}>{item.after}%</span></span>
              </div>
              <div className="relative h-12 w-full bg-slate-50 rounded-lg flex flex-col justify-center gap-1 overflow-hidden border border-slate-100 p-1">
                {/* Before Bar */}
                <div 
                  className="h-4 bg-slate-300 rounded-sm transition-all duration-1000 ease-out motion-reduce:transition-none motion-reduce:duration-0 flex items-center px-2 text-[10px] font-bold text-slate-700"
                  style={{ width: isInView ? `${beforeWidth}%` : '0%' }}
                  title={`Before 23 Jul 2024: ${item.before}%`}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Before: {item.before}%</span>
                </div>
                {/* After Bar */}
                <div 
                  className={`h-4 rounded-sm transition-all duration-1000 ease-out delay-300 motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:delay-0 flex items-center px-2 text-[10px] font-bold text-white ${item.after > item.before ? 'bg-red-500' : 'bg-brandGrowthGreen'}`}
                  style={{ width: isInView ? `${afterWidth}%` : '0%' }}
                  title={`On/After 23 Jul 2024: ${item.after}%`}
                >
                   <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">After: {item.after}%</span>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="mt-2 bg-brandBgSoft p-4 rounded-xl border border-brandBorder flex justify-between items-center transition-colors hover:border-brandNavy/30">
          <p className="text-sm text-slate-700 font-medium">LTCG Exemption Threshold (u/s 112A)</p>
          <div className="text-right">
             <p className="text-xs text-slate-400 line-through">{capitalGainsThreshold.before}</p>
             <p className="text-base font-bold text-brandGrowthGreen">{capitalGainsThreshold.after}</p>
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-xs text-slate-400">
        Source: Income Tax Department / Finance (No.2) Act 2024 / PIB
      </p>
    </div>
  );
}

// C) Old vs New Regime Slab Snapshot
export function OldVsNewRegimeSlabSnapshot() {
  return (
    <div className="my-8 rounded-2xl border border-brandBorder bg-white shadow-sm overflow-hidden" aria-label="Old vs New Tax Regime Slabs">
      <div className="bg-slate-50 p-6 border-b border-brandBorder">
        <h3 className="text-lg font-bold text-brandDeepNavy">Tax Slab Comparison (Resident Individual &lt; 60 years)</h3>
      </div>
      
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brandBorder">
        <div className="p-6">
          <h4 className="text-base font-bold text-brandNavy mb-4">Old Tax Regime</h4>
          <div className="flex flex-col gap-3">
             {taxSlabs.oldRegime.map((slab, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                  <span className="text-sm text-slate-600">{slab.range}</span>
                  <span className="text-sm font-bold text-slate-800">{slab.rate}%</span>
                </div>
             ))}
          </div>
        </div>
        
        <div className="p-6">
          <h4 className="text-base font-bold text-brandGrowthGreen mb-4">New Tax Regime</h4>
          <div className="flex flex-col gap-3">
             {taxSlabs.newRegime.map((slab, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-colors">
                  <span className="text-sm text-slate-700">{slab.range}</span>
                  <span className="text-sm font-bold text-brandGrowthGreen">{slab.rate}%</span>
                </div>
             ))}
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6 pt-2">
        <p className="text-xs text-slate-400">
          Source: Income Tax Department / Finance (No.2) Act 2024 / PIB
        </p>
      </div>
    </div>
  );
}

// D) Rebate u/s 87A Comparison
export function RebateComparison() {
  return (
    <div className="mb-8 rounded-2xl border border-brandBorder bg-slate-50 p-6 shadow-sm" aria-label="Tax Rebate Comparison under Section 87A">
      <h3 className="text-base font-bold text-brandDeepNavy mb-4">Maximum Tax Rebate (u/s 87A)</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-xl border border-brandGrowthGreen/30 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1 h-full bg-brandGrowthGreen"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-brandGrowthGreen mb-1">New Regime</p>
          <p className="text-2xl font-black text-slate-800">{rebates.newRegime.amount}</p>
          <p className="text-xs text-slate-500 mt-1">If taxable income &le; {rebates.newRegime.limit}</p>
        </div>
        
        <div className="flex-1 bg-white p-4 rounded-xl border border-brandBorder shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Old Regime</p>
          <p className="text-2xl font-black text-slate-800">{rebates.oldRegime.amount}</p>
          <p className="text-xs text-slate-500 mt-1">If taxable income &le; {rebates.oldRegime.limit}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Source: Income Tax Department / Finance (No.2) Act 2024 / PIB
      </p>
    </div>
  );
}

// E) ITR-2 Trigger Matrix
export function ITR2TriggerMatrix() {
  const { ref, isInView, reduceMotion } = useInView();

  return (
    <div ref={ref} className="my-8 rounded-2xl border border-brandBorder bg-white p-6 shadow-sm" aria-label="ITR-2 Trigger Matrix Checklist">
      <h3 className="text-lg font-bold text-brandDeepNavy mb-4">When do you need ITR-2?</h3>
      <p className="text-sm text-slate-600 mb-6">For individuals and HUFs without business or professional income, these circumstances can require ITR-2. An otherwise eligible ITR-1 filer can report Section 112A long-term gains up to ₹1.25 lakh and income from two house properties for AY 2026-27. Check all form exclusions before deciding; business or professional income requires a different form.</p>
      
      <div className="grid sm:grid-cols-2 gap-3">
        {triggerMatrix.map((trigger, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-brandBgSoft hover:border-brandGrowthGreen/30 transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:duration-0 opacity-0 translate-y-2"
            style={{ 
              opacity: isInView ? 1 : 0, 
              transform: isInView ? 'translateY(0)' : 'translateY(8px)',
              transitionDelay: reduceMotion ? '0ms' : `${idx * 100}ms` 
            }}
          >
            <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brandGrowthGreen/20 flex items-center justify-center text-brandGrowthGreen">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">{trigger}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-slate-400">
        <a href="https://www.incometax.gov.in/iec/foportal/downloads" target="_blank" rel="noopener noreferrer" className="underline hover:text-brandNavy">
          Source: Income Tax Department — AY 2026-27 ITR-1 and ITR-2 eligibility
        </a>
      </p>
    </div>
  );
}
