import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, Megaphone, ChevronDown, Search, Paperclip, X, Check, Plus } from 'lucide-react';
import { stores, employees, demoIdentities, defaultEmployee } from './data';
import { roleLabel, isManager, canView, publishAnnouncement, acknowledge, hasAcknowledged, progress, readWorkspace, writeWorkspace, initials, avatarColors } from './workflow';
import '@fontsource-variable/dm-sans';
import './styles.css';

function loadIdentity() {
  try { return demoIdentities.find(person => person.id === localStorage.getItem('summitup.identity')) || defaultEmployee; }
  catch { return defaultEmployee; }
}
function loadData() { try { return readWorkspace(localStorage); } catch { return readWorkspace(null); } }
const storeName = id => stores.find(store => store.id === id)?.name || 'All stores';
const audienceLabel = item => item.storeIds.length ? item.storeIds.map(storeName).join(', ') : 'All stores';
function Avatar({ person }) { return <span className="avatar" style={avatarColors(person)} title={person.name} aria-label={person.name}>{initials(person.name)}</span>; }
function authorFor(item) { return demoIdentities.find(person => person.id === item.authorId) || employees.find(person => person.name === item.author) || { id: `author-${item.author}`, name: item.author }; }

function App() {
  const [person, setPerson] = useState(loadIdentity);
  const [loaded] = useState(loadData);
  const [workspace, setWorkspace] = useState(loaded.workspace);
  const [storageError, setStorageError] = useState(loaded.error);
  const [notice, setNotice] = useState('');
  const [switcher, setSwitcher] = useState(false);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(() => isManager(loadIdentity()) ? 'dashboard' : 'feed');
  const [dialog, setDialog] = useState(null);
  const identityRef = useRef(null);
  const identityButtonRef = useRef(null);
  const manager = isManager(person);
  const operations = person.role === 'operations';
  const items = workspace.announcements.filter(item => canView(item, person));
  const filtered = items.filter(item => (tab === 'all' || (tab === 'important' ? item.important : !item.important)) && `${item.title} ${item.body} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  const done = item => hasAcknowledged(workspace.acknowledgments, item, person);
  const attention = filtered.filter(item => item.important && (manager || !done(item)));
  const history = manager ? [] : filtered.filter(item => item.important && done(item));
  const general = filtered.filter(item => !item.important);
  const ordered = [...items.filter(item => item.important), ...items.filter(item => !item.important)];
  const selected = dialog && workspace.announcements.find(item => item.id === dialog.id);

  useEffect(() => {
    if (!switcher) return;
    const dismiss = event => { if (!identityRef.current?.contains(event.target)) setSwitcher(false); };
    const escape = event => { if (event.key === 'Escape') { setSwitcher(false); identityButtonRef.current?.focus(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [switcher]);

  function commitWorkspace(next) {
    setWorkspace(next);
    if (loaded.error) return;
    try { writeWorkspace(localStorage, next); setStorageError(''); }
    catch { setStorageError('Browser storage is unavailable or full. Changes are kept for this session only.'); }
  }
  function choose(next) {
    identityButtonRef.current?.focus(); setPerson(next); setSwitcher(false); setDialog(null);
    setPage(isManager(next) ? 'dashboard' : 'feed'); setTab('all'); setQuery(''); setNotice('');
    try { localStorage.setItem('summitup.identity', next.id); }
    catch { setStorageError('Browser storage is unavailable. Your demo identity will not persist after reload.'); }
  }
  function publish(draft) {
    const item = publishAnnouncement(person, draft);
    commitWorkspace({ ...workspace, announcements: [item, ...workspace.announcements] });
    setDialog(null); setNotice(`Published “${item.title}” to ${audienceLabel(item)}.`);
  }
  function confirmAcknowledgment() {
    if (!selected || dialog?.type !== 'detail') return;
    try {
      const receipts = acknowledge(workspace.acknowledgments, selected, person, dialog.id);
      commitWorkspace({ ...workspace, acknowledgments: receipts });
      setNotice(`Acknowledged “${selected.title}”. It is now in update history.`);
    } catch (error) { setNotice(error.message); }
  }
  const open = item => setDialog({ type: 'detail', id: item.id });
  const viewAll = item => setDialog({ type: 'statuses', id: item.id });
  const tracking = item => <ProgressSummary item={item} viewer={person} receipts={workspace.acknowledgments} onViewAll={() => viewAll(item)}/>;
  const renderAnnouncement = item => <Announcement key={item.id} item={item} onOpen={() => open(item)} acknowledged={!manager && done(item)} tracking={manager && item.important ? tracking(item) : null}/>;
  function identityOption(option) { return <button key={option.id} onClick={() => choose(option)} aria-pressed={person.id === option.id}><Avatar person={option}/><span><strong>{option.name}</strong><small>{roleLabel(option)}{option.storeId ? ` · ${storeName(option.storeId)}` : ''}</small></span>{person.id === option.id && <Check size={16} aria-hidden="true"/>}</button>; }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar" inert={dialog ? true : undefined}>
      <div className="brand">SummitUp</div><div className="workspace-label">Summit Retail Group</div>
      <nav aria-label="Main navigation">
        {manager && <button className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} aria-current={page === 'dashboard' ? 'page' : undefined} onClick={() => { setPage('dashboard'); setNotice(''); }}><LayoutDashboard size={18} aria-hidden="true"/>Overview</button>}
        <button className={`nav-item ${page === 'feed' ? 'active' : ''}`} aria-current={page === 'feed' ? 'page' : undefined} onClick={() => { setPage('feed'); setNotice(''); }}><Megaphone size={18} aria-hidden="true"/>Updates</button>
      </nav>
    </aside>
    <div className="main-shell" inert={dialog ? true : undefined}>
      <header className="topbar"><span className="workspace-context">{operations ? 'All stores' : `${storeName(person.storeId)} store`}</span>
        <div className="identity-wrap" ref={identityRef}><span className="demo-label">Demo as</span>
          <button className="identity-button" ref={identityButtonRef} onClick={() => setSwitcher(!switcher)} aria-expanded={switcher} aria-controls={switcher ? 'identity-menu' : undefined}><Avatar person={person}/><span className="identity-text"><strong>{person.name}</strong><small>{roleLabel(person)}</small></span><ChevronDown size={16} aria-hidden="true"/></button>
          {switcher && <div className="identity-menu" id="identity-menu"><div className="menu-heading"><strong>Demo as</strong><p>Switch roles without signing in.</p></div><div className="menu-store">Core demo roles</div>{demoIdentities.slice(0, 3).map(identityOption)}{stores.map(store => <div key={store.id}>{demoIdentities.slice(3).some(option => option.storeId === store.id) && <><div className="menu-store">{store.name}</div>{demoIdentities.slice(3).filter(option => option.storeId === store.id).map(identityOption)}</>}</div>)}</div>}
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div className="heading-actions"><div className="page-heading"><h1>{page === 'dashboard' ? operations ? 'Company overview' : 'Store overview' : 'Updates'}</h1><p>{page === 'dashboard' ? operations ? 'Announcements and employee acknowledgment progress across all stores.' : `${storeName(person.storeId)} · Results are limited to your store’s employees.` : `Hi, ${person.name.split(' ')[0]}. ${operations ? 'Updates across all stores.' : `Here are the updates for ${storeName(person.storeId)}.`}`}</p></div>{manager && <button className="primary-button" onClick={() => setDialog({ type: 'publish' })}><Plus size={17} aria-hidden="true"/>New announcement</button>}</div>
        {storageError && <p className="storage-warning" role="alert">{storageError}</p>}
        {notice && <p className="notice" role="status">{notice}</p>}
        {page === 'dashboard' && manager ? <section className="manager-panel" aria-labelledby="store-announcements">
          <div className="panel-heading"><div><h2 id="store-announcements">Announcements</h2><p>{operations ? 'Company-wide results for each targeted audience.' : `Updates for ${storeName(person.storeId)} and all-store announcements.`} Employee counts exclude managers.</p></div><button className="text-button" onClick={() => setPage('feed')}>View updates</button></div>
          <div className="list-columns" aria-hidden="true"><span>Announcement</span><span>Audience</span><span>Published</span></div>
          <div className="manager-list">{ordered.map(item => <article className="manager-announcement" key={item.id}><div className="dashboard-update"><span className="update-summary"><span className="row-category">{item.category}{item.important && <span className="important-label">Important</span>}</span><button className="announcement-title" onClick={() => open(item)}>{item.title}</button></span><span className="row-audience">{audienceLabel(item)}</span><span className="row-date">{item.date}</span></div>{item.important && tracking(item)}</article>)}</div>
        </section> : <div className="feed-column">
          <div className="feed-controls"><div className="tabs" aria-label="Filter announcements">{[['all','All updates'],['important','Important'],['general','General']].map(([value,label]) => <button aria-pressed={tab === value} className={tab === value ? 'selected' : ''} key={value} onClick={() => setTab(value)}>{label}</button>)}</div><label className="search-field"><Search size={18} aria-hidden="true"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search updates" aria-label="Search announcements"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={17} aria-hidden="true"/></button>}</label></div>
          <div className="feed" aria-live="polite">
            {attention.length > 0 && <section className="announcement-group attention-section" aria-labelledby="attention-heading"><div className="section-heading"><h2 id="attention-heading">Attention</h2><span>{manager ? 'Important updates' : 'Open each update to acknowledge'}</span></div>{attention.map(renderAnnouncement)}</section>}
            {!manager && !attention.length && !query && tab !== 'general' && <p className="attention-clear">No important updates awaiting your acknowledgment.</p>}
            {general.length > 0 && <section className="announcement-group" aria-labelledby="general-heading"><div className="section-heading"><h2 id="general-heading">General updates</h2></div>{general.map(renderAnnouncement)}</section>}
            {history.length > 0 && <section className="announcement-group history-section" aria-labelledby="history-heading"><div className="section-heading"><h2 id="history-heading">Update history</h2><span>Acknowledged updates</span></div>{history.map(renderAnnouncement)}</section>}
            {!filtered.length && <div className="empty-state"><h2>No updates found</h2><p>Try a different search or filter.</p><button className="text-button" onClick={() => {setQuery(''); setTab('all');}}>Show all updates</button></div>}
          </div>
        </div>}
        <footer className="about-note">SummitUp combines Summit Retail Group with “sum it up”: a simple place to find important updates.</footer>
      </main>
    </div>
    {dialog && <Modal key={`${dialog.type}-${dialog.id || ''}`} titleId={dialog.type === 'publish' ? 'publish-title' : dialog.type === 'statuses' ? 'status-title' : 'announcement-title'} onClose={() => setDialog(null)}>
      {dialog.type === 'publish' && manager && <PublishForm person={person} onPublish={publish}/>}
      {dialog.type === 'detail' && selected && canView(selected, person) && <><Announcement item={selected} expanded acknowledged={!manager && done(selected)} tracking={manager && selected.important ? tracking(selected) : null}/>{!manager && selected.important && !done(selected) && <div className="acknowledge-action"><p>By acknowledging, you confirm you have read this announcement.</p><button className="primary-button" onClick={confirmAcknowledgment}><Check size={18} aria-hidden="true"/>Acknowledge</button></div>}{!selected.important && <p className="detail-note">No acknowledgment required.</p>}</>}
      {dialog.type === 'statuses' && selected && manager && <StatusList item={selected} viewer={person} receipts={workspace.acknowledgments}/>}
    </Modal>}
  </div>;
}

function Modal({ titleId, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; ref.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; if (previousFocus?.isConnected) previousFocus.focus(); };
  }, []);
  function handleKey(event) {
    if (event.key === 'Escape') onClose();
    if (event.key !== 'Tab') return;
    const controls = [...ref.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { event.preventDefault(); first?.focus(); }
  }
  return <div className="modal-backdrop" onClick={onClose}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref} onKeyDown={handleKey} onClick={event => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label="Close dialog"><X size={22} aria-hidden="true"/></button>{children}</section></div>;
}
function Announcement({ item, onOpen, expanded=false, acknowledged=false, tracking }) {
  const Heading = expanded ? 'h2' : 'h3';
  return <article className={`announcement ${item.important ? 'is-important' : ''}`}>
    <div className="announcement-top"><span className="category">{item.category}</span>{item.important && <span className="important-label">Important</span>}</div>
    <Heading id={expanded ? 'announcement-title' : undefined}>{expanded ? item.title : <button onClick={onOpen}>{item.title}</button>}</Heading>
    <p className="announcement-body">{item.body}</p>
    {expanded && item.detail && <p className="announcement-detail">{item.detail}</p>}
    {expanded && item.attachment && <div className="attachment"><Paperclip size={17} aria-hidden="true"/><span>{item.attachment}<small>{item.attachmentSize} · Sample attachment, preview unavailable</small></span></div>}
    <div className="announcement-footer"><div className="author-with-avatar"><Avatar person={authorFor(item)}/><div className="author"><strong>{item.author}<span> · {item.authorRole}</span></strong><small>{item.date} at {item.time}</small></div></div><span className="audience">{audienceLabel(item)}</span></div>
    {acknowledged && <p className="acknowledged-status" role={expanded ? 'status' : undefined}><Check size={17} aria-hidden="true"/>Acknowledged</p>}
    {tracking}
  </article>;
}
function ProgressSummary({ item, viewer, receipts, onViewAll }) {
  const result = progress(item, receipts, viewer);
  const pending = result.statuses.filter(person => !person.acknowledged);
  return <section className="progress-summary" aria-label={`Acknowledgment progress for ${item.title}`}>
    <div className="progress-heading"><strong>{result.acknowledged} of {result.total} employees acknowledged <span>({result.percentage}%)</span></strong><span className="scope-label">{viewer.role === 'operations' ? 'Targeted audience' : `${storeName(viewer.storeId)} results`}</span></div>
    <progress value={result.acknowledged} max={result.total || 1} aria-label={`${result.percentage}% acknowledged`}/>
    <div className="progress-people"><div className="avatar-stack">{result.statuses.slice(0, 5).map(person => <Avatar key={person.id} person={person}/>)}</div><button className="text-button" onClick={onViewAll} aria-label={`View all acknowledgment statuses for ${item.title}`}>View all</button></div>
    <p className="pending-preview">{pending.length ? `Pending: ${pending.slice(0, 3).map(person => person.name).join(', ')}${pending.length > 3 ? ` and ${pending.length - 3} more` : ''}.` : 'All targeted employees have acknowledged.'}</p>
  </section>;
}
function StatusList({ item, viewer, receipts }) {
  const [query, setQuery] = useState('');
  const result = progress(item, receipts, viewer);
  const filtered = result.statuses.filter(person => `${person.name} ${storeName(person.storeId)} ${person.acknowledged ? 'acknowledged' : 'pending'}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => Number(a.acknowledged) - Number(b.acknowledged) || a.name.localeCompare(b.name));
  return <><h2 id="status-title">Employee acknowledgment status</h2><p className="status-announcement">{item.title}</p><p className="status-totals">{result.acknowledged} of {result.total} targeted employees acknowledged ({result.percentage}%). {viewer.role === 'manager' ? `${storeName(viewer.storeId)} employees only.` : 'All targeted stores.'}</p><label className="search-field status-search"><Search size={18} aria-hidden="true"/><input aria-label="Search employee statuses" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search names, store, or status"/>{query && <button aria-label="Clear employee search" onClick={() => setQuery('')}><X size={17} aria-hidden="true"/></button>}</label><p className="list-count" aria-live="polite">{filtered.length} employees shown · Pending first</p><ul className="employee-status-list">{filtered.map(person => <li key={person.id} data-employee-id={person.id}><Avatar person={person}/><span className="employee-name"><strong>{person.name}</strong><small>{storeName(person.storeId)}</small></span><span className={person.acknowledged ? 'acknowledged-status' : 'pending-status'}>{person.acknowledged && <Check size={15} aria-hidden="true"/>}{person.acknowledged ? 'Acknowledged' : 'Pending'}</span></li>)}</ul>{!filtered.length && <p>No employees match your search.</p>}</>;
}
function PublishForm({ person, onPublish }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState(person.role === 'operations' ? 'all' : person.storeId);
  const [important, setImportant] = useState(false);
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    try { onPublish({ title, body, storeIds: target === 'all' ? [] : [target], important, category: 'Operations' }); }
    catch (error) { setError(error.message); }
  }
  return <form className="publish-form" onSubmit={submit}><h2 id="publish-title">New announcement</h2><p>{person.role === 'operations' ? 'Publish to one store or all stores.' : `You can publish only to ${storeName(person.storeId)}.`}</p><label>Title<input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)}/></label><label>Message<textarea required maxLength={5000} rows={6} value={body} onChange={event => setBody(event.target.value)}/></label><label>Audience<select value={target} onChange={event => setTarget(event.target.value)}>{person.role === 'operations' && <option value="all">All stores</option>}{stores.filter(store => person.role === 'operations' || store.id === person.storeId).map(store => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label><label className="checkbox-label"><input type="checkbox" checked={important} onChange={event => setImportant(event.target.checked)}/><span>Important — requires employee acknowledgment</span></label><p className="form-help">{important ? 'Targeted employees must open the announcement before acknowledging.' : 'General update. No acknowledgment required.'}</p>{error && <p role="alert" className="form-error">{error}</p>}<button className="primary-button" type="submit">Publish announcement</button></form>;
}

createRoot(document.getElementById('root')).render(<App/>);
