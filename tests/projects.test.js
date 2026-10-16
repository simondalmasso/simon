import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/data/projects.js';

test('portfolio has ten requested sites', () => {
  assert.deepEqual(projects.map(p => p.id), [
    'jobas','voy','atm','leadx','aberturas','rebeca','zungun','liva','casa-tour','amira'
  ]);
});
test('all project links are unique and HTTPS', () => {
  assert.equal(new Set(projects.map(p => p.href)).size, 10);
  for (const p of projects) {
    assert.ok(p.name && p.id);
    assert.match(p.href, /^https:\/\//);
  }
});
test('all ten project functions are explicit and concise', () => {
  const expected = new Map([
    ['jobas','Asistente de búsqueda laboral remota y local'],
    ['voy','App de movilidad argentina'],
    ['atm','Panel de oportunidades, ingresos y cobros'],
    ['leadx','CRM para clientes y seguimiento comercial'],
    ['aberturas','Catálogo y pedidos de aberturas en Santa Fe'],
    ['rebeca','Tienda e-commerce de ropa femenina'],
    ['zungun','Sistema de operaciones y mensajería offline'],
    ['liva','Explorador de TV en vivo y videos a demanda'],
    ['casa-tour','Tours 3D de viviendas para inmobiliarias'],
    ['amira','Inteligencia bancaria y productos financieros']
  ]);
  assert.equal(projects.length,expected.size);
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
