import { useEffect, useState, useMemo } from 'react';
import {
  Activity, AlertOctagon, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight,
  BadgeAlert, BadgeCheck, Bell, Building2, Check, ChevronDown, CircleHelp, CloudOff,
  Copy, ExternalLink, Eye, Filter, Fingerprint, Globe2, LayoutDashboard, LoaderCircle,
  LockKeyhole, Menu, MoreHorizontal, Plus, RefreshCw, Search, Send, Settings2,
  Share2, Shield, ShieldAlert, ShieldCheck, Smartphone, Sparkles, Terminal, Trash2,
  TrendingUp, UserCheck, Users, X, Zap,
} from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || 'https://hackathon-ga7j.onrender.com/api').replace(/\/$/, '');

const PRESET_BRANDS = ['Nike', 'Apple', 'Spotify', 'Binance', 'Tesla', 'Northstar'];

async function request(path, options) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || `HTTP ${response.status} ${response.statusText}` };
  }
  if (!response.ok) {
    throw new Error(data.error || `Server request failed with code ${response.status}`);
  }
  return data;
}

// Risk Level Calculation
function getRiskLevel(score) {
  if (score >= 85) return { label: 'CRITICAL', color: 'text-rose-400 bg-rose-950/60 border-rose-800/80', dot: 'bg-rose-500' };
  if (score >= 70) return { label: 'HIGH', color: 'text-amber-400 bg-amber-950/60 border-amber-800/80', dot: 'bg-amber-500' };
  return { label: 'ELEVATED', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/80', dot: 'bg-indigo-500' };
}

// Platform Badges with brand styling
function PlatformBadge({ platform, type }) {
  const meta = {
    Instagram: { icon: 'IG', color: 'bg-pink-950/40 text-pink-400 border-pink-800/50' },
    X: { icon: '𝕏', color: 'bg-slate-900 text-slate-200 border-slate-700/80' },
    Facebook: { icon: 'FB', color: 'bg-blue-950/40 text-blue-400 border-blue-800/50' },
    TikTok: { icon: 'TT', color: 'bg-teal-950/40 text-teal-300 border-teal-800/50' },
    LinkedIn: { icon: 'IN', color: 'bg-sky-950/40 text-sky-400 border-sky-800/50' },
    'Google Play': { icon: 'GP', color: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/50' },
    'App Store': { icon: 'IOS', color: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50' },
  }[platform] || { icon: type === 'app' ? 'APP' : 'WEB', color: 'bg-slate-900 text-slate-400 border-slate-800' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${meta.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {platform || (type === 'app' ? 'App Store' : 'Social Web')}
    </span>
  );
}

// Status Badges
function StatusBadge({ status }) {
  const styles = {
    New: 'bg-rose-950/50 text-rose-300 border-rose-800/60',
    Reviewing: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
    Escalated: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
    Dismissed: 'bg-slate-900 text-slate-400 border-slate-800',
  }[status] || 'bg-slate-900 text-slate-400 border-slate-800';

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${styles}`}>
      {status}
    </span>
  );
}

// Sidebar Component
function Sidebar({ page, setPage, open, setOpen, brand, onSelectBrand, findings }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const socialCount = findings.filter((f) => f.type === 'social').length;
  const appCount = findings.filter((f) => f.type === 'app').length;
  const criticalCount = findings.filter((f) => f.score >= 85 && f.status !== 'Dismissed').length;

  const navigation = [
    { id: 'overview', label: 'Executive Radar', icon: LayoutDashboard },
    { id: 'social', label: 'Social Surveillance', icon: Globe2, badge: socialCount },
    { id: 'apps', label: 'App Store Defense', icon: Smartphone, badge: appCount },
    { id: 'brand', label: 'Protected Identity', icon: Building2 },
    { id: 'architecture', label: 'Threat Architecture', icon: Activity },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-950/90 border-r border-slate-800/80 backdrop-blur-2xl flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Wordmark */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
        <a href="#overview" onClick={() => setPage('overview')} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/15 group-hover:border-indigo-400/60 transition">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="font-extrabold text-white tracking-tight">SIGNAL</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-extrabold">GUARD</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-indigo-950/60 border border-indigo-800/50 text-indigo-300">DRP</span>
          </div>
        </a>
        <button className="lg:hidden p-1 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
      </div>

      {/* Monitored Workspace Switcher */}
      <div className="p-3">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition text-left group"
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 rounded bg-slate-950 object-contain p-0.5 border border-slate-800" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800/50 flex items-center justify-center font-bold text-xs text-indigo-300 shadow-inner">
                {(brand.name || 'B').charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Target Workspace</div>
              <div className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition">{brand.name || 'Select Brand'}</div>
            </div>
            <ChevronDown size={14} className="text-slate-500 group-hover:text-indigo-400 transition" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 py-1.5 bg-slate-900/95 border border-indigo-900/40 rounded-lg shadow-2xl backdrop-blur-xl z-40">
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400">Switch Target Brand</div>
              {PRESET_BRANDS.map((preset) => (
                <button
                  key={preset}
                  className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-indigo-950/40 ${brand.name.toLowerCase() === preset.toLowerCase() ? 'text-indigo-300 bg-indigo-950/60 font-semibold' : 'text-slate-300'}`}
                  onClick={() => {
                    onSelectBrand(preset);
                    setDropdownOpen(false);
                  }}
                >
                  <span>{preset}</span>
                  {brand.name.toLowerCase() === preset.toLowerCase() && <Check size={12} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <div className="px-3 pt-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">Security Modules</div>
      <nav className="p-3 space-y-1 flex-1">
        {navigation.map(({ id, label, icon: Icon, badge }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => { setPage(id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${active ? 'bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 text-indigo-200 border border-indigo-500/30 shadow-sm shadow-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'}`}
            >
              <Icon size={16} className={active ? 'text-indigo-400' : 'text-slate-500'} />
              <span className="flex-1 text-left">{label}</span>
              {Boolean(badge) && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${id === 'overview' && criticalCount ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live System Status Indicator */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-indigo-950/80 text-xs flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="font-mono text-[11px] text-slate-300">Gemini Live DRP</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">ACTIVE</span>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/30 text-slate-400 text-xs">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-900 to-violet-900 border border-indigo-700/50 flex items-center justify-center font-mono text-[10px] text-indigo-200 shadow-sm">
            SOC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200">Security Analyst</div>
            <div className="text-[10px] font-mono text-cyan-400/80 truncate">Render Cloud Host</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Header Component
function Header({ page, onScan, scanning, onMenu, onLookupBrand, brandSearching, brand, findings }) {
  const [query, setQuery] = useState('');
  const criticalCount = findings.filter((f) => f.score >= 85 && f.status !== 'Dismissed').length;

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    onLookupBrand(query.trim());
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded border border-slate-800">
          <Menu size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>SURVEILLANCE</span>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-indigo-300 uppercase">{brand.name || 'Brand'}</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400">{brand.domain}</span>
        </div>
      </div>

      {/* Brand Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-2">
        <div className="relative flex items-center group">
          <Search size={14} className="absolute left-3 text-slate-500 group-focus-within:text-indigo-400 transition pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={brandSearching}
            placeholder="Enter brand name (e.g. Nike, Apple, Spotify)..."
            className="w-full h-9 pl-9 pr-24 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/50 transition font-mono shadow-inner"
          />
          <button
            type="submit"
            disabled={brandSearching || !query.trim()}
            className="absolute right-1 px-2.5 py-1 rounded bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-[10px] tracking-wide flex items-center gap-1 transition shadow-sm shadow-indigo-500/20"
          >
            {brandSearching ? <LoaderCircle className="animate-spin" size={12} /> : <Sparkles size={12} className="text-cyan-300" />}
            <span>{brandSearching ? 'PROFILING...' : 'ANALYZE'}</span>
          </button>
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
          <ShieldAlert size={13} className={criticalCount ? 'text-rose-400' : 'text-slate-500'} />
          <span>ALERTS:</span>
          <strong className={criticalCount ? 'text-rose-400' : 'text-slate-400'}>{criticalCount}</strong>
        </div>

        <button
          onClick={onScan}
          disabled={scanning || brandSearching}
          className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
        >
          {scanning ? <LoaderCircle className="animate-spin text-cyan-400" size={14} /> : <RefreshCw size={14} className="text-cyan-400" />}
          <span className="hidden sm:inline">{scanning ? 'SURVEILLANCE SCAN...' : 'RUN SCAN'}</span>
        </button>
      </div>
    </header>
  );
}

// Executive Metric Card
function MetricCard({ title, value, subtitle, icon: Icon, tone = 'slate', badge }) {
  const tones = {
    indigo: 'border-indigo-800/40 bg-indigo-950/30 text-indigo-400 shadow-indigo-500/5',
    cyan: 'border-cyan-800/40 bg-cyan-950/30 text-cyan-400 shadow-cyan-500/5',
    rose: 'border-rose-800/40 bg-rose-950/20 text-rose-400 shadow-rose-500/5',
    amber: 'border-amber-800/40 bg-amber-950/20 text-amber-400 shadow-amber-500/5',
    slate: 'border-slate-800 bg-slate-900/60 text-slate-300',
  }[tone];

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>{title}</span>
        <div className={`p-2 rounded-lg border ${tones}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{value}</span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

// Risk Alert Banner
function RiskAlertBanner({ finding, onStatus }) {
  if (!finding) return null;
  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-950/50 via-slate-900/90 to-slate-900/90 border border-rose-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 mt-0.5">
          <AlertOctagon size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold tracking-wider">
              CRITICAL INCIDENT DETECTED
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Severity: {finding.score}/100</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-1">
            {finding.name} <span className="text-slate-400 font-normal">({finding.handle || finding.publisher})</span> — {finding.category}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
            {finding.description || 'Observed impersonation activity targeting brand consumers with deceptive branding.'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        <button
          onClick={() => onStatus(finding.id, 'Escalated')}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-rose-900/30"
        >
          <BadgeAlert size={14} />
          <span>Escalate to SOC</span>
        </button>
        {finding.sourceUrl && (
          <a
            href={finding.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Inspect external link"
          >
            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </div>
  );
}

// 7-Day Trend Chart Component
function ThreatTrendChart({ findings }) {
  const points = '0,75 35,68 70,72 105,50 140,58 175,38 210,42 245,20 280,30 315,14';
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-xl flex flex-col justify-between backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap size={15} className="text-indigo-400" />
            Threat Discovery Velocity
          </h3>
          <p className="text-xs text-slate-400">7-day continuous telemetry across web and mobile surfaces</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40">
          <TrendingUp size={12} className="text-cyan-400" />
          <span>CONTINUOUS STREAM</span>
        </div>
      </div>

      <div className="relative h-28 w-full mt-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 315 85" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cyber-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#02040a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cyber-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path d={`M ${points} L 315 85 L 0 85 Z`} fill="url(#cyber-gradient)" />
          <polyline points={points} fill="none" stroke="url(#cyber-stroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {[[0,75], [70,72], [140,58], [210,42], [280,30], [315,14]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="3" fill="#02040a" stroke="#22d3ee" strokeWidth="2" />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
        <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span className="text-cyan-400 font-bold">TODAY</span>
      </div>
    </div>
  );
}

// Social Media Monitoring Table
function SocialMonitoringSection({ findings, onStatus, filter, setFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const socialFindings = findings.filter((f) => f.type === 'social');

  const filtered = socialFindings.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = !searchTerm.trim() ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.handle && item.handle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-xl overflow-hidden backdrop-blur-xl">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe2 size={16} className="text-indigo-400" />
            Social Media Impersonation Radar
          </h3>
          <p className="text-xs text-slate-400">Detected spoofed handles, fake support hubs, and giveaway fraud</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter social handles..."
              className="h-8 pl-8 pr-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 font-mono"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Reviewing">Reviewing</option>
            <option value="Escalated">Escalated</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Candidate Identity</th>
              <th className="py-3 px-4">Threat Vector</th>
              <th className="py-3 px-4">Risk Severity</th>
              <th className="py-3 px-4">Detection Signals</th>
              <th className="py-3 px-4">Discovered</th>
              <th className="py-3 px-4 text-right">Triage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.length ? (
              filtered.map((item) => {
                const risk = getRiskLevel(item.score);
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition group">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PlatformBadge platform={item.platform} type="social" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.sourceUrl && (
                          <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition" title="Open grounded source">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {item.handle} {item.followers && <span className="text-slate-500">· {item.followers}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">{item.category}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${risk.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                        {item.score} <span className="text-[9px] opacity-75">{risk.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(item.signals || []).slice(0, 2).map((sig) => (
                          <span key={sig} className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
                            {sig}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {item.detected || 'Recent'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <select
                        value={item.status}
                        onChange={(e) => onStatus(item.id, e.target.value)}
                        className="h-7 px-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                  No social impersonation threats found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// App Store Monitoring Section
function AppMonitoringSection({ findings, onStatus }) {
  const appFindings = findings.filter((f) => f.type === 'app');

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-xl overflow-hidden backdrop-blur-xl">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone size={16} className="text-cyan-400" />
            App Store Defense & Counterfeit APKs
          </h3>
          <p className="text-xs text-slate-400">Surveillance across Google Play and iOS App Store for copycat apps and unauthorized publishers</p>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-indigo-300">
          {appFindings.length} APPS IDENTIFIED
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {appFindings.length ? (
          appFindings.map((item) => {
            const risk = getRiskLevel(item.score);
            return (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/30 transition flex flex-col justify-between gap-3 shadow-md">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PlatformBadge platform={item.platform} type="app" />
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${risk.color}`}>
                        Risk {item.score}
                      </span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.sourceUrl && (
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </h4>

                  <div className="mt-1 space-y-0.5 text-xs font-mono">
                    <div className="text-slate-400">
                      Publisher: <strong className="text-rose-300">{item.publisher || 'Unverified third party'}</strong>
                    </div>
                    {item.appId && <div className="text-slate-500 truncate">Bundle ID: {item.appId}</div>}
                    {item.followers && <div className="text-slate-400">Downloads/Rating: {item.followers}</div>}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {item.description || 'Potentially unauthorized client application utilizing brand trademarks without approval.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {(item.signals || []).slice(0, 2).map((sig) => (
                      <span key={sig} className="px-1.5 py-0.2 rounded text-[9px] bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                        {sig}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStatus(item.id, 'Escalated')}
                      className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 text-[11px] font-semibold transition"
                    >
                      Takedown
                    </button>
                    <button
                      onClick={() => onStatus(item.id, 'Dismissed')}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-[11px] transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-10 text-center text-slate-500 font-mono text-xs">
            No suspicious mobile applications discovered.
          </div>
        )}
      </div>
    </div>
  );
}

// Brand Profile Manager
function BrandProfileSection({ brand, setBrand, onLookupBrand, brandSearching }) {
  const [form, setForm] = useState(brand);
  const [enrichInput, setEnrichInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setForm(brand), [brand]);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function handleEnrich(e) {
    e.preventDefault();
    const query = enrichInput.trim() || form.name.trim();
    if (!query) return;
    onLookupBrand(query);
    setEnrichInput('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await request('/brand', { method: 'PUT', body: JSON.stringify(form) });
      setBrand(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Auto-Enrich Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-800/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/15">
            <Sparkles size={20} className="text-cyan-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Auto-Enrich Brand Footprint with Gemini</h3>
            <p className="text-xs text-slate-400">Instantly discovers official primary domains, verified social accounts, and registered app store IDs</p>
          </div>
        </div>

        <form onSubmit={handleEnrich} className="flex items-center gap-2">
          <input
            type="text"
            value={enrichInput}
            onChange={(e) => setEnrichInput(e.target.value)}
            placeholder="e.g. Nike, Spotify, Tesla"
            className="h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500/60"
          />
          <button
            type="submit"
            disabled={brandSearching}
            className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-indigo-500/25"
          >
            {brandSearching ? <LoaderCircle className="animate-spin" size={14} /> : <Sparkles size={14} className="text-cyan-300" />}
            <span>{brandSearching ? 'PROFILING...' : 'FETCH PROFILE'}</span>
          </button>
        </form>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identity */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-4 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building2 size={16} className="text-indigo-400" />
              Core Brand Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Company / Trading Name</label>
                <input
                  required
                  value={form.name || ''}
                  onChange={(e) => setField('name', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Primary Official Domain</label>
                <input
                  required
                  value={form.domain || ''}
                  onChange={(e) => setField('domain', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Brand Description</label>
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={(e) => setField('description', e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Social Accounts Allow-list */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 size={16} className="text-indigo-400" />
                Allow-Listed Social Accounts ({form.officialSocials?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setField('officialSocials', [...(form.officialSocials || []), { platform: 'Instagram', handle: '' }])}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus size={13} />
                <span>Add Account</span>
              </button>
            </div>

            <div className="space-y-2">
              {(form.officialSocials || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.platform}
                    onChange={(e) => setField('officialSocials', form.officialSocials.map((s, i) => i === idx ? { ...s, platform: e.target.value } : s))}
                    className="h-8 px-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                  >
                    {['Instagram', 'X', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <input
                    value={item.handle}
                    onChange={(e) => setField('officialSocials', form.officialSocials.map((s, i) => i === idx ? { ...s, handle: e.target.value } : s))}
                    placeholder="@officialhandle"
                    className="flex-1 h-8 px-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />

                  <button
                    type="button"
                    onClick={() => setField('officialSocials', form.officialSocials.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Official Apps */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone size={16} className="text-cyan-400" />
                Verified Mobile Applications ({form.officialApps?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setField('officialApps', [...(form.officialApps || []), { store: 'Google Play', name: '', appId: '', publisher: '' }])}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus size={13} />
                <span>Add App</span>
              </button>
            </div>

            <div className="space-y-3">
              {(form.officialApps || []).map((app, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <select
                    value={app.store}
                    onChange={(e) => setField('officialApps', form.officialApps.map((a, i) => i === idx ? { ...a, store: e.target.value } : a))}
                    className="h-8 px-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                  >
                    <option value="Google Play">Google Play</option>
                    <option value="App Store">App Store</option>
                  </select>

                  <input
                    value={app.name}
                    onChange={(e) => setField('officialApps', form.officialApps.map((a, i) => i === idx ? { ...a, name: e.target.value } : a))}
                    placeholder="App Name"
                    className="h-8 px-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  />

                  <input
                    value={app.appId}
                    onChange={(e) => setField('officialApps', form.officialApps.map((a, i) => i === idx ? { ...a, appId: e.target.value } : a))}
                    placeholder="Bundle ID / Package"
                    className="h-8 px-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      value={app.publisher}
                      onChange={(e) => setField('officialApps', form.officialApps.map((a, i) => i === idx ? { ...a, publisher: e.target.value } : a))}
                      placeholder="Publisher"
                      className="flex-1 h-8 px-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setField('officialApps', form.officialApps.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aside Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck size={20} />
              <h4 className="font-bold text-white text-sm">False-Positive Shield</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All official handles and bundle IDs defined here are allow-listed and strictly excluded prior to risk score calculation.
            </p>
            <div className="pt-3 border-t border-slate-800 font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Verified Social Accounts:</span>
                <strong className="text-indigo-300">{form.officialSocials?.length || 0}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Protected App IDs:</span>
                <strong className="text-cyan-300">{form.officialApps?.length || 0}</strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-2">
            <div>
              {saved && <span className="text-xs text-cyan-400 font-mono flex items-center gap-1"><Check size={13} /> Saved</span>}
              {error && <span className="text-xs text-rose-400 font-mono">{error}</span>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-indigo-500/20 ml-auto"
            >
              {saving ? <LoaderCircle className="animate-spin" size={14} /> : <Check size={14} />}
              <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Architecture Pipeline Diagram
function ArchitectureSection() {
  const steps = [
    { num: '01', title: 'Target Ingestion', desc: 'Continuous intake of indexed social handles, web endpoints, and Google Play / iOS listings.', icon: Globe2 },
    { num: '02', title: 'Allow-List Filter', desc: 'Candidate identifiers cross-referenced with official brand handles and package IDs; exact matches dismissed.', icon: ShieldCheck },
    { num: '03', title: 'Look-Alike Scorer', desc: 'Levenshtein distance, brand description parsing, transposed glyphs, and unapproved publisher verification.', icon: Sparkles },
    { num: '04', title: 'SOC Response Queue', desc: 'High-risk threats populated with forensic signals for analyst takedown escalation.', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-white">SignalGuard DRP Detection Pipeline</h3>
        <p className="text-xs text-slate-400 mt-1">Autonomous threat isolation architecture powered by Google Gemini and live public indexing.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {steps.map((st) => (
            <div key={st.num} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative space-y-2 group hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{st.num}</span>
                <st.icon size={16} className="text-slate-500 group-hover:text-indigo-400 transition" />
              </div>
              <h4 className="text-sm font-bold text-white">{st.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App Container
export default function App() {
  const [page, setPage] = useState('overview');
  const [brand, setBrand] = useState({ name: 'Northstar', domain: 'northstar.com', description: '', officialSocials: [], officialApps: [] });
  const [findings, setFindings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [scanning, setScanning] = useState(false);
  const [brandSearching, setBrandSearching] = useState(false);
  const [notification, setNotification] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function loadDashboard() {
    try {
      const [b, f] = await Promise.all([request('/brand'), request('/findings')]);
      setBrand(b);
      setFindings(f);
    } catch (err) {
      console.warn('Dashboard load warning:', err.message);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleLookupBrand(name) {
    if (!name || !name.trim()) return;
    setBrandSearching(true);
    setNotification(`Profiling brand "${name}" with Gemini Intelligence...`);
    try {
      const res = await request('/brand/lookup', {
        method: 'POST',
        body: JSON.stringify({ brandName: name.trim() }),
      });
      setBrand(res.brand);
      setFindings(res.findings);
      setNotification(`✓ Discovered ${res.detections} threats targeting ${res.brand.name}.`);
      setTimeout(() => setNotification(''), 7000);
    } catch (err) {
      setNotification(`Error: ${err.message}`);
    } finally {
      setBrandSearching(false);
    }
  }

  async function runScan() {
    setScanning(true);
    setNotification(`Scanning live threat indicators for ${brand.name}...`);
    try {
      const res = await request('/scan', { method: 'POST' });
      await loadDashboard();
      setNotification(`Scan finished: ${res.scanned} evaluated · ${res.detections} active threats.`);
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      setNotification(`Scan error: ${err.message}`);
    } finally {
      setScanning(false);
    }
  }

  async function updateFindingStatus(id, status) {
    try {
      const updated = await request(`/findings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setFindings((prev) => prev.map((f) => f.id === id ? { ...f, status: updated.status } : f));
    } catch (err) {
      console.error('Update status failed:', err.message);
    }
  }

  const criticalThreats = useMemo(() => findings.filter((f) => f.score >= 85 && f.status !== 'Dismissed'), [findings]);
  const activeThreats = useMemo(() => findings.filter((f) => f.status !== 'Dismissed'), [findings]);
  const topCriticalAlert = criticalThreats[0] || null;

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <Sidebar
        page={page}
        setPage={setPage}
        open={mobileNavOpen}
        setOpen={setMobileNavOpen}
        brand={brand}
        onSelectBrand={handleLookupBrand}
        findings={findings}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          page={page}
          onScan={runScan}
          scanning={scanning}
          onMenu={() => setMobileNavOpen(true)}
          onLookupBrand={handleLookupBrand}
          brandSearching={brandSearching}
          brand={brand}
          findings={findings}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Notification Toast */}
          {notification && (
            <div className="p-3 rounded-lg bg-slate-900/90 border border-indigo-500/40 text-xs font-mono text-cyan-300 flex items-center justify-between shadow-2xl backdrop-blur-xl">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400" />
                {notification}
              </span>
              <button onClick={() => setNotification('')} className="p-1 text-slate-400 hover:text-white">
                <X size={13} />
              </button>
            </div>
          )}

          {/* Critical Risk Alert Banner */}
          {page === 'overview' && topCriticalAlert && (
            <RiskAlertBanner finding={topCriticalAlert} onStatus={updateFindingStatus} />
          )}

          {/* View Switcher */}
          {page === 'overview' && (
            <>
              {/* Executive Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="ACTIVE THREATS"
                  value={String(activeThreats.length).padStart(2, '0')}
                  subtitle="Requiring SOC triage"
                  icon={ShieldAlert}
                  tone={activeThreats.length > 3 ? 'rose' : 'amber'}
                  badge={criticalThreats.length ? `${criticalThreats.length} CRITICAL` : null}
                />
                <MetricCard
                  title="SPOOFED SOCIALS"
                  value={String(findings.filter((f) => f.type === 'social').length).padStart(2, '0')}
                  subtitle="Across 5 networks"
                  icon={Globe2}
                  tone="indigo"
                />
                <MetricCard
                  title="ROGUE MOBILE APPS"
                  value={String(findings.filter((f) => f.type === 'app').length).padStart(2, '0')}
                  subtitle="Public app stores"
                  icon={Smartphone}
                  tone="cyan"
                />
                <MetricCard
                  title="PROTECTED ASSETS"
                  value={String((brand.officialSocials?.length || 0) + (brand.officialApps?.length || 0)).padStart(2, '0')}
                  subtitle="Allow-listed profiles"
                  icon={BadgeCheck}
                  tone="slate"
                />
              </div>

              {/* Middle Section: Trend Chart & Threat Posture */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ThreatTrendChart findings={findings} />
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-xl flex flex-col justify-between backdrop-blur-xl">
                  <div>
                    <h3 className="text-sm font-bold text-white">Brand Risk Posture</h3>
                    <p className="text-xs text-slate-400">Automated risk assessment score for {brand.name}</p>
                    <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between shadow-inner">
                      <div>
                        <div className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
                          {criticalThreats.length ? '84/100' : '38/100'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {criticalThreats.length ? 'CRITICAL RISK EXPOSURE' : 'MODERATE EXPOSURE'}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-rose-500/80 flex items-center justify-center font-mono text-xs font-bold text-rose-400 shadow-md shadow-rose-500/10">
                        {criticalThreats.length ? 'HIGH' : 'LOW'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Monitored Domain:</span>
                      <strong className="text-slate-200 font-mono">{brand.domain}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Threat Engine:</span>
                      <strong className="text-cyan-400 font-mono">Gemini 3.1 Grounded</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Table */}
              <SocialMonitoringSection
                findings={findings}
                onStatus={updateFindingStatus}
                filter={filter}
                setFilter={setFilter}
              />

              {/* App Store Section */}
              <AppMonitoringSection
                findings={findings}
                onStatus={updateFindingStatus}
              />
            </>
          )}

          {page === 'social' && (
            <SocialMonitoringSection
              findings={findings}
              onStatus={updateFindingStatus}
              filter={filter}
              setFilter={setFilter}
            />
          )}

          {page === 'apps' && (
            <AppMonitoringSection
              findings={findings}
              onStatus={updateFindingStatus}
            />
          )}

          {page === 'brand' && (
            <BrandProfileSection
              brand={brand}
              setBrand={setBrand}
              onLookupBrand={handleLookupBrand}
              brandSearching={brandSearching}
            />
          )}

          {page === 'architecture' && (
            <ArchitectureSection />
          )}
        </main>
      </div>
    </div>
  );
}