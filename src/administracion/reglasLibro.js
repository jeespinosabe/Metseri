// Reglas de los datos de un libro. Módulo puro y sin dependencias: lo usan el
// formulario (src/) y la API (servidor/) para aplicar los mismos criterios y mensajes.
// Las restricciones equivalentes de la base están en bd/validarDatosLibros.sql.
import { obtenerAnioActual } from '../datos/anioPublicacion.js'

export const LIMITES_LIBRO = Object.freeze({
  titulo: 200,
  editorial: 100,
  autor: 100,
  autorMinimo: 2,
  autoresMaximo: 50,
  anioMinimo: 1450,
})

const CARACTERES_CONTROL = /[\p{Cc}\p{Zl}\p{Zp}]/u
const LETRA_O_DIGITO = /[\p{L}\p{N}]/u
const LETRA_INICIAL = /^\p{L}/u

const medir = (texto) => Array.from(texto).length

// Recorta los extremos y reduce los espacios internos repetidos a uno solo.
export function normalizarTextoLibro(texto) {
  return String(texto ?? '').replace(/\p{Zs}+/gu, ' ').trim()
}

export function anioMaximoLibro(anioActual = obtenerAnioActual()) {
  return anioActual + 1
}

const NOMBRES_TEXTO = Object.freeze({
  titulo: Object.freeze({
    vacio: 'Escribe el título del libro.',
    control: 'El título no admite saltos de línea ni caracteres de control.',
    largo: `El título admite hasta ${LIMITES_LIBRO.titulo} caracteres.`,
    sinLetra: 'El título debe contener al menos una letra o un número.',
  }),
  editorial: Object.freeze({
    vacio: 'Escribe la editorial del libro.',
    control: 'La editorial no admite saltos de línea ni caracteres de control.',
    largo: `La editorial admite hasta ${LIMITES_LIBRO.editorial} caracteres.`,
    sinLetra: 'La editorial debe contener al menos una letra o un número.',
  }),
})

// Orden de validación: vacío, caracteres de control, longitud y letra o dígito.
function validarTextoDeUnaLinea(campo, valor) {
  const mensajes = NOMBRES_TEXTO[campo]
  const original = String(valor ?? '')
  if (CARACTERES_CONTROL.test(original.trim())) return mensajes.control
  const texto = normalizarTextoLibro(original)
  if (!texto) return mensajes.vacio
  if (medir(texto) > LIMITES_LIBRO[campo]) return mensajes.largo
  return LETRA_O_DIGITO.test(texto) ? '' : mensajes.sinLetra
}

export const validarTituloLibro = (valor) => validarTextoDeUnaLinea('titulo', valor)
export const validarEditorialLibro = (valor) => validarTextoDeUnaLinea('editorial', valor)

// Año opcional: vacío es válido. Con valor, cuatro cifras entre 1450 y el año actual + 1.
export function validarAnioLibro(valor, anioActual = obtenerAnioActual()) {
  if (valor === null || valor === undefined) return ''
  const texto = typeof valor === 'number' ? (Number.isInteger(valor) ? String(valor) : 'no entero') : String(valor).trim()
  if (texto === '') return ''
  if (!/^\d{4}$/.test(texto)) return 'Escribe el año con cuatro cifras, por ejemplo 2020.'
  const maximo = anioMaximoLibro(anioActual)
  return +texto >= LIMITES_LIBRO.anioMinimo && +texto <= maximo ? '' : `Escribe un año entre ${LIMITES_LIBRO.anioMinimo} y ${maximo}.`
}

// Convierte el texto de la autoría (un nombre por línea) en entradas con su número de línea.
export function listarAutoresDeTexto(texto) {
  return String(texto ?? '').split('\n')
    .map((nombre, indice) => ({ nombre: nombre.trim(), linea: indice + 1 }))
    .filter(({ nombre }) => nombre !== '')
}

// Entradas: [{ nombre, linea }]. Devuelve el primer error o una cadena vacía.
export function validarAutoriaLibro(entradas) {
  if (!entradas.length) return 'Escribe el autor del libro.'
  if (entradas.length > LIMITES_LIBRO.autoresMaximo) return `Escribe hasta ${LIMITES_LIBRO.autoresMaximo} autores.`
  for (const { nombre, linea } of entradas) {
    const prefijo = `El nombre de autor de la línea ${linea}`
    const largo = medir(nombre)
    if (largo > LIMITES_LIBRO.autor) return `${prefijo} admite hasta ${LIMITES_LIBRO.autor} caracteres.`
    if (largo === 0) return `${prefijo} debe tener al menos ${LIMITES_LIBRO.autorMinimo} caracteres.`
    if (!LETRA_INICIAL.test(nombre)) return `${prefijo} debe empezar con una letra, no con «${Array.from(nombre)[0]}».`
    if (largo < LIMITES_LIBRO.autorMinimo) return `${prefijo} debe tener al menos ${LIMITES_LIBRO.autorMinimo} caracteres.`
  }
  return new Set(entradas.map(({ nombre }) => nombre.toLowerCase())).size !== entradas.length ? 'Escribe cada nombre una sola vez.' : ''
}
