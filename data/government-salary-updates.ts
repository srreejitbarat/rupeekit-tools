export interface GovernmentSalaryUpdate {
  id: string;
  title: string;
  slug: string;
  category: "DA Update" | "Pay Revision" | "Pension" | "Allowances" | "Arrears" | "Circular";
  state: string;
  employeeGroup: string;
  updateType: string;
  sourceName: string;
  sourceUrl?: string;
  publishedDate: string;
  effectiveDate: string;
  summary: string;
  whyItMatters: string;
  whoMayBeAffected: string;
  actionToVerify: string;
  relatedLinks: { label: string; href: string }[];
  tags: string[];
  status: "official" | "explainer" | "sample";
}

export const governmentSalaryUpdates: GovernmentSalaryUpdate[] = [
  {
    id: "cg-da-dr-update-2025",
    title: "Central Government Dearness Allowance (DA) & DR Revision Format",
    slug: "central-government-da-dr-revision-format",
    category: "DA Update",
    state: "Central Government",
    employeeGroup: "Central Govt Employees & Pensioners",
    updateType: "Dearness Allowance / Dearness Relief",
    sourceName: "Ministry of Finance, Department of Expenditure",
    sourceUrl: "https://doe.gov.in",
    publishedDate: "2025-03-15",
    effectiveDate: "2025-01-01",
    summary: "This represents the standard biannual revision format for Dearness Allowance (DA) for active central government employees and Dearness Relief (DR) for pensioners, calculated using the All India Consumer Price Index (AICPI-IW).",
    whyItMatters: "DA adjustments offset inflation. It directly increases the monthly gross salary of employees and monthly payouts for retirees.",
    whoMayBeAffected: "Around 4.8 million central government employees and over 6.7 million pensioners.",
    actionToVerify: "Check the official Department of Expenditure (DoE) website for the signed Office Memorandum (OM) specifying the exact percentage increase.",
    relatedLinks: [
      { label: "Department of Expenditure Official Site", href: "https://doe.gov.in" },
      { label: "AICPI Portal", href: "https://labourbureau.gov.in" }
    ],
    tags: ["DA", "DR", "Central Govt", "AICPI"],
    status: "sample"
  },
  {
    id: "wb-da-tracker-2025",
    title: "West Bengal State Dearness Allowance (DA) Tracker Format",
    slug: "west-bengal-da-tracker-format",
    category: "DA Update",
    state: "West Bengal",
    employeeGroup: "West Bengal State Government Employees",
    updateType: "Dearness Allowance",
    sourceName: "West Bengal Finance Department (Audit Branch)",
    sourceUrl: "https://wbfin.gov.in",
    publishedDate: "2025-04-10",
    effectiveDate: "2025-04-01",
    summary: "A demo tracking structure showing West Bengal state government employees' Dearness Allowance adjustments, which are periodically notified via executive orders from the Audit Branch of the State Finance Department.",
    whyItMatters: "West Bengal state employees calculate DA updates relative to basic pay adjustments determined by the state's latest pay rules.",
    whoMayBeAffected: "All state government employees, school teachers, non-teaching staff, and employees of state-aided institutions.",
    actionToVerify: "Locate the official notification under the 'Government Orders' section on the WB Finance Department portal.",
    relatedLinks: [
      { label: "WB Finance Department Portal", href: "https://wbfin.gov.in" }
    ],
    tags: ["West Bengal", "DA", "State Employees"],
    status: "sample"
  },
  {
    id: "mah-salary-update-2025",
    title: "Maharashtra State Government Employee Salary Update Layout",
    slug: "maharashtra-salary-update-layout",
    category: "Circular",
    state: "Maharashtra",
    employeeGroup: "Maharashtra State Civil Services",
    updateType: "Salary Disbursement & Allowances",
    sourceName: "Government of Maharashtra Finance Department",
    sourceUrl: "https://maharashtra.gov.in",
    publishedDate: "2025-05-02",
    effectiveDate: "2025-06-01",
    summary: "Sample format explaining the tracking of basic pay scales, local allowances, and pension distributions under the Maharashtra Civil Services Rules.",
    whyItMatters: "Ensures uniform implementation of dearness updates and house rent allowance classifications across different cities in Maharashtra (Category X, Y, Z).",
    whoMayBeAffected: "Over 1.7 million state government employees, including gazetted officers and municipal staff.",
    actionToVerify: "Check the official Maharashtra Government Resolution (GR) portal using code-based filtering for the Finance Department.",
    relatedLinks: [
      { label: "Maharashtra GR Database", href: "https://gr.maharashtra.gov.in" }
    ],
    tags: ["Maharashtra", "GR", "Civil Services", "Salary"],
    status: "sample"
  },
  {
    id: "kar-pay-revision-2025",
    title: "Karnataka Pay Revision Tracker & Pay Commission Format",
    slug: "karnataka-pay-revision-tracker-format",
    category: "Pay Revision",
    state: "Karnataka",
    employeeGroup: "Karnataka State Govt Employees & Autonomous Bodies",
    updateType: "Pay Commission / Revision of Pay Scales",
    sourceName: "Karnataka State Finance Department",
    sourceUrl: "https://finance.karnataka.gov.in",
    publishedDate: "2025-02-28",
    effectiveDate: "2024-08-01",
    summary: "Demonstration format outlining the alignment of Karnataka state pay scales with recommendations from State Pay Commissions, covering basic pay restructuring and fitment formulas.",
    whyItMatters: "Pay revision updates restructure the fundamental pay matrix, influencing HRA, DA, and retirement gratuity limits.",
    whoMayBeAffected: "Active state employees, university staff, and aided educational institutional workers in Karnataka.",
    actionToVerify: "Verify the official Government Order (GO) issued by the Finance Department (Services-2) on their official web repository.",
    relatedLinks: [
      { label: "Karnataka Finance Department", href: "https://finance.karnataka.gov.in" }
    ],
    tags: ["Karnataka", "Pay Commission", "Basic Pay", "Fitment"],
    status: "sample"
  },
  {
    id: "tn-allowance-update-2025",
    title: "Tamil Nadu State Employee Allowance Update Format",
    slug: "tamil-nadu-allowance-update-format",
    category: "Allowances",
    state: "Tamil Nadu",
    employeeGroup: "Tamil Nadu State Employees & Teachers",
    updateType: "Special Allowances & HRA",
    sourceName: "Government of Tamil Nadu Finance Department",
    sourceUrl: "https://finance.tn.gov.in",
    publishedDate: "2025-03-20",
    effectiveDate: "2025-04-01",
    summary: "Model tracking layout for Tamil Nadu state employee allowances, including medical allowance, house rent allowance updates, and city compensatory allowance metrics.",
    whyItMatters: "Adjustments in allowances change the net take-home salary structure, separately from basic pay or dearness allowance rates.",
    whoMayBeAffected: "State government departments, primary school teachers, and cooperative society staff.",
    actionToVerify: "Review the Tamil Nadu Government Gazette or check direct Finance Department circular announcements.",
    relatedLinks: [
      { label: "Tamil Nadu Finance Department", href: "https://finance.tn.gov.in" }
    ],
    tags: ["Tamil Nadu", "Allowances", "Medical Allowance", "HRA"],
    status: "sample"
  },
  {
    id: "ker-pension-dr-2025",
    title: "Kerala Pension & Dearness Relief (DR) Update Format",
    slug: "kerala-pension-dr-update-format",
    category: "Pension",
    state: "Kerala",
    employeeGroup: "Kerala Government Pensioners & Family Pensioners",
    updateType: "Pension & Dearness Relief",
    sourceName: "Kerala Finance (Pension) Department",
    sourceUrl: "https://finance.kerala.gov.in",
    publishedDate: "2025-01-15",
    effectiveDate: "2025-01-01",
    summary: "Educational format showing how Dearness Relief (DR) revisions are tracked and applied to base pension and family pensions for retired Kerala state personnel.",
    whyItMatters: "Determines the net monthly deposit for pensioners and addresses issues such as commutation factors and medical benefits (MEDISEP).",
    whoMayBeAffected: "Retired civil servants, teachers, police personnel, and family pension recipients in Kerala.",
    actionToVerify: "Check the 'Pension & Treasury Orders' section of the Kerala Finance Department website.",
    relatedLinks: [
      { label: "Kerala Finance Department Portal", href: "https://finance.kerala.gov.in" },
      { label: "PRISM Kerala Pension Portal", href: "https://prism.kerala.gov.in" }
    ],
    tags: ["Kerala", "Pension", "DR", "MEDISEP"],
    status: "sample"
  },
  {
    id: "tel-pay-revision-2025",
    title: "Telangana Employee Pay Update Tracker Layout",
    slug: "telangana-employee-pay-update-tracker-layout",
    category: "Pay Revision",
    state: "Telangana",
    employeeGroup: "Telangana Public Servants & Gazetted Officers",
    updateType: "Pay Revision Commission (PRC)",
    sourceName: "Finance Department, Government of Telangana",
    sourceUrl: "https://finance.telangana.gov.in",
    publishedDate: "2025-04-05",
    effectiveDate: "2025-05-01",
    summary: "Sample layout to demonstrate how Telangana state government employees can track the progress of Pay Revision Commission recommendations and fitment increments.",
    whyItMatters: "PRC updates define the baseline salary scale for state-level employees for subsequent years.",
    whoMayBeAffected: "State government departments, local body employees, and teachers.",
    actionToVerify: "Consult the Telangana Treasury and Accounts portal (IFMIS) or official GO updates.",
    relatedLinks: [
      { label: "Telangana Finance Department", href: "https://finance.telangana.gov.in" }
    ],
    tags: ["Telangana", "PRC", "Salary Scales", "Fitment"],
    status: "sample"
  },
  {
    id: "odi-da-tracker-2025",
    title: "Odisha State Dearness Allowance Update Tracker Format",
    slug: "odisha-state-da-tracker-format",
    category: "DA Update",
    state: "Odisha",
    employeeGroup: "Odisha State Government Employees",
    updateType: "Dearness Allowance",
    sourceName: "Odisha Finance Department",
    sourceUrl: "https://finance.odisha.gov.in",
    publishedDate: "2025-03-30",
    effectiveDate: "2025-01-01",
    summary: "Demo tracking entry illustrating Odisha state government employees' dearness allowance percentage alignment with AICPI indicators.",
    whyItMatters: "Calculates the revised monthly dearness factor to determine gross pay and dearness pension adjustments.",
    whoMayBeAffected: "All regular state government employees and pensioners in Odisha.",
    actionToVerify: "Locate office orders on the Odisha Finance Department portal under 'Notifications'.",
    relatedLinks: [
      { label: "Odisha Finance Department", href: "https://finance.odisha.gov.in" }
    ],
    tags: ["Odisha", "DA", "State Employees"],
    status: "sample"
  },
  {
    id: "up-salary-circular-2025",
    title: "Uttar Pradesh Employee Pay Circular Tracker Format",
    slug: "uttar-pradesh-employee-pay-circular-format",
    category: "Circular",
    state: "Uttar Pradesh",
    employeeGroup: "UP State Teachers, Police & Civil Personnel",
    updateType: "State Salary Rules & General Circulars",
    sourceName: "Finance Department, Government of Uttar Pradesh",
    sourceUrl: "https://shasanadesh.up.gov.in",
    publishedDate: "2025-05-10",
    effectiveDate: "2025-05-01",
    summary: "Sample format for tracking general state guidelines regarding grade pay, salary calculations, and treasury rules for Uttar Pradesh.",
    whyItMatters: "Defines rules for annual increments, pay scale upgrades, and promotion allowances.",
    whoMayBeAffected: "Over 2.2 million state employees, government school teachers, and state police forces.",
    actionToVerify: "Use the official UP Shasanadesh verification portal with the document ID to review verified circulars.",
    relatedLinks: [
      { label: "UP Shasanadesh Portal", href: "https://shasanadesh.up.gov.in" }
    ],
    tags: ["Uttar Pradesh", "Shasanadesh", "Circular", "Increment"],
    status: "sample"
  },
  {
    id: "raj-pension-tracker-2025",
    title: "Rajasthan Pension & DR Revision Tracker Layout",
    slug: "rajasthan-pension-tracker-layout",
    category: "Pension",
    state: "Rajasthan",
    employeeGroup: "Rajasthan State Pensioners",
    updateType: "Pension & Old Pension Scheme (OPS) / NPS Updates",
    sourceName: "Finance Department, Government of Rajasthan",
    sourceUrl: "https://finance.rajasthan.gov.in",
    publishedDate: "2025-02-15",
    effectiveDate: "2025-01-01",
    summary: "Educational tracking template representing how retired Rajasthan civil service personnel can track pension updates, relief rates, and retirement benefits.",
    whyItMatters: "Directly relates to monthly pension calculation rules, family pension eligibility criteria, and medical scheme parameters (RGHS).",
    whoMayBeAffected: "All retired employees of the Government of Rajasthan.",
    actionToVerify: "Check the Rajasthan Integrated Financial Management System (IFMS) portal or Finance Department orders.",
    relatedLinks: [
      { label: "Rajasthan Finance Department", href: "https://finance.rajasthan.gov.in" },
      { label: "Rajasthan Pension Portal", href: "https://pension.raj.nic.in" }
    ],
    tags: ["Rajasthan", "Pension", "DR", "OPS"],
    status: "sample"
  },
  {
    id: "asm-employee-da-2025",
    title: "Assam State Employee Update Tracker Format",
    slug: "assam-state-employee-update-tracker-format",
    category: "DA Update",
    state: "Assam",
    employeeGroup: "Assam State Civil Service & Secondary Teachers",
    updateType: "Dearness Allowance & Arrears Payments",
    sourceName: "Government of Assam Finance Department",
    sourceUrl: "https://finance.assam.gov.in",
    publishedDate: "2025-04-18",
    effectiveDate: "2025-01-01",
    summary: "Sample dearness allowance adjustment layout for Assam, detailing tracking of arrears payouts split across distinct financial quarters.",
    whyItMatters: "Highlights tracking rules for arrears where backdated increases are credited to the General Provident Fund (GPF) or bank accounts.",
    whoMayBeAffected: "All state employees in Assam, provincialized school staff, and university personnel.",
    actionToVerify: "Verify the official Office Memorandum published by the Assam Finance (Estt-A) department.",
    relatedLinks: [
      { label: "Assam Finance Department", href: "https://finance.assam.gov.in" }
    ],
    tags: ["Assam", "DA", "Arrears", "GPF"],
    status: "sample"
  },
  {
    id: "del-payroll-update-2025",
    title: "Delhi Government Employee Payroll Update Format",
    slug: "delhi-government-employee-payroll-format",
    category: "Circular",
    state: "Delhi",
    employeeGroup: "GNCTD Employees, Teachers & Municipal Workers",
    updateType: "Payroll System & Grade Pay Rules",
    sourceName: "Finance Department, Govt of NCT of Delhi",
    sourceUrl: "https://finance.delhi.gov.in",
    publishedDate: "2025-05-12",
    effectiveDate: "2025-06-01",
    summary: "A demo tracking structure explaining administrative decisions regarding payroll disbursements, contract staff extensions, and Grade Pay alignment in Delhi.",
    whyItMatters: "Provides structure for tracking salary timelines and allowance caps in municipal corporations and metropolitan schools.",
    whoMayBeAffected: "Employees under the Government of NCT of Delhi (GNCTD) and municipal corporations.",
    actionToVerify: "Check the 'Orders & Circulars' database on the Delhi Finance Department official web portal.",
    relatedLinks: [
      { label: "Delhi Finance Department Portal", href: "https://finance.delhi.gov.in" }
    ],
    tags: ["Delhi", "GNCTD", "Payroll", "Salary Rules"],
    status: "sample"
  }
];

// Sample entries are editorial templates, not verified public updates. Keep a
// single indexable collection so the hub, detail routes, and sitemap cannot
// accidentally expose a sample URL with conflicting crawl directives.
export const indexableGovernmentSalaryUpdates = governmentSalaryUpdates.filter(
  (update) => update.status !== "sample"
);
