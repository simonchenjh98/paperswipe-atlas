"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchOpenAlex, type Paper } from "../lib/openalex";

const SEED: Paper[] = [
  { id: 1, title: "Generative Agents: Interactive Simulacra of Human Behavior", zh: "生成式智能体：人类行为的交互式模拟", authors: "Park et al.", venue: "UIST", year: 2023, score: 97, verdict: "优先读", minutes: 24, tags: ["Agent", "Memory", "HCI"], claim: "用记忆、反思与规划构成可信的生成式智能体行为架构。", why: "与你关注的长期记忆和智能体行为高度重合，可直接复用其记忆流与反思机制。", methods: "25 个智能体沙盒实验 · 观察性评估", citations: 4210 },
  { id: 2, title: "Self-Reflection in LLM Agents: Effects on Problem-Solving", zh: "大模型智能体的自我反思及其问题求解效应", authors: "Shinn et al.", venue: "NeurIPS", year: 2024, score: 93, verdict: "优先读", minutes: 18, tags: ["Reflection", "LLM", "Reasoning"], claim: "语言反馈驱动的反思能在不更新参数的情况下改进多轮决策。", why: "它提供了可直接迁移到你研究中的反思闭环，并讨论了错误记忆累积。", methods: "语言反馈闭环 · 多任务基准", citations: 1832 },
  { id: 3, title: "MemoryBank: Enhancing Large Language Models with Long-Term Memory", zh: "MemoryBank：为大语言模型注入长期记忆", authors: "Zhong et al.", venue: "AAAI", year: 2024, score: 88, verdict: "可以读", minutes: 16, tags: ["Memory", "Personalization"], claim: "借鉴遗忘曲线维护长期对话记忆，使个性化交互保持连续。", why: "适合作为长期记忆的工程基线，但对记忆污染与来源治理讨论较弱。", methods: "记忆检索 · 艾宾浩斯遗忘曲线", citations: 947 },
  { id: 4, title: "MemGPT: Towards LLMs as Operating Systems", zh: "MemGPT：把大模型当作操作系统", authors: "Packer et al.", venue: "arXiv", year: 2023, score: 84, verdict: "可以读", minutes: 21, tags: ["Agent", "Memory", "Systems"], claim: "通过分层存储和函数调用突破固定上下文窗口。", why: "能补足记忆系统的工程视角，尤其适合比较短期与长期记忆调度。", methods: "虚拟上下文管理 · 分层存储", citations: 2560 },
  { id: 5, title: "A Survey on the Security of Long-Term Memory in LLM Agents", zh: "大模型智能体长期记忆安全综述", authors: "Chen et al.", venue: "arXiv", year: 2026, score: 72, verdict: "优先读", minutes: 28, tags: ["Security", "Memory", "Survey"], claim: "长期记忆因持久性、状态性与传播性形成独立的攻击面。", why: "AI 越级推荐：语义距离不算最近，但它会直接改变你对记忆更新机制的安全判断。", methods: "系统综述 · 威胁分类", citations: 14 },
  { id: 6, title: "Tip-Adapter: Training-free Adaption of CLIP", zh: "Tip-Adapter：免训练的 CLIP 小样本适配", authors: "Zhang et al.", venue: "ECCV", year: 2022, score: 41, verdict: "先放着", minutes: 14, tags: ["Vision", "Adapter"], claim: "用键值缓存实现免训练的视觉语言模型适配。", why: "只有 adapter 一词与主题重合，研究对象和机制均偏离当前主线。", methods: "CLIP · 键值缓存", citations: 3250 },
];

const tabs = [
  ["discover", "✦", "发现"], ["library", "▤", "论文库"], ["plan", "◷", "阅读计划"], ["trending", "↗", "趋势"], ["atlas", "◎", "Atlas"],
] as const;

