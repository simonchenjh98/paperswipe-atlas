import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PROFILE, applyFeedback, rankPapers } from "../lib/relevance.ts";

const relevant = {
  id: 101,
  title: "Reliable AI Coding Agents for Software Engineering Benchmarks",
  zh: "",
  authors: "Builder et al.",
  venue: "NeurIPS",
  year: 2026,
  score: 96,
  verdict: "优先读",
  minutes: 7,
  tags: ["AI Agents", "Developer Tools", "Evaluation"],
  claim: "Coding agents are evaluated on reliable software engineering benchmarks with tool-use feedback.",
  why: "A practical agent evaluation workflow for builders.",
  methods: "SWE benchmark and agent tool evaluation",
  citations: 120,
};

const irrelevant = {
  ...relevant,
  id: 102,
  title: "Coastal Sediment Transport in Tropical Estuaries",
  venue: "Marine Geology",
  score: 72,
  tags: ["Geology", "Ocean", "Sediment"],
  claim: "Field measurements describe sediment transport in coastal estuaries under seasonal rainfall.",
  why: "Useful for coastal planning.",
  methods: "Field sampling and hydrodynamic modelling",
  citations: 900,
};

test("multi-signal ranking prioritizes direct intent over raw popularity", () => {
  const ranked = rankPapers([irrelevant, relevant], "reliable AI coding agents and software engineering benchmarks", DEFAULT_PROFILE);
  assert.equal(ranked[0].id, relevant.id);
  assert.ok(ranked[0].signal.topic >= 85);
  assert.ok(ranked[0].totalScore > ranked[1].totalScore + 20);
  assert.ok(ranked[0].matchReasons[0].startsWith("Strong match"));
});

test("explicit skip reasons update the negative preference profile", () => {
  const next = applyFeedback(DEFAULT_PROFILE, irrelevant, "skipped", "wrong topic too theoretical");
  assert.ok(next.negativeTerms.includes("wrong"));
  assert.ok(next.seenPaperIds.includes(irrelevant.id));
  assert.equal(next.actions.skipped, 1);
});
