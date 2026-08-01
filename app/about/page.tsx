"use client";

import { useEffect, useState } from "react";

const slides = [
  { day: "MON", title: "Generative Agents", meta: "24 min · Priority", color: "violet" },
  { day: "TUE", title: "MemoryBank", meta: "16 min · Saved", color: "cyan" },
  { day: "WED", title: "MemGPT", meta: "21 min · Systems", color: "coral" },
  { day: "THU", title: "Long-Term Memory Security", meta: "28 min · AI pick", color: "green" },
];

export default function AboutPage() {
  const [slide, setSlide] = useState(0);
  const [active, setActive] = useState("explore");

  useEffect(() => {
    const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    }), { threshold: 0.14 });
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    const nav = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    }), { threshold: 0.42 });
    ["explore", "library", "schedule", "trending"].forEach((id) => {
      const element = document.getElementById(id); if (element) nav.observe(element);
    });
    return () => { reveal.disconnect(); nav.disconnect(); };
  }, []);

  useEffect(() => { const timer = window.setInterval(() => setSlide((s) => (s + 1) % slides.length), 3200); return () => window.clearInterval(timer); }, []);

  return <div className="landing">
    <div className="landing-orbs" aria-hidden="true"><i></i><i></i><i></i></div>
    <header className="landing-nav"><div className="landing-nav-inner">
      <a className="landing-brand" href="#top"><span>🎉</span><b>PaperSwipe</b></a>
      <nav>{["explore","library","schedule","trending"].map((id)=><a className={active===id?"active":""} key={id} href={`#${id}`}>{id[0].toUpperCase()+id.slice(1)}</a>)}</nav>
      <a className="landing-cta small" href="../">立即体验 <span>→</span></a>
    </div></header>

    <main id="top">
      <section className="landing-hero">
        <div className="landing-hero-copy" data-reveal><p className="landing-eyebrow">What if Google Scholar felt like TikTok?</p><h1>别再<span className="strike-word">搜</span>论文了，<br/>开始<span className="gradient-word">刷</span>论文。</h1><p>AI 先认识你，再替你发现论文。像刷短视频一样，几分钟完成过去需要几小时的筛选。</p><div className="landing-actions"><a className="landing-cta" href="../">开始刷论文 <span>→</span></a><a href="#explore">看看怎么工作</a></div><div className="landing-stats"><div><b>5s</b><span>判断是否值得读</span></div><div><b>0</b><span>次手动翻译摘要</span></div><div><b>Live</b><span>全球论文实时接入</span></div></div></div>
        <div className="hero-device-stage" data-reveal><div className="hero-glow"></div><Phone variant="back"/><Phone variant="front"/></div>
      </section>

      <section className="landing-pain"><div className="landing-centered" data-reveal><p className="section-label">痛点</p><h2>读论文最贵的成本，<br/>不仅仅是「读」，还有<span>找</span>。</h2></div><div className="pain-grid" data-reveal><div className="fake-browser"><div className="browser-bar"><i></i><i></i><i></i><span>scholar.google.com</span></div><div className="search-screen"><div className="google-mark">Scholar</div><div className="search-box">long-term memory LLM agents　⌕</div>{[1,2,3,4].map(n=><div className="result-line" key={n}><b></b><span></span><em></em></div>)}</div></div><div className="pain-steps">{["搜一个关键词，得到几千篇结果","逐篇打开、翻译摘要、判断相关性","重复几十次，收藏一堆论文","最后真正读完的：0 篇"].map((text,i)=><div className={i===3?"result":""} key={text}><b>{i===3?"🤯":`0${i+1}`}</b><span>{text}</span></div>)}</div></div><p className="pain-note">问题不是论文不够多，而是从「几千篇结果」到「值得读的那一篇」之间，隔着太多重复劳动。</p></section>

      <section className="landing-idea"><div data-reveal><p className="section-label">一个大胆的想法</p><h2>如果找论文，能像刷 <span className="gradient-word">TikTok</span> 一样呢？</h2><p>不用输入精确关键词，不用翻几十页结果。AI 理解你的方向、阅读历史和最近关注，直接把最可能有用的论文推到眼前。</p><h3>于是有了 <b>PaperSwipe</b> 🎉</h3></div></section>

      <Feature id="explore" index="01" title={<>AI 先认识你，<br/>再替你发现论文</>} copy="用自然语言告诉 AI 你的研究问题，它会生成检索策略，实时连接 OpenAlex，并把高价值论文变成可快速判断的贡献卡片。" items={["一句话抓住核心贡献","问题、方法、结果和创新点分层呈现","左滑跳过 · 右滑收藏 · 上滑重点 · 下滑已读"]}><SwipeDemo/></Feature>
      <Feature id="library" index="02" title={<>划走的每一篇论文，<br/>都有真正属于它的家</>} copy="收藏不会掉进杂乱文件夹。Library 记录每次判断，支持搜索、状态筛选和一键导出，随时回到原文。" items={["感兴趣 · 重点 · 已读，进度一眼看清","主题标签与全文标题搜索","真实 BibTeX 导出，接入文献工作流"]} reverse><LibraryDemo/></Feature>
      <Feature id="schedule" index="03" title={<>AI 帮你规划阅读，<br/>论文不再躺着吃灰</>} copy="收藏只是起点。阅读计划按价值、阅读时长和当前状态排出一周路线，完成后自动同步到论文库。" items={["优先论文自动进入本周路线","阅读时长与完成进度实时统计","打开原文与标记已读形成闭环"]}><ScheduleDemo slide={slide} setSlide={setSlide}/></Feature>
      <Feature id="trending" index="04" title={<>今天，全世界<br/>都在看什么</>} copy="实时聚合近半年人工智能研究的高引用论文，让热点、重要工作与潜在新方向更早出现在你的雷达上。" items={["OpenAlex 实时引用趋势","按领域筛选全局热点","一键收藏进个人论文库"]} reverse><TrendingDemo/></Feature>

      <section className="landing-philosophy"><div data-reveal><p className="section-label">我们的理念</p><h2>未来发现论文的方式，<br/>不应该是 <span className="outline-word">Search</span>，<br/>而应该是 <span className="gradient-word">Discover</span>。</h2><p>只需要说清楚自己正在研究什么，剩下的交给 AI。</p></div></section>
      <section className="landing-final"><div data-reveal><h2>把「找论文」的力气，<br/>还给「<span className="gradient-word">读论文</span>」本身。</h2><b>Swipe Right On Science.</b><a className="landing-cta" href="../">别再搜论文了，开始刷论文 <span>→</span></a><p>当前版本已支持实时发现、滑动筛选、阅读计划与趋势追踪。</p></div></section>
    </main>
    <footer className="landing-footer">© PaperSwipe Atlas — Discover, not Search. <a href="../">进入产品</a></footer>
  </div>;
}

