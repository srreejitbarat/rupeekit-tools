'use client';

import Link from 'next/link';
import type { BlogPost } from '@/data/blog-posts';
import TableOfContents from './TableOfContents';
import FAQSection from './FAQSection';
import FinanceDisclaimer from './FinanceDisclaimer';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import EditorialByline from '@/components/seo/EditorialByline';

const statuses = [
  ['Active', 14433],
  ['Cancelled', 22476],
  ['Expired', 15184],
] as const;

const fees = [
  ['FC-3A registration', 10000],
  ['FC-3B prior permission', 5000],
  ['FC-3C renewal', 5000],
  ['Revision application', 3000],
] as const;

const filingSteps = [
  ['Choose the service', 'Use New Registration for FC-3A or FC-3B. Existing associations use Registered Associations for renewal, FC-4 annual returns and FC-6 changes.'],
  ['Sign up or log in', 'New users select Sign Up. Existing users enter PAN or their user ID, password and CAPTCHA.'],
  ['Prepare organisation records', 'Keep PAN, NGO Darpan ID, registration papers, governing-body details and key-functionary records ready.'],
  ['Select purpose and location', 'Choose the exact purpose and every State or Union Territory where the foreign-funded activity will happen.'],
  ['Add the SBI FCRA account', 'Foreign contribution must first enter the designated SBI New Delhi Main Branch FCRA account.'],
  ['Upload and verify documents', 'Check OCR-extracted data, complete required authentication, pay the applicable fee and e-sign.'],
  ['Submit and track', 'Save the acknowledgement and application reference number, then use Track Application for status and clarifications.'],
] as const;

function PortalMock({ login = false }: { login?: boolean }) {
  return (
    <figure className="my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <div className="flex items-center gap-2 border-b bg-slate-100 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-slate-300"/><span className="h-3 w-3 rounded-full bg-slate-300"/><span className="h-3 w-3 rounded-full bg-slate-300"/>
        <div className="ml-2 flex-1 rounded-lg bg-white px-3 py-1.5 text-[11px] text-slate-500">fcraonline.gov.in</div>
      </div>
      <div className="p-5 md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ministry of Home Affairs · Government of India</p>
        <h3 className="mt-1 text-2xl font-black text-brandDeepNavy">FCRA Online</h3>
        {login ? (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border bg-slate-50 p-5">
            <h4 className="text-center font-black text-brandDeepNavy">Login to your Account</h4>
            {['User ID (PAN / Existing User ID)', 'Password', 'Enter CAPTCHA'].map((label) => <div key={label} className="mt-4"><p className="mb-1 text-xs font-semibold text-slate-600">{label}</p><div className="h-10 rounded-lg border bg-white"/></div>)}
            <div className="mt-5 rounded-lg bg-brandGrowthGreen py-2.5 text-center text-sm font-bold text-white">Login</div>
            <p className="mt-4 text-center text-xs text-slate-500">Don&apos;t have an account? <b className="text-brandNavy">Sign Up</b></p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['Foreign Hospitality', 'FC-2 applications'],
              ['New Registration', 'FC-3A and FC-3B'],
              ['Registered Associations', 'Renewal, FC-4 and FC-6'],
            ].map(([title, detail]) => <div key={title} className="rounded-2xl border p-5 shadow-sm"><div className="h-10 w-10 rounded-xl bg-brandNavy/10"/><h4 className="mt-4 font-black text-brandDeepNavy">{title}</h4><p className="mt-2 text-xs text-slate-600">{detail}</p></div>)}
          </div>
        )}
      </div>
      <figcaption className="border-t bg-slate-50 px-5 py-3 text-xs text-slate-600">Explanatory recreation of the live FCRA 2.0 portal interface researched on 5 August 2026. Use the official portal for filing.</figcaption>
    </figure>
  );
}

