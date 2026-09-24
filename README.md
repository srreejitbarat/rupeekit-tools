# RupeeKit Tools

> Free personal finance calculators, guides, and educational resources for everyday Indians.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router, Static Site Generation)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Vanilla CSS animations
- **Hosting**: Hostinger VPS with Docker + Nginx; Cloudflare authoritative DNS

## 📦 Features

- **Free Calculators** — Salary in-hand, EMI, SIP, HRA, 80C deductions, and more
- **Blog** — Beginner-friendly personal finance guides with branded SVG visuals
- **Government Salary Updates** — State-wise DA, DR, pay revision tracking for govt employees
- **Money Health Check** — Self-assessment quiz for financial wellness
- **Start Here** — Curated onboarding page for new users
- **Resources** — 30-Day Budget Challenge and beginner guides

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

App runs at `http://localhost:3000`

## 📁 Project Structure

```
app/          → Pages & routes (Next.js App Router)
components/   → Reusable UI components
data/         → Static data (blog posts, tools, salary updates)
lib/          → Utility functions
public/       → Static assets
automation/   → n8n workflow configs
scripts/      → Helper scripts
```

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values.

## 📜 License

MIT — see [LICENSE](./LICENSE)

---

> **Disclaimer**: RupeeKit content is for general educational information only and is not financial, tax, legal, or investment advice.
