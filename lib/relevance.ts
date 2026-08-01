import type { Paper } from "./openalex";

export type ActionKind = "saved" | "skipped" | "priority" | "read" | "opened" | "shared";

export type InterestProfile = {
  topics: string[];
  positiveTerms: string[];
  negativeTerms: string[];
  seenPaperIds: number[];
  actions: Partial<Record<ActionKind, number>>;
};

export type SignalBreakdown = {
  topic: number;
  personal: number;
  novelty: number;
  evidence: number;
  momentum: number;
  builder: number;
};

export type RankedPaper = Paper & {
  signal: SignalBreakdown;
  totalScore: number;
  matchReasons: string[];
};

export const DEFAULT_PROFILE: InterestProfile = {
  topics: ["AI agents", "foundation models", "robotics", "developer tools"],
  positiveTerms: ["agent", "memory", "reasoning", "evaluation", "multimodal"],
  negativeTerms: [],
  seenPaperIds: [],
  actions: {},
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "into", "using", "use", "about", "that",
  "this", "your", "are", "how", "what", "why", "paper", "research", "study", "models",
]);

const BUILDER_TERMS = new Set([
  "agent", "benchmark", "dataset", "evaluation", "framework", "memory", "multimodal",
  "open-source", "reasoning", "robot", "system", "tool", "training", "workflow",
]);

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tokens(value: string) {
  return Array.from(new Set(value.toLowerCase().replace(/[^a-z0-9+.-]+/g, " ").split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .map((word) => word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word)));
}

function paperText(paper: Paper) {
  return `${paper.title} ${paper.claim} ${paper.methods} ${paper.tags.join(" ")}`.toLowerCase();
}

function tokenCoverage(needles: string[], haystack: string) {
  if (!needles.length) return 0;
  return needles.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0) / needles.length;
}

function evidenceScore(paper: Paper) {
  const age = Math.max(1, new Date().getFullYear() - paper.year + 1);
  const ageNormalisedCitations = paper.citations / Math.pow(age, 0.72);
  const citationSignal = Math.log10(ageNormalisedCitations + 1) / Math.log10(2500);
  const abstractSignal = paper.claim.length > 150 ? 1 : paper.claim.length > 70 ? 0.72 : 0.4;
  const venueSignal = /arxiv|openalex|unknown/i.test(paper.venue) ? 0.48 : 0.82;
  return clamp((citationSignal * 0.5 + abstractSignal * 0.3 + venueSignal * 0.2) * 100);
}

function momentumScore(paper: Paper) {
  const age = Math.max(0, new Date().getFullYear() - paper.year);
  const recency = Math.max(0, 1 - age / 8);
  const citationVelocity = Math.min(1, paper.citations / Math.max(18, (age + 1) * 420));
  return clamp((recency * 0.64 + citationVelocity * 0.36) * 100);
}

export function rankPapers(papers: Paper[], query: string, profile: InterestProfile): RankedPaper[] {
  const queryTokens = tokens(query);
  const interestTokens = tokens([...profile.topics, ...profile.positiveTerms].join(" "));
  const negativeTokens = tokens(profile.negativeTerms.join(" "));
  const seen = new Set(profile.seenPaperIds);
  const deduped = Array.from(new Map(papers.filter((paper) => paper.title && paper.claim)
    .map((paper) => [paper.doi || paper.title.toLowerCase().replace(/\W/g, ""), paper])).values());

  return deduped.map((paper) => {
    const text = paperText(paper);
    const matchingTokens = queryTokens.filter((token) => text.includes(token));
    const lexicalMatch = Math.min(1, tokenCoverage(queryTokens, text) * 1.65);
    const sourceRelevance = paper.score / 100;
    const negativePenalty = tokenCoverage(negativeTokens, text);
    const topic = clamp((lexicalMatch * 0.58 + sourceRelevance * 0.42 - negativePenalty * 0.65) * 100);
    const personal = clamp(tokenCoverage(interestTokens, text) * 82 + (paper.tags.some((tag) => profile.positiveTerms.includes(tag.toLowerCase())) ? 18 : 0));
    const novelty = clamp((seen.has(paper.id) ? 0.18 : 0.82) * 100 + Math.min(18, paper.tags.length * 4));
    const evidence = evidenceScore(paper);
    const momentum = momentumScore(paper);
    const builderHits = tokens(text).filter((token) => BUILDER_TERMS.has(token)).length;
    const builder = clamp(38 + builderHits * 12 + (/benchmark|dataset|github|open.source/i.test(text) ? 18 : 0));
    const signal = { topic, personal, novelty, evidence, momentum, builder };
    const totalScore = clamp(topic * 0.42 + personal * 0.2 + novelty * 0.11 + evidence * 0.1 + momentum * 0.09 + builder * 0.08);
    const matchReasons = [
      topic >= 72 ? `Strong match for ${matchingTokens.slice(0, 2).join(" + ") || "your brief"}` : "Adjacent to your current brief",
      personal >= 62 ? `Aligned with your ${paper.tags[0] || "technology"} interest` : "Adds a useful outside signal",
      momentum >= 72 ? "Momentum is accelerating" : evidence >= 68 ? "Backed by a solid evidence signal" : "Early signal — worth watching",
    ];
    return { ...paper, score: totalScore, totalScore, signal, matchReasons };
  }).sort((first, second) => second.totalScore - first.totalScore);
}

export function applyFeedback(profile: InterestProfile, paper: Paper, action: ActionKind, reason = "") {
  const positive = action === "saved" || action === "priority" || action === "read" || action === "opened" || action === "shared";
  const paperTerms = paper.tags.slice(0, 3).map((tag) => tag.toLowerCase());
  return {
    ...profile,
    positiveTerms: positive ? Array.from(new Set([...profile.positiveTerms, ...paperTerms])).slice(-30) : profile.positiveTerms,
    negativeTerms: !positive && reason ? Array.from(new Set([...profile.negativeTerms, ...tokens(reason)])).slice(-30) : profile.negativeTerms,
    seenPaperIds: Array.from(new Set([...profile.seenPaperIds, paper.id])).slice(-300),
    actions: { ...profile.actions, [action]: (profile.actions[action] || 0) + 1 },
  };
}

export function buildDiscoveryQuery(topic: string, profile: InterestProfile) {
  const intent = tokens(`${topic} ${profile.topics.join(" ")} ${profile.positiveTerms.slice(-8).join(" ")}`);
  return intent.slice(0, 18).join(" ");
}
