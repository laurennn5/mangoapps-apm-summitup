import test from 'node:test';
import assert from 'node:assert/strict';
import { stores, employees, demoIdentities, announcements, visibleAnnouncements } from '../src/data.js';

test('five stores have exactly 200 staff and one manager each', () => {
  assert.equal(stores.length, 5);
  assert.equal(employees.length, 200);
  assert.equal(new Set(employees.map(person => person.id)).size, 200);
  for (const store of stores) {
    const team = employees.filter(person => person.storeId === store.id);
    assert.equal(team.length, store.employees);
    assert.equal(team.filter(person => person.role === 'manager').length, 1);
    assert.ok(demoIdentities.some(person => person.storeId === store.id && person.role === 'manager'));
    assert.ok(demoIdentities.some(person => person.storeId === store.id && person.role === 'employee'));
    assert.equal(demoIdentities.filter(person => person.role === 'operations').length, 1);
  }
});

test('each store sees company announcements and only its own local updates', () => {
  const company = announcements.filter(item => item.storeIds.length === 0);
  for (const store of stores) {
    const feed = visibleAnnouncements(store.id);
    assert.ok(feed.some(item => item.important));
    assert.ok(feed.some(item => !item.important));
    for (const item of company) assert.ok(feed.includes(item));
    for (const item of feed) assert.ok(item.storeIds.length === 0 || item.storeIds.includes(store.id));
    for (const other of stores.filter(other => other.id !== store.id)) {
      for (const item of announcements.filter(item => item.storeIds.includes(other.id))) assert.ok(!feed.includes(item));
    }
  }
});
