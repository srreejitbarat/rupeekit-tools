'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChallengeDay {
  day: number;
  title: string;
  task: string;
  category: 'Income & Budget' | 'Expenses' | 'Savings' | 'Debt' | 'Mindset' | 'Investing & Taxes';
  linkText?: string;
  linkHref?: string;
}

export default function BudgetChallenge() {
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});

  const challengeDays: ChallengeDay[] = [
    {
      day: 1,
      title: 'Identify Income Sources',
      task: 'List all net monthly income streams entering your bank account. Note down fixed salaries and estimate freelance/irregular earnings.',
      category: 'Income & Budget',
    },
    {
      day: 2,
      title: 'List Fixed Expenses',
      task: 'Document your predictable monthly costs like rent/mortgages, utilities, minimum loan obligations, and insurance premiums.',
      category: 'Expenses',
    },
    {
      day: 3,
      title: 'Identify Variable Expenses',
      task: 'List flexible costs like groceries, transit, dining out, and shopping. Look at recent statements to find your actual average.',
      category: 'Expenses',
    },
    {
      day: 4,
      title: 'Review Recurring Subscriptions',
      task: 'Identify 2-3 unnecessary or underutilized automated monthly costs. Mark them to pause or cancel.',
      category: 'Expenses',
    },
    {
      day: 5,
      title: 'Set a Weekly Variable Limit',
      task: 'Estimate a realistic weekly cap for variable spending. Having a weekly buffer makes tracking simpler than a monthly view.',
      category: 'Income & Budget',
    },
    {
      day: 6,
      title: 'Learn Budgeting Methods',
      task: 'Understand frameworks like the 50/30/20 budget rule to divide net income into needs, wants, and savings.',
      category: 'Income & Budget',
    },
    {
      day: 7,
      title: 'Choose Your Tracking Method',
      task: 'Explore spreadsheets, pen & paper notebooks, or dedicated privacy-focused tracking apps. Choose what you can stick to.',
      category: 'Mindset',
    },
    {
      day: 8,
      title: 'Log Last Week\'s Expenses',
      task: 'Spend 10 minutes entering your recent transactions into your tracking system of choice.',
      category: 'Expenses',
    },
    {
      day: 9,
      title: 'Audit Banking Fees',
      task: 'Review your statements for any recurring account maintenance fees, ATM charges, or interest costs.',
      category: 'Expenses',
    },
    {
      day: 10,
      title: 'Identify Spending Triggers',
      task: 'Understand the emotional or environmental cues (like late-night browsing or social outings) that prompt impulse buys.',
      category: 'Mindset',
    },
    {
      day: 11,
      title: 'Earmark a Savings Account',
      task: 'Explore setting up a separate bank account dedicated solely to future savings or specific milestones.',
      category: 'Savings',
    },
    {
      day: 12,
      title: 'Define a Short-Term Goal',
      task: 'Write down one realistic, specific milestone you want to save for over the next 6 months (e.g. holiday buffer, device replacement).',
      category: 'Mindset',
    },
    {
      day: 13,
      title: 'Calculate Emergency Cushion Target',
      task: 'Estimate your baseline monthly survival costs and multiply by 3 to 6 months to define your emergency fund goal.',
      category: 'Savings',
      linkText: 'Emergency Fund Guide',
      linkHref: '/blog/how-much-emergency-fund',
    },
    {
      day: 14,
      title: 'Review Outstanding Liabilities',
      task: 'List all debt interest rates and minimum monthly payments. Highlight high-interest debt that requires prioritization.',
      category: 'Debt',
    },
    {
      day: 15,
      title: 'Check Mid-Month Progress',
      task: 'Compare actual spending so far against your weekly caps and adjust for the remaining two weeks.',
      category: 'Expenses',
    },
    {
      day: 16,
      title: 'Explore Cooking at Home',
      task: 'Plan and prepare a meal from raw ingredients. Compare the cost of cooking at home to the price of ordering takeout.',
      category: 'Expenses',
    },
    {
      day: 17,
      title: 'List Free Local Activities',
      task: 'Discover low-cost or free recreational activities in your community, such as local parks, museums, or libraries.',
      category: 'Mindset',
    },
    {
      day: 18,
      title: 'Research Cash Parking Options',
      task: 'Learn common emergency fund options used in your country, such as savings accounts or other low-risk cash-equivalent options.',
      category: 'Savings',
    },
    {
      day: 19,
      title: 'Understand Credit Scores',
      task: 'Learn what a credit score is and check it only through a trusted provider available in your country.',
      category: 'Debt',
    },
    {
      day: 20,
      title: 'Automate a Small Savings Transfer',
      task: 'Schedule a tiny, automatic transfer to your goal account on payday. Paying yourself first removes decision fatigue.',
      category: 'Savings',
    },
    {
      day: 21,
      title: 'Review Utility Agreements',
      task: 'Check if you can switch mobile, internet, or energy service providers for better rates or downgrade unnecessary data packages.',
      category: 'Expenses',
    },
    {
      day: 22,
      title: 'Calculate Debt-to-Income Ratio',
      task: 'Measure your total monthly debt payments against your net monthly income. An ideal ratio is typically under 36%.',
      category: 'Debt',
      linkText: 'Explore Loan Payment Calculator',
      linkHref: '/tools/emi-calculator-india',
    },
    {
      day: 23,
      title: 'Study Saving vs Investing',
      task: 'Understand how saving protects capital while investing builds long-term purchasing power to beat inflation.',
      category: 'Investing & Taxes',
    },
    {
      day: 24,
      title: 'Estimate Net Income Flow',
      task: 'Review your payroll deductions (taxes, pensions) to understand how gross salary matches your take-home pay.',
      category: 'Income & Budget',
    },
    {
      day: 25,
      title: 'Practice a No-Spend Day',
      task: 'Try a 24-hour block without spending on non-essential items like snacks, coffees, or online shopping.',
      category: 'Mindset',
    },
    {
      day: 26,
      title: 'Practice Smart Grocery Planning',
      task: 'Create a strict shopping list before visiting the store to avoid impulse buys and reduce food waste.',
      category: 'Expenses',
    },
    {
      day: 27,
      title: 'Explore Compounding Interest',
      task: 'Calculate potential growth from regular contributions over time. Small savings, when compounded, grow significantly.',
      category: 'Investing & Taxes',
      linkText: 'Open Savings Compound Calculator',
      linkHref: '/tools/sip-calculator-india',
    },
    {
      day: 28,
      title: 'Plan Next Month\'s Margin',
      task: 'Set aside a small margin in your upcoming budget for unexpected minor costs that usually trigger overspending.',
      category: 'Income & Budget',
    },
    {
      day: 29,
      title: 'Explore Local Tax Allowances',
      task: 'Review whether any common deductions, allowances, or tax-saving rules apply in your country, and consult official sources if needed.',
      category: 'Investing & Taxes',
    },
    {
      day: 30,
      title: 'Reflect and Draft Next Month\'s Plan',
      task: 'Reflect on your spending patterns from the past 30 days. Draft a realistic, structured monthly budget based on actual data.',
      category: 'Income & Budget',
    },
  ];

  // Retrieve progress from localStorage after hydration; the server renders
  // the full board with no days completed so crawlers see every task.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rupeekit_budget_challenge');
      if (saved) {
        setCompletedDays(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
  }, []);

  const toggleDay = (day: number) => {
    const nextCompleted = {
      ...completedDays,
      [day]: !completedDays[day],
    };
    setCompletedDays(nextCompleted);
    try {
      localStorage.setItem('rupeekit_budget_challenge', JSON.stringify(nextCompleted));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to reset your challenge progress? This cannot be undone.')) {
      setCompletedDays({});
      try {
        localStorage.removeItem('rupeekit_budget_challenge');
      } catch (e) {
        console.error('Failed to clear localStorage', e);
      }
    }
  };

  const getCompletedCount = () => {
    return Object.values(completedDays).filter((val) => val === true).length;
  };

  const getPercentage = () => {
    return Math.round((getCompletedCount() / challengeDays.length) * 100);
  };

  const completedCount = getCompletedCount();
  const percentage = getPercentage();

  return (
    <div className="space-y-8">
      {/* Dashboard Card */}
      <div className="rounded-3xl border border-brandBorder bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-brandDeepNavy">Your Progress Board</h2>
            <p className="mt-2 text-sm text-brandMuted max-w-md">
              Take it one bite-sized action at a time. Each day offers a simple habit shift to build financial discipline.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-brandNavy">{percentage}%</span>
              <span className="text-xs text-brandMuted font-medium">
                {completedCount} of {challengeDays.length} Tasks
              </span>
            </div>
            <div className="relative h-16 w-16 flex items-center justify-center rounded-full border-4 border-slate-100 bg-brandBgSoft">
              <div
                className="absolute inset-0 rounded-full border-4 border-brandGrowthGreen transition-all duration-300"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${
                    percentage >= 25 ? '100% 0%,' : ''
                  } ${percentage >= 50 ? '100% 100%,' : ''} ${
                    percentage >= 75 ? '0% 100%,' : ''
                  } ${percentage >= 100 ? '0% 0%,' : ''} 50% 0%)`,
                  transform: 'rotate(-45deg)',
                }}
              />
              <span className="text-[10px] font-bold text-brandGrowthGreen">Progress</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Alternative for Mobile */}
        <div className="mt-6 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-brandGrowthGreen transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {percentage === 100 && (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-brandGrowthGreen/20 p-4 text-center">
            <p className="text-sm font-bold text-brandGrowthGreen">
              🎉 Congratulations! You completed all 30 days of the Budget Challenge!
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={clearAll}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition"
          >
            Reset Progress
          </button>
        </div>
      </div>

      {/* Grid of Days */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challengeDays.map((item) => {
          const isDone = !!completedDays[item.day];
          return (
            <div
              key={item.day}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
                isDone
                  ? 'border-brandGrowthGreen/35 bg-emerald-50/20 shadow-sm'
                  : 'border-brandBorder bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDone
                        ? 'bg-brandGrowthGreen/10 text-brandGrowthGreen'
                        : 'bg-brandNavy/10 text-brandNavy'
                    }`}
                  >
                    Day {item.day}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    {item.category}
                  </span>
                </div>
                <h4 className="mt-3 text-base font-bold tracking-tight text-brandDeepNavy">
                  {item.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-brandMuted">
                  {item.task}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-3">
                {item.linkText && item.linkHref && (
                  <Link
                    href={item.linkHref}
                    className="text-[11px] font-bold text-brandNavy hover:text-brandDeepNavy flex items-center gap-0.5"
                  >
                    {item.linkText} <span className="text-brandMuted">→</span>
                  </Link>
                )}
                <button
                  onClick={() => toggleDay(item.day)}
                  className={`w-full rounded-full py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isDone
                      ? 'bg-brandGrowthGreen text-white'
                      : 'bg-brandBgSoft text-brandText hover:bg-slate-200'
                  }`}
                >
                  {isDone ? (
                    <>
                      <span>✓ Completed</span>
                    </>
                  ) : (
                    <span>Mark Complete</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* General Disclaimer */}
      <div className="rounded-2xl border border-brandBorder bg-brandBgSoft p-5 text-center">
        <p className="text-xs leading-relaxed text-brandMuted">
          <span className="font-bold text-brandDeepNavy block mb-1">Educational Disclaimer</span>
          This challenge is for educational goal-setting only and does not constitute financial, tax, legal, or investment advice.
        </p>
      </div>
    </div>
  );
}