function StatusChart() {
  const max = Math.max(...statuses.map(([, value]) => value));
  return <figure className="my-8 rounded-3xl border p-6 shadow-sm"><h3 className="text-lg font-black text-brandDeepNavy">FCRA certificate status snapshot</h3><p className="mt-1 text-xs text-slate-600">Counts displayed by the official portal during research.</p><div className="mt-6 space-y-5">{statuses.map(([label, value]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><b>{label}</b><b>{new Intl.NumberFormat('en-IN').format(value)}</b></div><div className="h-4 rounded-full bg-slate-100"><div className="h-4 rounded-full bg-brandNavy" style={{width:`${value/max*100}%`}}/></div></div>)}</div><figcaption className="mt-5 text-xs text-slate-500">Source: Ministry of Home Affairs FCRA Online portal. Live counts may change.</figcaption></figure>;
}

function FeeChart() {
  const max = 10000;
  return <figure className="my-8 rounded-3xl border p-6 shadow-sm"><h3 className="text-lg font-black text-brandDeepNavy">Portal application fees</h3><div className="mt-6 space-y-4">{fees.map(([label,value]) => <div key={label} className="grid gap-2 sm:grid-cols-[180px_1fr_80px] sm:items-center"><span className="text-xs font-bold">{label}</span><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-brandGrowthGreen" style={{width:`${value/max*100}%`}}/></div><b className="text-right text-sm">₹{new Intl.NumberFormat('en-IN').format(value)}</b></div>)}</div><figcaption className="mt-5 text-xs text-slate-500">Verify the final fee on the official portal; extra purpose or State/UT charges may apply.</figcaption></figure>;
}

function FilingGuide() {
  return <div className="my-8 rounded-3xl border bg-slate-50 p-6"><h3 className="text-xl font-black text-brandDeepNavy">Login-to-filing walkthrough</h3><ol className="mt-5 space-y-4">{filingSteps.map(([title,detail],index) => <li key={title} className="grid grid-cols-[36px_1fr] gap-4 rounded-2xl bg-white p-4 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brandNavy text-sm font-black text-white">{index+1}</span><div><h4 className="font-black text-brandDeepNavy">{title}</h4><p className="mt-1 text-sm leading-relaxed text-slate-600">{detail}</p></div></li>)}</ol><div className="mt-6 flex flex-wrap gap-3"><a href="https://fcraonline.gov.in/" target="_blank" rel="noreferrer" className="rounded-full bg-brandNavy px-5 py-2.5 text-xs font-bold text-white">Open official portal</a><a href="https://fcraonline.gov.in/Home/RequiredDocument.aspx" target="_blank" rel="noreferrer" className="rounded-full border border-brandNavy px-5 py-2.5 text-xs font-bold text-brandNavy">Open login page</a></div></div>;
}

export default function FcraArticleLayout({ post }: { post: BlogPost }) {
  const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-');
  return <div className="mx-auto max-w-6xl px-4 py-8">
    <nav className="mb-6 flex gap-2 text-xs text-brandMuted"><Link href="/">Home</Link><span>/</span><Link href="/blog">Blog</Link><span>/</span><span className="truncate">{post.title}</span></nav>
    <header className="overflow-hidden rounded-[2rem] border bg-brandDeepNavy shadow-xl"><div className="grid lg:grid-cols-[1.05fr_.95fr]"><div className="bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 p-8 text-white md:p-11"><span className="rounded-full border border-brandGrowthGreen/30 bg-brandGrowthGreen/15 px-3 py-1 text-xs font-bold uppercase text-brandBrightGreen">{post.category}</span><h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">{post.h1}</h1><p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">{post.metaDescription}</p><p className="mt-6 text-xs text-slate-300">Published: {post.date} · {post.readTime}</p></div><div className="self-center bg-white"><img src={post.heroImage || '/images/blog/fcra-2-0-india-2026-guide-v2.png'} alt={post.heroImageAlt || post.h1} className="block h-auto w-full"/></div></div></header>
    <EditorialByline className="mt-6" publishedIso={post.publishedDateISO} updatedIso={post.modifiedDateISO} updatedFallback={post.date}/>
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.36fr]"><article className="flex flex-col gap-8"><div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"><p className="text-lg font-medium leading-relaxed text-slate-800">{post.intro}</p>{post.quickAnswer && <div className="mt-6"><QuickAnswerBox title={post.quickAnswer.title || 'Quick Answer'} question={post.quickAnswer.question} answer={post.quickAnswer.answer} note={post.quickAnswer.note} links={post.quickAnswer.links}/></div>}<AnswerEngineSummary className="mt-6" summary={post.answerEngineSummary || post.intro}/><div className="my-8 grid gap-4 sm:grid-cols-3">{[['14,500 approx.','Active organisations'],['15,000–20,000','Applications per year'],['17,000 approx.','Annual returns per year']].map(([v,l]) => <div key={l} className="rounded-2xl border bg-brandNavy/[.03] p-5"><p className="text-2xl font-black text-brandNavy">{v}</p><p className="mt-2 text-xs font-semibold text-slate-600">{l}</p></div>)}</div><StatusChart/><PortalMock/><div className="mt-8 space-y-10">{post.sections.map(section => <section key={section.title} id={slugify(section.title)} className="scroll-mt-24 border-t pt-8"><h2 className="text-2xl font-black text-brandDeepNavy">{section.title}</h2>{section.paragraphs.map(p => <p key={p} className="mt-4 leading-relaxed text-slate-700">{p}</p>)}{section.bullets && <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">{section.bullets.map(b => <li key={b}>{b}</li>)}</ul>}{section.example && <div className="mt-5 rounded-2xl border bg-brandNavy/[.02] p-5"><b className="uppercase text-brandDeepNavy">Practical example: {section.example.title}</b><p className="mt-2 text-sm text-slate-700">{section.example.details}</p></div>}{section.title === 'FCRA 2.0 is not one new law' && <FeeChart/>}{section.title === 'What the FCRA 2.0 portal changes' && <><PortalMock login/><FilingGuide/></>}</section>)}</div></div><FAQSection faqs={post.faqs}/><FinanceDisclaimer/></article><aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start"><TableOfContents sections={post.sections}/><div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-black text-brandDeepNavy">Primary sources</h3><ul className="mt-4 space-y-3 text-xs text-slate-600"><li><a className="font-bold text-brandNavy" href="https://fcraonline.gov.in/">MHA FCRA Online portal</a></li><li><a className="font-bold text-brandNavy" href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2279410&lang=1&reg=48">PIB portal-launch release</a></li><li><a className="font-bold text-brandNavy" href="https://fcraonline.nic.in/home/PDF_Doc/fc_gaz_23062026.pdf">Official Gazette rules</a></li><li><a className="font-bold text-brandNavy" href="https://prsindia.org/billtrack/the-foreign-contribution-regulation-amendment-bill-2026">PRS Bill analysis</a></li></ul></div></aside></div>
  </div>;
}
