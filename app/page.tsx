"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchOpenAlex, type Paper } from "../lib/openalex";
import {
  applyFeedback,
  buildDiscoveryQuery,
  DEFAULT_PROFILE,
  rankPapers,
  type ActionKind,
  type InterestProfile,
  type RankedPaper,
  type SignalBreakdown,
} from "../lib/relevance";

const SEED: Paper[] = [
  { id: 1, title: "Generative Agents: Interactive Simulacra of Human Behavior", zh: "", authors: "Park et al.", venue: "UIST", year: 2023, score: 98, verdict: "优先读", minutes: 8, tags: ["AI Agents", "Memory", "HCI"], claim: "A believable agent architecture emerges when memory, reflection, and planning work as one continuous loop.", why: "Builder angle: treat memory as product infrastructure, not a chat-history feature. The architecture is still the clearest blueprint for persistent AI products.", methods: "25-agent sandbox · qualitative evaluation", citations: 4210, openAccess: true, url: "https://arxiv.org/abs/2304.03442" },
  { id: 2, title: "SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering", zh: "", authors: "Yang et al.", venue: "NeurIPS", year: 2024, score: 95, verdict: "优先读", minutes: 7, tags: ["AI Agents", "Developer Tools", "Evaluation"], claim: "Purpose-built interfaces can matter as much as model capability when agents operate real software systems.", why: "Builder angle: redesign the tool surface before reaching for a larger model. Interface constraints can produce cheaper, more reliable agents.", methods: "SWE-bench · agent-computer interface", citations: 1890, openAccess: true, url: "https://arxiv.org/abs/2405.15793" },
  { id: 3, title: "MemoryBank: Enhancing Large Language Models with Long-Term Memory", zh: "", authors: "Zhong et al.", venue: "AAAI", year: 2024, score: 91, verdict: "优先读", minutes: 6, tags: ["Memory", "Personalization", "LLM"], claim: "Forgetting curves provide a practical control mechanism for long-term conversational memory.", why: "Builder angle: a useful baseline for personalized assistants, but memory provenance and poisoning still need a stronger product layer.", methods: "memory retrieval · forgetting curve", citations: 947, openAccess: true, url: "https://arxiv.org/abs/2305.10250" },
  { id: 4, title: "MemGPT: Towards LLMs as Operating Systems", zh: "", authors: "Packer et al.", venue: "arXiv", year: 2023, score: 89, verdict: "优先读", minutes: 8, tags: ["AI Agents", "Memory", "Systems"], claim: "Hierarchical storage and explicit memory calls let agents operate beyond a fixed context window.", why: "Builder angle: the operating-system metaphor turns context management into an observable, testable product primitive.", methods: "virtual context management · tiered storage", citations: 2560, openAccess: true, url: "https://arxiv.org/abs/2310.08560" },
  { id: 5, title: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery", zh: "", authors: "Lu et al.", venue: "arXiv", year: 2024, score: 87, verdict: "可以读", minutes: 9, tags: ["AI Agents", "Science", "Automation"], claim: "An agent pipeline can generate ideas, run experiments, and draft papers with limited human intervention.", why: "Builder angle: the workflow is a provocative product map, while its evaluation exposes how far autonomous knowledge work still has to go.", methods: "end-to-end agent pipeline · reviewer evaluation", citations: 1320, openAccess: true, url: "https://arxiv.org/abs/2408.06292" },
  { id: 6, title: "OpenVLA: An Open-Source Vision-Language-Action Model", zh: "", authors: "Kim et al.", venue: "CoRL", year: 2024, score: 84, verdict: "可以读", minutes: 7, tags: ["Robotics", "Multimodal", "Open Source"], claim: "A generalist vision-language-action model can transfer internet-scale visual knowledge into robotic control.", why: "Builder angle: open weights and broad robot data lower the barrier for vertical robotics products and embodied-agent experiments.", methods: "970k robot trajectories · multi-robot evaluation", citations: 980, openAccess: true, url: "https://arxiv.org/abs/2406.09246" },
  { id: 7, title: "RAGAS: Automated Evaluation of Retrieval Augmented Generation", zh: "", authors: "Es et al.", venue: "EACL", year: 2024, score: 82, verdict: "可以读", minutes: 6, tags: ["Evaluation", "RAG", "Developer Tools"], claim: "Reference-free metrics make retrieval and generation quality easier to evaluate during product iteration.", why: "Builder angle: instrument RAG quality before scaling traffic; the metric decomposition is directly useful in production dashboards.", methods: "reference-free evaluation · synthetic tests", citations: 1540, openAccess: true, url: "https://arxiv.org/abs/2309.15217" },
];

const NAV = [
  ["today", "◉", "Today"],
  ["library", "□", "Library"],
  ["radar", "✦", "Signal map"],
] as const;

type Tab = (typeof NAV)[number][0];

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [profile, setProfile] = useState<InterestProfile>(DEFAULT_PROFILE);
  const [topic, setTopic] = useState("AI agents that can reliably use memory and tools");
  const [papers, setPapers] = useState<RankedPaper[]>(() => rankPapers(SEED, "AI agents memory tools", DEFAULT_PROFILE));
  const [queue, setQueue] = useState<RankedPaper[]>(() => rankPapers(SEED, "AI agents memory tools", DEFAULT_PROFILE));
  const [states, setStates] = useState<Record<number, ActionKind>>({});
  const [loading, setLoading] = useState(false);
  const [showTune, setShowTune] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast] = useState("");
  const [skipPrompt, setSkipPrompt] = useState<Paper | null>(null);
  const completed = Math.max(0, papers.slice(0, 7).filter((paper) => states[paper.id]).length);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedProfile = localStorage.getItem("paperswipe-profile-v2");
      const savedStates = localStorage.getItem("paperswipe-state-v2");
      if (savedProfile) try { setProfile(JSON.parse(savedProfile)); } catch { /* keep safe default */ }
      if (savedStates) try { setStates(JSON.parse(savedStates)); } catch { /* keep empty state */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const flash = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const refresh = useCallback(async (nextTopic: string, nextProfile = profile) => {
    setTopic(nextTopic);
    setLoading(true);
    setShowTune(false);
    try {
      const query = buildDiscoveryQuery(nextTopic, nextProfile);
      const result = await searchOpenAlex({ query, count: 60 });
      const ranked = rankPapers([...result.papers, ...SEED], nextTopic, nextProfile).slice(0, 24);
      setPapers(ranked);
      setQueue(ranked.slice(0, 7));
      flash(`${ranked.length} signals ranked for relevance`);
    } catch {
      const ranked = rankPapers(SEED, nextTopic, nextProfile);
      setPapers(ranked);
      setQueue(ranked.slice(0, 7));
      flash("Live index unavailable — your curated brief is ready");
    } finally {
      setLoading(false);
    }
  }, [flash, profile]);

  const act = useCallback((paper: RankedPaper, action: ActionKind) => {
    const nextStates = { ...states, [paper.id]: action };
    const nextProfile = applyFeedback(profile, paper, action);
    setStates(nextStates);
    setProfile(nextProfile);
    setQueue((current) => current.filter((item) => item.id !== paper.id));
    localStorage.setItem("paperswipe-state-v2", JSON.stringify(nextStates));
    localStorage.setItem("paperswipe-profile-v2", JSON.stringify(nextProfile));
    if (action === "skipped") setSkipPrompt(paper);
    else flash(action === "saved" ? "Insight saved" : action === "shared" ? "Share card copied" : "Signal added to your profile");
  }, [flash, profile, states]);

  const explainSkip = (reason: string) => {
    if (!skipPrompt) return;
    const next = applyFeedback(profile, skipPrompt, "skipped", reason);
    setProfile(next);
    localStorage.setItem("paperswipe-profile-v2", JSON.stringify(next));
    setSkipPrompt(null);
    flash("Your next brief will use this feedback");
  };

  return <div className="frontier-shell">
    <aside className="frontier-sidebar">
      <button className="frontier-brand" onClick={() => setTab("today")}><Mark/><span>PaperSwipe</span><em>beta</em></button>
      <nav>{NAV.map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><i>{icon}</i><span>{label}</span>{id === "today" && <b>{queue.length}</b>}</button>)}</nav>
      <div className="side-signal"><SignalOrb progress={completed / 7}/><div><span>Daily signal</span><b>{completed}/7 complete</b></div></div>
      <button className="tune-button" onClick={() => setShowTune(true)}><span>⌁</span><div><b>Tune your signal</b><small>{profile.topics.length} interests active</small></div><i>›</i></button>
      <a className="about-link" href="./about/">About & pricing <span>↗</span></a>
      <button className="upgrade-side" onClick={() => setShowUpgrade(true)}><small>FOUNDER PLAN</small><b>Go deeper for $5</b><span>Unlock the full daily drop →</span></button>
    </aside>

    <main className="frontier-main">
      <header className="frontier-topbar">
        <div className="mobile-brand"><Mark/><b>PaperSwipe</b></div>
        <div className="brief-context"><span>YOUR BRIEF</span><button onClick={() => setShowTune(true)}>{topic} <i>⌄</i></button></div>
        <div className="topbar-actions"><span className="streak">● <b>12</b> day streak</span><button className="pro-pill" onClick={() => setShowUpgrade(true)}>Get Pro</button><button className="avatar-button" aria-label="Account">SC</button></div>
      </header>

      {tab === "today" && <TodayView queue={queue} all={papers} states={states} loading={loading} onAct={act} onRefresh={() => refresh(topic)} completed={completed}/>}
      {tab === "library" && <Library papers={papers} states={states} onOpen={(paper) => paper.url && window.open(paper.url, "_blank", "noopener,noreferrer")}/>}
      {tab === "radar" && <SignalMap papers={papers} profile={profile}/>}
    </main>

    <nav className="frontier-mobile-nav">{NAV.map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><i>{icon}</i><span>{label}</span></button>)}</nav>
    {showTune && <TuneModal topic={topic} profile={profile} onClose={() => setShowTune(false)} onSave={(value, topics) => { const next = { ...profile, topics }; setProfile(next); localStorage.setItem("paperswipe-profile-v2", JSON.stringify(next)); refresh(value, next); }}/>}
    {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)}/>}
    {skipPrompt && <SkipFeedback onChoose={explainSkip} onClose={() => setSkipPrompt(null)}/>}
    {toast && <div className="frontier-toast"><span>✓</span>{toast}</div>}
  </div>;
}

