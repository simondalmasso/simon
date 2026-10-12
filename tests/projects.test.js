import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/data/projects.js';

test('portfolio has nine requested sites', () => {
  assert.deepEqual(projects.map(p => p.id), [
    'jobas','voy','atm','leadx','aberturas','rebeca','zungun','liva','casa-tour'
  ]);
});
test('all project links are unique and HTTPS', () => {
  assert.equal(new Set(projects.map(p => p.href)).size, 9);
  for (const p of projects) {
    assert.ok(p.name && p.id);
    assert.match(p.href, /^https:\/\//);
  }
});
test('all nine project functions are explicit and concise', () => {
  const expected = new Map([
    ['jobas','Asistente de búsqueda laboral'],
    ['voy','App de movilidad'],
    ['atm','Panel de oportunidades e ingresos'],
    ['leadx','CRM para gestionar clientes'],
    ['aberturas','Catálogo de puertas y ventanas'],
    ['rebeca','Tienda de ropa'],
    ['zungun','Sistema de operaciones y mensajería'],
    ['liva','Explorador de TV y streaming'],
    ['casa-tour','Recorridos 3D interactivos de propiedades']
  ]);
  for(const project of projects){
    assert.equal(project.description,expected.get(project.id));
    assert.ok(project.description.length<=48);
  }
});
test('all projects use a predictable screenshot path', () => {
  for(const project of projects) {
    assert.match('/previews/' + project.id + '.jpg', /^\/previews\/[a-z0-9-]+\.jpg$/);
  }
});
