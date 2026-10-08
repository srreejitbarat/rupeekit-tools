'use client';

import React from 'react';

interface VisualProps {
  type: string;
  mode: 'hero' | 'inline' | 'thumbnail';
  title?: string;
  subtitle?: string;
}

export function BlogVisualRenderer({ type, mode, title, subtitle }: VisualProps) {
  const isDark = mode === 'hero';
  
  // High contrast color classes based on background theme
  const textClass = isDark ? 'fill-slate-100 font-semibold' : 'fill-brandDeepNavy font-semibold';
  const labelClass = isDark ? 'fill-slate-300 font-medium' : 'fill-brandMuted font-medium';
  const subtextClass = isDark ? 'fill-slate-400' : 'fill-slate-500';
  
  const bgClass = isDark ? 'fill-slate-800/80' : 'fill-slate-50';
  const borderClass = isDark ? 'stroke-slate-700' : 'stroke-brandBorder';
  const lineClass = isDark ? 'stroke-slate-700' : 'stroke-slate-200';

  const navyColor = '#003080';
  const deepNavyColor = '#002070';
  const growthGreenColor = '#43A047';
  const brightGreenColor = '#50B040';
  
  const renderSvg = () => {
    switch (type) {
      case 'monthly-budget':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Monthly budget flow chart">
            <title>Monthly Budget Flow</title>
            {/* Flow connections */}
            <path d="M 105 110 C 180 110, 200 42, 280 42" fill="none" stroke={navyColor} strokeWidth="6" opacity={isDark ? "0.8" : "0.5"} className="budget-path" />
            <path d="M 105 110 L 280 110" fill="none" stroke="#64748B" strokeWidth="6" opacity={isDark ? "0.8" : "0.5"} className="budget-path" />
            <path d="M 105 110 C 180 110, 200 178, 280 178" fill="none" stroke={growthGreenColor} strokeWidth="6" opacity={isDark ? "0.8" : "0.5"} className="budget-path" />

            {/* Income node */}
            <g className="budget-node">
              <rect x="15" y="85" width="90" height="50" rx="8" className={`${bgClass} ${borderClass}`} strokeWidth="2" />
              <text x="60" y="110" textAnchor="middle" className={textClass} fontSize="11">INCOME</text>
              <text x="60" y="125" textAnchor="middle" className={labelClass} fontSize="10">100%</text>
            </g>

            {/* Needs node */}
            <g className="budget-node">
              <rect x="280" y="18" width="105" height="48" rx="8" className={`${bgClass} ${borderClass}`} strokeWidth="2" />
              <text x="332" y="38" textAnchor="middle" className={textClass} fontSize="11" fill={navyColor}>NEEDS</text>
              <text x="332" y="53" textAnchor="middle" className={labelClass} fontSize="10">50% Allocated</text>
            </g>

            {/* Wants node */}
            <g className="budget-node">
              <rect x="280" y="86" width="105" height="48" rx="8" className={`${bgClass} ${borderClass}`} strokeWidth="2" />
              <text x="332" y="106" textAnchor="middle" className={textClass} fontSize="11">WANTS</text>
              <text x="332" y="121" textAnchor="middle" className={labelClass} fontSize="10">30% Allocated</text>
            </g>

            {/* Savings node */}
            <g className="budget-node">
              <rect x="280" y="154" width="105" height="48" rx="8" className={`${bgClass} ${borderClass}`} strokeWidth="2" />
              <text x="332" y="174" textAnchor="middle" className={textClass} fontSize="11" fill={growthGreenColor}>SAVINGS</text>
              <text x="332" y="189" textAnchor="middle" className={labelClass} fontSize="10">20% Allocated</text>
            </g>
          </svg>
        );

      case '50-30-20':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="50 30 20 budget split rings">
            <title>50/30/20 Budget Split</title>
            {/* Circle Gauges */}
            {/* Needs - 50% */}
            <g className="gauge-group">
              <circle cx="80" cy="95" r="35" fill="none" className={lineClass} strokeWidth="8" />
              <circle cx="80" cy="95" r="35" fill="none" stroke={navyColor} strokeWidth="8" 
                      strokeDasharray="110 220" transform="rotate(-90 80 95)" strokeLinecap="round" />
              <text x="80" y="100" textAnchor="middle" className={textClass} fontSize="13">50%</text>
              <text x="80" y="150" textAnchor="middle" className={textClass} fontSize="11">NEEDS</text>
              <text x="80" y="166" textAnchor="middle" className={labelClass} fontSize="9">Survival Essentials</text>
            </g>

            {/* Wants - 30% */}
            <g className="gauge-group">
              <circle cx="200" cy="95" r="35" fill="none" className={lineClass} strokeWidth="8" />
              <circle cx="200" cy="95" r="35" fill="none" stroke="#64748B" strokeWidth="8" 
                      strokeDasharray="66 220" transform="rotate(-90 200 95)" strokeLinecap="round" />
              <text x="200" y="100" textAnchor="middle" className={textClass} fontSize="13">30%</text>
              <text x="200" y="150" textAnchor="middle" className={textClass} fontSize="11">WANTS</text>
              <text x="200" y="166" textAnchor="middle" className={labelClass} fontSize="9">Lifestyle Choices</text>
            </g>

            {/* Savings - 20% */}
            <g className="gauge-group">
              <circle cx="320" cy="95" r="35" fill="none" className={lineClass} strokeWidth="8" />
              <circle cx="320" cy="95" r="35" fill="none" stroke={growthGreenColor} strokeWidth="8" 
                      strokeDasharray="44 220" transform="rotate(-90 320 95)" strokeLinecap="round" />
              <text x="320" y="100" textAnchor="middle" className={textClass} fontSize="13">20%</text>
              <text x="320" y="150" textAnchor="middle" className={textClass} fontSize="11" fill={growthGreenColor}>SAVINGS</text>
              <text x="320" y="166" textAnchor="middle" className={labelClass} fontSize="9">Future Wealth</text>
            </g>
          </svg>
        );

      case 'emergency-fund':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Emergency fund timeline and milestones">
            <title>Emergency Fund Cushion</title>
            {/* Main timeline line */}
            <rect x="40" y="100" width="320" height="12" rx="6" className={lineClass} />
            {/* Filled progress */}
            <rect x="40" y="100" width="220" height="12" rx="6" fill={growthGreenColor} className="progress-bar-glow" />

            {/* Start node */}
            <g className="milestone-group">
              <circle cx="45" cy="106" r="8" fill={navyColor} className="milestone-node" />
              <text x="45" y="132" textAnchor="middle" className={`milestone-title ${labelClass}`} fontSize="9">Start</text>
              <text x="45" y="145" textAnchor="middle" className={subtextClass} fontSize="8">₹0 saved</text>
            </g>

            {/* Milestone 3 Months */}
            <g className="milestone-group">
              <g className="milestone-node">
                <circle cx="180" cy="106" r="10" fill={growthGreenColor} stroke={isDark ? "#0f172a" : "#fff"} strokeWidth="2" />
                {/* Shield Icon path */}
                <path d="M 180 100 L 185 102 L 185 107 C 185 110, 180 113, 180 113 C 180 113, 175 110, 175 107 L 175 102 Z" fill="#fff" />
              </g>
              <text x="180" y="132" textAnchor="middle" className={`milestone-title ${textClass}`} fontSize="10">3 Months</text>
              <text x="180" y="145" textAnchor="middle" className={labelClass} fontSize="9">Basic Safety</text>
              <line x1="180" y1="116" x2="180" y2="124" stroke={growthGreenColor} strokeWidth="1" strokeDasharray="2 2" />
            </g>

            {/* Milestone 6 Months */}
            <g className="milestone-group">
              <g className="milestone-node">
                <circle cx="320" cy="106" r="10" fill={navyColor} stroke={isDark ? "#0f172a" : "#fff"} strokeWidth="2" />
                {/* Shield Icon path */}
                <path d="M 320 100 L 325 102 L 325 107 C 325 110, 320 113, 320 113 C 320 113, 315 110, 315 107 L 315 102 Z" fill="#fff" />
              </g>
              <text x="320" y="132" textAnchor="middle" className={`milestone-title ${textClass}`} fontSize="10">6 Months</text>
              <text x="320" y="145" textAnchor="middle" className={labelClass} fontSize="9">Full Cushion</text>
              <line x1="320" y1="116" x2="320" y2="124" stroke={navyColor} strokeWidth="1" strokeDasharray="2 2" />
            </g>

            <text x="200" y="55" textAnchor="middle" className={textClass} fontSize="12">Emergency Savings Milestone Track</text>
          </svg>
        );

      case 'bookshelf':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Bookshelf with generic personal finance books">
            <title>Personal Finance Bookshelf</title>
            {/* Shelf */}
            <rect x="30" y="180" width="340" height="8" rx="2" fill="#64748B" />

            {/* Generic Books - spine labels only, no copyrighted art */}
            {/* Book 1: Budgeting Basics */}
            <g className="book-group">
              <rect x="65" y="50" width="40" height="130" rx="3" fill={navyColor} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <line x1="65" y1="62" x2="105" y2="62" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="65" y1="168" x2="105" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x="-115" y="89" textAnchor="middle" transform="rotate(-90)" fill="#fff" fontSize="9" fontWeight="bold" letterSpacing="0.5">BUDGETING BASICS</text>
            </g>

            {/* Book 2: Money Habits */}
            <g className="book-group">
              <rect x="120" y="70" width="42" height="110" rx="3" fill={growthGreenColor} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <line x1="120" y1="82" x2="162" y2="82" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="120" y1="168" x2="162" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x="-125" y="145" textAnchor="middle" transform="rotate(-90)" fill="#fff" fontSize="9" fontWeight="bold" letterSpacing="0.5">MONEY HABITS</text>
            </g>

            {/* Book 3: Saving Guide */}
            <g className="book-group">
              <rect x="178" y="40" width="40" height="140" rx="3" fill={deepNavyColor} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <line x1="178" y1="52" x2="218" y2="52" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="178" y1="168" x2="218" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x="-110" y="202" textAnchor="middle" transform="rotate(-90)" fill="#fff" fontSize="9" fontWeight="bold" letterSpacing="0.5">SAVING GUIDE</text>
            </g>

            {/* Book 4: Debt Planning */}
            <g className="book-group">
              <rect x="234" y="60" width="42" height="120" rx="3" fill={brightGreenColor} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <line x1="234" y1="72" x2="276" y2="72" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="234" y1="168" x2="276" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x="-120" y="259" textAnchor="middle" transform="rotate(-90)" fill="#fff" fontSize="9" fontWeight="bold" letterSpacing="0.5">DEBT PLANNING</text>
            </g>

            {/* Book 5: Beginner Finance */}
            <g className="book-group">
              <rect x="292" y="85" width="40" height="95" rx="3" fill="#1E293B" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <line x1="292" y1="97" x2="332" y2="97" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="292" y1="168" x2="332" y2="168" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x="-132" y="316" textAnchor="middle" transform="rotate(-90)" fill="#fff" fontSize="8" fontWeight="bold" letterSpacing="0.5">BEGINNER FINANCE</text>
            </g>
          </svg>
        );

      case 'expense-tracking':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Expense tracking categories grid">
            <title>Expense Categories</title>
            {/* Card Grid */}
            {/* Housing (50%) */}
            <g className="expense-card">
              <rect x="20" y="30" width="105" height="70" rx="8" className={`expense-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              {/* Minimal House Icon */}
              <g className="housing-roof">
                <path d="M 57 55 L 72.5 42 L 88 55" fill="none" stroke={navyColor} strokeWidth="1.5" />
              </g>
              <path d="M 72.5 45 L 85 53 L 85 65 L 60 65 L 60 53 Z" fill="none" stroke={navyColor} strokeWidth="1.5" />
              <text x="72.5" y="80" textAnchor="middle" className={textClass} fontSize="10">Housing (50%)</text>
            </g>

            {/* Food (20%) */}
            <g className="expense-card">
              <rect x="147.5" y="30" width="105" height="70" rx="8" className={`expense-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              {/* Plate/Fork/Knife Icon */}
              <g className="food-icon">
                <circle cx="200" cy="53" r="8" fill="none" stroke={growthGreenColor} strokeWidth="1.5" />
                <line x1="187" y1="46" x2="187" y2="60" stroke={growthGreenColor} strokeWidth="1.5" />
                <line x1="213" y1="46" x2="213" y2="60" stroke={growthGreenColor} strokeWidth="1.5" />
              </g>
              <text x="200" y="80" textAnchor="middle" className={textClass} fontSize="10" fill={growthGreenColor}>Food (20%)</text>
            </g>

            {/* Utilities (10%) */}
            <g className="expense-card">
              <rect x="275" y="30" width="105" height="70" rx="8" className={`expense-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              {/* Lightning bolt */}
              <path d="M 330 42 L 320 54 L 328 54 L 324 66 L 334 52 L 326 52 Z" fill="none" stroke="#EAB308" strokeWidth="1.5" className="utility-bolt" />
              <text x="327.5" y="80" textAnchor="middle" className={textClass} fontSize="10">Utilities (10%)</text>
            </g>

            {/* Transport (10%) */}
            <g className="expense-card">
              <rect x="83.5" y="120" width="110" height="70" rx="8" className={`expense-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              {/* Car wheel / dash icon */}
              <g className="transport-wheel">
                <circle cx="138.5" cy="144" r="9" fill="none" stroke={navyColor} strokeWidth="1.5" />
                <path d="M 130 144 L 147 144 M 138.5 135 L 138.5 153" stroke={navyColor} strokeWidth="1" />
              </g>
              <text x="138.5" y="170" textAnchor="middle" className={textClass} fontSize="10">Transport (10%)</text>
            </g>

            {/* Leisure (10%) */}
            <g className="expense-card">
              <rect x="206.5" y="120" width="110" height="70" rx="8" className={`expense-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              {/* Ticket star icon */}
              <polygon className="leisure-star" points="261.5,135 264.5,142 271.5,143 266.5,148 268,155 261.5,151 255,155 256.5,148 251.5,143 258.5,142" 
                       fill="none" stroke={growthGreenColor} strokeWidth="1.5" />
              <text x="261.5" y="170" textAnchor="middle" className={textClass} fontSize="10" fill={growthGreenColor}>Leisure (10%)</text>
            </g>
          </svg>
        );

      case 'saving-vs-investing':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none scale-svg" aria-label="Saving vs investing comparison scale">
            <title>Saving vs. Investing Balance</title>
            {/* Fulcrum stand */}
            <polygon points="185,170 215,170 200,140" className={`${isDark ? 'fill-slate-700' : 'fill-slate-300'}`} />
            <line x1="200" y1="140" x2="200" y2="85" stroke={isDark ? '#475569' : '#CBD5E1'} strokeWidth="4" />

            <g className="scale-beam-group">
              {/* Balance beam */}
              <line x1="80" y1="85" x2="320" y2="85" stroke={navyColor} strokeWidth="4" />

              {/* Left Pan (Saving) */}
              <g>
                <line x1="80" y1="85" x2="55" y2="125" stroke="#64748B" strokeWidth="1.5" />
                <line x1="80" y1="85" x2="105" y2="125" stroke="#64748B" strokeWidth="1.5" />
                <path d="M 50 125 L 110 125" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                {/* Lock Icon */}
                <rect x="68" y="132" width="24" height="18" rx="3" fill="none" stroke={navyColor} strokeWidth="1.5" />
                <path d="M 74 132 L 74 127 C 74 123, 86 123, 86 127 L 86 132" fill="none" stroke={navyColor} strokeWidth="1.5" />
                <text x="80" y="170" textAnchor="middle" className={textClass} fontSize="12">SAVING</text>
                <text x="80" y="184" textAnchor="middle" className={labelClass} fontSize="9">Capital Safety & Liquidity</text>
                <text x="80" y="196" textAnchor="middle" className={subtextClass} fontSize="8">Savings, FDs, Liquid Funds</text>
              </g>

              {/* Right Pan (Investing) */}
              <g>
                <line x1="320" y1="85" x2="295" y2="125" stroke="#64748B" strokeWidth="1.5" />
                <line x1="320" y1="85" x2="345" y2="125" stroke="#64748B" strokeWidth="1.5" />
                <path d="M 290 125 L 350 125" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                {/* Trending Up Arrow Sprout */}
                <path d="M 312 146 L 320 133 L 328 146 Z M 320 133 L 320 150" fill="none" stroke={growthGreenColor} strokeWidth="1.5" />
                <path d="M 314 138 Q 320 132, 326 138" fill="none" stroke={growthGreenColor} strokeWidth="1.5" />
                <text x="320" y="170" textAnchor="middle" className={textClass} fontSize="12" fill={growthGreenColor}>INVESTING</text>
                <text x="320" y="184" textAnchor="middle" className={labelClass} fontSize="9">Beat Inflation & Compound</text>
                <text x="320" y="196" textAnchor="middle" className={subtextClass} fontSize="8">Mutual Funds, Equity SIPs</text>
              </g>
            </g>
          </svg>
        );

      case 'family-expense':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Family house budget illustration">
            <title>Family Expense Framework</title>
            {/* House Structure */}
            <polygon points="200,20 360,85 360,200 40,200 40,85" fill="none" stroke={navyColor} strokeWidth="2.5" strokeLinejoin="round" />
            <line x1="40" y1="85" x2="360" y2="85" stroke={navyColor} strokeWidth="1.5" />

            {/* Roof Label */}
            <text x="200" y="60" textAnchor="middle" className={textClass} fontSize="12">FAMILY HOUSEHOLD</text>

            {/* Room compartments */}
            {/* Bottom Floor: Rent & Groceries */}
            <g className="family-room">
              <rect x="52" y="136" width="296" height="52" rx="4" fill="none" className="room-bg" stroke={navyColor} strokeWidth="1" strokeDasharray="3 3" />
              <text x="200" y="160" textAnchor="middle" className={`room-text ${textClass}`} fontSize="10">Base Needs (Rent, Utilities, Food) ~ 50%</text>
            </g>

            {/* Top Left Room: Child Education */}
            <g className="family-room room-green">
              <rect x="52" y="94" width="142" height="34" rx="4" fill="none" className="room-bg" stroke={growthGreenColor} strokeWidth="1" strokeDasharray="3 3" />
              <text x="123" y="115" textAnchor="middle" className={`room-text ${textClass}`} fontSize="9" fill={growthGreenColor}>School & Activities</text>
            </g>

            {/* Top Right Room: Sinking Fund */}
            <g className="family-room">
              <rect x="206" y="94" width="142" height="34" rx="4" fill="none" className="room-bg" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
              <text x="277" y="115" textAnchor="middle" className={`room-text ${textClass}`} fontSize="9">Medical & Seasonal Fees</text>
            </g>
          </svg>
        );

      case 'debt-ladder':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Debt ladder repayment steps showing snowball and avalanche comparison">
            <title>Debt Repayment Ladder</title>
            {/* Staircase Steps */}
            {/* Step 1 */}
            <g className="ladder-step">
              <rect x="40" y="150" width="50" height="50" rx="4" className={`step-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              <text x="65" y="180" textAnchor="middle" className={textClass} fontSize="9">Debt 1</text>
            </g>
            {/* Step 2 */}
            <g className="ladder-step">
              <rect x="90" y="115" width="50" height="85" rx="4" className={`step-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              <text x="115" y="160" textAnchor="middle" className={textClass} fontSize="9">Debt 2</text>
            </g>
            {/* Step 3 */}
            <g className="ladder-step">
              <rect x="140" y="80" width="50" height="120" rx="4" className={`step-bg ${bgClass} ${borderClass}`} strokeWidth="1.5" />
              <text x="165" y="140" textAnchor="middle" className={textClass} fontSize="9">Debt 3</text>
            </g>
            
            {/* Flag at top */}
            <g className="victory-flag-group">
              <line x1="215" y1="80" x2="215" y2="40" stroke={growthGreenColor} strokeWidth="2" />
              <polygon className="victory-flag" points="215,40 245,50 215,60" fill={growthGreenColor} />
              <text x="232" y="76" className={textClass} fontSize="9" fontWeight="bold" fill={growthGreenColor}>DEBT FREE</text>
            </g>

            {/* Methods Explainer (Right Side) */}
            <rect x="210" y="90" width="170" height="100" rx="8" className={bgClass} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="1" />
            
            <text x="220" y="112" className={textClass} fontSize="10" fontWeight="bold">Repayment Strategies:</text>
            
            <circle cx="228" cy="132" r="3" fill={navyColor} />
            <text x="238" y="135" className={labelClass} fontSize="9" fontWeight="bold">Debt Snowball</text>
            <text x="238" y="146" className={subtextClass} fontSize="8">Smallest balances first for morale</text>
            
            <circle cx="228" cy="167" r="3" fill={growthGreenColor} />
            <text x="238" y="170" className={labelClass} fontSize="9" fontWeight="bold" fill={growthGreenColor}>Debt Avalanche</text>
            <text x="238" y="181" className={subtextClass} fontSize="8">Highest interest rates first to save money</text>
          </svg>
        );

      case 'habit-tracker':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="30-day money habit tracker checklist grid">
            <title>30-Day Money Habits Grid</title>
            {/* Subtitle */}
            <text x="200" y="32" textAnchor="middle" className={textClass} fontSize="12">30-Day Financial Consistency Grid</text>

            {/* Generate 5x6 grid = 30 cells */}
            {Array.from({ length: 5 }).map((_, rIdx) => {
              return Array.from({ length: 6 }).map((_, cIdx) => {
                const dayNum = rIdx * 6 + cIdx + 1;
                const isChecked = dayNum <= 22; // 22 days completed
                const xPos = 95 + cIdx * 35;
                const yPos = 50 + rIdx * 28;

                return (
                  <g key={dayNum} className={`habit-cell ${isChecked ? 'habit-completed' : ''}`}>
                    {isChecked ? (
                      <>
                        <rect x={xPos} y={yPos} width="24" height="22" rx="4" fill={growthGreenColor} className="habit-rect" />
                        <path d={`M ${xPos + 6} ${yPos + 11} L ${xPos + 10} ${yPos + 15} L ${xPos + 18} ${yPos + 7}`} 
                              fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    ) : (
                      <rect x={xPos} y={yPos} width="24" height="22" rx="4" fill="none" stroke={isDark ? "#475569" : "#CBD5E1"} strokeWidth="1.5" strokeDasharray="2 2" className="habit-rect" />
                    )}
                    <text x={xPos + 12} y={yPos + 32} textAnchor="middle" className={subtextClass} fontSize="7">D{dayNum}</text>
                  </g>
                );
              });
            })}
            
            <text x="200" y="206" textAnchor="middle" className={labelClass} fontSize="9">22 / 30 Days Logged Successfully (Consistency: 73%)</text>
          </svg>
        );

      case 'salary-checklist':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Generic global-friendly salary checklist tracker">
            <title>Salaried Employee Checklist</title>
            
            {/* Title */}
            <text x="200" y="28" textAnchor="middle" className={textClass} fontSize="12">Salary Planning Dashboard Checklist</text>

            {/* Column 1 (Left side) */}
            <g>
              {/* Checklist item 1 */}
              <g className="checklist-row">
                <g className="checklist-badge">
                  <circle cx="45" cy="60" r="8" fill={growthGreenColor} />
                  <path d="M 41 60 L 44 63 L 49 57" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <text x="60" y="63" className={textClass} fontSize="10">Salary breakup</text>
                <text x="60" y="74" className={labelClass} fontSize="8">Base pay vs allowances</text>
              </g>

              {/* Checklist item 2 */}
              <g className="checklist-row">
                <g className="checklist-badge">
                  <circle cx="45" cy="110" r="8" fill={growthGreenColor} />
                  <path d="M 41 110 L 44 113 L 49 107" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <text x="60" y="113" className={textClass} fontSize="10">Benefits optimization</text>
                <text x="60" y="124" className={labelClass} fontSize="8">Health covers & perks</text>
              </g>

              {/* Checklist item 3 */}
              <g className="checklist-row">
                <g className="checklist-badge">
                  <circle cx="45" cy="160" r="8" fill={growthGreenColor} />
                  <path d="M 41 160 L 44 163 L 49 157" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <text x="60" y="163" className={textClass} fontSize="10">Deductions check</text>
                <text x="60" y="174" className={labelClass} fontSize="8">Taxes withheld correctly</text>
              </g>
            </g>

            {/* Column 2 (Right side) */}
            <g>
              {/* Checklist item 4 */}
              <g className="checklist-row">
                <g className="checklist-badge">
                  <circle cx="225" cy="60" r="8" fill={growthGreenColor} />
                  <path d="M 221 60 L 224 63 L 229 57" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <text x="240" y="63" className={textClass} fontSize="10">Tax regime selection</text>
                <text x="240" y="74" className={labelClass} fontSize="8">Compare old vs new systems</text>
              </g>

              {/* Checklist item 5 */}
              <g className="checklist-row">
                <g className="checklist-badge">
                  <circle cx="225" cy="110" r="8" fill={growthGreenColor} />
                  <path d="M 221 110 L 224 113 L 229 107" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <text x="240" y="113" className={textClass} fontSize="10">Retirement contribution</text>
                <text x="240" y="124" className={labelClass} fontSize="8">Maximize employer matches</text>
              </g>

              {/* Checklist item 6 */}
              <g className="checklist-row">
                <g className="checklist-badge">
                  <circle cx="225" cy="160" r="8" fill={growthGreenColor} />
                  <path d="M 221 160 L 224 163 L 229 157" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <text x="240" y="163" className={textClass} fontSize="10">Take-home estimate</text>
                <text x="240" y="174" className={labelClass} fontSize="8">Net salary calculation check</text>
              </g>
            </g>
          </svg>
        );

      case 'process-timeline':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="ITR-2 process timeline flow">
            <title>ITR-2 Filing Flow</title>
            {/* Background connection line */}
            <line x1="40" y1="110" x2="360" y2="110" stroke={isDark ? "#334155" : "#E2E8F0"} strokeWidth="4" />
            
            {/* Animated progress line */}
            <line x1="40" y1="110" x2="360" y2="110" stroke={growthGreenColor} strokeWidth="4" strokeDasharray="6 6" className="timeline-progress-path" />

            {/* Nodes */}
            {[
              { x: 40, label: "Collect Docs", sub: "Form 16 & CG" },
              { x: 120, label: "Reconcile AIS", sub: "Match 26AS" },
              { x: 200, label: "Capital Gains", sub: "Aggregate data" },
              { x: 280, label: "Choose Regime", sub: "Compare taxes" },
              { x: 360, label: "E-verify", sub: "Submit ITR-2" },
            ].map((step, idx) => (
              <g key={idx} className="timeline-node-group">
                <circle cx={step.x} cy="110" r="10" fill={isDark ? '#1e293b' : '#f8fafc'} stroke={growthGreenColor} strokeWidth="2.5" className="timeline-node" />
                <circle cx={step.x} cy="110" r="4" fill={growthGreenColor} className="timeline-dot" />
                <text x={step.x} y={idx % 2 === 0 ? 80 : 140} textAnchor="middle" className={textClass} fontSize="10">{step.label}</text>
                <text x={step.x} y={idx % 2 === 0 ? 92 : 152} textAnchor="middle" className={subtextClass} fontSize="8">{step.sub}</text>
                {/* Connecting subtle line to text */}
                <line x1={step.x} y1={idx % 2 === 0 ? 96 : 124} x2={step.x} y2={idx % 2 === 0 ? 98 : 130} stroke={growthGreenColor} strokeWidth="1" strokeDasharray="1 2" />
              </g>
            ))}
          </svg>
        );

      case 'home-loan-vs-rent':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Home loan vs rent comparison in India">
            <title>Home Loan vs Rent Comparison</title>

            {/* Left panel: Renting */}
            <rect x="8" y="16" width="170" height="192" rx="12" className={bgClass} stroke={isDark ? '#475569' : '#CBD5E1'} strokeWidth="1.5" />
            <text x="93" y="36" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold">RENTING</text>

            {/* Dashed house outline */}
            <polygon points="93,55 116,72 116,97 70,97 70,72" fill="none" stroke={isDark ? '#64748B' : '#94A3B8'} strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points="93,44 121,68 65,68" fill="none" stroke={isDark ? '#64748B' : '#94A3B8'} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="93" y="114" textAnchor="middle" fontSize="10" className={labelClass}>Monthly: ₹20,000</text>

            <circle cx="22" cy="131" r="3" fill={growthGreenColor} />
            <text x="30" y="134" fontSize="8.5" className={labelClass}>Flexibility to relocate</text>
            <circle cx="22" cy="147" r="3" fill={growthGreenColor} />
            <text x="30" y="150" fontSize="8.5" className={labelClass}>No maintenance cost</text>
            <circle cx="22" cy="163" r="3" fill="#EF4444" />
            <text x="30" y="166" fontSize="8.5" fill={isDark ? '#FCA5A5' : '#DC2626'}>Zero equity built</text>
            <circle cx="22" cy="179" r="3" fill="#EF4444" />
            <text x="30" y="182" fontSize="8.5" fill={isDark ? '#FCA5A5' : '#DC2626'}>Rent rises yearly</text>

            {/* Right panel: Buying */}
            <rect x="222" y="16" width="170" height="192" rx="12" fill={isDark ? 'rgba(0,48,128,0.2)' : 'rgba(0,48,128,0.05)'} stroke={navyColor} strokeWidth="1.5" />
            <text x="307" y="36" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold" fill={navyColor}>BUYING</text>

            {/* Filled house */}
            <polygon points="307,55 330,72 330,97 284,97 284,72" fill={isDark ? 'rgba(0,48,128,0.3)' : 'rgba(0,48,128,0.08)'} stroke={navyColor} strokeWidth="1.5" />
            <polygon points="307,44 335,68 279,68" fill={isDark ? 'rgba(0,48,128,0.3)' : 'rgba(0,48,128,0.08)'} stroke={navyColor} strokeWidth="1.5" />
            <text x="307" y="114" textAnchor="middle" fontSize="10" className={labelClass}>Monthly: ₹35,000 EMI</text>

            <circle cx="236" cy="131" r="3" fill={growthGreenColor} />
            <text x="244" y="134" fontSize="8.5" className={labelClass}>Equity builds monthly</text>
            <circle cx="236" cy="147" r="3" fill={growthGreenColor} />
            <text x="244" y="150" fontSize="8.5" className={labelClass}>Sec 24b: ₹2L deduction</text>
            <circle cx="236" cy="163" r="3" fill={growthGreenColor} />
            <text x="244" y="166" fontSize="8.5" className={labelClass}>80C: principal savings</text>
            <circle cx="236" cy="179" r="3" fill="#EF4444" />
            <text x="244" y="182" fontSize="8.5" fill={isDark ? '#FCA5A5' : '#DC2626'}>Lower liquidity</text>

            {/* VS badge */}
            <circle cx="200" cy="110" r="16" fill={navyColor} />
            <text x="200" y="115" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">VS</text>
          </svg>
        );

      case 'capital-gains-rates':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="STCG vs LTCG tax rates for equity AY 2026-27">
            <title>Capital Gains Tax Rates AY 2026-27</title>

            <text x="200" y="20" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold">Equity Capital Gains — AY 2026-27</text>

            {/* Timeline */}
            <line x1="40" y1="78" x2="360" y2="78" stroke={isDark ? '#475569' : '#CBD5E1'} strokeWidth="3" strokeLinecap="round" />

            {/* BUY marker */}
            <circle cx="40" cy="78" r="8" fill={growthGreenColor} />
            <text x="40" y="98" textAnchor="middle" fontSize="9" className={labelClass}>BUY</text>

            {/* 12-month divider */}
            <line x1="210" y1="53" x2="210" y2="106" stroke={isDark ? '#64748B' : '#94A3B8'} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="210" y="48" textAnchor="middle" fontSize="9" className={subtextClass}>12 months</text>

            {/* SELL marker */}
            <circle cx="360" cy="78" r="8" fill={navyColor} />
            <text x="360" y="98" textAnchor="middle" fontSize="9" className={labelClass}>SELL</text>

            {/* Zone shadings */}
            <rect x="42" y="61" width="166" height="17" rx="3" fill={isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.09)'} />
            <text x="125" y="73" textAnchor="middle" fontSize="9" fill={isDark ? '#FCA5A5' : '#DC2626'} fontWeight="bold">SHORT-TERM</text>
            <rect x="212" y="61" width="146" height="17" rx="3" fill={isDark ? 'rgba(67,160,71,0.18)' : 'rgba(67,160,71,0.09)'} />
            <text x="285" y="73" textAnchor="middle" fontSize="9" fill={growthGreenColor} fontWeight="bold">LONG-TERM</text>

            {/* STCG rate card */}
            <rect x="20" y="112" width="160" height="85" rx="10" fill={isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)'} stroke={isDark ? 'rgba(239,68,68,0.5)' : '#FECACA'} strokeWidth="1.5" />
            <text x="100" y="132" textAnchor="middle" fontSize="10" className={textClass} fontWeight="bold">STCG Tax</text>
            <text x="100" y="157" textAnchor="middle" fontSize="22" fill={isDark ? '#FCA5A5' : '#DC2626'} fontWeight="bold">20%</text>
            <text x="100" y="175" textAnchor="middle" fontSize="8.5" className={subtextClass}>Held &lt; 12 months</text>
            <text x="100" y="189" textAnchor="middle" fontSize="8.5" className={subtextClass}>No exemption limit</text>

            {/* LTCG rate card */}
            <rect x="220" y="112" width="160" height="85" rx="10" fill={isDark ? 'rgba(67,160,71,0.12)' : 'rgba(67,160,71,0.06)'} stroke={isDark ? 'rgba(67,160,71,0.5)' : 'rgba(67,160,71,0.35)'} strokeWidth="1.5" />
            <text x="300" y="132" textAnchor="middle" fontSize="10" className={textClass} fontWeight="bold">LTCG Tax</text>
            <text x="300" y="157" textAnchor="middle" fontSize="22" fill={growthGreenColor} fontWeight="bold">12.5%</text>
            <text x="300" y="175" textAnchor="middle" fontSize="8.5" className={subtextClass}>Held ≥ 12 months</text>
            <text x="300" y="189" textAnchor="middle" fontSize="8.5" fill={growthGreenColor} fontWeight="bold">₹1.25L exempt/year</text>
          </svg>
        );

      case 'tax-saving-trio':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="PPF vs ELSS vs FD comparison under Section 80C">
            <title>PPF vs ELSS vs FD — Section 80C Comparison</title>

            <text x="200" y="18" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold">Section 80C: PPF vs ELSS vs FD</text>

            {/* PPF Column */}
            <rect x="8" y="28" width="118" height="182" rx="10" fill={isDark ? 'rgba(0,48,128,0.2)' : 'rgba(0,48,128,0.05)'} stroke={navyColor} strokeWidth="1.5" />
            <path d="M 67 47 L 78 51 L 78 60 C 78 66, 67 71, 67 71 C 67 71, 56 66, 56 60 L 56 51 Z" fill="none" stroke={navyColor} strokeWidth="2" />
            <text x="67" y="83" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold" fill={navyColor}>PPF</text>
            <text x="67" y="101" textAnchor="middle" fontSize="18" fontWeight="bold" fill={navyColor}>7.1%</text>
            <text x="67" y="115" textAnchor="middle" fontSize="8" className={subtextClass}>per annum</text>
            <line x1="18" y1="124" x2="118" y2="124" stroke={isDark ? '#475569' : '#E2E8F0'} strokeWidth="1" />
            <text x="67" y="139" textAnchor="middle" fontSize="8.5" className={labelClass}>15-yr lock-in</text>
            <text x="67" y="154" textAnchor="middle" fontSize="8.5" fill={growthGreenColor} fontWeight="bold">EEE Tax Status</text>
            <text x="67" y="168" textAnchor="middle" fontSize="8" className={subtextClass}>Govt-backed safe</text>
            <text x="67" y="182" textAnchor="middle" fontSize="8" className={subtextClass}>Best: Low risk</text>
            <text x="67" y="200" textAnchor="middle" fontSize="7.5" className={subtextClass}>₹1.5L/yr limit</text>

            {/* ELSS Column */}
            <rect x="141" y="28" width="118" height="182" rx="10" fill={isDark ? 'rgba(67,160,71,0.15)' : 'rgba(67,160,71,0.05)'} stroke={growthGreenColor} strokeWidth="1.5" />
            <path d="M 175 68 L 200 46 L 225 68" fill="none" stroke={growthGreenColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 200 46 L 200 70" stroke={growthGreenColor} strokeWidth="2.5" strokeLinecap="round" />
            <text x="200" y="83" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold" fill={growthGreenColor}>ELSS</text>
            <text x="200" y="101" textAnchor="middle" fontSize="18" fontWeight="bold" fill={growthGreenColor}>12–14%</text>
            <text x="200" y="115" textAnchor="middle" fontSize="8" className={subtextClass}>historical CAGR</text>
            <line x1="151" y1="124" x2="251" y2="124" stroke={isDark ? '#475569' : '#E2E8F0'} strokeWidth="1" />
            <text x="200" y="139" textAnchor="middle" fontSize="8.5" className={labelClass}>3-yr lock-in</text>
            <text x="200" y="154" textAnchor="middle" fontSize="8.5" fill="#EAB308" fontWeight="bold">LTCG taxable</text>
            <text x="200" y="168" textAnchor="middle" fontSize="8" className={subtextClass}>Market-linked</text>
            <text x="200" y="182" textAnchor="middle" fontSize="8" className={subtextClass}>Best: Long term</text>
            <text x="200" y="200" textAnchor="middle" fontSize="7.5" className={subtextClass}>₹1.5L/yr limit</text>

            {/* FD Column */}
            <rect x="274" y="28" width="118" height="182" rx="10" fill={isDark ? 'rgba(100,116,139,0.15)' : 'rgba(100,116,139,0.05)'} stroke={isDark ? '#64748B' : '#94A3B8'} strokeWidth="1.5" />
            <rect x="326" y="53" width="14" height="12" rx="2" fill="none" stroke={isDark ? '#94A3B8' : '#64748B'} strokeWidth="1.5" />
            <path d="M 329 53 L 329 49 C 329 45, 337 45, 337 49 L 337 53" fill="none" stroke={isDark ? '#94A3B8' : '#64748B'} strokeWidth="1.5" />
            <text x="333" y="83" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold">FD (5yr)</text>
            <text x="333" y="101" textAnchor="middle" fontSize="18" fontWeight="bold" className={textClass}>~7%</text>
            <text x="333" y="115" textAnchor="middle" fontSize="8" className={subtextClass}>per annum</text>
            <line x1="284" y1="124" x2="384" y2="124" stroke={isDark ? '#475569' : '#E2E8F0'} strokeWidth="1" />
            <text x="333" y="139" textAnchor="middle" fontSize="8.5" className={labelClass}>5-yr lock-in</text>
            <text x="333" y="154" textAnchor="middle" fontSize="8.5" fill={isDark ? '#FCA5A5' : '#DC2626'} fontWeight="bold">Interest taxable</text>
            <text x="333" y="168" textAnchor="middle" fontSize="8" className={subtextClass}>Guaranteed return</text>
            <text x="333" y="182" textAnchor="middle" fontSize="8" className={subtextClass}>Best: Short term</text>
            <text x="333" y="200" textAnchor="middle" fontSize="7.5" className={subtextClass}>₹1.5L/yr limit</text>
          </svg>
        );

      case 'broker-comparison':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Zerodha vs Upstox vs Angel One broker comparison">
            <title>Broker Comparison: Zerodha vs Upstox vs Angel One</title>
            {/* Background */}
            <rect x="0" y="0" width="400" height="220" rx="12" fill={isDark ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.9)'} />

            {/* Title */}
            <text x="200" y="22" textAnchor="middle" className={textClass} fontSize="11" fontWeight="bold">Zerodha · Upstox · Angel One</text>

            {/* AMC Fee Bar Chart — Rs 240 to Rs 300 */}
            {/* Zerodha bar */}
            <rect x="40" y="45" width="88" height="110" rx="8" fill={isDark ? 'rgba(56,126,209,0.15)' : 'rgba(56,126,209,0.08)'} stroke={isDark ? '#5B9BD5' : '#387ED1'} strokeWidth="1.5" />
            <rect x="60" y="85" width="48" height="56" rx="4" fill={isDark ? 'rgba(56,126,209,0.6)' : 'rgba(56,126,209,0.9)'} />
            <text x="84" y="80" textAnchor="middle" className={textClass} fontSize="9" fontWeight="bold">ZERODHA</text>
            <text x="84" y="155" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isDark ? '#93C5FD' : '#1D4ED8'}>₹300/yr</text>
            <text x="84" y="167" textAnchor="middle" fontSize="8" className={subtextClass}>AMC</text>

            {/* Upstox bar */}
            <rect x="156" y="45" width="88" height="110" rx="8" fill={isDark ? 'rgba(123,47,247,0.15)' : 'rgba(123,47,247,0.08)'} stroke={isDark ? '#A78BFA' : '#7B2FF7'} strokeWidth="1.5" />
            <rect x="176" y="85" width="48" height="56" rx="4" fill={isDark ? 'rgba(123,47,247,0.6)' : 'rgba(123,47,247,0.85)'} />
            <text x="200" y="80" textAnchor="middle" className={textClass} fontSize="9" fontWeight="bold">UPSTOX</text>
            <text x="200" y="155" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isDark ? '#C4B5FD' : '#6D28D9'}>₹300/yr</text>
            <text x="200" y="167" textAnchor="middle" fontSize="8" className={subtextClass}>AMC</text>

            {/* Angel One bar — shorter (lower AMC) */}
            <rect x="272" y="45" width="88" height="110" rx="8" fill={isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.07)'} stroke={isDark ? '#FCA5A5' : '#DC2626'} strokeWidth="1.5" />
            <rect x="292" y="97" width="48" height="44" rx="4" fill={isDark ? 'rgba(220,38,38,0.6)' : 'rgba(220,38,38,0.85)'} />
            <text x="316" y="80" textAnchor="middle" className={textClass} fontSize="9" fontWeight="bold">ANGEL ONE</text>
            <text x="316" y="155" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isDark ? '#FCA5A5' : '#DC2626'}>₹240/yr</text>
            <text x="316" y="167" textAnchor="middle" fontSize="8" className={subtextClass}>AMC</text>

            {/* Common Metrics Row */}
            <line x1="20" y1="180" x2="380" y2="180" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="1" />
            <text x="200" y="196" textAnchor="middle" fontSize="9" className={labelClass}>Delivery: ₹0 · Intraday/F&O: ₹20/order — all three brokers</text>
            <text x="200" y="212" textAnchor="middle" fontSize="8.5" fill={growthGreenColor} fontWeight="bold">All SEBI-registered · Securities held in your name at CDSL/NSDL</text>
          </svg>
        );

      case 'mutual-fund-sip':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="SIP mutual fund growth over time">
            <title>SIP Mutual Fund Growth</title>
            {/* Background */}
            <rect x="0" y="0" width="400" height="220" rx="12" fill={isDark ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.9)'} />

            {/* Y-axis */}
            <line x1="55" y1="20" x2="55" y2="168" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1.5" />
            {/* X-axis */}
            <line x1="55" y1="168" x2="380" y2="168" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1.5" />

            {/* Y-axis labels */}
            <text x="50" y="168" textAnchor="end" fontSize="8" className={subtextClass}>0</text>
            <text x="50" y="128" textAnchor="end" fontSize="8" className={subtextClass}>₹5L</text>
            <text x="50" y="88" textAnchor="end" fontSize="8" className={subtextClass}>₹15L</text>
            <text x="50" y="48" textAnchor="end" fontSize="8" className={subtextClass}>₹30L</text>
            <line x1="53" y1="128" x2="57" y2="128" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1" />
            <line x1="53" y1="88" x2="57" y2="88" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1" />
            <line x1="53" y1="48" x2="57" y2="48" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1" />

            {/* Invested Amount Area (grey) */}
            <path
              d={`M 55 168 L 145 143 L 235 118 L 325 93 L 380 80 L 380 168 Z`}
              fill={isDark ? 'rgba(100,116,139,0.3)' : 'rgba(100,116,139,0.15)'}
            />
            <path
              d={`M 55 168 L 145 143 L 235 118 L 325 93 L 380 80`}
              fill="none"
              stroke={isDark ? '#94A3B8' : '#64748B'}
              strokeWidth="2"
              strokeDasharray="5 3"
            />

            {/* Corpus / Returns Area (green) */}
            <path
              d={`M 55 168 L 115 162 L 175 150 L 235 130 L 295 103 L 355 65 L 380 52 L 380 168 Z`}
              fill={isDark ? 'rgba(67,160,71,0.2)' : 'rgba(67,160,71,0.12)'}
            />
            <path
              d={`M 55 168 L 115 162 L 175 150 L 235 130 L 295 103 L 355 65 L 380 52`}
              fill="none"
              stroke={growthGreenColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* X-axis labels */}
            <text x="55" y="180" textAnchor="middle" fontSize="8" className={subtextClass}>Yr 0</text>
            <text x="145" y="180" textAnchor="middle" fontSize="8" className={subtextClass}>Yr 5</text>
            <text x="235" y="180" textAnchor="middle" fontSize="8" className={subtextClass}>Yr 10</text>
            <text x="325" y="180" textAnchor="middle" fontSize="8" className={subtextClass}>Yr 15</text>
            <text x="380" y="180" textAnchor="middle" fontSize="8" className={subtextClass}>Yr 20</text>

            {/* Corpus point marker */}
            <circle cx="380" cy="52" r="4" fill={growthGreenColor} stroke={isDark ? '#0F172A' : '#fff'} strokeWidth="2" />

            {/* Legend */}
            <rect x="70" y="30" width="10" height="8" rx="2" fill={isDark ? 'rgba(67,160,71,0.6)' : growthGreenColor} />
            <text x="85" y="38" fontSize="8.5" className={textClass}>Corpus (₹12K SIP, 12% p.a.)</text>
            <rect x="230" y="30" width="10" height="8" rx="2" fill={isDark ? 'rgba(100,116,139,0.5)' : 'rgba(100,116,139,0.4)'} />
            <text x="245" y="38" fontSize="8.5" className={textClass}>Amount invested</text>

            {/* Callout at yr 20 */}
            <rect x="260" y="40" width="120" height="36" rx="6" fill={isDark ? 'rgba(67,160,71,0.2)' : 'rgba(67,160,71,0.1)'} stroke={growthGreenColor} strokeWidth="1.5" />
            <text x="320" y="56" textAnchor="middle" fontSize="9" fontWeight="bold" fill={growthGreenColor}>~₹1.2 Cr at Yr 20</text>
            <text x="320" y="69" textAnchor="middle" fontSize="8" className={subtextClass}>invested ₹28.8L total</text>

            {/* Title */}
            <text x="200" y="210" textAnchor="middle" fontSize="9" className={labelClass}>Power of SIP compounding — start early, stay invested</text>
          </svg>
        );

      case 'tax-regime-comparison':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full select-none" aria-label="Old vs new tax regime comparison chart">
            <title>Old vs New Tax Regime Comparison</title>
            {/* Background */}
            <rect x="0" y="0" width="400" height="220" rx="12" fill={isDark ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.9)'} />

            {/* Title */}
            <text x="200" y="18" textAnchor="middle" className={textClass} fontSize="10" fontWeight="bold">Old vs New Tax Regime — Tax Payable at Key Salary Levels</text>

            {/* Y-axis */}
            <line x1="60" y1="28" x2="60" y2="158" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1.5" />
            {/* X-axis */}
            <line x1="60" y1="158" x2="385" y2="158" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1.5" />

            {/* Y-axis ticks & labels */}
            {[0, 50000, 100000, 150000].map((val, i) => {
              const y = 158 - (val / 150000) * 130;
              return (
                <g key={val}>
                  <line x1="58" y1={y} x2="62" y2={y} stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1" />
                  <text x="56" y={y + 3} textAnchor="end" fontSize="7.5" className={subtextClass}>
                    {val === 0 ? '0' : `₹${val / 1000}K`}
                  </text>
                </g>
              );
            })}

            {/* Data: [salary, old regime tax, new regime tax] */}
            {[
              { label: '₹7L', x: 90, old: 22500, newTax: 0 },
              { label: '₹10L', x: 160, old: 61500, newTax: 33800 },
              { label: '₹12L', x: 230, old: 93600, newTax: 0 },
              { label: '₹15L', x: 300, old: 123500, newTax: 105000 },
              { label: '₹20L', x: 370, old: 195500, newTax: 177000 },
            ].map(({ label, x, old, newTax }) => {
              const oldH = Math.round((old / 150000) * 130);
              const newH = Math.round((newTax / 150000) * 130);
              return (
                <g key={label}>
                  {/* Old regime bar */}
                  <rect x={x - 20} y={158 - oldH} width="16" height={oldH} rx="3"
                    fill={isDark ? 'rgba(0,48,128,0.7)' : navyColor} />
                  {/* New regime bar */}
                  <rect x={x + 4} y={158 - newH} width="16" height={newH} rx="3"
                    fill={isDark ? 'rgba(67,160,71,0.7)' : growthGreenColor} />
                  <text x={x} y="170" textAnchor="middle" fontSize="8" className={subtextClass}>{label}</text>
                </g>
              );
            })}

            {/* Legend */}
            <rect x="60" y="185" width="10" height="8" rx="2" fill={isDark ? 'rgba(0,48,128,0.7)' : navyColor} />
            <text x="74" y="193" fontSize="8.5" className={textClass}>Old Regime</text>
            <rect x="155" y="185" width="10" height="8" rx="2" fill={isDark ? 'rgba(67,160,71,0.7)' : growthGreenColor} />
            <text x="169" y="193" fontSize="8.5" className={textClass}>New Regime</text>
            <text x="280" y="193" fontSize="8" className={subtextClass} textAnchor="middle">₹0 = zero tax (87A rebate)</text>

            {/* Note */}
            <text x="200" y="210" textAnchor="middle" fontSize="8" className={subtextClass}>Estimates after standard deduction. Verify with RupeeKit calculator for your exact numbers.</text>
          </svg>
        );

      default:
        return null;
    }
  };

  const cssStyles = `
    /* Media query for reduced motion */
    @media (prefers-reduced-motion: no-preference) {
      @keyframes flow-dash {
        to {
          stroke-dashoffset: -40;
        }
      }
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.95; }
        50% { opacity: 0.85; filter: brightness(1.08) drop-shadow(0 0 2px rgba(67, 160, 71, 0.25)); }
      }
      @keyframes scale-tilt {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-1.2deg); }
        75% { transform: rotate(1.2deg); }
      }
      @keyframes flag-wave {
        0%, 100% { transform: skewY(0deg); }
        50% { transform: skewY(-6deg) scaleX(0.95); }
      }
      @keyframes blog-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }

      .blog-hero-float {
        animation: blog-float 6s ease-in-out infinite;
      }
      
      .progress-bar-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      
      .budget-path {
        stroke-dasharray: 6 6;
        animation: flow-dash 15s linear infinite;
      }
      
      @media (hover: hover) {
        .budget-path:hover {
          animation-duration: 5s;
        }
        .scale-svg:hover .scale-beam-group {
          animation: scale-tilt 3s ease-in-out infinite;
        }
        .victory-flag-group:hover .victory-flag {
          animation: flag-wave 1s ease-in-out infinite;
        }
      }
    }

    /* Transitions and hover states for all visual elements */
    .budget-path {
      transition: stroke-width 0.3s ease, stroke 0.3s ease, opacity 0.3s ease;
    }
    .budget-node {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }

    .gauge-group {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }

    .milestone-node {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }
    .milestone-title {
      transition: fill 0.3s ease, font-weight 0.3s ease;
    }

    .book-group {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
      transform-origin: bottom center;
      transform-box: fill-box;
      cursor: pointer;
    }

    .expense-card {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
      cursor: pointer;
    }
    .expense-bg {
      transition: stroke 0.3s ease, fill 0.3s ease;
    }
    .housing-roof {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }
    .food-icon {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }
    .utility-bolt {
      transition: fill 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }
    .transport-wheel {
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }
    .leisure-star {
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), fill 0.3s ease;
      transform-origin: center;
      transform-box: fill-box;
    }

    .scale-beam-group {
      transform-origin: 200px 85px;
      transition: transform 0.5s ease-in-out;
    }

    .room-bg {
      transition: fill 0.3s ease, stroke-dasharray 0.3s ease, stroke-width 0.3s ease;
    }
    .room-text {
      transition: transform 0.3s ease;
      transform-origin: center;
      transform-box: fill-box;
    }
    .family-room {
      cursor: pointer;
    }

    .ladder-step {
      cursor: pointer;
    }
    .step-bg {
      transition: stroke 0.3s ease, fill 0.3s ease, filter 0.3s ease;
    }
    .victory-flag {
      transform-origin: 215px 50px;
      transition: transform 0.3s ease;
    }

    .timeline-progress-path {
      animation: flow-dash 10s linear infinite;
    }
    .timeline-node-group {
      cursor: pointer;
    }
    .timeline-node {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.3s ease;
      transform-origin: center;
      transform-box: fill-box;
    }
    .timeline-dot {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
    }

    .habit-cell {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center;
      transform-box: fill-box;
      cursor: pointer;
    }
    .habit-rect {
      transition: fill 0.3s ease, stroke 0.3s ease, filter 0.3s ease;
    }

    .checklist-row {
      cursor: pointer;
    }
    .checklist-row text {
      transition: transform 0.3s ease;
    }
    .checklist-badge {
      transition: transform 0.3s ease;
      transform-origin: center;
      transform-box: fill-box;
    }

    /* Hover Pointer media query to prevent sticky hovers on touch devices */
    @media (hover: hover) {
      .budget-path:hover {
        opacity: 1 !important;
        stroke-width: 8px;
      }
      .budget-node:hover {
        transform: scale(1.04);
      }
      .gauge-group:hover {
        transform: scale(1.05);
      }
      .milestone-group:hover .milestone-node {
        transform: translateY(-4px);
      }
      .milestone-group:hover .milestone-title {
        fill: #43A047 !important;
      }
      .book-group:hover {
        transform: translateY(-8px);
        filter: brightness(1.12);
      }
      
      .expense-card:hover {
        transform: scale(1.04);
      }
      .expense-card:hover .expense-bg {
        stroke: #003080 !important;
      }
      .expense-card:hover .housing-roof {
        transform: translateY(-2px);
      }
      .expense-card:hover .food-icon {
        transform: scale(1.15);
      }
      .expense-card:hover .utility-bolt {
        fill: #FACC15;
        transform: scale(1.12);
      }
      .expense-card:hover .transport-wheel {
        transform: rotate(20deg);
      }
      .expense-card:hover .leisure-star {
        transform: rotate(36deg) scale(1.1);
        fill: rgba(67, 160, 71, 0.1);
      }
      
      .family-room:hover .room-bg {
        fill: rgba(0, 48, 128, 0.04);
        stroke-dasharray: none;
        stroke-width: 1.5;
      }
      .family-room.room-green:hover .room-bg {
        fill: rgba(67, 160, 71, 0.05);
      }
      .family-room:hover .room-text {
        transform: scale(1.02);
      }
      
      .ladder-step:hover .step-bg {
        stroke: #43A047 !important;
        filter: drop-shadow(0 2px 4px rgba(67, 160, 71, 0.15));
      }
      
      .timeline-node-group:hover .timeline-node {
        transform: scale(1.4);
        stroke-width: 2px;
      }
      .timeline-node-group:hover .timeline-dot {
        transform: scale(1.2);
      }

      .habit-cell:hover {
        transform: scale(1.15);
      }
      .habit-cell.habit-completed:hover .habit-rect {
        filter: brightness(1.08) drop-shadow(0 2px 4px rgba(67, 160, 71, 0.25));
      }
      
      .checklist-row:hover text {
        transform: translateX(3px);
      }
      .checklist-row:hover .checklist-badge {
        transform: scale(1.15);
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      {renderSvg()}
    </>
  );
}