export default function Home() {
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("discover");
  const [queue, setQueue] = useState(SEED);
  const [papers, setPapers] = useState(SEED);
  const [states, setStates] = useState<Record<number, string>>({});
  const [topic, setTopic] = useState("长期记忆如何改变个性化 AI 智能体的行为与安全？");
  const [showTopic, setShowTopic] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("paperswipe-state");
      if (saved) try { setStates(JSON.parse(saved)); } catch { /* ignore */ }
      const savedPapers = localStorage.getItem("paperswipe-papers");
      if (savedPapers) try { setPapers(JSON.parse(savedPapers)); } catch { /* ignore */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const discover = async (value: string) => {
    setTopic(value); setShowTopic(false); setLoading(true);
    try {
      const data = await searchOpenAlex({ query: value, count: 10 });
      const merged = [...data.papers, ...papers.filter((paper) => !data.papers.some((live) => live.id === paper.id))];
      setPapers(merged); setQueue(data.papers); localStorage.setItem("paperswipe-papers", JSON.stringify(merged));
      setToast(`已从 OpenAlex 找到 ${data.papers.length} 篇实时论文`);
    } catch {
      setQueue(SEED); setToast("实时检索暂不可用，已切换到离线推荐");
    } finally { setLoading(false); window.setTimeout(() => setToast(""), 2200); }
  };

  const act = (paper: Paper, state: string) => {
    const next = { ...states, [paper.id]: state };
    setStates(next); localStorage.setItem("paperswipe-state", JSON.stringify(next));
    setQueue((q) => q.filter((p) => p.id !== paper.id));
    setToast(state === "saved" ? "已收藏到论文库" : state === "priority" ? "已标为重点" : state === "read" ? "已完成阅读" : "暂时跳过");
    window.setTimeout(() => setToast(""), 1800);
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => setTab("discover")}><span>🎉</span><b>PaperSwipe</b></button>
      <nav>{tabs.map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><i>{icon}</i><span>{label}</span></button>)}<a href="./about/" style={{height:48,borderRadius:13,color:"#77756f",display:"flex",alignItems:"center",gap:14,padding:"0 15px",textDecoration:"none",fontSize:13,fontWeight:700}}><i style={{fontStyle:"normal",fontSize:20,width:24,textAlign:"center"}}>◈</i><span>产品介绍</span></a></nav>
      <div className="side-foot"><div className="avatar">JC</div><div><b>Researcher</b><small>同步于本机</small></div><button aria-label="设置">•••</button></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="topic-pill" onClick={() => setShowTopic(true)}><span>研究主题</span><b>{topic}</b><i>⌄</i></button>
        <div className="top-actions"><button className="icon-btn" aria-label="搜索">⌕</button><button className="icon-btn" aria-label="通知">♢</button><button className="new-topic" onClick={() => setShowTopic(true)}>＋ 新建主题</button></div>
      </header>
      {tab === "discover" && <Discover queue={queue} loading={loading} onAct={act} onReset={() => discover(topic)} />}
      {tab === "library" && <Library papers={papers} states={states} onOpen={(p) => { setQueue([p, ...queue.filter(x => x.id !== p.id)]); setTab("discover"); }} />}
      {tab === "plan" && <Plan papers={papers} states={states} onRead={(id) => { const next={...states,[id]:"read"}; setStates(next); localStorage.setItem("paperswipe-state",JSON.stringify(next)); }} />}
      {tab === "trending" && <Trending onSave={(paper) => { const merged=[paper,...papers.filter(p=>p.id!==paper.id)]; setPapers(merged); const next={...states,[paper.id]:"saved"}; setStates(next); localStorage.setItem("paperswipe-state",JSON.stringify(next)); localStorage.setItem("paperswipe-papers",JSON.stringify(merged)); setToast("已收藏趋势论文"); }} />}
      {tab === "atlas" && <Atlas />}
    </main>

    <nav className="mobile-nav">{tabs.map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><i>{icon}</i><span>{label}</span></button>)}</nav>
    {showTopic && <TopicModal value={topic} onClose={() => setShowTopic(false)} onSave={discover} />}
    {toast && <div className="toast">✓ {toast}</div>}
  </div>;
}

