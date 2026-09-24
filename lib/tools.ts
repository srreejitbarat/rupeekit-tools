import tools from '../data/tools.json';
import growthTools from '../data/growth-tools.json';
import decisionTools from '../data/decision-tools-2026.json';
import insuranceTools from '../data/insurance-tools-2026.json';
import investingTools from '../data/investing-tools-2026.json';
import lifestageTools from '../data/lifestage-tools-2026.json';
import policyTools from '../data/policy-tools-2026.json';
import ctrToolSeoOverrides from '../data/ctr-tool-seo-overrides-2026-08-15.json';
import searchGrowthOverrides from '../data/search-growth-overrides-2026-08-17.json';
import directAnswerOverrides from '../data/direct-answer-overrides-2026-08-17.json';
import queryVariantOverrides from '../data/query-variant-tool-overrides-2026-08-18.json';
import issue76ToolOverrides from '../data/issue-76-tool-overrides-2026-08-23.json';
import issue77RescueOverrides from '../data/issue-77-rescue-overrides-2026-08-24.json';
import issue80ToolOverrides from '../data/issue-80-tool-overrides-2026-08-27.json';
import issue79RelatedOverrides from '../data/issue-79-related-overrides.json';
import { CONSOLIDATED_TOOL_SLUGS } from './consolidated-routes';
import { applyLiveRateDefaults } from './live-rate-defaults';

export type ToolInput = { key:string; label:string; unit?:string; default:number; min?:number; max?:number; step?:number; help?:string; };
export type ToolOutput = { key:string; label:string; formula:string; format:'currency'|'number'|'percent'; hidden?:boolean; };
export type ToolFaq = { question:string; answer:string; };
export type ToolContentSection = { heading:string; body:string; bullets?:string[]; };
export type ToolQuickAnswerLink = { label:string; href:string; };
export type ToolQuickAnswer = { title:string; question:string; answer:string; formula?:string; example?:string; note?:string; links?:ToolQuickAnswerLink[]; };
export type ToolOfficialSource = { label:string; href:string; };
export type ToolFactRow = { topic:string; explanation:string; };
export type ToolPreset = { id:string; label:string; description?:string; values:Record<string,number>; };
export type Tool = {
  slug:string; name:string; seoTitle?:string; category:string; status:string; targetKeyword:string; shortDescription:string; metaDescription:string;
  inputs:ToolInput[]; outputs:ToolOutput[]; formulaExplanation:string; example:string; faqs:ToolFaq[]; related:string[];
  howToUse?:string[]; assumptions?:string[]; commonMistakes?:string[]; contentSections?:ToolContentSection[]; quickAnswer?:ToolQuickAnswer;
  lastReviewed?:string; lastReviewedIso?:string; officialSources?:ToolOfficialSource[]; presets?:ToolPreset[];
  calculationVersion?:string; factsCheckedIso?:string; nextReviewTrigger?:string; formulaHold?:boolean; calculationTests?:string[];
  factRows?:ToolFactRow[];
};

type ToolSeoCopyOverride = { title:string; description:string };
type QueryVariantToolOverride = Pick<Tool, 'contentSections' | 'faqs' | 'officialSources'>;
const ctrSeoOverrides = ctrToolSeoOverrides as Record<string, ToolSeoCopyOverride>;
const prioritySearchOverrides = searchGrowthOverrides as Record<string, Partial<Tool>>;
const directAnswers = directAnswerOverrides as Record<string, string>;
const queryVariants = queryVariantOverrides as Record<string, Partial<QueryVariantToolOverride>>;
const issue76Overrides = issue76ToolOverrides as Record<string, Partial<Tool>>;
const issue77Overrides = issue77RescueOverrides as Record<string, Partial<Tool>>;
const issue80Overrides = issue80ToolOverrides as Record<string, Partial<Tool>>;
const issue79Related = issue79RelatedOverrides as Record<string, string[]>;
const sourceTools = [...tools, ...growthTools, ...decisionTools, ...insuranceTools, ...investingTools, ...lifestageTools, ...policyTools] as Tool[];

function mergeUniqueSources(base: ToolOfficialSource[] = [], extra: ToolOfficialSource[] = []): ToolOfficialSource[] {
  const byHref = new Map<string, ToolOfficialSource>();
  [...base, ...extra].forEach((source) => byHref.set(source.href, source));
  return [...byHref.values()];
}

function mergeUniqueStrings(base: string[] = [], extra: string[] = []): string[] {
  return [...new Set([...base, ...extra])];
}

function mergeUniqueFaqs(base: ToolFaq[] = [], extra: ToolFaq[] = []): ToolFaq[] {
  const byQuestion = new Map<string, ToolFaq>();
  [...base, ...extra].forEach((faq) => byQuestion.set(faq.question, faq));
  return [...byQuestion.values()];
}

function mergeUniqueContentSections(base: ToolContentSection[] = [], extra: ToolContentSection[] = []): ToolContentSection[] {
  const byHeading = new Map<string, ToolContentSection>();
  [...base, ...extra].forEach((section) => byHeading.set(section.heading, section));
  return [...byHeading.values()];
}

function mergeUniqueFactRows(base: ToolFactRow[] = [], extra: ToolFactRow[] = []): ToolFactRow[] {
  const byTopic = new Map<string, ToolFactRow>();
  [...base, ...extra].forEach((row) => byTopic.set(row.topic, row));
  return [...byTopic.values()];
}

