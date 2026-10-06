import { useEffect, useState, useRef } from 'react';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Bell,
  Building2, Check, ChevronDown, CircleHelp, CloudOff, Fingerprint, Globe2,
  LayoutDashboard, LoaderCircle, LockKeyhole, Menu, MoreHorizontal, Plus, RefreshCw,
  ExternalLink, Search, Settings2, ShieldAlert, ShieldCheck, Smartphone, Sparkles, X,
} from 'lucide-react';

const API = '/api';
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'social', label: 'Social monitoring', icon: Globe2 },
  { id: 'apps', label: 'App stores', icon: Smartphone },
  { id: 'brand', label: 'Brand profile', icon: Building2 },
  { id: 'architecture', label: 'Architecture', icon: Activity },
];

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

function IconButton({ label, children, onClick, className = '' }) {
  return <button type="button" aria-label={label} title={label} className={`icon-button ${className}`} onClick={onClick}>{children}</button>;
}

function BrandMark() {
  return <div className="brand-mark"><span className="brand-mark-star">✳</span></div>;
}

function Sidebar({ page, setPage, open, setOpen, brand, onSelectBrand, findings }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const socialCount = findings.filter((f) => f.type === 'social').length;
  const appCount = findings.filter((f) => f.type === 'app').length;

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <a className="wordmark" href="#overview" onClick={() => setPage('overview')}>
        <BrandMark /><span>signal<span className="wordmark-light">guard</span></span><span className="wordmark-tag">DRP</span>
      </a>

      <div className="workspace-wrapper">
        <div className="workspace-switcher" onClick={() => setDropdownOpen(!dropdownOpen)}>
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="workspace-glyph-img" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="workspace-glyph">{(brand.name || 'B').charAt(0).toUpperCase()}</div>
          )}
          <div className="workspace-copy">
            <span>Workspace</span>
            <strong>{brand.name || 'Brand'}</strong>
          </div>
          <ChevronDown size={15} />
        </div>

        {dropdownOpen && (
          <div className="workspace-dropdown">
            <div className="workspace-dropdown-title">SWITCH MONITORED BRAND</div>
            {PRESET_BRANDS.map((preset) => (
              <button
                key={preset}
                className={`workspace-preset-btn ${brand.name.toLowerCase() === preset.toLowerCase() ? 'active' : ''}`}
                onClick={() => {
                  onSelectBrand(preset);
                  setDropdownOpen(false);
                }}
              >
                <span>{preset}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="nav-label">WORKSPACE</span>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.map(({ id, label, icon: Icon }) => {
          const badge = id === 'social' ? (socialCount ? String(socialCount) : null) : id === 'apps' ? (appCount ? String(appCount) : null) : null;
          return (
            <button key={id} className={`nav-item ${page === id ? 'nav-active' : ''}`} onClick={() => { setPage(id); setOpen(false); }}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="scan-health">
          <span className="live-dot" />
          <div>
            <strong>Active Protection</strong>
            <span>Targeting {brand.name}</span>
          </div>
          <MoreHorizontal size={17} />
        </div>
        <button className="nav-item settings-item" onClick={() => setPage('brand')}><Settings2 size={17} /><span>Brand Settings</span></button>
        <div className="user-profile"><div className="user-avatar">AI</div><div className="user-copy"><strong>Security Analyst</strong><span>Gemini Live DRP</span></div><MoreHorizontal size={17} /></div>
      </div>
    </aside>
  );
}

function Header({ page, onScan, scanning, onMenu, scanMode, onLookupBrand, brandSearching }) {
  const [searchInput, setSearchInput] = useState('');
  const pageNames = { overview: 'Overview', social: 'Social monitoring', apps: 'App store monitoring', brand: 'Brand profile', architecture: 'System architecture' };

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchInput.trim()) return;
    onLookupBrand(searchInput.trim());
    setSearchInput('');
  }

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <IconButton label="Open navigation" className="mobile-menu" onClick={onMenu}><Menu size={19} /></IconButton>
        <span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{pageNames[page]}</strong>
      </div>

      {/* Brand Search Bar */}
      <form className="brand-search-form" onSubmit={handleSearchSubmit}>
        <Search size={14} color="#7a8a77" />
        <input
          type="text"
          className="brand-search-input"
          placeholder="Enter brand name (e.g. Nike, Apple, Spotify)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={brandSearching}
        />
        <button type="submit" className="brand-search-btn" disabled={brandSearching || !searchInput.trim()}>
          {brandSearching ? <LoaderCircle className="spin" size={11} /> : <Sparkles size={11} />}
          <span>{brandSearching ? 'Analyzing...' : 'Analyze'}</span>
        </button>
      </form>

      <div className="topbar-actions">
        <div className={`source-status ${scanMode === 'demo' ? 'demo-source-status' : ''}`}>
          <span className="live-dot" />
          {scanMode === 'gemini' ? 'Gemini Live Intel' : 'Demo data mode'}
        </div>
        <IconButton label="Notifications"><Bell size={18} /><span className="notification-dot" /></IconButton>
        <button className="scan-button" onClick={onScan} disabled={scanning || brandSearching}>
          {scanning ? <LoaderCircle className="spin" size={16} /> : <RefreshCw size={16} />}
          <span>{scanning ? 'Scanning' : 'Run scan'}</span>
        </button>
      </div>
    </header>
  );
}

function MetricCard({ label, value, detail, trend, tone, icon: Icon }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={17} /></span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-foot">
        <span className={`metric-trend ${trend.startsWith('+') ? 'trend-up' : 'trend-down'}`}>
          {trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend}
        </span>
        <span>{detail}</span>
      </div>
    </article>
  );
}

function MiniChart({ count = 6 }) {
  const points = '0,69 28,62 56,66 84,50 112,56 140,40 168,45 196,23 224,33 252,19 280,28 308,11';
  return (
    <div className="chart-wrap">
      <div className="chart-labels"><span>{count * 2}</span><span>{Math.round(count * 1.5)}</span><span>{count}</span><span>{Math.round(count / 2)}</span><span>0</span></div>
      <svg className="trend-chart" viewBox="0 0 308 88" preserveAspectRatio="none" role="img" aria-label="Impersonation detections over the last seven days">
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9cca73" stopOpacity=".26" />
            <stop offset="100%" stopColor="#9cca73" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M ${points} L 308 88 L 0 88 Z`} fill="url(#chart-fill)" />
        <polyline points={points} fill="none" stroke="#659d48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {[[0,69],[56,66],[112,56],[168,45],[224,33],[280,28],[308,11]].map(([cx, cy]) => (
          <circle key={cx} cx={cx} cy={cy} r="3" fill="#fff" stroke="#659d48" strokeWidth="2" />
        ))}
      </svg>
      <div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
    </div>
  );
}

function SourceIcon({ platform, type }) {
  const labels = { Instagram: 'ig', X: '𝕏', Facebook: 'f', TikTok: '♪', 'Google Play': '▶', 'App Store': 'A', LinkedIn: 'in' };
  return (
    <div className={`source-icon source-${platform?.toLowerCase().replaceAll(' ', '-') || type}`}>
      <span>{labels[platform] || (type === 'app' ? 'A' : '•')}</span>
    </div>
  );
}

function RiskPill({ score }) {
  const level = score >= 85 ? 'critical' : score >= 70 ? 'high' : 'medium';
  return (
    <span className={`risk-pill risk-${level}`}>
      <span />
      {level === 'critical' ? 'Critical' : level === 'high' ? 'High' : 'Elevated'}
      <b>{score}</b>
    </span>
  );
}

function FindingRow({ finding, onStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  async function updateStatus(status) {
    setBusy(true);
    try { await onStatus(finding.id, status); } finally { setBusy(false); setMenuOpen(false); }
  }
  return (
    <div className="finding-row">
      <SourceIcon platform={finding.platform} type={finding.type} />
      <div className="finding-main">
        <div className="finding-title-line">
          <strong>{finding.name}</strong>
          {finding.status !== 'New' && <span className={`status-chip status-${finding.status.toLowerCase()}`}>{finding.status}</span>}
        </div>
        <div className="finding-subtitle">
          {finding.handle || finding.publisher || finding.platform} <span>·</span> {finding.category}
          {finding.sourceUrl && (
            <a className="source-link" href={finding.sourceUrl} target="_blank" rel="noreferrer" aria-label="Open source">
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
      <div className="finding-signals">{finding.signals.slice(0, 2).map((signal) => <span key={signal}>{signal}</span>)}</div>
      <RiskPill score={finding.score} />
      <span className="finding-time">{finding.detected}</span>
      <div className="finding-menu-wrap">
        <IconButton label="Finding actions" onClick={() => setMenuOpen(!menuOpen)}>
          {busy ? <LoaderCircle className="spin" size={17} /> : <MoreHorizontal size={18} />}
        </IconButton>
        {menuOpen && (
          <div className="action-menu">
            {['Reviewing', 'Escalated', 'Dismissed'].map((status) => (
              <button key={status} onClick={() => updateStatus(status)}>{status}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FindingsPanel({ findings, filter, setFilter, onStatus, page }) {
  const shown = page === 'social' ? findings.filter((f) => f.type === 'social') : page === 'apps' ? findings.filter((f) => f.type === 'app') : findings;
  const heading = page === 'social' ? 'Social detections' : page === 'apps' ? 'Suspicious applications' : 'Recent threat detections';
  return (
    <section className="panel findings-panel">
      <div className="panel-heading">
        <div><h2>{heading}</h2><p>Review and triage live detected impersonation threats</p></div>
        <div className="filter-actions">
          <label className="filter-select">
            <span className="sr-only">Filter by status</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="New">New</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Escalated">Escalated</option>
              <option value="Dismissed">Dismissed</option>
            </select>
            <ChevronDown size={14} />
          </label>
        </div>
      </div>
      <div className="finding-table-head"><span>DETECTION</span><span>DETECTION SIGNALS</span><span>RISK</span><span>DISCOVERED</span><span /></div>
      <div className="finding-list">
        {shown.length ? shown.map((finding) => <FindingRow key={finding.id} finding={finding} onStatus={onStatus} />) : (
          <div className="empty-state"><ShieldCheck size={22} /><span>No threats currently match this filter.</span></div>
        )}
      </div>
      <div className="panel-footer">
        <span>Showing <strong>{shown.length}</strong> detections</span>
      </div>
    </section>
  );
}

function Overview({ findings, filter, setFilter, onStatus, onPage, brand }) {
  const activeCount = findings.filter((f) => f.status !== 'Dismissed').length;
  const socialCount = findings.filter((f) => f.type === 'social').length;
  const appCount = findings.filter((f) => f.type === 'app').length;
  const officialCount = (brand.officialSocials?.length || 0) + (brand.officialApps?.length || 0);

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date()).toUpperCase();

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-mark" />{todayStr}</div>
          <h1>{brand.name}, <em>in the clear.</em></h1>
          <p>{brand.description || `Live impersonation & spoofing surveillance for ${brand.name}.`}</p>
        </div>
        <button className="quiet-button" onClick={() => onPage('brand')}><Settings2 size={15} />Brand settings</button>
      </section>

      <div className="metrics-grid">
        <MetricCard label="Active threats" value={String(activeCount).padStart(2, '0')} detail="requiring triage" trend={`+${activeCount}`} tone="metric-alert" icon={ShieldAlert} />
        <MetricCard label="Social profiles" value={String(socialCount).padStart(2, '0')} detail="flagged profiles" trend={`+${socialCount}`} tone="metric-social" icon={Globe2} />
        <MetricCard label="Suspicious apps" value={String(appCount).padStart(2, '0')} detail="flagged app stores" trend={`+${appCount}`} tone="metric-app" icon={Smartphone} />
        <MetricCard label="Official assets" value={String(officialCount).padStart(2, '0')} detail="protected & excluded" trend="+0" tone="metric-safe" icon={BadgeCheck} />
      </div>

      <div className="dashboard-middle">
        <section className="panel trend-panel">
          <div className="panel-heading">
            <div><h2>Threat activity</h2><p>Detection volume for {brand.name}</p></div>
            <button className="period-select">Live window <ChevronDown size={14} /></button>
          </div>
          <div className="trend-summary">
            <span className="trend-total">{findings.length}</span>
            <span className="trend-caption">total findings discovered <b><ArrowUpRight size={13} /> Active</b></span>
          </div>
          <MiniChart count={findings.length} />
          <div className="chart-legend">
            <span><i className="legend-dot legend-social" />Social profiles <b>{socialCount}</b></span>
            <span><i className="legend-dot legend-app" />Mobile apps <b>{appCount}</b></span>
          </div>
        </section>

        <section className="panel coverage-panel">
          <div className="panel-heading">
            <div><h2>Brand footprint</h2><p>Protected identifiers for {brand.name}</p></div>
          </div>
          <div className="coverage-list">
            <div className="coverage-row">
              <SourceIcon platform="Instagram" />
              <div><strong>Official socials</strong><span>{brand.officialSocials?.length || 0} allow-listed profiles</span></div>
              <span className="coverage-status"><i />Active</span>
            </div>
            <div className="coverage-row">
              <SourceIcon platform="Google Play" />
              <div><strong>Official apps</strong><span>{brand.officialApps?.length || 0} registered applications</span></div>
              <span className="coverage-status"><i />Active</span>
            </div>
            <div className="coverage-row">
              <span className="coverage-brand"><Fingerprint size={17} /></span>
              <div><strong>Domain</strong><span>{brand.domain || 'N/A'}</span></div>
              <span className="coverage-status protected"><i /><LockKeyhole size={11} />Protected</span>
            </div>
          </div>
          <button className="coverage-link" onClick={() => onPage('brand')}>View full brand profile <ArrowRight size={14} /></button>
        </section>
      </div>

      <FindingsPanel findings={findings} filter={filter} setFilter={setFilter} onStatus={onStatus} page="overview" />
    </>
  );
}

function BrandProfile({ brand, setBrand, onLookupBrand, brandSearching }) {
  const [form, setForm] = useState(brand);
  const [quickBrand, setQuickBrand] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setForm(brand), [brand]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function handleQuickEnrich(e) {
    e.preventDefault();
    const name = quickBrand.trim() || form.name.trim();
    if (!name) return;
    onLookupBrand(name);
    setQuickBrand('');
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await request('/brand', { method: 'PUT', body: JSON.stringify(form) });
      setBrand(updated);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow"><span className="eyebrow-mark" />PROTECTED IDENTITY</span>
          <h1>Brand profile: {brand.name}</h1>
          <p>Verified identifiers power detection and keep official accounts out of threat queues.</p>
        </div>
        <span className="verified-pill"><ShieldCheck size={15} />{brand.domain} protected</span>
      </div>

      {/* Gemini Live Auto-Detect Banner */}
      <div className="gemini-enrich-card">
        <div className="gemini-enrich-info">
          <div className="gemini-enrich-icon"><Sparkles size={20} /></div>
          <div>
            <h3>Auto-Detect Brand Details with Gemini</h3>
            <p>Enter any brand name to auto-discover official domains, social handles, and app stores instantly.</p>
          </div>
        </div>
        <form onSubmit={handleQuickEnrich} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            style={{ height: '32px', border: '1px solid #c2d8b5', borderRadius: '4px', padding: '0 8px', fontSize: '11px', minWidth: '150px' }}
            placeholder="e.g. Nike, Spotify, Tesla"
            value={quickBrand}
            onChange={(e) => setQuickBrand(e.target.value)}
          />
          <button type="submit" className="gemini-enrich-btn" disabled={brandSearching}>
            {brandSearching ? <LoaderCircle className="spin" size={14} /> : <Sparkles size={14} />}
            <span>{brandSearching ? 'Discovering...' : 'Fetch with Gemini'}</span>
          </button>
        </form>
      </div>

      <form className="profile-layout" onSubmit={saveProfile}>
        <div className="profile-main">
          <section className="panel profile-section">
            <div className="section-title">
              <span className="section-number">01</span>
              <div><h2>Brand identity</h2><p>Core information used to detect look-alikes and impersonations.</p></div>
            </div>
            <label className="field-label">Company or brand name
              <input required value={form.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Nike" />
            </label>
            <label className="field-label">Primary website domain
              <input required value={form.domain || ''} onChange={(e) => setField('domain', e.target.value)} placeholder="nike.com" />
            </label>
            <label className="field-label">Brand description & products
              <textarea rows="3" value={form.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="What does your company do?" />
            </label>
            <div className="logo-upload">
              <div className="profile-brand-logo">
                {form.logoUrl ? <img src={form.logoUrl} alt={form.name} onError={(e) => { e.target.style.display = 'none'; }} /> : (form.name?.charAt(0) || 'B')}
              </div>
              <div>
                <strong>Brand Logo & Mark</strong>
                <span>Used as reference during visual and logo matching.</span>
              </div>
            </div>
          </section>

          <section className="panel profile-section">
            <div className="section-title">
              <span className="section-number">02</span>
              <div><h2>Official social accounts ({form.officialSocials?.length || 0})</h2><p>These handles are allow-listed and excluded from impersonation alerts.</p></div>
              <button type="button" className="add-button" onClick={() => setField('officialSocials', [...(form.officialSocials || []), { platform: 'Instagram', handle: '' }])}>
                <Plus size={14} />Add account
              </button>
            </div>
            <div className="asset-list">
              {(form.officialSocials || []).map((account, index) => (
                <div className="asset-row" key={`${index}-${account.handle}`}>
                  <SourceIcon platform={account.platform} />
                  <select
                    value={account.platform}
                    onChange={(e) => setField('officialSocials', form.officialSocials.map((item, i) => i === index ? { ...item, platform: e.target.value } : item))}
                  >
                    {['Instagram', 'X', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube'].map((platform) => <option key={platform}>{platform}</option>)}
                  </select>
                  <input
                    value={account.handle}
                    onChange={(e) => setField('officialSocials', form.officialSocials.map((item, i) => i === index ? { ...item, handle: e.target.value } : item))}
                    placeholder="@officialhandle"
                  />
                  <IconButton label="Remove account" onClick={() => setField('officialSocials', form.officialSocials.filter((_, i) => i !== index))}>
                    <X size={15} />
                  </IconButton>
                </div>
              ))}
            </div>
          </section>

          <section className="panel profile-section">
            <div className="section-title">
              <span className="section-number">03</span>
              <div><h2>Official mobile applications ({form.officialApps?.length || 0})</h2><p>Publisher and app package IDs distinguish verified apps from counterfeit APKs.</p></div>
              <button type="button" className="add-button" onClick={() => setField('officialApps', [...(form.officialApps || []), { store: 'Google Play', name: '', appId: '', publisher: '' }])}>
                <Plus size={14} />Add app
              </button>
            </div>
            <div className="asset-list">
              {(form.officialApps || []).map((app, index) => (
                <div className="asset-row app-asset-row" key={`${index}-${app.appId}`}>
                  <SourceIcon platform={app.store} type="app" />
                  <select
                    value={app.store}
                    onChange={(e) => setField('officialApps', form.officialApps.map((item, i) => i === index ? { ...item, store: e.target.value } : item))}
                  >
                    <option>Google Play</option>
                    <option>App Store</option>
                  </select>
                  <input
                    value={app.name}
                    onChange={(e) => setField('officialApps', form.officialApps.map((item, i) => i === index ? { ...item, name: e.target.value } : item))}
                    placeholder="App name"
                  />
                  <input
                    value={app.appId}
                    onChange={(e) => setField('officialApps', form.officialApps.map((item, i) => i === index ? { ...item, appId: e.target.value } : item))}
                    placeholder="Bundle ID / Package"
                  />
                  <IconButton label="Remove app" onClick={() => setField('officialApps', form.officialApps.filter((_, i) => i !== index))}>
                    <X size={15} />
                  </IconButton>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="profile-aside">
          <div className="panel protection-card">
            <span className="protection-icon"><ShieldCheck size={19} /></span>
            <h3>Official assets are protected</h3>
            <p>Allow-listed assets are automatically excluded from threat findings so analysts focus strictly on impersonators.</p>
            <div className="protection-counts">
              <div><strong>{form.officialSocials?.length || 0}</strong><span>Social accounts</span></div>
              <div><strong>{form.officialApps?.length || 0}</strong><span>Official apps</span></div>
            </div>
          </div>
          <div className="profile-hint">
            <CircleHelp size={16} />
            <span>Brand identifiers are dynamically updated via Gemini. You can manually adjust any handles or publishers anytime.</span>
          </div>
        </aside>

        <div className="profile-savebar">
          {error && <span className="form-error">{error}</span>}
          {saved && <span className="saved-note"><Check size={14} />Changes saved</span>}
          <button type="submit" className="scan-button" disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}
            {saving ? 'Saving' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Architecture({ liveSearch }) {
  const flow = [
    { number: '01', icon: Globe2, title: 'Gemini Brand Discovery & Intelligence', text: 'Dynamic extraction of official domains, social handles, and app identifiers for any entered brand.', tags: ['Gemini 3.1 / 3.8', 'Identity Resolution', 'Multi-model Fallback'] },
    { number: '02', icon: Sparkles, title: 'Threat Discovery & Scanning', text: 'Live detection of look-alikes, rogue APKs, scam customer support pages, and phishing handles.', tags: ['Name similarity', 'Scam bio analysis', 'Rogue publisher checks'] },
    { number: '03', icon: ShieldCheck, title: 'Official Allow-list Filtering', text: 'Verified brand handles and app IDs are strictly excluded before alert generation.', tags: ['Allow-list Match', 'False-positive Suppression'] },
    { number: '04', icon: Activity, title: 'Triage & Continuous Protection', text: 'Interactive findings queue with forensic signals, external links, and risk scores.', tags: ['Analyst Triage', 'Persistent Intel'] },
  ];
  return (
    <div className="content-page architecture-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow"><span className="eyebrow-mark" />HOW SIGNALGUARD WORKS</span>
          <h1>From brand signal to threat action.</h1>
          <p>An autonomous digital risk protection pipeline powered by Gemini intelligence.</p>
        </div>
        <span className="demo-mode-pill"><span className="live-dot" />{liveSearch ? 'Gemini Live Intel' : 'Demo data mode'}</span>
      </div>

      <div className="architecture-note">
        <CloudOff size={17} />
        <div>
          <strong>Gemini Dynamic Brand Protection Pipeline</strong>
          <span>Enter any brand name. SignalGuard queries Gemini to reconstruct the brand's verified digital footprint, then scans public web channels to isolate high-risk impersonators and copycat scams.</span>
        </div>
      </div>

      <div className="architecture-flow">
        {flow.map(({ number, icon: Icon, title, text, tags }, index) => (
          <div className="architecture-step" key={number}>
            <div className="step-node">
              <span>{number}</span>
              <div><Icon size={21} /></div>
            </div>
            <div className="step-content">
              <h2>{title}</h2>
              <p>{text}</p>
              <div className="step-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            {index < flow.length - 1 && <div className="step-connector"><ArrowDownRight size={17} /></div>}
          </div>
        ))}
      </div>

      <div className="panel exclusion-panel">
        <div className="exclusion-icon"><Fingerprint size={19} /></div>
        <div>
          <h2>How official brand assets stay out of threat alerts</h2>
          <p>Before any detected candidate receives a risk score, its handle or bundle ID is compared against the brand allow-list. Official brand handles are completely filtered out, keeping analyst queues clean and focused.</p>
        </div>
        <div className="exclusion-rule">
          <code>candidate ID ∈ official assets</code>
          <ArrowRight size={15} />
          <span>Excluded before alert generation</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('overview');
  const [brand, setBrand] = useState({ name: 'Northstar', domain: 'northstar.com', description: '', officialSocials: [], officialApps: [] });
  const [findings, setFindings] = useState([]);
  const [scanMode, setScanMode] = useState('demo');
  const [filter, setFilter] = useState('all');
  const [scanning, setScanning] = useState(false);
  const [brandSearching, setBrandSearching] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  async function loadDashboard() {
    try {
      const [nextBrand, nextFindings, health] = await Promise.all([
        request('/brand'),
        request('/findings'),
        request('/health')
      ]);
      setBrand(nextBrand);
      setFindings(nextFindings);
      setScanMode(health.scanMode);
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleLookupBrand(brandName) {
    if (!brandName || !brandName.trim()) return;
    setBrandSearching(true);
    setScanMessage(`Connecting to Gemini: Fetching live identity and scanning threats for "${brandName}"...`);
    try {
      const res = await request('/brand/lookup', {
        method: 'POST',
        body: JSON.stringify({ brandName: brandName.trim() }),
      });
      setBrand(res.brand);
      setFindings(res.findings);
      setScanMode(res.mode);
      setScanMessage(`✓ Gemini Live Intel Loaded for "${res.brand.name}": ${res.detections} threat findings detected across social & app stores.`);
      window.setTimeout(() => setScanMessage(''), 8000);
    } catch (err) {
      setScanMessage(`Error querying Gemini: ${err.message}`);
    } finally {
      setBrandSearching(false);
    }
  }

  async function runScan() {
    setScanning(true);
    setScanMessage(`Scanning live threats for ${brand.name}...`);
    try {
      const result = await request('/scan', { method: 'POST' });
      setScanMode(result.mode);
      await loadDashboard();
      setScanMessage(`Scan complete · ${result.scanned} candidates evaluated · ${result.detections} threats active · ${result.highConfidence} high confidence.`);
      window.setTimeout(() => setScanMessage(''), 6000);
    } catch (error) {
      setScanMessage(error.message);
    } finally {
      setScanning(false);
    }
  }

  async function updateFinding(id, status) {
    try {
      const updated = await request(`/findings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setFindings((current) => current.map((finding) => finding.id === id ? { ...finding, status: updated.status } : finding));
    } catch (error) {
      setLoadError(error.message);
    }
  }

  const filteredFindings = findings.filter((f) => filter === 'all' || f.status === filter);

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        open={mobileNavOpen}
        setOpen={setMobileNavOpen}
        brand={brand}
        onSelectBrand={handleLookupBrand}
        findings={findings}
      />

      <main className="main-area">
        <Header
          page={page}
          onScan={runScan}
          scanning={scanning}
          onMenu={() => setMobileNavOpen(!mobileNavOpen)}
          scanMode={scanMode}
          onLookupBrand={handleLookupBrand}
          brandSearching={brandSearching}
        />

        <div className="page-content">
          {loadError && (
            <div className="error-banner">
              <AlertTriangle size={16} />
              {loadError}
              <button onClick={loadDashboard}>Retry</button>
            </div>
          )}

          {scanMessage && (
            <div className="scan-banner">
              <Sparkles size={16} />
              {scanMessage}
              <button aria-label="Dismiss" onClick={() => setScanMessage('')}><X size={15} /></button>
            </div>
          )}

          {page === 'overview' ? (
            <Overview
              findings={filteredFindings}
              filter={filter}
              setFilter={setFilter}
              onStatus={updateFinding}
              onPage={setPage}
              brand={brand}
            />
          ) : page === 'brand' ? (
            <BrandProfile
              brand={brand}
              setBrand={setBrand}
              onLookupBrand={handleLookupBrand}
              brandSearching={brandSearching}
            />
          ) : page === 'architecture' ? (
            <Architecture liveSearch={scanMode === 'gemini'} />
          ) : (
            <>
              <section className="welcome-row section-welcome">
                <div>
                  <div className="eyebrow"><span className="eyebrow-mark" />{brand.name.toUpperCase()} · SURVEILLANCE ACTIVE</div>
                  <h1>{page === 'social' ? 'Social Impersonation, in focus.' : 'App Store Clones, in focus.'}</h1>
                  <p>{page === 'social' ? `Spoofed handles, fake support, and scam giveaways targeting ${brand.name}.` : `Unauthorized apps and counterfeit APKs mimicking ${brand.name}.`}</p>
                </div>
                <span className="source-count"><span className="live-dot" />Live monitoring</span>
              </section>

              <div className="metrics-grid compact-metrics">
                <MetricCard
                  label="Open findings"
                  value={String(findings.filter((f) => f.type === (page === 'social' ? 'social' : 'app') && f.status !== 'Dismissed').length).padStart(2, '0')}
                  detail="requiring review"
                  trend="+2"
                  tone="metric-alert"
                  icon={ShieldAlert}
                />
                <MetricCard
                  label="High confidence"
                  value={String(findings.filter((f) => f.type === (page === 'social' ? 'social' : 'app') && f.score >= 85).length).padStart(2, '0')}
                  detail="score above 85"
                  trend="+1"
                  tone="metric-social"
                  icon={Fingerprint}
                />
                <MetricCard
                  label="Official assets"
                  value={String(page === 'social' ? brand.officialSocials?.length || 0 : brand.officialApps?.length || 0).padStart(2, '0')}
                  detail="allow-listed & protected"
                  trend="+0"
                  tone="metric-safe"
                  icon={BadgeCheck}
                />
              </div>

              <FindingsPanel
                findings={filteredFindings}
                filter={filter}
                setFilter={setFilter}
                onStatus={updateFinding}
                page={page}
              />
            </>
          )}

          <footer className="page-footer">
            <span>SignalGuard <b>·</b> Digital risk protection for {brand.name}</span>
            <span><span className="live-dot" />Powered by Google Gemini</span>
          </footer>
        </div>
      </main>

      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    </div>
  );
}

export default App;