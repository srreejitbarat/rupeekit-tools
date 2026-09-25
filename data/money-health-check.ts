export interface MoneyHealthQuestion {
  id: number;
  text: string;
  category: string;
}

export const moneyHealthQuestions: MoneyHealthQuestion[] = [
  { id: 1, text: 'Do you track your monthly expenses?', category: 'Tracking' },
  { id: 2, text: 'Do you follow a structured monthly budget?', category: 'Budgeting' },
  { id: 3, text: 'Do you have a dedicated emergency fund covering at least 3 months of expenses?', category: 'Savings' },
  { id: 4, text: 'Do you save a portion of your income systematically before spending?', category: 'Savings' },
  { id: 5, text: 'Do you know your exact monthly debt payments and total liabilities?', category: 'Debt' },
  { id: 6, text: 'Do you review subscriptions or recurring expenses at least once a quarter?', category: 'Audit' },
  { id: 7, text: 'Do you understand the difference between saving and investing?', category: 'Investing' },
  { id: 8, text: 'Do you have a basic money goal for the next 30 days?', category: 'Mindset' },
];

// Score bands used by the quiz results (score = share of "yes" answers).
export const moneyHealthBands = [
  { range: '0–39', category: 'Getting Started' },
  { range: '40–59', category: 'Building Awareness' },
  { range: '60–79', category: 'On Track' },
  { range: '80–100', category: 'Strong Foundation' },
];
