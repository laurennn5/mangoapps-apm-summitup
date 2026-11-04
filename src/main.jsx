import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, Megaphone, ChevronDown, Search, Paperclip, X, Check } from 'lucide-react';
import { stores, demoIdentities, visibleAnnouncements } from './data';
import '@fontsource-variable/dm-sans';
import './styles.css';

const initials = name => name.split(' ').map(word => word[0]).join('');
function loadIdentity() { try { return demoIdentities.find(p => p.id === localStorage.getItem('summitup.identity')) || demoIdentities[1]; } catch { return demoIdentities[1]; } }
function App() {
  const [person, setPerson] = useState(loadIdentity);
  const [switcher, setSwitcher] = useState(false);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(() => loadIdentity().role === 'manager' ? 'dashboard' : 'feed');
  const [selected, setSelected] = useState(null);
  const modalRef = useRef(null);
  const identityRef = useRef(null);
  const identityButtonRef = useRef(null);
  useEffect(() => {
    if (!switcher) return;
    const dismiss = event => {
      if (!identityRef.current?.contains(event.target)) setSwitcher(false);
    };
    const escape = event => {
      if (event.key === 'Escape') { setSwitcher(false); identityButtonRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [switcher]);
  useEffect(() => {
    if (!selected) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [selected]);
  function handleDialogKey(event) {
    if (event.key === 'Escape') setSelected(null);
    if (event.key === 'Tab') {
      const controls = modalRef.current.querySelectorAll('button, a[href], input, [tabindex="0"]');
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modalRef.current)) { event.preventDefault(); first?.focus(); }
    }
  }
  const store = stores.find(s => s.id === person.storeId);
  const manager = person.role === 'manager';
  const items = visibleAnnouncements(person.storeId);
  const filtered = items.filter(item => (tab === 'all' || (tab === 'important' ? item.important : !item.important)) && `${item.title} ${item.body} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  function choose(next) { identityButtonRef.current?.focus(); setPerson(next); setSwitcher(false); setPage(next.role === 'manager' ? 'dashboard' : 'feed'); setTab('all'); setQuery(''); try { localStorage.setItem('summitup.identity', next.id); } catch {} }
  const important = filtered.filter(item => item.important);
  const general = filtered.filter(item => !item.important);
  const ordered = [...items.filter(item => item.important), ...items.filter(item => !item.important)];
  const audience = item => item.storeIds.length ? `${store.name} store` : 'All stores';
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <div className="brand">SummitUp</div>
      <div className="workspace-label">Summit Retail Group</div>
      <nav aria-label="Main navigation">
        {manager && <button className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} aria-current={page === 'dashboard' ? 'page' : undefined} onClick={() => setPage('dashboard')}><LayoutDashboard size={18} aria-hidden="true"/>Overview</button>}
        <button className={`nav-item ${page === 'feed' ? 'active' : ''}`} aria-current={page === 'feed' ? 'page' : undefined} onClick={() => setPage('feed')}><Megaphone size={18} aria-hidden="true"/>Updates</button>
      </nav>
    </aside>
    <div className="main-shell">
      <header className="topbar">
        <span className="workspace-context">{store.name} store</span>
        <div className="identity-wrap" ref={identityRef}>
          <span className="demo-label">Demo</span>
          <button className="identity-button" ref={identityButtonRef} onClick={() => setSwitcher(!switcher)} aria-expanded={switcher} aria-controls={switcher ? 'identity-menu' : undefined}>
            <span className="avatar" aria-hidden="true">{initials(person.name)}</span>
            <span className="identity-text"><strong>{person.name}</strong><small>{manager ? 'Manager' : 'Employee'}</small></span>
            <ChevronDown size={16} aria-hidden="true"/>
          </button>
          {switcher && <div className="identity-menu" id="identity-menu">
            <div className="menu-heading"><strong>Switch identity</strong><p>Select a demo role and store.</p></div>
            {stores.map(s => <div key={s.id}>
              <div className="menu-store">{s.name}</div>
              {demoIdentities.filter(p => p.storeId === s.id).map(p => <button key={p.id} onClick={() => choose(p)} aria-pressed={person.id === p.id}>
                <span><strong>{p.name}</strong><small>{p.title}</small></span>
                {person.id === p.id && <Check size={16} aria-hidden="true"/>}
              </button>)}
            </div>)}
          </div>}
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div className="page-heading">
          <h1>{page === 'dashboard' ? 'Store overview' : 'Updates'}</h1>
          <p>{page === 'dashboard' ? `${store.name} · ${store.employees} team members` : `Hi, ${person.name.split(' ')[0]}. Here are the updates for ${store.name}.`}</p>
        </div>
        {page === 'dashboard' ? <section className="manager-panel" aria-labelledby="store-announcements">
          <div className="panel-heading"><div><h2 id="store-announcements">Announcements</h2><p>Updates for {store.name} and all-store announcements.</p></div><button className="text-button" onClick={() => setPage('feed')}>View updates</button></div>
          <div className="list-columns" aria-hidden="true"><span>Announcement</span><span>Audience</span><span>Published</span></div>
          <div className="manager-list">
            {ordered.map(item => <button className="dashboard-update" key={item.id} onClick={() => setSelected(item)}>
              <span className="update-summary"><span className="row-category">{item.category}{item.important && <span className="important-label">Important</span>}</span><strong>{item.title}</strong></span>
              <span className="row-audience">{audience(item)}</span><span className="row-date">{item.date}</span>
            </button>)}
          </div>
        </section> : <div className="feed-column">
          <div className="feed-controls">
            <div className="tabs" aria-label="Filter announcements">
              {[['all','All updates'],['important','Important'],['general','General']].map(([value,label]) => <button aria-pressed={tab === value} className={tab === value ? 'selected' : ''} key={value} onClick={() => setTab(value)}>{label}</button>)}
            </div>
            <label className="search-field"><Search size={18} aria-hidden="true"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search updates" aria-label="Search announcements"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={17} aria-hidden="true"/></button>}</label>
          </div>
          <div className="feed" aria-live="polite">
            {important.length > 0 && <section className="announcement-group attention-section" aria-labelledby="attention-heading">
              <div className="section-heading"><h2 id="attention-heading">Attention</h2><span>Important updates</span></div>
              {important.map(item => <Announcement key={item.id} item={item} audience={audience(item)} onOpen={() => setSelected(item)}/>)}
            </section>}
            {general.length > 0 && <section className="announcement-group" aria-labelledby="general-heading">
              <div className="section-heading"><h2 id="general-heading">General updates</h2></div>
              {general.map(item => <Announcement key={item.id} item={item} audience={audience(item)} onOpen={() => setSelected(item)}/>)}
            </section>}
            {!filtered.length && <div className="empty-state"><h2>No updates found</h2><p>Try a different search or filter.</p><button className="text-button" onClick={() => {setQuery(''); setTab('all');}}>Show all updates</button></div>}
          </div>
        </div>}
        <footer className="about-note">SummitUp combines Summit Retail Group with “sum it up”: a simple place to find important updates.</footer>
      </main>
    </div>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-title" ref={modalRef} tabIndex={-1} onKeyDown={handleDialogKey} onClick={e => e.stopPropagation()}>
        <button className="close-modal" onClick={() => setSelected(null)} aria-label="Close announcement"><X size={22} aria-hidden="true"/></button>
        <Announcement item={selected} audience={audience(selected)} expanded/>
        <p className="detail-note">Read-only prototype. No acknowledgment is recorded.</p>
      </section>
    </div>}
  </div>;
}
function Announcement({item, audience, onOpen, expanded=false}) {
  const Heading = expanded ? 'h2' : 'h3';
  return <article className={`announcement ${item.important ? 'is-important' : ''}`}>
    <div className="announcement-top"><span className="category">{item.category}</span>{item.important && <span className="important-label">Important</span>}</div>
    <Heading id={expanded ? 'announcement-title' : undefined}>{expanded ? item.title : <button onClick={onOpen}>{item.title}</button>}</Heading>
    <p className="announcement-body">{item.body}</p>
    {expanded && item.detail && <p className="announcement-detail">{item.detail}</p>}
    {expanded && item.attachment && <div className="attachment"><Paperclip size={17} aria-hidden="true"/><span>{item.attachment}<small>{item.attachmentSize} · Sample attachment, preview unavailable</small></span></div>}
    <div className="announcement-footer"><div className="author"><strong>{item.author}<span> · {item.authorRole}</span></strong><small>{item.date} at {item.time}</small></div><span className="audience">{audience}</span></div>
  </article>;
}

createRoot(document.getElementById('root')).render(<App/>);
