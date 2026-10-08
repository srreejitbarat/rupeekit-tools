'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PersonalFinanceRoadmap from './PersonalFinanceRoadmap';
import { moneyHealthQuestions } from '@/data/money-health-check';

export default function MoneyHealthCheckQuiz() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  const questions = moneyHealthQuestions;

  const handleAnswer = (val: boolean) => {
    const newAnswers = { ...answers, [questions[currentIdx].id]: val };
    setAnswers(newAnswers);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentIdx(0);
    setShowResults(false);
    setCopied(false);
  };

  const calculateScore = () => {
    const yesCount = Object.values(answers).filter((val) => val === true).length;
    return Math.round((yesCount / questions.length) * 100);
  };

  const getResultsDetails = (score: number) => {
    if (score < 40) {
      return {
        category: 'Getting Started',
        colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
        message: 'You are at the beginning of your financial journey. Establishing basic habits like tracking monthly spending and laying out a simple budget will help build your confidence.',
        roadmapStage: 1,
        actions: [
          { text: 'Start: The 30-Day Budget Challenge', href: '/resources/30-day-budget-challenge' },
        ],
      };
    } else if (score < 60) {
      return {
        category: 'Building Awareness',
        colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
        message: 'You understand the basics but are still building a consistent routine. Focusing on saving automatically and building a dedicated emergency buffer will strengthen your progress.',
        roadmapStage: 3,
        actions: [
          { text: 'Explore: How Much Emergency Fund You Need', href: '/blog/how-much-emergency-fund' },
          { text: 'Start: The 30-Day Budget Challenge', href: '/resources/30-day-budget-challenge' },
        ],
      };
    } else if (score < 80) {
      return {
        category: 'On Track',
        colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        message: 'You have solid money habits. Optimizing your current liabilities, clearing high-interest debt, and mapping out long-term saving vs investing goals is your next step.',
        roadmapStage: 5,
        actions: [
          { text: 'Estimate: Interactive Loan Calculator', href: '/tools/emi-calculator-india' },
        ],
      };
    } else {
      return {
        category: 'Strong Foundation',
        colorClass: 'text-brandGrowthGreen bg-emerald-50 border-emerald-200',
        message: 'Fantastic! You have constructed a highly disciplined financial framework. Keep reviewing your progress monthly, adjust your investments, and build compounding wealth.',
        roadmapStage: 6,
        actions: [
          { text: 'Explore: How Much Emergency Fund You Need', href: '/blog/how-much-emergency-fund' },
        ],
      };
    }
  };

  const handleShare = () => {
    const score = calculateScore();
    const details = getResultsDetails(score);
    const text = `I just checked my Money Health Score on RupeeKit and scored ${score}/100 (${details.category})! Take this 60-second interactive self-reflection quiz to understand your money score: ${window.location.origin}/money-health-check`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (showResults) {
    const score = calculateScore();
    const details = getResultsDetails(score);

    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="rounded-3xl border border-brandBorder bg-white p-8 shadow-sm text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brandMuted">
            Your Money Health Assessment
          </span>
          <h2 className="mt-4 text-3xl font-black text-brandDeepNavy">Your Results</h2>

          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-brandBgSoft border-4 border-slate-100 shadow-inner">
              <span className="text-4xl font-black text-brandNavy">{score}</span>
              <span className="absolute bottom-4 text-xs font-bold text-brandMuted">/100</span>
            </div>
            <span className={`mt-4 rounded-full border px-4 py-1 text-sm font-bold uppercase tracking-wide ${details.colorClass}`}>
              {details.category}
            </span>
          </div>

          <p className="mt-6 text-brandText leading-relaxed text-sm max-w-md mx-auto">
            {details.message}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleShare}
              className="rounded-full bg-brandNavy px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brandDeepNavy transition"
            >
              {copied ? '✓ Results Copied to Clipboard!' : 'Share Your Progress'}
            </button>
            <button
              onClick={resetQuiz}
              className="rounded-full border border-brandBorder bg-white px-6 py-2.5 text-xs font-bold text-brandText hover:bg-brandBgSoft transition"
            >
              Retake Quiz
            </button>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="rounded-3xl border border-brandBorder bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold tracking-tight text-brandDeepNavy">
            Recommended Action Plan
          </h3>
          <p className="mt-2 text-xs text-brandMuted">
            Three education-focused next steps based on your score:
          </p>

          <ul className="mt-5 space-y-3">
            {details.actions.map((act, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brandNavy/10 text-xs font-black text-brandNavy mt-0.5">
                  {i + 1}
                </span>
                <Link
                  href={act.href}
                  className="flex flex-1 items-center justify-between rounded-xl border border-brandBorder bg-brandBgSoft p-4 hover:border-slate-300 hover:bg-white transition"
                >
                  <span className="text-sm font-bold text-brandDeepNavy">{act.text}</span>
                  <span className="text-brandGrowthGreen text-lg font-black ml-3 shrink-0">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Highlighted Roadmap */}
        <div className="rounded-3xl border border-brandBorder bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold tracking-tight text-brandDeepNavy mb-6">
            Your Personal Finance Roadmap
          </h3>
          <PersonalFinanceRoadmap highlightStage={details.roadmapStage} />
        </div>

        {/* Educational Disclaimer */}
        <div className="rounded-2xl border border-brandBorder bg-brandBgSoft p-5 text-center">
          <p className="text-xs leading-relaxed text-brandMuted">
            <span className="font-bold text-brandDeepNavy block mb-1">Educational Disclaimer</span>
            This score is for educational self-reflection only and is not financial, tax, legal, or investment advice.
          </p>
        </div>
      </div>
    );
  }

  // Quiz Mode
  // Progress: how many questions have been answered
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const currentQuestion = questions[currentIdx];
  const existingAnswer = answers[currentQuestion.id]; // undefined | true | false

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-brandBorder bg-white shadow-sm overflow-hidden">
      {/* Progress bar header */}
      <div className="bg-brandBgSoft border-b border-brandBorder px-6 pt-5 pb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-brandMuted mb-2">
          <span className="text-brandDeepNavy font-bold">
            Question {currentIdx + 1} <span className="font-normal text-brandMuted">of {questions.length}</span>
          </span>
          <span>{progressPercent}% complete</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-brandGrowthGreen transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPercent}% complete`}
          />
        </div>
        {/* Step dots */}
        <div className="mt-2.5 flex gap-1">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`flex-1 h-1 rounded-full transition-colors duration-200 ${
                answers[q.id] !== undefined
                  ? 'bg-brandGrowthGreen'
                  : i === currentIdx
                  ? 'bg-brandNavy/40'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Question */}
        <div className="min-h-[120px] flex flex-col justify-center text-center">
          <span className="text-xs font-bold text-brandGrowthGreen uppercase tracking-wider">
            {currentQuestion.category}
          </span>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-brandDeepNavy leading-snug px-2">
            {currentQuestion.text}
          </h3>
          {/* Show if previously answered */}
          {existingAnswer !== undefined && (
            <p className="mt-2 text-xs text-brandMuted">
              You previously answered: <strong>{existingAnswer ? 'Yes' : 'No'}</strong> — change your answer below.
            </p>
          )}
        </div>

        {/* Privacy note — above buttons */}
        <p className="mt-4 mb-4 text-center text-[11px] text-brandMuted leading-relaxed rounded-lg bg-brandBgSoft border border-brandBorder/60 px-4 py-2.5">
          🔒 Your answers stay in this browser. RupeeKit does not store personal data.
        </p>

        {/* Yes / No Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            className={`rounded-full py-3 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brandNavy focus:ring-offset-2 ${
              existingAnswer === true
                ? 'bg-brandGrowthGreen text-white ring-2 ring-brandGrowthGreen ring-offset-2'
                : 'bg-brandNavy text-white hover:bg-brandDeepNavy'
            }`}
          >
            ✓ Yes
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className={`rounded-full border py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 ${
              existingAnswer === false
                ? 'border-brandDeepNavy bg-brandDeepNavy text-white ring-2 ring-brandDeepNavy ring-offset-2'
                : 'border-brandBorder bg-white text-brandText hover:bg-brandBgSoft'
            }`}
          >
            ✗ No
          </button>
        </div>

        {/* Back button */}
        {currentIdx > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={handleBack}
              className="text-xs font-semibold text-brandMuted hover:text-brandNavy transition underline-offset-2 hover:underline"
            >
              ← Back to previous question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