function Discover({ queue, loading, onAct, onReset }: { queue: Paper[]; loading: boolean; onAct: (p: Paper, s: string) => void; onReset: () => void }) {
  const top = queue[0];
  return <section className="view discover-view">
    <div className="view-heading"><div><p className="eyebrow">LIVE DISCOVERY · OPENALEX</p><h1>今天，发现点<span>新东西</span></h1><p>输入研究问题，实时检索全球论文，再用滑动快速完成筛选。</p></div><div className="daily"><b>{queue.length}</b><span> 篇待判断</span></div></div>
    <div className="deck-area">
      <div className="deck">
        {loading && <div className="done-card loading-card"><div>⌁</div><h2>正在检索全球论文</h2><p>OpenAlex 正在按你的研究主题生成发现流…</p></div>}
        {!loading && queue.slice(0, 3).reverse().map((p, i, a) => <SwipeCard key={p.id} paper={p} top={i === a.length - 1} onAct={onAct} />)}
        {!loading && !top && <div className="done-card"><div>🎉</div><h2>今天的发现完成了</h2><p>你的选择已经保存，可以随时从论文库找回。</p><button onClick={onReset}>刷新实时推荐</button></div>}
      </div>
      {top && <div className="legend"><span>← 跳过</span><span>↑ 标重点</span><span>右滑收藏 →</span></div>}
    </div>
    <aside className="insight-panel"><p className="eyebrow">WHY THIS PAPER</p><h3>AI 推荐理由</h3><p>{top?.why || "今日推荐已全部处理。"}</p><div className="signals"><div><b>{top?.score || 0}%</b><span>主题相关度</span></div><div><b>{top?.citations || 0}</b><span>引用次数</span></div><div><b>{top?.minutes || 0}m</b><span>预计阅读</span></div></div><div className="signal-note"><span>✦</span><p><b>双信号判断</b><br/>相关度来自稳定的语义排名，“值不值得读”由 AI 独立判断，两者不被混成一个模糊分数。</p></div></aside>
  </section>;
}

