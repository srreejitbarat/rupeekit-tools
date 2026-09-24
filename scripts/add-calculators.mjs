import fs from 'fs';

// Load existing tools
const tools = JSON.parse(fs.readFileSync('data/tools.json', 'utf8'));
console.log(`Current tools count: ${tools.length}`);

const newCalculators = [
  {
    "slug": "mutual-fund-calculator-india",
    "name": "Mutual Fund Calculator India",
    "seoTitle": "Mutual Fund Calculator India 2026 — SIP, Lumpsum & Returns",
    "category": "Investments",
    "status": "live",
    "targetKeyword": "mutual fund calculator india",
    "shortDescription": "Calculate mutual fund returns for SIP, lumpsum, and systematic withdrawal plans. Compare with FD, PPF and stock market returns.",
    "metaDescription": "Free mutual fund calculator India 2026. Estimate SIP returns, lumpsum gains, SWP corpus and compare mutual fund vs FD, PPF, gold returns.",
    "inputs": [
      {
        "key": "investmentMode",
        "label": "Investment mode",
        "unit": "",
        "default": "sip",
        "min": 0,
        "max": 2,
        "step": 1,
        "help": "Choose SIP (Systematic Investment Plan), Lumpsum or SWP (Systematic Withdrawal Plan)."
      },
      {
        "key": "monthlyInvestment",
        "label": "Monthly SIP amount (₹)",
        "unit": "₹",
        "default": 10000,
        "min": 500,
        "step": 500,
        "help": "Amount invested every month (SIP mode)."
      },
      {
        "key": "lumpsumAmount",
        "label": "Lumpsum investment (₹)",
        "unit": "₹",
        "default": 100000,
        "min": 0,
        "step": 10000,
        "help": "One-time investment amount (Lumpsum mode)."
      },
      {
        "key": "expectedReturn",
        "label": "Expected annual return",
        "unit": "%",
        "default": 12,
        "min": 1,
        "step": 0.5,
        "help": "Expected average annual return from mutual funds (equity funds typically 10-15%)."
      },
      {
        "key": "years",
        "label": "Investment duration",
        "unit": "years",
        "default": 10,
        "min": 1,
        "step": 1,
        "help": "How long you plan to invest."
      },
      {
        "key": "monthlyWithdrawal",
        "label": "Monthly withdrawal (₹)",
        "unit": "₹",
        "default": 5000,
        "min": 0,
        "step": 500,
        "help": "Monthly amount withdrawn (SWP mode)."
      }
    ],
    "outputs": [
      {
        "key": "totalInvested",
        "label": "Total invested amount",
        "formula": "investmentMode == 0 ? monthlyInvestment * years * 12 : lumpsumAmount",
        "format": "currency"
      },
      {
        "key": "futureValue",
        "label": "Estimated future value",
        "formula": "investmentMode == 0 ? monthlyInvestment * (((1 + expectedReturn/12/100) ^ (years*12) - 1) / (expectedReturn/12/100)) * (1 + expectedReturn/12/100) : lumpsumAmount * (1 + expectedReturn/100) ^ years",
        "format": "currency"
      },
      {
        "key": "estimatedGains",
        "label": "Estimated gains",
        "formula": "futureValue - totalInvested",
        "format": "currency"
      },
      {
        "key": "effectiveReturn",
        "label": "Effective annual return",
        "formula": "totalInvested > 0 ? ((futureValue / totalInvested) ^ (1 / years) - 1) * 100 : 0",
        "format": "percent"
      }
    ],
    "formulaExplanation": "For SIP: Future Value = monthly investment × [((1 + monthly return) ^ months - 1) / monthly return] × (1 + monthly return). For lumpsum: Future Value = principal × (1 + annual return) ^ years.",
    "example": "A ₹10,000 monthly SIP for 10 years at 12% expected annual return gives an estimated future corpus based on monthly compounding assumptions.",
    "faqs": [
      {
        "question": "What is the difference between SIP and lumpsum mutual fund investing?",
        "answer": "SIP (Systematic Investment Plan) invests a fixed amount regularly (monthly/quarterly), reducing market timing risk through rupee-cost averaging. Lumpsum invests a large amount at once, which can be advantageous if markets are undervalued but carries higher timing risk."
      },
      {
        "question": "What return should I expect from mutual funds?",
        "answer": "Equity mutual funds historically delivered 10-14% CAGR over 10+ years in India. Debt funds typically return 6-8%. Past performance does not guarantee future results. Always consider your risk appetite and investment horizon."
      },
      {
        "question": "How does mutual fund compare with FD or PPF?",
        "answer": "Mutual funds (especially equity) offer higher potential returns than FDs (6-7%) and PPF (7.1% as of 2024-25) but with higher risk. For goals 7+ years away, equity mutual funds generally outperform. For short-term goals, FDs or debt funds are safer."
      },
      {
        "question": "Is there a minimum SIP amount in mutual funds?",
        "answer": "Most mutual funds allow SIPs starting from ₹500 per month. Some platforms and funds have higher minimums. SIPs are flexible — you can increase, decrease, pause or stop anytime."
      },
      {
        "question": "What are the taxes on mutual fund gains?",
        "answer": "Equity mutual funds: gains above ₹1,00,000 per year are taxed at 12% (LTCG) if held >12 months. Short-term (≤12 months) taxed at 15%. Debt funds: taxed as per your income slab (short-term) or 20% with indexation (long-term >36 months)."
      },
      {
        "question": "What is SWP (Systematic Withdrawal Plan)?",
        "answer": "SWP lets you withdraw a fixed amount monthly/quarterly from your existing mutual fund holdings. It's useful for retirement income planning. The corpus depletes over time based on withdrawals and returns."
      },
      {
        "question": "Should I choose growth or dividend option in mutual funds?",
        "answer": "Growth option reinvests gains, compounding your returns. Dividend option pays out periodically but reduces corpus. For wealth creation, growth is generally better. Dividends from mutual funds are now taxed in the hands of investors (post-2020)."
      },
      {
        "question": "How do I choose the right mutual fund?",
        "answer": "Consider: fund category matching your goal, historical track record (5-10 years), expense ratio (lower is better), fund manager experience, and consistency. Diversify across large-cap, mid-cap, and debt funds."
      }
    ],
    "related": [
      "sip-calculator-india",
      "lumpsum-calculator-india",
      "fd-calculator-india",
      "ppf-calculator-india"
    ],
    "quickAnswer": {
      "title": "Mutual Fund Calculator Quick Answer",
      "question": "How does a mutual fund calculator estimate returns?",
      "answer": "It estimates future corpus using your investment mode (SIP/lumpsum/SWP), amount, expected annual return, and duration. SIP uses monthly compounding; lumpsum uses annual compounding. Results are educational projections only.",
      "formula": "SIP FV = monthly investment × [((1 + monthly return)^months - 1) / monthly return] × (1 + monthly return)",
      "note": "Educational estimate only. Actual returns depend on market performance, expense ratios, and fund management."
    },
    "howToUse": [
      "Choose investment mode: SIP, Lumpsum, or SWP.",
      "Enter amount, expected return, and duration.",
      "Review total invested, future value, and estimated gains.",
      "Compare with FD, PPF, or gold returns using the comparison section.",
      "Check tax implications and inflation-adjusted value."
    ],
    "assumptions": [
      "Expected return is user-entered and not guaranteed.",
      "SIP assumes monthly investments at the start of each month.",
      "Lumpsum assumes investment at the start of the period.",
      "SWP assumes withdrawals at the end of each period.",
      "Does not include exit loads, expense ratios, or tax effects."
    ],
    "contentSections": [
      {
        "heading": "How does a mutual fund calculator work?",
        "body": "A mutual fund calculator estimates how your investments may grow over time using SIP, lumpsum, or SWP inputs. It shows total invested amount, projected corpus, and estimated gains under your assumptions."
      },
      {
        "heading": "SIP vs lumpsum: which is better?",
        "body": "SIP reduces market timing risk through rupee-cost averaging. Lumpsum can capture higher returns if markets are undervalued. For most investors, SIP is recommended for regular income; lumpsum suits windfalls or market dips."
      },
      {
        "heading": "What is the ideal investment horizon for mutual funds?",
        "body": "Equity mutual funds: 7-10+ years. Debt mutual funds: 1-3 years. Hybrid funds: 3-5 years. Shorter horizons may not benefit from equity's higher long-term returns."
      },
      {
        "heading": "How does inflation affect mutual fund returns?",
        "body": "If inflation is 6% and your mutual fund returns 12%, your real return is approximately 6%. Always check inflation-adjusted value for long-term goals."
      },
      {
        "heading": "Is mutual fund investment safe?",
        "body": "Mutual funds are regulated by SEBI and invest in diversified portfolios. They are not risk-free — equity funds can lose value in the short term. Past performance does not guarantee future results."
      }
    ],
    "lastReviewed": "August 2026",
    "lastReviewedIso": "2026-08-10"
  },
  {
    "slug": "insurance-premium-calculator-india",
    "name": "Insurance Premium Calculator India",
    "seoTitle": "Insurance Premium Calculator India 2026 — Term, Health, Life",
    "category": "Insurance",
    "status": "live",
    "targetKeyword": "insurance premium calculator india",
    "shortDescription": "Estimate term life, health insurance, and life insurance premiums based on age, coverage, and policy type.",
    "metaDescription": "Free insurance premium calculator India. Estimate term life, health, and life insurance premiums. Compare policies and plan coverage.",
    "inputs": [
      {
        "key": "insuranceType",
        "label": "Insurance type",
        "unit": "",
        "default": "term",
        "min": 0,
        "max": 2,
        "step": 1,
        "help": "Choose Term Life, Health Insurance, or Life Insurance (Endowment/PUL)."
      },
      {
        "key": "coverageAmount",
        "label": "Coverage amount (₹)",
        "unit": "₹",
        "default": 5000000,
        "min": 500000,
        "step": 100000,
        "help": "Sum assured or coverage amount."
      },
      {
        "key": "currentAge",
        "label": "Your current age",
        "unit": "years",
        "default": 30,
        "min": 18,
        "max": 65,
        "step": 1,
        "help": "Age at policy purchase."
      },
      {
        "key": "policyTerm",
        "label": "Policy term",
        "unit": "years",
        "default": 20,
        "min": 5,
        "max": 40,
        "step": 1,
        "help": "Duration of the policy in years."
      },
      {
        "key": "smokingStatus",
        "label": "Smoking status",
        "unit": "",
        "default": "non-smoker",
        "min": 0,
        "max": 1,
        "step": 1,
        "help": "Non-smoker rates are typically 30-40% lower than smoker rates."
      },
      {
        "key": "gender",
        "label": "Gender",
        "unit": "",
        "default": "female",
        "min": 0,
        "max": 1,
        "step": 1,
        "help": "Female premiums are typically lower than male premiums."
      }
    ],
    "outputs": [
      {
        "key": "annualPremium",
        "label": "Estimated annual premium",
        "formula": "coverageAmount * baseRate * ageFactor * genderFactor * smokingFactor",
        "format": "currency"
      },
      {
        "key": "monthlyPremium",
        "label": "Estimated monthly premium",
        "formula": "annualPremium / 12",
        "format": "currency"
      },
      {
        "key": "totalPremiumPaid",
        "label": "Total premiums over policy term",
        "formula": "annualPremium * policyTerm",
        "format": "currency"
      },
      {
        "key": "coverageMultiple",
        "label": "Coverage to premium ratio",
        "formula": "annualPremium > 0 ? coverageAmount / annualPremium : 0",
        "format": "ratio"
      }
    ],
    "formulaExplanation": "Premium is estimated using base rate per ₹1 lakh coverage, adjusted for age, gender, and smoking status. Term life: base rate ~₹300-500 per lakh. Health: base rate ~₹15-25 per lakh per year.",
    "example": "For a 30-year-old non-smoking female seeking ₹50 lakh term cover for 20 years, the estimated annual premium is approximately ₹8,000-12,000.",
    "faqs": [
      {
        "question": "How is term life insurance premium calculated?",
        "answer": "Term life premium depends on coverage amount, age, gender, smoking status, and policy term. Younger non-smokers pay significantly less. Premiums are typically ₹300-500 per ₹1 lakh coverage for term plans."
      },
      {
        "question": "What is the ideal coverage amount?",
        "answer": "A common rule is 15-20x your annual income. For example, if your annual income is ₹10 lakh, ideal coverage is ₹1.5-2 crore. Also consider outstanding loans and future expenses (education, retirement)."
      },
      {
        "question": "Should I buy term or endowment insurance?",
        "answer": "Term insurance provides pure coverage at low premiums. Endowment/money-back plans combine insurance with savings but have lower coverage per premium rupee. Financial advisors generally recommend term + separate investments."
      },
      {
        "question": "How does age affect insurance premiums?",
        "answer": "Premiums increase with age. A 25-year-old may pay 40-50% less than a 35-year-old for the same coverage. Buy early to lock in lower rates."
      },
      {
        "question": "What is the waiting period in health insurance?",
        "answer": "Most health policies have a 30-day waiting period for general claims and 30 days for pre-existing diseases (some insurers offer 2-4 years). Accidents are covered from day one."
      },
      {
        "question": "Can I get insurance after 50 years of age?",
        "answer": "Yes, but premiums are higher and coverage may be limited. Some insurers offer term plans up to age 65-70. Health insurance options are more limited for older applicants."
      }
    ],
    "related": [
      "income-tax-calculator-old-vs-new-regime-india",
      "80d-deduction-calculator-india",
      "emergency-fund-calculator-india"
    ],
    "quickAnswer": {
      "title": "Insurance Premium Calculator Quick Answer",
      "question": "How is insurance premium calculated?",
      "answer": "Premium is estimated based on coverage amount, age, gender, smoking status, and policy type. Younger non-smokers pay less. This is an educational estimate — actual premiums depend on insurer underwriting.",
      "note": "Educational estimate only. Consult an insurance advisor for accurate quotes."
    },
    "howToUse": [
      "Choose insurance type: Term, Health, or Life Insurance.",
      "Enter coverage amount, age, and policy term.",
      "Select gender and smoking status.",
      "Review estimated annual and monthly premiums.",
      "Compare total cost over policy term with coverage amount."
    ],
    "assumptions": [
      "Base rates are approximate and vary by insurer.",
      "No additional riders or add-ons included.",
      "No pre-existing medical conditions considered.",
      "Premiums are for annual payment mode.",
      "Educational estimate only — get actual quotes from insurers."
    ],
    "contentSections": [
      {
        "heading": "Why insurance matters",
        "body": "Insurance protects your family's financial future. Term life covers income replacement. Health insurance covers medical expenses. Without insurance, a single event can wipe out years of savings."
      },
      {
        "heading": "How much coverage do you need?",
        "body": "Calculate: outstanding loans + future expenses (education, marriage) + income replacement (15-20x annual income) - existing assets (FDs, investments). This gives your ideal coverage amount."
      },
      {
        "heading": "Term vs endowment: which to choose?",
        "body": "Term plans offer 5-10x more coverage per rupee of premium. Endowment plans mix insurance with savings but have lower coverage. Most advisors recommend term + separate investments for better returns."
      }
    ],
    "lastReviewed": "August 2026",
    "lastReviewedIso": "2026-08-10"
  },
  {
    "slug": "retirement-calculator-india",
    "name": "Retirement Calculator India",
    "seoTitle": "Retirement Calculator India 2026 — Corpus Needed & Monthly Savings",
    "category": "Planning",
    "status": "live",
    "targetKeyword": "retirement calculator india",
    "shortDescription": "Calculate retirement corpus needed, monthly savings required, and estimate retirement income from investments and pension.",
    "metaDescription": "Free retirement calculator India 2026. Estimate corpus needed for retirement, monthly savings, and retirement income from investments and NPS.",
    "inputs": [
      {
        "key": "currentAge",
        "label": "Current age",
        "unit": "years",
        "default": 30,
        "min": 22,
        "max": 65,
        "step": 1,
        "help": "Your current age."
      },
      {
        "key": "retirementAge",
        "label": "Retirement age",
        "unit": "years",
        "default": 60,
        "min": 55,
        "max": 70,
        "step": 1,
        "help": "Age at which you want to retire."
      },
      {
        "key": "expectedLifeAge",
        "label": "Expected life age",
        "unit": "years",
        "default": 85,
        "min": 75,
        "max": 95,
        "step": 1,
        "help": "Expected age of life (for corpus planning)."
      },
      {
        "key": "monthlyExpenseNow",
        "label": "Current monthly expenses",
        "unit": "₹",
        "default": 50000,
        "min": 10000,
        "step": 1000,
        "help": "Current monthly expenses (will reduce post-retirement)."
      },
      {
        "key": "expenseReductionPercent",
        "label": "Expense reduction post-retirement",
        "unit": "%",
        "default": 20,
        "min": 0,
        "max": 50,
        "step": 5,
        "help": "Expenses typically reduce 15-25% post-retirement (no EMI, travel, etc.)."
      },
      {
        "key": "inflationRate",
        "label": "Annual inflation rate",
        "unit": "%",
        "default": 6,
        "min": 2,
        "max": 10,
        "step": 0.5,
        "help": "Expected annual inflation rate."
      },
      {
        "key": "postRetirementReturn",
        "label": "Post-retirement investment return",
        "unit": "%",
        "default": 8,
        "min": 4,
        "max": 12,
        "step": 0.5,
        "help": "Expected return on retired corpus (debt + equity mix)."
      },
      {
        "key": "existingCorpus",
        "label": "Existing retirement corpus (₹)",
        "unit": "₹",
        "default": 0,
        "min": 0,
        "step": 10000,
        "help": "Current savings for retirement (PF, PPF, FDs, investments)."
      },
      {
        "key": "monthlySip",
        "label": "Monthly SIP towards retirement (₹)",
        "unit": "₹",
        "default": 10000,
        "min": 0,
        "step": 500,
        "help": "Current monthly SIP or savings towards retirement."
      },
      {
        "key": "sipReturn",
        "label": "Expected SIP return",
        "unit": "%",
        "default": 12,
        "min": 5,
        "max": 18,
        "step": 0.5,
        "help": "Expected return on pre-retirement investments."
      }
    ],
    "outputs": [
      {
        "key": "yearsToRetire",
        "label": "Years to retirement",
        "formula": "retirementAge - currentAge",
        "format": "number"
      },
      {
        "key": "monthlyExpenseAtRetirement",
        "label": "Monthly expenses at retirement (today's value)",
        "formula": "monthlyExpenseNow * (1 - expenseReductionPercent / 100)",
        "format": "currency"
      },
      {
        "key": "annualExpenseAtRetirement",
        "label": "Annual expenses at retirement (inflation-adjusted)",
        "formula": "monthlyExpenseNow * (1 - expenseReductionPercent / 100) * 12 * (1 + inflationRate / 100) ^ (retirementAge - currentAge)",
        "format": "currency"
      },
      {
        "key": "retirementCorpusNeeded",
        "label": "Retirement corpus needed (in today's terms)",
        "formula": "monthlyExpenseNow * (1 - expenseReductionPercent / 100) * 12 * (expectedLifeAge - retirementAge) / (postRetirementReturn / 100 - inflationRate / 100)",
        "format": "currency"
      },
      {
        "key": "futureCorpusNeeded",
        "label": "Retirement corpus needed (at retirement, inflation-adjusted)",
        "formula": "retirementCorpusNeeded * (1 + inflationRate / 100) ^ (retirementAge - currentAge)",
        "format": "currency"
      },
      {
        "key": "futureExistingCorpus",
        "label": "Future value of existing corpus",
        "formula": "existingCorpus * (1 + sipReturn / 100) ^ (retirementAge - currentAge)",
        "format": "currency"
      },
      {
        "key": "futureSipCorpus",
        "label": "Future value of monthly SIP",
        "formula": "monthlySip * (((1 + sipReturn / 12 / 100) ^ ((retirementAge - currentAge) * 12) - 1) / (sipReturn / 12 / 100)) * (1 + sipReturn / 12 / 100)",
        "format": "currency"
      },
      {
        "key": "totalFutureCorpus",
        "label": "Total projected retirement corpus",
        "formula": "futureExistingCorpus + futureSipCorpus",
        "format": "currency"
      },
      {
        "key": "corpusShortfall",
        "label": "Corpus shortfall (if any)",
        "formula": "futureCorpusNeeded > totalFutureCorpus ? futureCorpusNeeded - totalFutureCorpus : 0",
        "format": "currency"
      },
      {
        "key": "requiredMonthlySip",
        "label": "Required monthly SIP to meet target",
        "formula": "corpusShortfall > 0 ? (corpusShortfall - futureExistingCorpus) * (sipReturn / 12 / 100) / (((1 + sipReturn / 12 / 100) ^ ((retirementAge - currentAge) * 12) - 1) * (1 + sipReturn / 12 / 100)) : 0",
        "format": "currency"
      }
    ],
    "formulaExplanation": "Retirement corpus = (monthly expenses at retirement × years in retirement) / (post-retirement return - inflation rate). This uses the perpetuity formula assuming corpus lasts throughout retirement.",
    "example": "A 30-year-old earning ₹50,000/month wanting to retire at 60 with expenses reducing by 20% needs approximately ₹1.5-2 crore corpus (today's value) at 6% inflation and 8% post-retirement return.",
    "faqs": [
      {
        "question": "How much corpus do I need for retirement?",
        "answer": "A common estimate is 20-25x your annual expenses at retirement. For ₹50,000/month expenses (₹6 lakh/year), you need ₹1.2-1.5 crore at retirement (today's value). Adjust for inflation and desired lifestyle."
      },
      {
        "question": "When should I start planning for retirement?",
        "answer": "The earlier, the better. Starting at 25 vs 35 can reduce required monthly SIP by 40-50% due to compounding. Even small amounts invested early grow significantly."
      },
      {
        "question": "What investments are best for retirement?",
        "answer": "Pre-retirement: Equity mutual funds (SIP) for growth. Post-retirement: Debt instruments, annuities, and balanced portfolios. A common allocation is 60-70% equity pre-retirement, shifting to 30-40% equity post-retirement."
      },
      {
        "question": "Should I rely on NPS for retirement?",
        "answer": "NPS is a good retirement tool with tax benefits (80CCD). However, it may not be sufficient alone. Use NPS as part of a diversified retirement plan including PF, PPF, and mutual funds."
      },
      {
        "question": "What is the 4% rule in retirement planning?",
        "answer": "The 4% rule suggests withdrawing 4% of your retirement corpus annually (adjusted for inflation). For ₹1 crore corpus, this gives ₹4 lakh/year. It assumes corpus lasts 30+ years."
      },
      {
        "question": "How does inflation affect retirement planning?",
        "answer": "Inflation erodes purchasing power. ₹50,000/month today may need ₹1.2-1.5 lakh/month at retirement (6% inflation, 30 years). Always plan with inflation-adjusted expenses."
      }
    ],
    "related": [
      "sip-calculator-india",
      "ppf-calculator-india",
      "nps-calculator-india",
      "emergency-fund-calculator-india"
    ],
    "quickAnswer": {
      "title": "Retirement Calculator Quick Answer",
      "question": "How much do I need for retirement?",
      "answer": "Typically 20-25x your annual expenses at retirement. For ₹6 lakh/year expenses, you need ₹1.2-1.5 crore (today's value). Use our calculator for a personalized estimate.",
      "note": "Educational estimate. Actual needs depend on lifestyle, healthcare costs, and inflation."
    },
    "howToUse": [
      "Enter current age, retirement age, and expected life age.",
      "Enter current monthly expenses and expected reduction post-retirement.",
      "Enter existing corpus and current monthly SIP towards retirement.",
      "Review corpus needed, projected corpus, and shortfall.",
      "Adjust monthly SIP to close the gap."
    ],
    "assumptions": [
      "Expenses reduce post-retirement (no EMI, fewer discretionary expenses).",
      "Inflation is constant throughout the planning period.",
      "Returns are estimated — actual returns vary.",
      "No Social Security or pension income included.",
      "Healthcare costs not separately modeled."
    ],
    "contentSections": [
      {
        "heading": "Why retirement planning matters",
        "body": "India's average life expectancy is 70+ years. With retirement at 60, you may need funds for 25+ years. Inflation erodes purchasing power, making planning essential."
      },
      {
        "heading": "The power of starting early",
        "body": "Investing ₹5,000/month from age 25 at 12% returns gives ₹1.1 crore by 60. Starting at 35 requires ₹12,000/month for the same result. Time is your biggest advantage."
      },
      {
        "heading": "Common retirement mistakes",
        "body": "Underestimating expenses, ignoring inflation, not diversifying, relying only on PF/NPS, and starting too late. Plan 10-15 years before retirement."
      }
    ],
    "lastReviewed": "August 2026",
    "lastReviewedIso": "2026-08-10"
  },
  {
    "slug": "stock-portfolio-calculator-india",
    "name": "Stock Portfolio Calculator India",
    "seoTitle": "Stock Portfolio Calculator India — Returns, Gains & Dividends",
    "category": "Investments",
    "status": "live",
    "targetKeyword": "stock portfolio calculator india",
    "shortDescription": "Calculate stock portfolio returns, capital gains, dividend yield, and compare with benchmarks like Nifty 50 and Sensex.",
    "metaDescription": "Free stock portfolio calculator India. Track gains, losses, dividend income, and returns on your equity investments. Compare with Nifty 50.",
    "inputs": [
      {
        "key": "totalInvested",
        "label": "Total invested amount (₹)",
        "unit": "₹",
        "default": 500000,
        "min": 1000,
        "step": 1000,
        "help": "Total amount invested in stocks."
      },
      {
        "key": "currentValue",
        "label": "Current portfolio value (₹)",
        "unit": "₹",
        "default": 650000,
        "min": 0,
        "step": 1000,
        "help": "Current market value of your portfolio."
      },
      {
        "key": "totalDividendsReceived",
        "label": "Total dividends received (₹)",
        "unit": "₹",
        "default": 0,
        "min": 0,
        "step": 500,
        "help": "Total dividends received from holdings."
      },
      {
        "key": "holdingPeriodYears",
        "label": "Holding period (years)",
        "unit": "years",
        "default": 5,
        "min": 1,
        "max": 30,
        "step": 1,
        "help": "How long you have held the portfolio."
      }
    ],
    "outputs": [
      {
        "key": "totalGainLoss",
        "label": "Total capital gain/loss (₹)",
        "formula": "currentValue - totalInvested",
        "format": "currency"
      },
      {
        "key": "totalGainLossPercent",
        "label": "Total return % (capital only)",
        "formula": "totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0",
        "format": "percent"
      },
      {
        "key": "totalReturnWithDividends",
        "label": "Total return % (including dividends)",
        "formula": "totalInvested > 0 ? ((currentValue + totalDividendsReceived - totalInvested) / totalInvested) * 100 : 0",
        "