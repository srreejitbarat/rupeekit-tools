export const preEmiSources = [
  {
    label: "RBI housing-loan FAQ: disbursement, pre-EMI and EMI",
    href: "https://www.rbi.org.in/commonperson/english/scripts/FAQs.aspx?Id=701",
  },
  {
    label:
      "RBI Fair Practices Code: charging interest from actual disbursement",
    href: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12678&Mode=0",
  },
  {
    label: "ICICI Bank: home-loan EMI and pre-EMI explanation",
    href: "https://www.icici.bank.in/personal-banking/loans/home-loan/emi-calculator",
  },
];
export const preEmiFaqs = [
  {
    question: "What is pre-EMI, and how is it calculated?",
    answer:
      "Pre-EMI is interest paid on the amount of a home loan already disbursed before regular EMI begins. For a complete month at a monthly rate, the estimate is outstanding disbursed principal × annual interest rate ÷ 12. A ₹12 lakh outstanding balance at 8.5% gives ₹8,500 for a full month. Actual charges depend on disbursement dates and the lender’s interest convention.",
  },
  {
    question: "Is pre-EMI better than full EMI?",
    answer:
      "Pre-EMI can leave more cash available during construction, but interest-only payments do not reduce principal. Starting principal repayment earlier can reduce total interest while putting more pressure on monthly cash. Compare both the cash remaining and the debt remaining on the same date, along with your reserve and your lender’s terms.",
  },
  {
    question: "Does a possession delay always increase loan interest?",
    answer:
      "No. A possession-only delay can add rent without changing loan interest if the disbursement and repayment dates stay the same. If construction milestones and full EMI commencement also move, interest can change. This planner lets you model those two cases separately.",
  },
  {
    question: "Can I include rent, builder payments and an emergency reserve?",
    answer:
      "Yes. Enter rent and its yearly rise, your income and expenses, liquid cash, a protected reserve and move-in costs. In each tranche, enter the bank’s percentage separately from your own builder contribution. Bank disbursements go towards the property and are not treated as household income.",
  },
  {
    question: "How does reserve-protected prepayment work?",
    answer:
      "The planner limits optional extra payments to the cash left above your chosen reserve after that month’s mandatory payments and income. It does not forecast and reserve every future expense before making a prepayment. A later builder demand, income pause or move-in bill can still create a shortfall.",
  },
  {
    question:
      "Why do the three repayment strategies have different payoff dates?",
    answer:
      "The model starts the entered repayment tenure at the full-EMI start month for pre-EMI and at the first draw for early EMI. New tranches and interest-rate resets can change instalments. Actual lender rules may differ; the same-date comparison keeps the cash and debt trade-off visible.",
  },
  {
    question:
      "Does the calculator include tax benefits or exact daily interest?",
    answer:
      "No. It is a monthly, before-tax cash-planning estimate with draws at the start of each month. It does not calculate mid-month interest, tax deductions, fees, penalties or compensation from the builder. Verify the bank’s daily interest schedule and enter extra upfront expenses in your own-cash budget.",
  },
  {
    question: "Can I save or share my plan without signing up?",
    answer:
      "Yes. Save a copy on this browser, download a reusable JSON plan file, export the complete monthly CSV, or request a PDF comparison. Calculations and local downloads run in the browser. A PDF request sends the plan to RupeeKit’s server for processing without storing it. The Share calculator button shares the public page without your financial inputs.",
  },
];
export const lenderQuestions = [
  "When does regular EMI begin: final disbursement, a fixed date, or a moratorium limit?",
  "Can I pay EMI on the disbursed balance or full sanction during construction?",
  "On a new tranche or rate reset, will the bank change EMI, tenure, or both?",
  "How are mid-month disbursements and optional prepayments reflected in daily interest?",
  "Which own contributions, charges and possession costs are due, and on what dates?",
];