function Feature({id,index,title,copy,items,reverse=false,children}:{id:string;index:string;title:React.ReactNode;copy:string;items:string[];reverse?:boolean;children:React.ReactNode}) { return <section id={id} className={`landing-feature ${reverse?"reverse":""}`}><div className="feature-copy" data-reveal><p className="section-label">{index} · {id}</p><h2>{title}</h2><p>{copy}</p><ul>{items.map(item=><li key={item}><i>✓</i><span>{item}</span></li>)}</ul><a href="../">立即体验此功能 <span>→</span></a></div><div className="feature-art" data-reveal>{children}</div></section> }

function Phone({variant}:{variant:"front"|"back"}) { return <div className={`landing-phone ${variant}`}><div className="phone-top"><span>9:41</span><i></i></div><div className="phone-brand">✦ PaperSwipe</div>{variant==="front"?<><div className="phone-paper"><small>PRIORITY · 97% MATCH</small><h3>Generative Agents</h3><p>用记忆、反思与规划构成可信的生成式智能体行为架构。</p><div><span>#Agent</span><span>#Memory</span></div></div><div className="phone-actions"><b>×</b><b>☆</b><b>→</b></div></>:<><div className="phone-list-title">Your Library</div>{["Priority","Interested","Read"].map((x,i)=><div className="phone-row" key={x}><i></i><p><b>{x}</b><span>{["12 papers","28 papers","41 papers"][i]}</span></p></div>)}</>}</div> }
function SwipeDemo(){return <div className="demo-stack"><div className="demo-card back"></div><div className="demo-card"><small>优先读 · 93% 相关</small><h3>Self-Reflection in LLM Agents</h3><p>语言反馈驱动的反思能在不更新参数的情况下改进多轮决策。</p><div className="demo-tags"><span>#Reflection</span><span>#Reasoning</span></div><footer><i>×</i><i>☆</i><b>收藏 →</b></footer></div></div>}
function LibraryDemo(){return <div className="library-demo"><div className="library-head"><b>Library</b><span>⌕</span></div><div className="library-tabs"><b>All 68</b><span>Saved 28</span><span>Priority 12</span></div>{["Generative Agents","MemoryBank","MemGPT","Long-Term Memory Security"].map((x,i)=><div className="library-paper" key={x}><i>{["UIST","AAAI","ARXIV","SURVEY"][i]}</i><p><b>{x}</b><span>{93-i*4}% match · {18+i*3} min</span></p><em>›</em></div>)}</div>}
function ScheduleDemo({slide,setSlide}:{slide:number;setSlide:(n:number)=>void}){return <div className="schedule-demo"><div className="schedule-top"><b>This week</b><span>3.2 hours</span></div><div className="schedule-progress"><i></i></div><div className="schedule-stage">{slides.map((item,i)=><div className={`schedule-slide ${i===slide?"active":""}`} key={item.title}><small>{item.day}</small><div className={`schedule-icon ${item.color}`}>▤</div><h3>{item.title}</h3><p>{item.meta}</p><button>Start reading →</button></div>)}</div><div className="schedule-dots">{slides.map((_,i)=><button aria-label={`第 ${i+1} 张`} className={i===slide?"active":""} key={i} onClick={()=>setSlide(i)}></button>)}</div></div>}
function TrendingDemo(){return <div className="trending-demo"><header><b>Trending</b><span><i></i> LIVE</span></header>{["A Survey of Large Language Models","Sycophantic AI decreases prosocial intentions","Accelerating scientific discovery with Co-Scientist"].map((x,i)=><div key={x}><strong>0{i+1}</strong><p><b>{x}</b><span>↗ {1423-i*631} citations</span></p><button>＋</button></div>)}</div>}
