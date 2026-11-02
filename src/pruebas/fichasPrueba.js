import { readFileSync } from 'node:fs'

// Fuente de prueba; nunca se importa desde la interfaz de produccion.
const sql = readFileSync(new URL('../../bd/corregirContenidoDesdePdf.sql', import.meta.url), 'utf8')
const fuentes = JSON.parse(sql.split('$fichasPdf$')[1])

export const FICHAS_PRUEBA = fuentes.map((fuente, indice) => ({
  id: `00000000-0000-4000-8000-${String(indice + 1).padStart(12, '0')}`,
  slug: fuente.slug,
  nombre: fuente.nombre,
  tipo: fuente.tipo,
  planeta: fuente.planeta_slug ? {
    slug: fuente.planeta_slug,
    nombre: fuentes.find((ficha) => ficha.slug === fuente.planeta_slug).nombre,
  } : null,
  imagen: { path: '/imagen-remota-no-utilizada.webp', alt: 'Alternativa remota' },
  clasificacion: fuente.clasificacion,
  subtitulo: null,
  descripcion_breve: fuente.descripcion_breve,
  contenido_ficha: fuente.contenido_ficha,
  datos_principales: { rotacion_horas: 1407.6, orbita_dias: 4331 },
  curiosidades: fuente.curiosidades,
  libros: [],
}))
