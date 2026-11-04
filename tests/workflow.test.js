import test from 'node:test';
import assert from 'node:assert/strict';
import { employees, defaultEmployee as drew, operationsManager as michael, announcements, stores } from '../src/data.js';
import { canPublish, publishAnnouncement, acknowledge, hasAcknowledged, progress, targetedEmployees, canView, initialWorkspace, readWorkspace, writeWorkspace, workspaceKey, initials, avatarColors } from '../src/workflow.js';
const jordan = employees.find(person => person.id === 'downtown-0');
const other = employees.find(person => person.id === 'westside-1');
const draft = { title: 'Safety update', body: 'Review the new safety procedures.', important: true, storeIds: ['downtown'] };

test('publishing permissions cover all three roles and reject invalid audiences', () => {
  assert.ok(canPublish(michael, []));
  for (const store of stores) assert.ok(canPublish(michael, [store.id]));
  for (const store of stores) {
    const manager = employees.find(person => person.role === 'manager' && person.storeId === store.id);
    assert.ok(canPublish(manager, [store.id]));
    const item = publishAnnouncement(manager, { ...draft, storeIds: [store.id] }, `store-${store.id}`);
    assert.deepEqual(item.storeIds, [store.id]);
    assert.throws(() => publishAnnouncement(manager, { ...draft, storeIds: [] }));
    for (const otherStore of stores.filter(otherStore => otherStore.id !== store.id)) {
      assert.throws(() => publishAnnouncement(manager, { ...draft, storeIds: [otherStore.id] }));
    }
  }
  assert.ok(canPublish(jordan, ['downtown']));
  for (const storeIds of [[], ['westside'], ['downtown', 'westside'], ['downtown', 'downtown'], ['unknown'], undefined]) {
    assert.equal(canPublish(jordan, storeIds), false);
    assert.throws(() => publishAnnouncement(jordan, { ...draft, storeIds }));
  }
  assert.throws(() => publishAnnouncement(drew, draft));
  assert.equal(canPublish(michael, ['unknown']), false);
  assert.throws(() => publishAnnouncement(michael, { ...draft, title: '  ' }));
  assert.throws(() => publishAnnouncement(michael, { ...draft, body: '  ' }));
  const published = publishAnnouncement(jordan, draft, 'new-store');
  assert.equal(published.authorId, jordan.id);
  assert.equal(published.authorRole, 'Store Manager');
  assert.deepEqual(published.storeIds, ['downtown']);
});

test('target counts include only employees in the intended audience', () => {
  const local = publishAnnouncement(jordan, draft, 'local');
  const company = publishAnnouncement(michael, { ...draft, storeIds: [] }, 'company');
  assert.equal(targetedEmployees(local).length, 43);
  assert.equal(targetedEmployees(company).length, 195);
  assert.ok(targetedEmployees(local).every(person => person.storeId === 'downtown' && person.role === 'employee'));
  assert.equal(canView(local, other), false);
  assert.equal(canView(company, other), true);
  assert.equal(canView(local, michael), true);
  const westManager = employees.find(person => person.id === 'westside-0');
  assert.equal(progress(local, {}, westManager).total, 0);
  assert.equal(progress(company, {}, westManager).total, 37);
});

test('acknowledgment requires opening a targeted important item and is idempotent', () => {
  const item = publishAnnouncement(jordan, draft, 'local');
  assert.throws(() => acknowledge({}, item, drew, null));
  assert.throws(() => acknowledge({}, item, drew, 'another-id'));
  assert.throws(() => acknowledge({}, item, other, item.id));
  assert.throws(() => acknowledge({}, item, jordan, item.id));
  assert.throws(() => acknowledge({}, item, michael, item.id));
  assert.throws(() => acknowledge({}, item, { ...drew, id: 'fake' }, item.id));
  assert.throws(() => acknowledge({}, { ...item, important: false }, drew, item.id));
  const receipts = acknowledge({}, item, drew, item.id);
  assert.deepEqual(receipts[item.id], [drew.id]);
  assert.equal(acknowledge(receipts, item, drew, item.id), receipts);
  assert.equal(hasAcknowledged(receipts, item, drew), true);
  // Same display name must not share an acknowledgment.
  assert.equal(hasAcknowledged(receipts, item, { ...other, name: drew.name }), false);
  assert.equal(hasAcknowledged(receipts, { ...item, id: 'different-announcement' }, drew), false);
});

test('manager progress scopes company-wide receipts and ignores out-of-audience IDs', () => {
  const company = publishAnnouncement(michael, { ...draft, storeIds: [] }, 'company');
  let receipts = acknowledge({}, company, drew, company.id);
  receipts = acknowledge(receipts, company, other, company.id);
  receipts.company.push(jordan.id, 'unknown', drew.id);
  const companyProgress = progress(company, receipts, michael);
  assert.equal(companyProgress.total, 195);
  assert.equal(companyProgress.acknowledged, 2);
  assert.equal(companyProgress.percentage, 1);
  const localProgress = progress(company, receipts, jordan);
  assert.equal(localProgress.total, 43);
  assert.equal(localProgress.acknowledged, 1);
  assert.equal(localProgress.percentage, 2);
  assert.ok(localProgress.statuses.every(person => person.storeId === 'downtown'));
  const duplicateName = localProgress.statuses.find(person => person.name === other.name);
  assert.ok(duplicateName);
  assert.equal(duplicateName.acknowledged, false, 'same-name employee at another store must stay pending');
  assert.equal(localProgress.statuses.find(person => person.id === drew.id).acknowledged, true);
  assert.equal(progress(company, receipts, drew).total, 0);
  const local = publishAnnouncement(jordan, draft, 'local');
  const localReceipts = { local: [drew.id, other.id, jordan.id, 'missing'] };
  assert.equal(progress(local, localReceipts, michael).acknowledged, 1);
  assert.equal(progress(local, localReceipts, michael).total, 43);
});

test('published announcements and ID-based receipts survive a storage round trip', () => {
  const storage = { value: null, getItem(key) { assert.equal(key, workspaceKey); return this.value; }, setItem(key, value) { assert.equal(key, workspaceKey); this.value = value; } };
  const workspace = initialWorkspace();
  const item = publishAnnouncement(michael, { ...draft, storeIds: [] }, 'persisted');
  workspace.announcements.unshift(item);
  workspace.acknowledgments = acknowledge({}, item, drew, item.id);
  writeWorkspace(storage, workspace);
  const loaded = readWorkspace(storage);
  assert.equal(loaded.error, '');
  assert.deepEqual(loaded.workspace, workspace);
  assert.equal(progress(loaded.workspace.announcements[0], loaded.workspace.acknowledgments, michael).acknowledged, 1);
  storage.value = 'broken JSON';
  assert.ok(readWorkspace(storage).error);
  storage.value = JSON.stringify({ ...workspace, acknowledgments: { persisted: 'invalid' } });
  assert.ok(readWorkspace(storage).error);
  assert.ok(readWorkspace(null).error);
  assert.equal(workspace.announcements.length, announcements.length + 1);
});

test('initials and avatar colors are readable, deterministic, and stable per ID', () => {
  assert.equal(initials(drew.name), 'DJ');
  assert.deepEqual(avatarColors(drew), avatarColors({ ...drew }));
  assert.equal(initials(' Michael Torres '), 'MT');
  assert.notEqual(avatarColors(drew).background, avatarColors(drew).color);
});
