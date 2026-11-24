import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  anioMaximoLibro, LIMITES_LIBRO, listarAutoresDeTexto, normalizarTextoLibro,
  validarAnioLibro, validarAutoriaLibro, validarEditorialLibro, validarTituloLibro,
} from './reglasLibro.js'

// El año se fija para que las pruebas no dependan del reloj: el máximo es 2027.
const ANIO = 2026
const autoria = (texto) => validarAutoriaLibro(listarAutoresDeTexto(texto))

describe('límites de longitud (VL-01 a VL-08)', () => {
  it('conserva los límites aprobados', () => {
    assert.deepEqual({ ...LIMITES_LIBRO }, { titulo: 200, editorial: 100, autor: 100, autorMinimo: 2, autoresMaximo: 50, anioMinimo: 1450 })
  })

  it('título: 200 caracteres sí, 201 no, vacío o solo espacios no', () => {
    assert.equal(validarTituloLibro('a'.repeat(200)), '')
    assert.equal(validarTituloLibro('a'.repeat(201)), 'El título admite hasta 200 caracteres.')
    assert.equal(validarTituloLibro(''), 'Escribe el título del libro.')
    assert.equal(validarTituloLibro('     '), 'Escribe el título del libro.')
  })

  it('nombre de autor: 100 caracteres sí, 101 no con su línea', () => {
    assert.equal(autoria('A'.repeat(100)), '')
    assert.equal(autoria(`Ana\n${'A'.repeat(101)}`), 'El nombre de autor de la línea 2 admite hasta 100 caracteres.')
  })

  it('50 autores sí, 51 no, ninguno no', () => {
    const nombres = (n) => Array.from({ length: n }, (_, i) => `Autor ${String.fromCharCode(65 + (i % 26))}${'x'.repeat(Math.floor(i / 26) + 1)}`).join('\n')
    assert.equal(autoria(nombres(50)), '')
    assert.equal(autoria(nombres(51)), 'Escribe hasta 50 autores.')
    assert.equal(autoria('  \n  '), 'Escribe el autor del libro.')
  })

  it('editorial: 100 caracteres sí, 101 no', () => {
    assert.equal(validarEditorialLibro('E'.repeat(100)), '')
    assert.equal(validarEditorialLibro('E'.repeat(101)), 'La editorial admite hasta 100 caracteres.')
  })

  it('cuenta los caracteres Unicode completos, no las unidades UTF-16', () => {
    assert.equal(validarTituloLibro('𝔸'.repeat(200)), '')
    assert.equal(validarTituloLibro('𝔸'.repeat(201)), 'El título admite hasta 200 caracteres.')
  })

  it('el límite cuenta tras colapsar espacios (VL-33)', () => {
    const titulo = `${'a'.repeat(100)}    ${'b'.repeat(99)}`
    assert.equal(titulo.length, 203)
    assert.equal(validarTituloLibro(titulo), '')
  })
})

