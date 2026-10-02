import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/data/projects.js';

test('portfolio contains the eight requested live websites', () => {
  assert.equal(projects.length, 8);
  assert.deepEqual(
    projects.map(project => project.id),
    ['jobas', 'voy', 'atm', 'leadx', 'aberturas', 'rebeca', 'zungun', 'liva']
  );
});

test('project ids are unique and destinations use https', () => {
  const ids = new Set(projects.map(project => project.id));
  assert.equal(ids.size, projects.length);
  for (const project of projects) {
    assert.match(project.href, /^https:\/\//);
    assert.ok(project.name.length > 0);
  }
});
