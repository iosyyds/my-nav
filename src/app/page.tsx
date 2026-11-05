"use client";

import { useState, useMemo } from "react";
import { BOOKMARK_GROUPS, BookmarkItem } from "./bookmarks";

const PALETTES: [string, string][] = [
  ["#007aff", "#5ac8fa"], ["#af52de", "#ff2d55"], ["#ff9500", "#ffcc00"],
  ["#34c759", "#30d158"], ["#ff3b30", "#ff6b6b"], ["#5856d6", "#5e5ce6"],
  ["#00c7be", "#64d2ff"], ["#ff2d55", "#ff375f"], ["#bfaf9e", "#d2c4b5"],
  ["#8e8e93", "#aeaeb2"], ["#1d1d1f", "#3a3a3c"], ["#64d2ff", "#007aff"],
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function makeIcon(domain: string): string {
  const h = hashStr(domain);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const letter = domain.charAt(0).toUpperCase();
  const id = `g${h % 100000}`;
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="40" height="40" rx="9" fill="url(#${id})"/><text x="20" y="27" text-anchor="middle" fill="white" font-size="18" font-weight="700" font-family="-apple-system,sans-serif">${letter}</text></svg>`;
}

const CAT_COLORS: Record<string, string> = {
  "AI 工具": "#af52de",
  "iOS / 苹果": "#ff2d55",
  "开发 / 站长": "#007aff",
  "设计 / 素材": "#ff9500",
  "机场 / 网络": "#34c759",
  "网盘 / 资源": "#00c7be",
  "游戏": "#ff3b30",
  "其他": "#8e8e93",
};

const ENGINES: Record<string, string> = {
  baidu: "https://www.baidu.com/s?wd=",
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
};

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [engine, setEngine] = useState("baidu");

  const total = BOOKMARK_GROUPS.reduce((s, g) => s + g.items.length, 0);

  const quickItems = useMemo(() => {
    const seen = new Set<string>();
    const picks: BookmarkItem[] = [];
    for (const g of BOOKMARK_GROUPS) {
      for (let i = 0; i < Math.min(2, g.items.length); i++) {
        const it = g.items[i];
        if (!seen.has(it.domain)) {
          seen.add(it.domain);
          picks.push(it);
        }
      }
    }
    return picks.slice(0, 16);
  }, []);

  const visibleGroups = useMemo(() => {
    let groups = activeTab === "全部" ? BOOKMARK_GROUPS : BOOKMARK_GROUPS.filter((g) => g.name === activeTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      groups = groups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (it) =>
              it.name.toLowerCase().includes(q) ||
              it.domain.toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.items.length > 0);
    }
    return groups;
  }, [activeTab, searchQuery]);

  const totalShown = visibleGroups.reduce((s, g) => s + g.items.length, 0);

  const handleSearch = () => {
    if (searchQuery) {
      window.open(ENGINES[engine] + encodeURIComponent(searchQuery), "_blank");
    }
  };

  return (
    <>
      <div className="hero">
        <h1>我的导航</h1>
        <div className="search-container">
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="搜索书签…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
          </div>
          <div className="engine-tabs">
            {Object.keys(ENGINES).map((e) => (
              <button key={e} className={`engine-tab ${engine === e ? "active" : ""}`} onClick={() => setEngine(e)}>
                {e === "baidu" ? "百度" : e === "google" ? "Google" : "必应"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-section">
        <div className="quick-scroll">
          {quickItems.map((it) => (
            <a key={it.domain + it.url} href={it.url} target="_blank" rel="noopener" className="quick-item">
              <div className="icon" dangerouslySetInnerHTML={{ __html: makeIcon(it.domain) }} />
              <span className="name">{it.name.length > 6 ? it.name.slice(0, 6) : it.name}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="tabs-section">
        <div className="tabs">
          <button className={`tab ${activeTab === "全部" ? "active" : ""}`} onClick={() => setActiveTab("全部")}>全部 {total}</button>
          {BOOKMARK_GROUPS.map((g) => (
            <button key={g.name} className={`tab ${activeTab === g.name ? "active" : ""}`} onClick={() => setActiveTab(g.name)}>{g.name} {g.items.length}</button>
          ))}
        </div>
      </div>

      <div className="main">
        {totalShown === 0 ? (
          <div className="empty">没有找到「{searchQuery}」</div>
        ) : (
          visibleGroups.map((g) => (
            <div key={g.name} className="section">
              <div className="section-header">
                <span style={{ color: CAT_COLORS[g.name] || "#8e8e93", fontSize: 18 }}>●</span>
                <h2>{g.name}</h2>
                <span className="count">{g.items.length}</span>
              </div>
              <div className="grid">
                {g.items.map((it) => (
                  <a key={it.url} href={it.url} target="_blank" rel="noopener" className="card">
                    <div className="favicon" dangerouslySetInnerHTML={{ __html: makeIcon(it.domain) }} />
                    <div className="info">
                      <div className="name">{highlight(it.name, searchQuery)}</div>
                      <div className="domain">{it.domain}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="footer">共 {totalShown} 个书签</div>
    </>
  );
}
