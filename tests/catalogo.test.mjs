import test from 'node:test';
import assert from 'node:assert/strict';
import { allObjects, celestialBodies, constellations, buscarObjetoCeleste, esObjetoVisible, leerDescubrimientosGuardados } from '../src/catalogoCeleste.js';

test('El catálogo incluye ocho planetas, el Sol, la Luna y constelaciones seleccionables', () => {
  assert.equal(celestialBodies.filter(body => body.kind === 'planet').length, 8);
  assert.ok(buscarObjetoCeleste('sun'));
  assert.ok(buscarObjetoCeleste('moon'));
  assert.equal(new Set(allObjects.map(body => body.id)).size, allObjects.length);
  for (const body of allObjects) {
    assert.equal(body.position.length, 3);
    assert.ok(body.position.every(Number.isFinite));
    assert.equal(body.facts.length, 4);
    assert.ok(body.description.length > 60);
    assert.ok(body.source.startsWith('https://science.nasa.gov/'));
  }
});

test('Los filtros respetan las capas sin mostrar objetos ocultos', () => {
  assert.equal(esObjetoVisible(buscarObjetoCeleste('saturn'), 'constellations'), false);
  assert.equal(esObjetoVisible(buscarObjetoCeleste('orion'), 'planets'), false);
  assert.equal(esObjetoVisible(buscarObjetoCeleste('orion'), 'all', false), false);
  assert.equal(esObjetoVisible(buscarObjetoCeleste('earth'), 'all', false), true);
  assert.equal(esObjetoVisible(buscarObjetoCeleste('orion'), 'constellations', true), true);
});

test('Una colección corrupta o con IDs obsoletos no rompe la aplicación', () => {
  const crearAlmacenamientoSimulado = value => ({ getItem: () => value });
  assert.deepEqual(leerDescubrimientosGuardados(crearAlmacenamientoSimulado('invalid-json')), []);
  assert.deepEqual(leerDescubrimientosGuardados(crearAlmacenamientoSimulado('{"id":"saturn"}')), []);
  assert.deepEqual(leerDescubrimientosGuardados(crearAlmacenamientoSimulado('["saturn","missing","saturn","orion"]')), ['saturn', 'orion']);
  assert.deepEqual(leerDescubrimientosGuardados({ getItem() { throw new Error('Storage denied'); } }), []);
});

test('Todas las conexiones de constelaciones enlazan estrellas válidas', () => {
  for (const constellation of constellations) {
    for (const edge of constellation.connections) {
      assert.equal(edge.length, 2);
      assert.ok(edge.every(index => Number.isInteger(index) && index >= 0 && index < constellation.points.length));
    }
  }
});
