'use client';

import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  sections: { title: string }[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Table of Contents with scrollspy (AEO-friendly).
 * - Desktop (lg+): static linked list inside the sticky sidebar rail.
 * - Mobile/Tablet: collapsible disclosure; active section is tracked while scrolling.
 */
export default function TableOfContents({ sections }: TableOfContentsProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(() => {
    const first = sections[0]?.title;
    return first ? slugify(first) : '';
  });

  const items = sections.map((section) => ({
    id: slugify(section.title),
    label: section.title,
  }));

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
    <div className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left lg:cursor-default lg:pointer-events-none"
      >
        <h3 className="text-base font-bold text-brandDeepNavy uppercase tracking-wider">
          Table of Contents
        </h3>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-brandMuted transition-transform lg:hidden ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      <div className={`mt-2 lg:block ${open ? 'block' : 'hidden'}`}>
        <nav aria-label="Table of contents">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} className="leading-snug">
                <a
                  href={`#${item.id}`}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    activeId === item.id
                      ? 'bg-brandBgSoft font-bold text-brandNavy'
                      : 'font-medium text-brandMuted hover:bg-brandBgSoft hover:text-brandNavy hover:underline'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}