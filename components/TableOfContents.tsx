'use client';

import { useEffect, useState } from 'react';

type TocItem = {
  id: string;
  label: string;
  level: number;
};

type TableOfContentsProps = {
  items: TocItem[];
  title?: string;
  /** Adds an id used by the page's TableOfContents schema */
  id?: string;
};

/**
 * Reusable, responsive Table of Contents.
 * - Desktop: sticky right/left rail (lg+)
 * - Mobile/Tablet: collapsible disclosure below the heading
 * - Tracks active section while scrolling (scrollspy) for better AEO/UX
 */
export default function TableOfContents({ items, title = 'On this page', id = 'table-of-contents' }: TableOfContentsProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav id={id} aria-label="Table of contents" className="rounded-2xl border border-brandBorder bg-white text-sm shadow-card dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 font-bold text-brandDeepNavy dark:text-white lg:cursor-default lg:pointer-events-none"
      >
        <span>{title}</span>
        <svg aria-hidden="true" className={`h-4 w-4 transition-transform lg:hidden ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
        </svg>
      </button>
      <div className={`px-2 pb-2 lg:block ${open ? 'block' : 'hidden'}`}>
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
              <a
                href={`#${item.id}`}
                className={`block rounded-lg px-3 py-2 leading-snug transition ${
                  activeId === item.id
                    ? 'bg-brandBgSoft font-bold text-brandNavy dark:bg-slate-800 dark:text-brandBrightGreen'
                    : 'text-brandMuted hover:bg-brandBgSoft hover:text-brandNavy dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}