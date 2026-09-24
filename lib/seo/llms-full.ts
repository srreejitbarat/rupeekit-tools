import { blogPosts } from '../../data/blog-posts';
import {
  calculatorGuideClusters,
  calculatorGuides,
} from '../../data/calculator-guides';
import { financialUpdates } from '../../data/financial-updates';
import { getLiveTools, type Tool } from '../tools';

export const SITE_URL = 'https://www.rupeekit.co.in';
export const LLMS_CATALOG_LAST_REVIEWED = '2026-07-16';

function oneLine(value: string): string {
  return value
    .replace(/×/g, '×')
    .replace(/−/g, '−')
    .replace(/₹/g, '₹')
    .replace(/\s+/g, ' ')
    .trim();
}

function concise(value: string, limit = 340): string {
  const normalized = oneLine(value);
  if (normalized.length <= limit) return normalized;

  const shortened = normalized.slice(0, limit + 1);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : limit).trim()}…`;
}

function firstSentence(value: string): string {
  const normalized = oneLine(value);
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return concise(match?.[0] ?? normalized, 280);
}

function visibleOutputLabels(tool: Tool): string[] {
  return tool.outputs
    .filter((output) => !output.hidden)
    .map((output) => oneLine(output.label));
}

function groupToolsByCategory(tools: Tool[]): Map<string, Tool[]> {
  const grouped = new Map<string, Tool[]>();

  for (const tool of tools) {
    const category = tool.category || 'Other';
    const categoryTools = grouped.get(category) ?? [];
    categoryTools.push(tool);
    grouped.set(category, categoryTools);
  }

  return new Map(
    [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right, 'en-IN'))
      .map(([category, categoryTools]) => [
        category,
        categoryTools.sort((left, right) => left.name.localeCompare(right.name, 'en-IN')),
      ])
  );
}

export function buildLlmsFullCatalog(): string {
  const liveTools = getLiveTools();
  const toolsByCategory = groupToolsByCategory(liveTools);
  const lines: string[] = [
    '# RupeeKit Full Content Catalog',
    '',
    '> Complete machine-readable catalog of RupeeKit\'s live India-focused financial calculators and educational content.',
    '',
    `Last reviewed: ${LLMS_CATALOG_LAST_REVIEWED}`,
    '',
    `Canonical site: ${SITE_URL}`,
    '',
    'RupeeKit provides educational estimates from user-entered assumptions. It does not provide personalized financial, tax, legal, lending, or investment advice; quote live lender rates; or guarantee returns, eligibility, approval, or tax outcomes.',
    '',
    'This catalog is a content-discovery convenience. It does not replace robots.txt, canonical URLs, page-level indexing directives, or the terms and methodology shown on the linked pages.',
    '',
    '## Core indexes',
    '',
    `- [All calculators](${SITE_URL}/tools)`,
    `- [Calculator-backed decision guides](${SITE_URL}/guides)`,
    `- [Personal finance articles](${SITE_URL}/blog)`,
    `- [XML sitemap](${SITE_URL}/sitemap.xml)`,
    `- [About RupeeKit](${SITE_URL}/about)`,
    `- [Editorial disclaimer](${SITE_URL}/disclaimer)`,
    '',
    `## Calculators (${liveTools.length})`,
    '',
  ];

  for (const [category, categoryTools] of toolsByCategory) {
    lines.push(`### ${category}`, '');

    for (const tool of categoryTools) {
      const inputs = tool.inputs.map((input) => oneLine(input.label)).join('; ');
      const outputs = visibleOutputLabels(tool).join('; ');
      lines.push(
        `#### [${tool.name}](${SITE_URL}/tools/${tool.slug})`,
        '',
        `- Purpose: ${concise(tool.shortDescription)}`,
        `- Inputs: ${inputs || 'See calculator page for mode-specific inputs.'}`,
        `- Outputs: ${outputs || 'See calculator page for mode-specific outputs.'}`,
        `- Method: ${firstSentence(tool.formulaExplanation)}`,
        `- Last reviewed: ${tool.lastReviewedIso ?? tool.lastReviewed ?? 'See calculator page.'}`,
        ''
      );
    }
  }

  lines.push(`## Calculator-backed decision guides (${calculatorGuides.length})`, '');

  for (const cluster of calculatorGuideClusters) {
    const guides = calculatorGuides.filter((guide) => guide.clusterId === cluster.id);
    lines.push(
      `### ${cluster.title}`,
      '',
      `${concise(cluster.description)} Use the [${cluster.toolName}](${SITE_URL}/tools/${cluster.toolSlug}) to test personal assumptions.`,
      ''
    );

    for (const guide of guides) {
      lines.push(
        `- [${guide.title}](${SITE_URL}/guides/${guide.slug}): ${concise(guide.answer)}`
      );
    }

    lines.push('');
  }

  lines.push(`## Personal finance articles (${blogPosts.length})`, '');

  for (const post of [...blogPosts].sort((left, right) => left.title.localeCompare(right.title, 'en-IN'))) {
    lines.push(
      `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${concise(post.metaDescription)}`
    );
  }

  lines.push('', `## Reviewed financial explainers (${financialUpdates.length})`, '');

  for (const update of [...financialUpdates].sort((left, right) => left.title.localeCompare(right.title, 'en-IN'))) {
    lines.push(
      `- [${update.title}](${SITE_URL}/financial-updates/${update.slug}): ${concise(update.summary)}`
    );
  }

  lines.push(
    '',
    '## Verification policy',
    '',
    'Calculator outputs and articles should be checked against the dated methodology and primary sources on each page. Tax rules, government notifications, lender terms, rates, limits, and market outcomes can change. Use official authorities and a qualified professional where a decision requires individual advice.',
    ''
  );

  return `${lines.join('\n').trim()}\n`;
}