describe('nombre de autor: inicia con una letra (VL-09 a VL-15)', () => {
  it('acepta letras, incluidas las acentuadas, la ñ y la ü', () => {
    for (const nombre of ['Álvaro Mutis', 'Ñandú Pérez', 'Carl Sagan', 'Ünal Yilmaz', 'Ángela', 'élodie Roux', 'Li']) assert.equal(autoria(nombre), '', nombre)
  })

  it('rechaza símbolos y puntuación al inicio e indica el carácter', () => {
    assert.equal(autoria('#Carl Sagan'), 'El nombre de autor de la línea 1 debe empezar con una letra, no con «#».')
    for (const nombre of ['¿Quién', '(Anónimo)', '-Pérez', '_x', '"Pérez', '___', '@Ann', '$$%^&*()', '.Ana', "'t Hooft"]) {
      assert.match(autoria(nombre), /^El nombre de autor de la línea 1 debe empezar con una letra, no con «.»\.$/, nombre)
    }
  })

  it('rechaza números al inicio', () => {
    assert.equal(autoria('3 Carl Sagan'), 'El nombre de autor de la línea 1 debe empezar con una letra, no con «3».')
    assert.equal(autoria('2001 Editores'), 'El nombre de autor de la línea 1 debe empezar con una letra, no con «2».')
  })

  it('evalúa tras quitar los espacios exteriores y señala la línea afectada', () => {
    assert.match(autoria('  #Carl Sagan'), /«#»/)
    assert.equal(autoria('Carl Sagan\n@Ann Druyan'), 'El nombre de autor de la línea 2 debe empezar con una letra, no con «@».')
    assert.equal(autoria('Ana\n\n#Beto'), 'El nombre de autor de la línea 3 debe empezar con una letra, no con «#».')
  })

  it('rechaza nombres repetidos sin distinguir mayúsculas', () => {
    assert.equal(autoria('Ana\nana'), 'Escribe cada nombre una sola vez.')
  })
})

describe('nombre de autor: al menos 2 caracteres (G2, VL-16 a VL-18)', () => {
  it('rechaza un carácter que sí es letra', () => {
    assert.equal(autoria('A'), 'El nombre de autor de la línea 1 debe tener al menos 2 caracteres.')
  })

  it('acepta el mínimo y las instituciones', () => {
    for (const nombre of ['Li', 'NASA', 'Al']) assert.equal(autoria(nombre), '', nombre)
  })

  it('un carácter que no es letra muestra solo el mensaje de la letra', () => {
    assert.equal(autoria('#'), 'El nombre de autor de la línea 1 debe empezar con una letra, no con «#».')
  })

  it('un nombre vacío en la lista de la API tiene mensaje de longitud', () => {
    assert.equal(validarAutoriaLibro([{ nombre: '', linea: 1 }]), 'El nombre de autor de la línea 1 debe tener al menos 2 caracteres.')
  })
})

describe('título y editorial en una línea y sin ruido (G1, VL-27 a VL-34)', () => {
  it('rechaza saltos de línea y caracteres de control', () => {
    assert.equal(validarTituloLibro('Cosmos\ninfinito'), 'El título no admite saltos de línea ni caracteres de control.')
    assert.equal(validarTituloLibro('Cosmos\tinfinito'), 'El título no admite saltos de línea ni caracteres de control.')
    assert.equal(validarTituloLibro('Cosmos\u0000'), 'El título no admite saltos de línea ni caracteres de control.')
    assert.equal(validarTituloLibro('Cosmos infinito'), 'El título no admite saltos de línea ni caracteres de control.')
    assert.equal(validarEditorialLibro('Fondo\tde Cultura'), 'La editorial no admite saltos de línea ni caracteres de control.')
    assert.equal(validarEditorialLibro('Fondo\r\nde Cultura'), 'La editorial no admite saltos de línea ni caracteres de control.')
  })

  it('un salto de línea solo al final se recorta sin error', () => {
    assert.equal(validarTituloLibro('Cosmos infinito\n'), '')
    assert.equal(validarEditorialLibro('\tFondo de Cultura\r\n'), '')
  })

  it('exige al menos una letra o un número', () => {
    assert.equal(validarTituloLibro('!!!'), 'El título debe contener al menos una letra o un número.')
    assert.equal(validarEditorialLibro('....'), 'La editorial debe contener al menos una letra o un número.')
    assert.equal(validarTituloLibro('1984'), '')
    assert.equal(validarTituloLibro('¡Ñ!'), '')
  })

  it('normaliza espacios exteriores e internos repetidos', () => {
    assert.equal(normalizarTextoLibro('  Cosmos    infinito  '), 'Cosmos infinito')
    assert.equal(normalizarTextoLibro('Fondo   de  Cultura'), 'Fondo de Cultura')
    assert.equal(normalizarTextoLibro('a  b'), 'a b')
    assert.equal(normalizarTextoLibro(null), '')
  })
})

describe('editorial obligatoria (VL-19 y VL-20)', () => {
  it('rechaza vacío, nulo y solo espacios', () => {
    for (const valor of ['', '   ', null, undefined]) assert.equal(validarEditorialLibro(valor), 'Escribe la editorial del libro.')
    assert.equal(validarEditorialLibro('Fondo de Cultura Económica'), '')
  })
})

describe('año de publicación (VL-22 a VL-26)', () => {
  it('es opcional', () => {
    for (const vacio of ['', '   ', null, undefined]) assert.equal(validarAnioLibro(vacio, ANIO), '')
  })

  it('el máximo es el año actual + 1 y el mínimo 1450, ambos inclusivos', () => {
    assert.equal(anioMaximoLibro(ANIO), 2027)
    for (const valido of ['1450', '2020', '2026', '2027', ' 2020 ', 1450, 2027]) assert.equal(validarAnioLibro(valido, ANIO), '', String(valido))
  })

  it('fuera de rango muestra el máximo vigente', () => {
    for (const fuera of ['1449', '1000', '0123', '2028', '2100', '9999', 1449, 2028]) {
      assert.equal(validarAnioLibro(fuera, ANIO), 'Escribe un año entre 1450 y 2027.', String(fuera))
    }
    assert.equal(validarAnioLibro('2028', 2030), '')
  })

  it('formato inválido pide cuatro cifras', () => {
    for (const mal of ['20', '999', '2020.5', '20,5', 'dos mil', '02020', '-2020', '1e3', '+2020', 2020.5, '10000']) {
      assert.equal(validarAnioLibro(mal, ANIO), 'Escribe el año con cuatro cifras, por ejemplo 2020.', String(mal))
    }
  })
})