function SwipeCard({ paper, top, onAct }: { paper: Paper; top: boolean; onAct: (p: Paper, s: string) => void }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 }); const origin = useRef<{x:number;y:number}|null>(null);
  useEffect(()=>{ if(!top)return; const key=(event:KeyboardEvent)=>{if(event.key==="ArrowRight")onAct(paper,"saved");if(event.key==="ArrowLeft")onAct(paper,"skipped");if(event.key==="ArrowUp")onAct(paper,"priority");if(event.key==="ArrowDown")onAct(paper,"read")}; window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[top,paper,onAct]);
  const end = () => { if (!top) return; if (drag.x > 95) onAct(paper, "saved"); else if (drag.x < -95) onAct(paper, "skipped"); else if (drag.y < -95) onAct(paper, "priority"); setDrag({x:0,y:0}); origin.current=null; };
  return <article className={`paper-card ${top ? "top" : "behind"}`} style={{ transform: top ? `translate(${drag.x}px,${drag.y}px) rotate(${drag.x/24}deg)` : undefined }} onPointerDown={(e) => { if(top){ origin.current={x:e.clientX,y:e.clientY}; e.currentTarget.setPointerCapture(e.pointerId); } }} onPointerMove={(e) => { if(origin.current) setDrag({x:e.clientX-origin.current.x,y:e.clientY-origin.current.y}); }} onPointerUp={end}>
    <div className={`swipe-stamp save ${drag.x > 55 ? "show" : ""}`}>收藏</div><div className={`swipe-stamp skip ${drag.x < -55 ? "show" : ""}`}>跳过</div><div className={`swipe-stamp focus ${drag.y < -55 ? "show" : ""}`}>重点</div>
    <div className="card-cover"><div className="journal">{paper.venue}</div><div className="paper-lines"></div><span>{paper.year}</span></div>
    <div className="card-body"><div className="badges"><b>{paper.verdict}</b><span>相关度 {paper.score}%</span></div><h2>{paper.title}</h2><h3>{paper.zh}</h3><p className="authors">{paper.authors} · {paper.venue} {paper.year}</p><div className="claim"><span>一句话读懂</span><p>{paper.claim}</p></div><div className="tags">{paper.tags.map(t => <span key={t}>#{t}</span>)}</div></div>
    <div className="card-actions"><button aria-label="跳过" onClick={() => onAct(paper,"skipped")}>×</button><button aria-label="标为重点" onClick={() => onAct(paper,"priority")}>☆</button><button className="save-btn" onClick={() => onAct(paper,"saved")}><span>收藏论文</span> →</button>{paper.url ? <button aria-label="打开原文" onClick={() => window.open(paper.url,"_blank","noopener,noreferrer")}>↗</button> : <button aria-label="已读" onClick={() => onAct(paper,"read")}>✓</button>}</div>
  </article>;
}

function downloadBibTeX(papers: Paper[]) {
  const body = papers.map((paper) => {
    const key = `${paper.authors.split(/[ ,]/)[0] || "paper"}${paper.year}${paper.id}`.replace(/[^a-zA-Z0-9]/g, "");
    const fields = [`  title = {${paper.title}}`, `  author = {${paper.authors.replace(/, /g," and ")}}`, `  year = {${paper.year}}`, `  journal = {${paper.venue}}`];
    if (paper.doi) fields.push(`  doi = {${paper.doi.replace("https://doi.org/","")}}`);
    if (paper.url) fields.push(`  url = {${paper.url}}`);
    return `@article{${key},\n${fields.join(",\n")}\n}`;
  }).join("\n\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([body], { type: "application/x-bibtex" }));
  link.download = "paperswipe-library.bib"; link.click(); URL.revokeObjectURL(link.href);
}

function Library({ papers: allPapers, states, onOpen }: { papers: Paper[]; states: Record<number,string>; onOpen:(p:Paper)=>void }) {
  const [q,setQ]=useState(""); const [filter,setFilter]=useState("all");
  const papers=useMemo(()=>allPapers.filter(p=>(filter==="all"||states[p.id]===filter)&&(`${p.title}${p.zh}${p.tags}`.toLowerCase().includes(q.toLowerCase()))),[allPapers,q,filter,states]);
  const exportable = papers.filter((paper) => states[paper.id] && states[paper.id] !== "skipped");
  return <section className="view list-view"><div className="page-title"><div><p className="eyebrow">YOUR LIBRARY · {allPapers.length} PAPERS</p><h1>论文库</h1><p>每一次滑动都变成可找回、可行动的研究资产。</p></div><button className="primary" onClick={()=>downloadBibTeX(exportable.length?exportable:papers)}>导出 BibTeX</button></div><div className="toolbar"><label>⌕<input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索标题、作者或标签"/></label><div>{[["all","全部"],["saved","感兴趣"],["priority","重点"],["read","已读"]].map(([id,l])=><button className={filter===id?"active":""} onClick={()=>setFilter(id)} key={id}>{l}</button>)}</div></div><div className="paper-list">{papers.map(p=><article key={p.id}><div className="mini-cover">{p.venue}<small>{p.year}</small></div><div className="paper-info"><div className="tags">{p.tags.slice(0,2).map(t=><span key={t}>#{t}</span>)}</div><h3>{p.zh}</h3><p>{p.title}</p><small>{p.authors} · {p.citations.toLocaleString()} 次引用 · {states[p.id] === "priority" ? "重点" : states[p.id] === "read" ? "已读" : states[p.id] === "saved" ? "已收藏" : "未分类"}</small></div><div className="row-score"><b>{p.score}%</b><span>相关</span></div><button onClick={()=>p.url?window.open(p.url,"_blank","noopener,noreferrer"):onOpen(p)}>{p.url?"阅读原文 ↗":"打开卡片 →"}</button></article>)}</div></section>;
}

function Plan({papers,states,onRead}:{papers:Paper[];states:Record<number,string>;onRead:(id:number)=>void}) {
  const chosen=papers.filter(p=>states[p.id]==="priority"||states[p.id]==="saved"||states[p.id]==="read").sort((a,b)=>(states[a.id]==="priority"?-1:0)-(states[b.id]==="priority"?-1:0)).slice(0,5);
  const list=chosen.length?chosen:papers.slice(0,5); const completed=list.filter(p=>states[p.id]==="read").length; const total=list.reduce((sum,p)=>sum+p.minutes,0);
  const dayLabels=["今天","明天","周五","周六","周日"];
  return <section className="view list-view"><div className="page-title"><div><p className="eyebrow">READING PLAN</p><h1>把收藏变成读完</h1><p>优先论文自动进入本周计划，完成状态会同步回论文库。</p></div><button className="primary" onClick={()=>window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})}>查看本周安排</button></div><div className="week"><div className="week-summary"><span>本周阅读路线</span><b>{Math.round(total/6)/10} 小时</b><em>计划阅读</em><div><i style={{width:`${list.length?completed/list.length*100:0}%`}}></i></div><small>{completed} / {list.length} 篇已完成</small></div>{list.map((paper,i)=><article key={paper.id}><div className="day"><b>{dayLabels[i]||`第 ${i+1} 天`}</b><span>{states[paper.id]==="read"?"已完成":"待阅读"}</span></div><div className="plan-paper"><span className={states[paper.id]!=="read"&&i===completed?"priority-dot":""}></span><div><small>{paper.verdict} · {paper.minutes} 分钟</small><h3>{paper.zh}</h3><p>{paper.authors}</p></div><button onClick={()=>paper.url?window.open(paper.url,"_blank","noopener,noreferrer"):onRead(paper.id)}>{states[paper.id]==="read"?"已读 ✓":paper.url?"开始读 ↗":"标记读完"}</button></div></article>)}</div></section>
}

function Trending({onSave}:{onSave:(paper:Paper)=>void}) {
  const [papers,setPapers]=useState<Paper[]>([]); const [loading,setLoading]=useState(true); const [field,setField]=useState("全部");
  useEffect(()=>{ let active=true; searchOpenAlex({mode:"trending",count:12}).then((data)=>{if(active)setPapers(data.papers)}).catch(()=>{if(active)setPapers(SEED.slice().sort((a,b)=>b.citations-a.citations))}).finally(()=>{if(active)setLoading(false)}); return()=>{active=false}},[]);
  const visible=field==="全部"?papers:papers.filter(p=>`${p.tags}${p.title}`.toLowerCase().includes(field.toLowerCase()));
  return <section className="view list-view"><div className="page-title"><div><p className="eyebrow">GLOBAL TRENDING · LIVE</p><h1>今天，全世界都在看什么</h1><p>基于近 120 天 OpenAlex 引用数据实时生成，不依赖静态榜单。</p></div><span className="live-badge"><i></i> LIVE</span></div><div className="trend-filters">{["全部","AI","Health","Education","Climate"].map(item=><button key={item} className={field===item?"active":""} onClick={()=>setField(item)}>{item}</button>)}</div>{loading?<div className="trend-loading">正在更新全球论文热榜…</div>:<div className="trend-grid">{visible.map((paper,index)=><article key={paper.id}><b className="rank">{String(index+1).padStart(2,"0")}</b><div className="trend-meta"><span>{paper.venue}</span><em>↗ {paper.citations.toLocaleString()} 引用</em></div><h3>{paper.title}</h3><p>{paper.authors} · {paper.year}</p><div className="tags">{paper.tags.slice(0,3).map(tag=><span key={tag}>#{tag}</span>)}</div><footer><button onClick={()=>onSave(paper)}>＋ 收藏</button>{paper.url&&<button onClick={()=>window.open(paper.url,"_blank","noopener,noreferrer")}>阅读原文 ↗</button>}</footer></article>)}</div>}</section>
}

function Atlas(){return <section className="view list-view"><div className="page-title"><div><p className="eyebrow">KNOWLEDGE ATLAS</p><h1>看见论文之间的关系</h1><p>PaperAtlas 的概念、争议与研究缺口，不再只是一个漂亮的引用网络。</p></div><button className="primary">生成研究综述</button></div><div className="atlas-grid"><div className="atlas-map"><div className="node core">长期记忆<span>12 篇</span></div><div className="node n1">记忆治理<span>4</span></div><div className="node n2">个性化<span>7</span></div><div className="node n3">智能体<span>9</span></div><div className="node n4">安全<span>5</span></div><div className="node n5">反思<span>6</span></div><div className="edge e1"></div><div className="edge e2"></div><div className="edge e3"></div><div className="edge e4"></div><div className="edge e5"></div></div><div className="atlas-insights"><article><span>⚡ 争议</span><h3>长期记忆提升一致性，还是放大错误？</h3><p>4 篇支持持续更新，3 篇指出外源文本污染与错误累积。</p></article><article><span>⌁ 研究缺口</span><h3>跨模型的记忆迁移仍缺少可靠评测</h3><p>这个概念只有 1 个独立工作支撑，是最值得补文献的方向。</p></article><article><span>✦ 新连接</span><h3>反思机制 × 记忆安全</h3><p>两组文献很少互相引用，但共享同一个“错误自我强化”机制。</p></article></div></div></section>}

function TopicModal({value,onClose,onSave}:{value:string;onClose:()=>void;onSave:(v:string)=>void}){const[v,setV]=useState(value);return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onSubmit={e=>{e.preventDefault();if(v.trim())onSave(v.trim())}} onMouseDown={e=>e.stopPropagation()}><button type="button" className="close" onClick={onClose}>×</button><p className="eyebrow">TELL AI WHAT MATTERS</p><h2>你最近在研究什么？</h2><p>用自然语言描述即可，AI 会拆成检索词并重新排序论文。</p><textarea autoFocus value={v} onChange={e=>setV(e.target.value)} /><div className="suggestions"><span onClick={()=>setV("AI 智能体的长期记忆与个性化")}>长期记忆</span><span onClick={()=>setV("大模型自我反思与可靠性")}>自我反思</span><span onClick={()=>setV("多模态情绪识别与对齐")}>情绪对齐</span></div><button className="primary" type="submit">生成我的发现流 →</button></form></div>}