// Hero Visual container Component (renders inside/alongside BlogHero dark navy section)
export function BlogHeroVisual({ type, alt }: { type: string; alt: string }) {
  if (!type) return null;
  return (
    <div 
      className="relative flex items-center justify-center p-3 md:p-6 w-full max-w-sm md:max-w-md mx-auto aspect-[16/10] bg-slate-900/50 border border-slate-700/60 rounded-2xl shadow-inner backdrop-blur-sm blog-hero-float"
      role="img"
      aria-label={alt}
    >
      <BlogVisualRenderer type={type} mode="hero" />
    </div>
  );
}

// Inline explainer card (renders inside the blog post body after section 1 or 2)
export function BlogInlineVisual({ type, title, subtitle, alt }: { type: string; title: string; subtitle: string; alt: string }) {
  if (!type) return null;
  return (
    <div 
      className="my-10 p-6 md:p-8 rounded-3xl border border-brandBorder bg-white shadow-sm max-w-2xl mx-auto flex flex-col items-center gap-5"
    >
      <div className="text-center">
        <span className="inline-block rounded-full bg-brandNavy/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brandNavy">
          Topic Explainer Visual
        </span>
        <h4 className="mt-2 text-lg font-black text-brandDeepNavy tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-brandMuted mt-1">
          {subtitle}
        </p>
      </div>

      <div 
        className="w-full aspect-[16/10] bg-brandBgSoft border border-brandBorder/60 rounded-2xl p-4 flex items-center justify-center"
        role="img"
        aria-label={alt}
      >
        <div className="w-full max-w-md">
          <BlogVisualRenderer type={type} mode="inline" title={title} subtitle={subtitle} />
        </div>
      </div>
    </div>
  );
}
