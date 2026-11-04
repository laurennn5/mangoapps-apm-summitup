import { stores, employees, announcements } from './data.js';

export const roleLabel = person => person.role === 'operations' ? 'Operations Manager' : person.role === 'manager' ? 'Store Manager' : 'Employee';
export const isManager = person => ['operations', 'manager'].includes(person.role);
export const canView = (item, person) => person.role === 'operations' || item.storeIds.length === 0 || item.storeIds.includes(person.storeId);
export function canPublish(person, storeIds) {
  if (!Array.isArray(storeIds) || new Set(storeIds).size !== storeIds.length || storeIds.some(id => !stores.some(store => store.id === id))) return false;
  return person.role === 'operations' || (person.role === 'manager' && storeIds.length === 1 && storeIds[0] === person.storeId);
}
export function publishAnnouncement(person, draft, id = crypto.randomUUID(), now = new Date()) {
  if (!canPublish(person, draft.storeIds)) throw new Error('You can only publish to your permitted stores.');
  const title = draft.title.trim(), body = draft.body.trim();
  if (!title || title.length > 120 || !body || body.length > 5000) throw new Error('Enter a title (up to 120 characters) and a message (up to 5,000 characters).');
  return { id, title, body, storeIds: [...draft.storeIds], important: Boolean(draft.important), category: draft.category || 'Operations', author: person.name, authorId: person.id, authorRole: roleLabel(person), createdAt: now.toISOString(), date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }), time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }) };
}
export const targetedEmployees = item => employees.filter(person => person.role === 'employee' && (item.storeIds.length === 0 || item.storeIds.includes(person.storeId)));
export const hasAcknowledged = (receipts, item, person) => (receipts[item.id] || []).includes(person.id);
export function acknowledge(receipts, item, person, openedId) {
  if (person.role !== 'employee' || !item.important || !canView(item, person) || !targetedEmployees(item).some(employee => employee.id === person.id && employee.storeId === person.storeId) || openedId !== item.id) throw new Error('Open a targeted important announcement before acknowledging it.');
  if (hasAcknowledged(receipts, item, person)) return receipts;
  return { ...receipts, [item.id]: [...(receipts[item.id] || []), person.id] };
}
export function progress(item, receipts, viewer) {
  const targets = isManager(viewer) && canView(item, viewer) && item.important ? targetedEmployees(item).filter(person => viewer.role === 'operations' || person.storeId === viewer.storeId) : [];
  const statuses = targets.map(person => ({ ...person, acknowledged: hasAcknowledged(receipts, item, person) }));
  const acknowledged = statuses.filter(person => person.acknowledged).length;
  return { statuses, total: targets.length, acknowledged, percentage: targets.length ? Math.round(acknowledged / targets.length * 100) : 0 };
}
export const workspaceKey = 'summitup.workspace.v1';
export const initialWorkspace = () => ({ version: 1, announcements: [...announcements], acknowledgments: {} });
export function readWorkspace(storage) {
  try {
    const raw = storage.getItem(workspaceKey);
    if (!raw) return { workspace: initialWorkspace(), error: '' };
    const saved = JSON.parse(raw);
    if (saved.version !== 1 || !Array.isArray(saved.announcements) || !saved.acknowledgments || typeof saved.acknowledgments !== 'object' || Array.isArray(saved.acknowledgments)) throw Error();
    const ids = new Set();
    for (const item of saved.announcements) {
      if (!['string', 'number'].includes(typeof item.id) || ids.has(String(item.id)) || typeof item.title !== 'string' || typeof item.body !== 'string' || typeof item.important !== 'boolean' || typeof item.author !== 'string' || !Array.isArray(item.storeIds) || item.storeIds.some(id => !stores.some(store => store.id === id))) throw Error();
      ids.add(String(item.id));
    }
    if (Object.values(saved.acknowledgments).some(list => !Array.isArray(list) || list.some(id => typeof id !== 'string'))) throw Error();
    return { workspace: saved, error: '' };
  } catch { return { workspace: initialWorkspace(), error: 'Saved data could not be loaded. Sample updates are shown. Changes will be kept for this session only.' }; }
}
export function writeWorkspace(storage, workspace) { storage.setItem(workspaceKey, JSON.stringify(workspace)); }
export const initials = name => name.trim().split(/\s+/).map(word => word[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
const avatarPalette = [ ['#eaf2ff', '#2157a5'], ['#f1edff', '#614293'], ['#e1f3f1', '#21635d'], ['#fbeaf0', '#973b59'], ['#fff1d9', '#805412'] ];
export function avatarColors(person) {
  const hash = [...person.id].reduce((value, letter) => (value * 31 + letter.charCodeAt(0)) >>> 0, 0);
  const [background, color] = avatarPalette[hash % avatarPalette.length];
  return { background, color };
}