function TodayView({ queue, all, states, loading, onAct, onRefresh, completed }: { queue: RankedPaper[]; all: RankedPaper[]; states: Record<number, ActionKind>; loading: boolean; onAct: (paper: RankedPaper, action: ActionKind) => void; onRefresh: () => void; completed: number }) {
  const paper = queue[0];
  const date = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  return <section className="today-view">
    <header className="today-heading">
      <div><p className="frontier-kicker"><i></i> DAILY FRONTIER · {date.toUpperCase()}</p><h1>Your edge, in<br/><em>seven signals.</em></h1><p>High-relevance research for people building what comes next.</p></div>
      <div className="today-progress"><span>{completed < 7 ? `${7 - completed} signals left` : "Brief complete"}</span><div>{Array.from({ length: 7 }, (_, index) => <i className={index < completed ? "done" : index === completed ? "current" : ""} key={index}></i>)}</div><small>About {Math.max(0, 10 - completed)} minutes</small></div>
    </header>

    <div className="brief-grid">
      <div className="brief-stage">
        {loading ? <LoadingBrief/> : paper ? <BriefCard key={paper.id} paper={paper} onAct={onAct}/> : <BriefComplete papers={all} states={states} onRefresh={onRefresh}/>}
      </div>
      <aside className="signal-rail">
        <div className="rail-heading"><span>WHY THIS MATCHED</span><b>{paper?.totalScore || 0}<small>/100</small></b></div>
        {paper ? <><SignalFingerprint signal={paper.signal}/><div className="match-reasons">{paper.matchReasons.map((reason, index) => <p key={reason}><i>{String(index + 1).padStart(2, "0")}</i>{reason}</p>)}</div><div className="trust-note"><span>◎</span><p><b>Transparent ranking</b><br/>Topic fit and evidence quality are scored independently, so popularity never masquerades as relevance.</p></div></> : <p className="rail-empty">Your completed brief becomes tomorrow&apos;s relevance signal.</p>}
      </aside>
    </div>
  </section>;
}

