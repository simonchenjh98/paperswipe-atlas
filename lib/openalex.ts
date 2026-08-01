export type Paper = {
  id: number;
  title: string;
  zh: string;
  authors: string;
  venue: string;
  year: number;
  score: number;
  verdict: "优先读" | "可以读" | "先放着";
  minutes: number;
  tags: string[];
  claim: string;
  why: string;
  methods: string;
  citations: number;
  doi?: string;
  url?: string;
};

type OpenAlexWork = {
  id?: string;
  doi?: string | null;
  display_name?: string;
  publication_year?: number;
  cited_by_count?: number;
  relevance_score?: number;
  authorships?: Array<{ author?: { display_name?: string } }>;
  primary_location?: {
    source?: { display_name?: string } | null;
    landing_page_url?: string | null;
  } | null;
  best_oa_location?: {
    landing_page_url?: string | null;
    pdf_url?: string | null;
  } | null;
  concepts?: Array<{ display_name?: string; score?: number }>;
  abstract_inverted_index?: Record<string, number[]> | null;
};

function stableId(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) + 1000;
}

function abstractText(index?: Record<string, number[]> | null) {
  if (!index) return "";
  const words: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words.push([position, word]);
  }
  return words
    .sort((first, second) => first[0] - second[0])
    .map(([, word]) => word)
    .join(" ");
}

export async function searchOpenAlex({
  query = "",
  mode = "search",
  count = 8,
}: {
  query?: string;
  mode?: "search" | "trending";
  count?: number;
}) {
  const safeCount = Math.min(20, Math.max(6, count));
  const params = new URLSearchParams({ per_page: String(safeCount) });

  if (mode === "trending") {
    const from = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
      .toISOString()
      .slice(0, 10);
    params.set("search", "artificial intelligence machine learning");
    params.set(
      "filter",
      `from_publication_date:${from},is_retracted:false,has_abstract:true,type:article`,
    );
    params.set("sort", "cited_by_count:desc");
  } else {
    if (!query.trim()) throw new Error("请输入研究主题");
    params.set("search", query.trim());
    params.set("sort", "relevance_score:desc");
  }

  const response = await fetch(`https://api.openalex.org/works?${params}`, {
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`OpenAlex ${response.status}`);

  const data = (await response.json()) as { results?: OpenAlexWork[] };
  const raw = data.results || [];
  const maxRelevance = Math.max(
    ...raw.map((work) => work.relevance_score || 0),
    1,
  );

  const papers: Paper[] = raw.map((work, index) => {
    const abstract = abstractText(work.abstract_inverted_index);
    const authors = (work.authorships || [])
      .slice(0, 3)
      .map((item) => item.author?.display_name)
      .filter(Boolean);
    const tags = (work.concepts || [])
      .filter((concept) => (concept.score || 0) > 0.35)
      .slice(0, 3)
      .map((concept) => concept.display_name)
      .filter(Boolean) as string[];
    const relevance =
      mode === "trending"
        ? Math.max(66, 96 - index * 3)
        : Math.max(
            45,
            Math.round(((work.relevance_score || 0) / maxRelevance) * 98),
          );
    const verdict =
      relevance >= 88 ? "优先读" : relevance >= 65 ? "可以读" : "先放着";
    const title = work.display_name || "Untitled paper";
    const source = work.primary_location?.source?.display_name || "OpenAlex";

    return {
      id: stableId(work.id || title),
      title,
      zh: title,
      authors: authors.length
        ? `${authors.join(", ")}${(work.authorships?.length || 0) > 3 ? " et al." : ""}`
        : "Unknown authors",
      venue: source,
      year: work.publication_year || new Date().getFullYear(),
      score: relevance,
      verdict,
      minutes: Math.max(
        10,
        Math.min(35, Math.round((abstract.split(/\s+/).length || 450) / 22)),
      ),
      tags: tags.length ? tags : ["Research"],
      claim: abstract
        ? `${abstract.slice(0, 260)}${abstract.length > 260 ? "…" : ""}`
        : "OpenAlex 暂未收录摘要，建议打开原文查看核心贡献。",
      why:
        mode === "trending"
          ? `近期引用增长显著，目前已被引用 ${(work.cited_by_count || 0).toLocaleString()} 次。`
          : `它在实时检索结果中排名第 ${index + 1}，与当前研究主题的语义匹配度较高。`,
      methods: "OpenAlex live discovery",
      citations: work.cited_by_count || 0,
      doi: work.doi || "",
      url:
        work.best_oa_location?.pdf_url ||
        work.best_oa_location?.landing_page_url ||
        work.primary_location?.landing_page_url ||
        work.doi ||
        work.id ||
        "",
    };
  });

  return { papers, source: "OpenAlex", fetchedAt: new Date().toISOString() };
}
