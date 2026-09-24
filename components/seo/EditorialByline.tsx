import Link from 'next/link';

import {
  EDITORIAL_TEAM_NAME,
  formatBylineDate,
} from '@/lib/seo/editorial';
import LatestOfficialUpdateLink from '@/components/seo/LatestOfficialUpdateLink';

type EditorialBylineProps = {
  /** ISO date the page was first published. */
  publishedIso?: string | null;
  /** ISO date of the most recent review or update. */
  updatedIso?: string | null;
  /** Rendered when no usable ISO date is available (e.g. "August 2026"). */
  updatedFallback?: string | null;
  className?: string;
};

/**
 * Visible authorship and review line for YMYL pages.
 *
 * The 2025-26 core updates penalised finance pages that publish with no stated
 * author or review process, so this renders alongside the `author` /
 * `reviewedBy` JSON-LD rather than instead of it.
 */
export default function EditorialByline({
  publishedIso,
  updatedIso,
  updatedFallback,
  className,
}: EditorialBylineProps) {
  const published = formatBylineDate(publishedIso);
  const updated = formatBylineDate(updatedIso) ?? updatedFallback ?? null;

  return (
    <>
      <div
        className={[
          'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brandMuted dark:text-slate-400',
          className ?? '',
        ]
          .join(' ')
          .trim()}
      >
        <span>
          Written and reviewed by{' '}
          <Link
            href="/editorial-policy"
            className="font-semibold text-brandNavy underline underline-offset-2 hover:text-brandDeepNavy dark:text-slate-200 dark:hover:text-white"
          >
            {EDITORIAL_TEAM_NAME}
          </Link>
        </span>
        {published ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Published {published}</span>
          </>
        ) : null}
        {updated && updated !== published ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Last reviewed {updated}</span>
          </>
        ) : null}
        <span aria-hidden="true">·</span>
        <Link
          href="/corrections-policy"
          className="underline underline-offset-2 hover:text-brandNavy dark:hover:text-white"
        >
          Report a correction
        </Link>
      </div>
      <LatestOfficialUpdateLink />
    </>
  );
}