function BriefCard({ paper, onAct }: { paper: RankedPaper; onAct: (paper: RankedPaper, action: ActionKind) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [drag, setDrag] = useState(0);
  const origin = useRef<number | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onAct(paper, "skipped");
      if (event.key === "ArrowRight") onAct(paper, "saved");
      if (event.key === "ArrowUp") setExpanded(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onAct, paper]);
  const finishDrag = () => {
    if (drag > 105) onAct(paper, "saved");
    else if (drag < -105) onAct(paper, "skipped");
    setDrag(0); origin.current = null;
  };
  const share = async () => {
    const copy = `${paper.title}\n\n${paper.claim}\n\nDiscovered on PaperSwipe.`;
    await navigator.clipboard?.writeText(copy);
    onAct(paper, "shared");
  };
  return <article className={`brief-card ${expanded ? "expanded" : ""}`} style={{ transform: `translateX(${drag}px) rotate(${drag / 45}deg)` }} onPointerDown={(event) => { origin.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => origin.current !== null && setDrag(event.clientX - origin.current)} onPointerUp={finishDrag}>
    <div className={`gesture-label no ${drag < -45 ? "show" : ""}`}>NOT FOR ME</div><div className={`gesture-label yes ${drag > 45 ? "show" : ""}`}>SAVE SIGNAL</div>
    <header className="paper-signal-cover"><div className="cover-grid"></div><div className="cover-orbit"></div><div className="paper-number">PS—{String(paper.id).slice(-4)}</div><div className="paper-source"><span>{paper.venue}</span><b>{paper.year}</b></div><div className="cover-score"><small>SIGNAL</small><b>{paper.totalScore}</b></div></header>
    <div className="brief-card-body">
      <div className="paper-meta"><span className="signal-badge">HIGH SIGNAL</span><span>{paper.minutes} MIN</span><span>{paper.openAccess ? "OPEN ACCESS" : paper.type?.toUpperCase() || "PAPER"}</span></div>
      <h2>{paper.title}</h2>
      <p className="authors">{paper.authors} · {paper.venue}, {paper.year}</p>
      <section className="takeaway"><span>THE TAKEAWAY</span><p>{paper.claim}</p></section>
      <section className="builder-angle"><i>↳</i><div><span>BUILDER ANGLE</span><p>{paper.why.replace(/^Builder angle:\s*/i, "")}</p></div></section>
      {expanded && <div className="deep-panel"><div><span>METHOD</span><p>{paper.methods}</p></div><div><span>TRUST SIGNAL</span><p>{paper.citations.toLocaleString()} citations · evidence {paper.signal.evidence}/100</p></div><div><span>LIMITATION</span><p>Signal scores support triage; inspect the original study before making a product or scientific claim.</p></div></div>}
    </div>
    <footer className="brief-actions"><button className="reject-action" onClick={() => onAct(paper, "skipped")}><span>×</span><small>Not for me</small></button><button onClick={() => setExpanded((value) => !value)}><span>⌁</span><small>{expanded ? "Less" : "Go deeper"}</small></button><button onClick={share}><span>↗</span><small>Share</small></button><button className="save-action" onClick={() => onAct(paper, "saved")}><span>＋</span><small>Save insight</small></button></footer>
  </article>;
}

function SignalFingerprint({ signal }: { signal: SignalBreakdown }) {
  const items: Array<[string, number, string]> = [["Topic fit", signal.topic, "cyan"], ["Personal", signal.personal, "cyan"], ["Novelty", signal.novelty, "orange"], ["Evidence", signal.evidence, "paper"], ["Momentum", signal.momentum, "orange"], ["Builder value", signal.builder, "cyan"]];
  return <div className="signal-fingerprint">{items.map(([label, value, color]) => <div key={label}><span>{label}</span><i><b className={color} style={{ width: `${value}%` }}></b></i><em>{value}</em></div>)}</div>;
}

function SignalOrb({ progress }: { progress: number }) {
  const offset = 138 - Math.min(1, progress) * 138;
  return <svg className="signal-orb" viewBox="0 0 54 54" aria-label={`${Math.round(progress * 100)} percent complete`}><defs><linearGradient id="orb" x1="0" x2="1"><stop stopColor="#83f7d0"/><stop offset="1" stopColor="#68d9ff"/></linearGradient></defs><circle cx="27" cy="27" r="22" className="orb-track"/><circle cx="27" cy="27" r="22" className="orb-value" strokeDasharray="138" strokeDashoffset={offset}/><circle cx="27" cy="27" r="5" className="orb-core"/></svg>;
}

function LoadingBrief() { return <div className="loading-brief"><div className="loading-orb"><i></i><i></i><i></i></div><p>SCANNING THE FRONTIER</p><h2>Ranking evidence, momentum<br/>and builder relevance…</h2></div>; }

function BriefComplete({ papers, states, onRefresh }: { papers: RankedPaper[]; states: Record<number, ActionKind>; onRefresh: () => void }) {
  const saved = papers.filter((paper) => states[paper.id] === "saved" || states[paper.id] === "priority");
  return <div className="brief-complete"><SignalOrb progress={1}/><p>DAILY DROP COMPLETE</p><h2>Today, you sharpened<br/>your view of the frontier.</h2><div>{saved.slice(0, 3).map((paper) => <span key={paper.id}>{paper.tags[0]}</span>)}</div><p className="complete-copy">Your choices are already shaping tomorrow&apos;s ranking.</p><button onClick={onRefresh}>Refresh live signals <span>→</span></button></div>;
}

function Library({ papers, states, onOpen }: { papers: RankedPaper[]; states: Record<number, ActionKind>; onOpen: (paper: RankedPaper) => void }) {
  const [query, setQuery] = useState("");
  const visible = papers.filter((paper) => (states[paper.id] === "saved" || states[paper.id] === "priority" || states[paper.id] === "read") && paperTextMatch(paper, query));
  return <section className="collection-view"><header><p className="frontier-kicker"><i></i> YOUR SIGNAL LIBRARY</p><h1>Ideas worth<br/><em>coming back to.</em></h1><p>Every saved paper, ranked by what it can change for you.</p></header><div className="collection-toolbar"><label>⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your signals"/></label><button onClick={() => downloadBibTeX(visible)}>Export BibTeX ↗</button></div>{visible.length ? <div className="collection-grid">{visible.map((paper, index) => <article key={paper.id}><div className="library-index">{String(index + 1).padStart(2, "0")}</div><div className="library-copy"><div><span>{paper.tags[0]}</span><em>{paper.year}</em></div><h3>{paper.title}</h3><p>{paper.claim}</p><footer><span>{paper.totalScore} signal score</span><span>{paper.minutes} min</span><button onClick={() => onOpen(paper)}>Read source ↗</button></footer></div></article>)}</div> : <div className="empty-library"><span>◇</span><h2>Your strongest signals will live here.</h2><p>Save a paper from today&apos;s brief to start building your edge.</p></div>}</section>;
}

function SignalMap({ papers, profile }: { papers: RankedPaper[]; profile: InterestProfile }) {
  return <section className="radar-view"><header><div><p className="frontier-kicker"><i></i> PERSONAL FRONTIER MAP</p><h1>See where your<br/><em>attention is moving.</em></h1><p>Not a citation graph. A living map of relevance, momentum and unexplored edges.</p></div><div className="map-legend"><span><i className="mature"></i>Mature</span><span><i className="rising"></i>Rising</span><span><i className="edge"></i>New edge</span></div></header><div className="radar-grid"><TopicConstellation topics={profile.topics}/><FrontierMap papers={papers}/></div><div className="radar-insights"><article><span>FASTEST MOVING</span><b>Agent evaluation</b><p>Momentum is up across your recent signals, with stronger evidence than last week.</p></article><article><span>UNDEREXPLORED EDGE</span><b>Embodied memory</b><p>High personal relevance, but only one paper in your saved history.</p></article><article><span>YOUR CENTER OF GRAVITY</span><b>Reliable AI agents</b><p>42% of positive actions now connect memory, tools and evaluation.</p></article></div></section>;
}

function TopicConstellation({ topics }: { topics: string[] }) {
  const nodes = [{ x: 50, y: 48, r: 11, label: "AI agents" }, { x: 23, y: 26, r: 7, label: "Memory" }, { x: 78, y: 24, r: 8, label: "Evaluation" }, { x: 82, y: 70, r: 6, label: "Robotics" }, { x: 25, y: 76, r: 5, label: "Multimodal" }];
  return <article className="constellation-card"><header><span>INTEREST CONSTELLATION</span><b>{topics.length} active signals</b></header><svg viewBox="0 0 100 100" role="img" aria-label="Interest topic constellation"><defs><radialGradient id="nodeGlow"><stop stopColor="#83f7d0"/><stop offset="1" stopColor="#83f7d000"/></radialGradient></defs>{nodes.slice(1).map((node, index) => <line key={node.label} x1="50" y1="48" x2={node.x} y2={node.y} className={`constellation-line l${index}`}/>)}{nodes.map((node, index) => <g key={node.label}><circle cx={node.x} cy={node.y} r={node.r + 5} className="node-glow"/><circle cx={node.x} cy={node.y} r={node.r} className={index === 0 ? "topic-core" : "topic-node"}/><text x={node.x} y={node.y + node.r + 7} textAnchor="middle">{node.label}</text></g>)}</svg><footer><span>Closer nodes share more of your positive actions.</span></footer></article>;
}

function FrontierMap({ papers }: { papers: RankedPaper[] }) {
  return <article className="frontier-map-card"><header><span>FRONTIER MAP</span><b>Momentum × maturity</b></header><div className="frontier-plot"><span className="axis-y">MOMENTUM</span><span className="axis-x">MATURITY →</span><div className="plot-grid"></div>{papers.slice(0, 9).map((paper, index) => <button key={paper.id} className={`plot-dot d${index % 4}`} style={{ left: `${12 + paper.signal.evidence * 0.72}%`, bottom: `${10 + paper.signal.momentum * 0.72}%`, width: `${12 + paper.totalScore / 6}px`, height: `${12 + paper.totalScore / 6}px` }} title={`${paper.title}: ${paper.totalScore}`}><span>{paper.tags[0]}</span></button>)}</div><footer><span>Bubble size = personal relevance</span></footer></article>;
}

function TuneModal({ topic, profile, onClose, onSave }: { topic: string; profile: InterestProfile; onClose: () => void; onSave: (topic: string, topics: string[]) => void }) {
  const [value, setValue] = useState(topic);
  const [topics, setTopics] = useState(profile.topics);
  const options = ["AI agents", "Robotics", "Biotech", "Climate tech", "Developer tools", "Spatial computing", "Cybersecurity", "Future of work"];
  const toggle = (item: string) => setTopics((current) => current.includes(item) ? current.filter((topicItem) => topicItem !== item) : [...current, item].slice(-5));
  return <div className="frontier-modal-backdrop" onMouseDown={onClose}><form className="tune-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (value.trim()) onSave(value.trim(), topics); }}><button className="modal-close" type="button" onClick={onClose}>×</button><p className="frontier-kicker"><i></i> TUNE YOUR SIGNAL</p><h2>What are you building toward?</h2><p>Specific intent beats broad keywords. We&apos;ll use this to re-rank a wider candidate set.</p><textarea value={value} onChange={(event) => setValue(event.target.value)} autoFocus/><span className="input-label">CHOOSE UP TO FIVE INTERESTS</span><div className="topic-options">{options.map((item) => <button type="button" className={topics.includes(item) ? "active" : ""} key={item} onClick={() => toggle(item)}>{topics.includes(item) ? "✓ " : "+ "}{item}</button>)}</div><button className="modal-primary" type="submit">Build my daily brief <span>→</span></button></form></div>;
}

function UpgradeModal({ onClose }: { onClose: () => void }) { return <div className="frontier-modal-backdrop" onMouseDown={onClose}><div className="upgrade-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><div className="pricing-orb"><SignalOrb progress={0.78}/></div><p className="frontier-kicker"><i></i> PAPERSWIPE PRO</p><h2>Stay ahead for less<br/>than a coffee.</h2><p>Turn the daily habit into a compounding knowledge edge.</p><div className="price"><b>$5</b><span>/ month<br/><small>Cancel anytime</small></span></div><ul><li>✓ Full 7–10 signal Daily Drop</li><li>✓ Unlimited history and topic tracking</li><li>✓ Weekly Frontier Map report</li><li>✓ Exports and priority ranking</li></ul><button className="modal-primary" onClick={() => window.alert("Secure checkout will be connected before launch.")}>Start 7-day free trial <span>→</span></button><small>No card during beta · Founder price locked for life</small></div></div>; }

function SkipFeedback({ onChoose, onClose }: { onChoose: (reason: string) => void; onClose: () => void }) { return <div className="skip-feedback"><span>Why wasn&apos;t it useful?</span>{["Too theoretical", "Wrong topic", "Already know this", "Low trust"].map((reason) => <button key={reason} onClick={() => onChoose(reason)}>{reason}</button>)}<button className="skip-close" onClick={onClose}>×</button></div>; }

function Mark() { return <span className="brand-mark"><i></i><i></i><i></i></span>; }

function paperTextMatch(paper: Paper, query: string) { return `${paper.title} ${paper.authors} ${paper.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()); }

function downloadBibTeX(papers: Paper[]) {
  const body = papers.map((paper) => `@article{paperswipe${paper.id},\n  title = {${paper.title}},\n  author = {${paper.authors.replace(/, /g, " and ")}},\n  year = {${paper.year}},\n  journal = {${paper.venue}}${paper.doi ? `,\n  doi = {${paper.doi.replace("https://doi.org/", "")}}` : ""}\n}`).join("\n\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([body], { type: "application/x-bibtex" }));
  link.download = "paperswipe-signals.bib";
  link.click();
  URL.revokeObjectURL(link.href);
}
