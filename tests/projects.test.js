import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/data/projects.js';

test('project ids are unique and links are https', () => {
  const ids = new Set(projects.map(project => project.id));
  assert.equal(ids.size, projects.length);
  for (const project of projects) {
    assert.match(project.href, /^https:\/\//);
    assert.ok(project.name.length > 0);
    assert.ok(project.summary.length > 0);
  }
});

test('unverified copy stays explicitly marked pending', () => {
  for (const project of projects) {
    assert.match(project.summary.toLowerCase(), /pending/);
  }
});
