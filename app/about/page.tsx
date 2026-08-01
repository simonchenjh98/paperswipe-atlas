"use client";

import { useEffect } from "react";

export default function AboutPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("revealed")), { threshold: 0.12 });
    document.querySelectorAll("[data-launch-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return <div className="launch-page">
    <nav className="launch-nav"><a className="launch-logo" href="#top"><LaunchMark/><b>PaperSwipe</b></a><div><a href="#how">How it works</a><a href="#signal">Relevance</a><a href="#pricing">Pricing</a></div><a className="launch-nav-cta" href="../">Open today&apos;s brief <span>↗</span></a></nav>
    <main id="top">
      <section className="launch-hero">
        <div className="hero-noise"></div>
        <div className="launch-hero-copy" data-launch-reveal><p className="launch-label"><i></i> THE DAILY FRONTIER FOR BUILDERS</p><h1>Know what matters.<br/><em>Before everyone else.</em></h1><p>Seven high-signal research breakthroughs, ranked for what you&apos;re building and explained in plain English. Ten minutes a day.</p><div className="launch-actions"><a href="../">Read today&apos;s drop <span>→</span></a><button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>See the signal system</button></div><div className="launch-proof"><span>BUILT FOR</span><b>AI builders</b><i></i><b>Founders</b><i></i><b>Future-facing teams</b></div></div>
        <ProductStage/>
        <div className="hero-index">01 — DISCOVER</div>
      </section>

      <section className="launch-manifesto" data-launch-reveal><p>THE PROBLEM</p><h2>The frontier moves every day.<br/>Your reading list doesn&apos;t.</h2><div><p>Search gives you thousands of papers. Feeds give you whatever is popular. Neither understands what you&apos;re actually trying to build.</p><p>PaperSwipe turns the global research graph into a finite daily briefing—ranked for relevance, novelty, evidence, and practical builder value.</p></div></section>

      <section className="launch-system" id="signal">
        <div className="system-copy" data-launch-reveal><p className="launch-label"><i></i> RELEVANCE, NOT POPULARITY</p><h2>A ranking system<br/>you can actually inspect.</h2><p>Every recommendation is decomposed into independent signals. A famous paper cannot hide weak topic fit. A new paper is not buried just because it has fewer citations.</p><ul><li><b>01</b><span><strong>Broad retrieval</strong>Multiple intent-aware searches build a richer candidate set.</span></li><li><b>02</b><span><strong>Multi-signal re-ranking</strong>Topic fit, personal history, novelty, evidence, momentum, builder value.</span></li><li><b>03</b><span><strong>Feedback that compounds</strong>Every save, skip and deep read sharpens tomorrow&apos;s drop.</span></li></ul></div>
        <SignalDemo/>
      </section>

      <section className="launch-daily" id="how">
        <header data-launch-reveal><p className="launch-label"><i></i> A TEN-MINUTE RITUAL</p><h2>Finite by design.<br/><em>Useful by default.</em></h2></header>
        <div className="daily-steps" data-launch-reveal>{[
          ["01", "Tune", "Tell us what you're building toward—not just a list of keywords."],
          ["02", "Swipe", "Judge seven concise signals with a takeaway and builder angle."],
          ["03", "Go deeper", "Inspect method, evidence and limitations only when it earns attention."],
          ["04", "Compound", "Finish with a daily synthesis. Tomorrow's brief learns from today."],
        ].map(([index, title, text]) => <article key={title}><span>{index}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="launch-map" data-launch-reveal><div><p className="launch-label"><i></i> YOUR PERSONAL FRONTIER</p><h2>Watch your attention<br/>become an edge.</h2><p>See the fields gaining momentum, the mature ideas worth trusting, and the adjacent territory you haven&apos;t explored yet.</p><a href="../">Explore your signal map <span>→</span></a></div><MiniMap/></section>

      <section className="launch-pricing" id="pricing">
        <header data-launch-reveal><p className="launch-label"><i></i> SIMPLE ON PURPOSE</p><h2>One plan. One useful habit.</h2></header>
        <div className="price-card" data-launch-reveal><div className="price-card-top"><div><span>PAPERSWIPE PRO</span><h3>Your daily knowledge edge.</h3></div><p><b>$5</b><span>/month<br/><small>Founder price</small></span></p></div><div className="price-features"><span>Full 7–10 signal Daily Drop</span><span>Unlimited signal history</span><span>Topic tracking and weekly Frontier Map</span><span>BibTeX and insight exports</span><span>Personal ranking that learns from you</span></div><a href="../">Start free for seven days <span>→</span></a><small>No card during beta. Cancel anytime.</small></div>
      </section>

      <section className="launch-final"><div data-launch-reveal><LaunchMark/><p>THE FRONTIER WON&apos;T WAIT</p><h2>Read less.<br/><em>Know more.</em></h2><a href="../">Open today&apos;s brief <span>→</span></a></div></section>
    </main>
    <footer className="launch-footer"><a className="launch-logo" href="#top"><LaunchMark/><b>PaperSwipe</b></a><p>The 10-minute daily briefing for people building the future.</p><div><a href="../">Product</a><a href="#pricing">Pricing</a><a href="https://github.com/simonchenjh98/paperswipe-atlas">GitHub ↗</a></div><small>© 2026 PaperSwipe. Built at the edge of what&apos;s next.</small></footer>
  </div>;
}

function LaunchMark() { return <span className="launch-mark"><i></i><i></i><i></i></span>; }

function ProductStage() { return <div className="product-stage" id="demo" data-launch-reveal><div className="stage-glow"></div><div className="stage-card-back"></div><div className="stage-card"><header><span>HIGH SIGNAL</span><i>94</i></header><h3>SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering</h3><p>Purpose-built interfaces can matter as much as model capability when agents operate real software systems.</p><div className="stage-builder"><span>↳</span><p><b>BUILDER ANGLE</b>Redesign the tool surface before reaching for a larger model.</p></div><footer><button>×</button><button>⌁</button><button>＋ <span>Save insight</span></button></footer></div><div className="stage-signal"><span>WHY THIS MATCHED</span>{[["Topic fit",96],["Personal",88],["Novelty",78],["Evidence",82]].map(([name,value]) => <div key={name}><b>{name}</b><i><em style={{width:`${value}%`}}></em></i><span>{value}</span></div>)}</div></div>; }

function SignalDemo() { return <div className="signal-demo" data-launch-reveal><header><span>SIGNAL FINGERPRINT</span><b>94<small>/100</small></b></header>{[["Topic fit",96,"cyan"],["Personal",88,"cyan"],["Novelty",78,"orange"],["Evidence",82,"white"],["Momentum",91,"orange"],["Builder value",94,"cyan"]].map(([name,value,color]) => <div className="demo-bar" key={name}><span>{name}</span><i><b className={String(color)} style={{width:`${value}%`}}></b></i><em>{value}</em></div>)}<footer><p><i>01</i>Strong match for agents + developer tools</p><p><i>02</i>Momentum is accelerating this week</p><p><i>03</i>High practical value for your profile</p></footer></div>; }

function MiniMap() { const dots = [[20,65,24,"AI agents"],[40,35,17,"Memory"],[64,68,20,"Evaluation"],[78,28,14,"Robotics"],[88,52,11,"Embodied AI"]]; return <div className="mini-map"><span className="map-y">MOMENTUM</span><span className="map-x">MATURITY →</span><div className="mini-grid"></div>{dots.map(([x,y,size,label],index) => <div key={String(label)} className={`mini-dot m${index}`} style={{left:`${x}%`,bottom:`${y}%`,width:size,height:size}}><span>{label}</span></div>)}</div>; }