function mergeToolOverride(base: Tool, override?: Partial<Tool>): Tool {
  if (!override) return base;
  return {
    ...base,
    ...override,
    related: mergeUniqueStrings(base.related, override.related),
    contentSections: mergeUniqueContentSections(base.contentSections, override.contentSections),
    faqs: mergeUniqueFaqs(base.faqs, override.faqs),
    officialSources: mergeUniqueSources(base.officialSources, override.officialSources),
    factRows: mergeUniqueFactRows(base.factRows, override.factRows),
  } as Tool;
}

function firstSentence(value: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/[\s\S]*?[.!?](?=\s|$)/);
  return (match?.[0] ?? cleaned).trim();
}

function listLabels(labels: string[]) {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function enrichLegacyTool(tool: Tool): Tool {
  const visibleOutputs = tool.outputs.filter((output) => !output.hidden);
  const inputLabels = tool.inputs.slice(0, 3).map((input) => input.label);
  const outputLabels = visibleOutputs.slice(0, 3).map((output) => output.label);
  const formulaLine = firstSentence(tool.formulaExplanation);
  const exampleLine = firstSentence(tool.example);

  const quickAnswer = tool.quickAnswer ?? {
    title: `${tool.name} Quick Answer`,
    question: `How does the ${tool.name} work?`,
    answer:
      inputLabels.length > 0 && outputLabels.length > 0
        ? `It estimates ${listLabels(outputLabels)} from inputs such as ${listLabels(inputLabels)} using the formula shown on this page.`
        : 'It converts the values you enter into formula-based educational estimates.',
    formula: formulaLine.length <= 220 ? formulaLine : undefined,
    example: exampleLine.length <= 220 ? exampleLine : undefined,
    note: 'Educational estimate only. RupeeKit does not provide personalized financial, tax, legal, investment, or loan advice.',
  };

  const hasMethodology = (tool.contentSections ?? []).some((section) => /source|methodology/i.test(section.heading));
  const contentSections = hasMethodology
    ? tool.contentSections
    : [
        ...(tool.contentSections ?? []),
        {
          heading: 'Source and methodology',
          body: `This calculator uses the formula and assumptions described on this page. ${formulaLine} Values are calculated in-browser from user-entered inputs and are not saved by default. Verify tax, regulatory, lender, scheme or product rules with the relevant official source where applicable.`,
        },
      ];

  const factRows = tool.factRows?.length
    ? tool.factRows
    : [
        { topic: 'Calculation type', explanation: 'Formula-based educational estimate from user-entered values' },
        { topic: 'Key inputs', explanation: inputLabels.length ? listLabels(inputLabels) : 'Depends on the calculator fields' },
        { topic: 'Primary outputs', explanation: outputLabels.length ? listLabels(outputLabels) : 'Depends on the calculator outputs' },
        { topic: 'Method reference', explanation: formulaLine },
        { topic: 'Privacy', explanation: 'Values are processed in the browser and are not saved by default.' },
      ];

  return {
    ...tool,
    quickAnswer,
    contentSections,
    factRows,
  };
}

export const allTools = sourceTools.map((tool) => {
  const priorityOverride = prioritySearchOverrides[tool.slug];
  const priorityMergedTool = priorityOverride ? { ...tool, ...priorityOverride } : tool;
  const rescueOverride = issue76Overrides[tool.slug];
  const mergedTool = rescueOverride
    ? {
        ...priorityMergedTool,
        ...rescueOverride,
        contentSections: [
          ...(priorityMergedTool.contentSections ?? []),
          ...(rescueOverride.contentSections ?? []),
        ],
        faqs: [...priorityMergedTool.faqs, ...(rescueOverride.faqs ?? [])],
        officialSources: mergeUniqueSources(priorityMergedTool.officialSources, rescueOverride.officialSources),
        related: mergeUniqueStrings(priorityMergedTool.related, rescueOverride.related),
      }
    : priorityMergedTool;
  const seoOverride = ctrSeoOverrides[tool.slug];
  const directAnswer = directAnswers[tool.slug];
  const queryVariant = queryVariants[tool.slug];
  const issue77Override = issue77Overrides[tool.slug];
  const issue80Override = issue80Overrides[tool.slug];
  const withLiveRates = applyLiveRateDefaults(mergedTool);
  const withQueryVariants = {
    ...withLiveRates,
    ...(seoOverride ? { seoTitle: seoOverride.title, metaDescription: seoOverride.description } : {}),
    ...(directAnswer ? { shortDescription: directAnswer } : {}),
    ...(queryVariant
      ? {
          contentSections: mergeUniqueContentSections(mergedTool.contentSections, queryVariant.contentSections),
          faqs: mergeUniqueFaqs(mergedTool.faqs, queryVariant.faqs),
          officialSources: mergeUniqueSources(mergedTool.officialSources, queryVariant.officialSources),
        }
      : {}),
    related: mergeUniqueStrings(mergedTool.related, issue79Related[tool.slug] ?? []),
  } as Tool;

  const withIssue77 = mergeToolOverride(withQueryVariants, issue77Override);
  const withIssue80 = mergeToolOverride(withIssue77, issue80Override);
  return enrichLegacyTool(withIssue80);
});

export function getLiveTools(): Tool[] { return allTools.filter((tool) => tool.status === 'live' && !CONSOLIDATED_TOOL_SLUGS.has(tool.slug)); }
export function getToolBySlug(slug:string): Tool|undefined { return allTools.find((tool) => tool.slug === slug && tool.status === 'live' && !CONSOLIDATED_TOOL_SLUGS.has(tool.slug)); }
export function getRelatedTools(tool:Tool): Tool[] { const live=getLiveTools(); const bySlug=new Map(live.map((item)=>[item.slug,item])); return tool.related.map((slug)=>bySlug.get(slug)).filter(Boolean) as Tool[]; }
