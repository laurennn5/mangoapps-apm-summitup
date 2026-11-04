import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Mountain, LayoutDashboard, Megaphone, MapPin, ChevronDown, ArrowUpRight, Search, ShieldCheck, CalendarDays, Heart, BookOpen, Paperclip, Users, Store, ArrowRight, X, Info, SlidersHorizontal, Check } from 'lucide-react';
import { stores, employees, demoIdentities, visibleAnnouncements } from './data';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './styles.css';

const initials = name => name.split(' ').map(word => word[0]).join('');
function loadIdentity() { try { return demoIdentities.find(p => p.id === localStorage.getItem('summitup.identity')) || demoIdentities[1]; } catch { return demoIdentities[1]; } }
const icons = { shield: ShieldCheck, calendar: CalendarDays, heart: Heart, book: BookOpen };
function App() {
  const [person, setPerson] = useState(loadIdentity);
  const [switcher, setSwitcher] = useState(false);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(() => loadIdentity().role === 'manager' ? 'dashboard' : 'feed');
  const [selected, setSelected] = useState(null);
  const modalRef = useRef(null);
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
  const important = items.filter(item => item.important);
  const filtered = items.filter(item => (tab === 'all' || (tab === 'important' ? item.important : !item.important)) && `${item.title} ${item.body} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  function choose(next) { setPerson(next); setSwitcher(false); setPage(next.role === 'manager' ? 'dashboard' : 'feed'); setTab('all'); setQuery(''); try { localStorage.setItem('summitup.identity', next.id); } catch {} }
  return <div className="app-shell">
    <aside className="sidebar">
      <a href="#" className="brand" onClick={e => {e.preventDefault(); setPage('feed');}}><span className="brand-mark"><Mountain size={25} strokeWidth={2.5}/></span>Summit<span className="brand-up">Up</span><span className="brand-dot">.</span></a>
      <div className="workspace-label">SUMMIT RETAIL GROUP</div>
      <nav aria-label="Main navigation">
        {manager && <button className={page === 'dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('dashboard')}><LayoutDashboard size={19}/>Overview</button>}
        <button className={page === 'feed' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('feed')}><Megaphone size={19}/>Announcements<span className="nav-count">{items.length}</span></button>
      </nav>
      <div className="sidebar-note"><span className="little-spark">✧</span><h3>One team. In the loop.</h3><p>The updates that matter.<br/>The people who make it happen.</p><div className="mountain-art"><Mountain size={116} strokeWidth={0.65}/><Mountain size={78} strokeWidth={0.65}/></div></div>
      <div className="store-label"><MapPin size={16}/><div><strong>{store.name} store</strong><span>Your home team</span></div><span className="status-dot"/></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{page === 'dashboard' ? 'Overview' : 'Announcements'}</strong></div><div className="identity-wrap"><span className="demo-badge">DEMO WORKSPACE</span><button className="identity-button" onClick={() => setSwitcher(!switcher)} aria-expanded={switcher} aria-controls="identity-menu"><span className="avatar">{initials(person.name)}</span><span className="identity-text"><strong>{person.name}</strong><small>{manager ? 'Manager' : 'Employee'} · {store.name}</small></span><ChevronDown size={16}/></button>
      {switcher && <div className="identity-menu" id="identity-menu"><div className="menu-heading"><strong>Explore as a teammate</strong><p>Switch roles and stores. No sign-in needed.</p></div>{stores.map(s => <div key={s.id}><div className="menu-store">{s.name}</div>{demoIdentities.filter(p => p.storeId === s.id).map(p => <button key={p.id} onClick={() => choose(p)}><span className="avatar small">{initials(p.name)}</span><span><strong>{p.name}</strong><small>{p.title}</small></span>{person.id === p.id && <Check size={16}/>}</button>)}</div>)}</div>}
      </div></header>
      <main>
        <div className="page-heading"><div className="eyebrow">YOUR TEAM, CONNECTED</div><h1>{page === 'dashboard' ? `A little clarity for your day, ${person.name.split(' ')[0]}.` : `You’re in the loop, ${person.name.split(' ')[0]}.`}<span className="greeting-dot">✳</span></h1><p>{page === 'dashboard' ? `Here’s what’s happening with your ${store.name} team.` : 'Everything you need to know. All in one place.'}</p><span className="today">WEDNESDAY, NOVEMBER 4</span></div>
        {page === 'dashboard' ? <>
          <div className="stat-grid"><Stat label="Your store team" value={store.employees} icon={Users} detail="Including you"/><Stat label="Store announcements" value={items.length} icon={Megaphone} detail="Relevant to your team"/><Stat label="Important updates" value={important.length} icon={ShieldCheck} detail="Stand out in the feed"/><Stat label="Across Summit Retail" value={employees.length} icon={Store} detail="People across 5 stores"/></div>
          <div className="dashboard-grid"><section className="panel"><div className="section-heading"><h2>Your team’s updates</h2><button className="text-button" onClick={() => setPage('feed')}>View feed <ArrowRight size={16}/></button></div>{items.map(item => <button className="dashboard-update" key={item.id} onClick={() => setSelected(item)}><span className={`update-icon ${item.important ? 'amber' : ''}`}>{React.createElement(icons[item.icon], {size:20})}</span><span><strong>{item.title}</strong><small>{item.category} · {item.date}</small></span><ArrowUpRight size={17}/></button>)}</section><section className="panel"><div className="section-heading"><h2>Our five stores</h2><span className="muted">200 people</span></div>{stores.map(s => <div className="store-row" key={s.id}><span className="store-icon"><Store size={18}/></span><div><strong>{s.name}</strong><small>{s.address}</small></div><span>{s.employees} <span className="muted">people</span></span></div>)}</section></div>
          <div className="phase-note"><Info size={18}/><span>This is your workspace foundation. Publishing updates and tracking acknowledgments will be available in the next phase.</span></div>
        </> : <div className="content-grid"><div className="feed-column">
          <section className="priority-banner"><div className="priority-symbol"><ShieldCheck size={25}/></div><div><span className="eyebrow">WORTH YOUR ATTENTION</span><h2>{important.length} important updates for your team</h2><p>A few things to know before your next shift.</p></div><button onClick={() => {setTab('important'); setQuery('');}} aria-label="Show important updates"><ArrowUpRight size={22}/></button></section>
          <div className="feed-toolbar"><div className="tabs" aria-label="Filter announcements">{[['all','All updates'],['important','Important'],['general','General']].map(([value,label]) => <button aria-pressed={tab === value} className={tab === value ? 'selected' : ''} key={value} onClick={() => setTab(value)}>{label}{value === 'all' && <span>{items.length}</span>}</button>)}</div><span className="sort-label"><SlidersHorizontal size={14}/>Latest first</span></div>
          <label className="search-field"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find an update…" aria-label="Search announcements"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
          <div className="feed" aria-live="polite">{filtered.map(item => <Announcement key={item.id} item={item} onOpen={() => setSelected(item)}/>)}{!filtered.length && <div className="empty-state"><Search size={28}/><h2>No updates found</h2><p>Try another search or choose a different category.</p><button className="text-button" onClick={() => {setQuery(''); setTab('all');}}>Show all updates <ArrowRight size={16}/></button></div>}</div>
          <div className="feed-end"><span/>You’re all caught up with your team’s updates<span/></div>
        </div><aside className="right-column"><section className="team-card"><div className="team-illustration"><div className="sun"/><Mountain className="large-mountain" size={170} strokeWidth={0.8}/><Mountain className="small-mountain" size={115} strokeWidth={0.9}/><span className="illustration-caption">GROWING TOGETHER</span></div><div className="team-card-body"><span className="eyebrow">YOUR HOME TEAM</span><h2>{store.name}</h2><p>Good things happen when we’re connected.</p><div className="team-avatars">{employees.filter(p => p.storeId === store.id).slice(0,4).map((p,i) => <span className={`avatar shade-${i}`} key={p.id}>{initials(p.name)}</span>)}<span className="team-plus">+{store.employees - 4}</span></div><div className="team-card-footer"><Users size={15}/>{store.employees} teammates, one team</div></div></section><section className="quiet-card"><span className="quiet-icon"><Heart size={20}/></span><h3>Less noise. More connection.</h3><p>Important updates are clearly marked, so you can focus on what matters and get on with your day.</p></section><div className="help-note"><span className="status-dot"/>Made for the people behind the stores.</div></aside></div>}
        <footer><span>SummitUp <span className="footer-dot">·</span> A better-connected workday.</span><span>Summit Retail Group</span></footer>
      </main>
    </div>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="detail-modal" role="dialog" aria-modal="true" aria-label={selected.title} ref={modalRef} tabIndex={-1} onKeyDown={handleDialogKey} onClick={e => e.stopPropagation()}><button className="close-modal" onClick={() => setSelected(null)} aria-label="Close announcement"><X size={22}/></button><Announcement item={selected} expanded/><div className="detail-note"><Info size={16}/>This phase is read-only. No acknowledgment is requested or recorded.</div></section></div>}
  </div>;
}
function Stat({label,value,icon:Icon,detail}) {return <section className="stat-card"><div>{label}<Icon size={19}/></div><strong>{value}</strong><small>{detail}</small></section>}
function Announcement({item,onOpen,expanded=false}) {const Icon=icons[item.icon]; return <article className={`announcement ${item.important ? 'is-important' : ''}`}><div className="announcement-top"><span className={`category ${item.important ? 'important-category' : ''}`}><Icon size={14}/>{item.category}</span>{item.important && <span className="important-label"><span/>IMPORTANT</span>}</div><h2>{expanded ? item.title : <button onClick={onOpen}>{item.title}</button>}</h2><p className="announcement-body">{item.body}</p>{item.detail && <div className="announcement-detail"><Icon size={16}/>{item.detail}</div>}{expanded && item.attachment && <div className="attachment"><Paperclip size={17}/><span>{item.attachment}<small>{item.attachmentSize} · Sample attachment, preview unavailable</small></span></div>}<div className="announcement-footer"><span className="avatar author-avatar">{initials(item.author)}</span><div className="author"><strong>{item.author}<span> · {item.authorRole}</span></strong><small>{item.date} at {item.time}</small></div><span className="audience"><MapPin size={13}/>{item.storeIds.length ? 'Your store' : 'All stores'}</span>{!expanded && <button className="read-button" onClick={onOpen} aria-label={`Read ${item.title}`}><ArrowUpRight size={18}/></button>}</div></article>}

createRoot(document.getElementById('root')).render(<App/>);
