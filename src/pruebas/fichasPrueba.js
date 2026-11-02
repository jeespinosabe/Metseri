export function crearFichaPrueba(cuerpo) {
  return {
    id: '00000000-0000-4000-8000-000000000001', slug: cuerpo.id,
    nombre: cuerpo.nombre, tipo: cuerpo.tipo, clasificacion: cuerpo.clasificacion,
    planeta: cuerpo.tipo === 'satelite' ? { slug: cuerpo.planetaId, nombre: cuerpo.planetaPrincipal } : null,
    subtitulo: `Subtítulo de prueba de ${cuerpo.nombre}`,
    descripcion_breve: `Descripción sintética de ${cuerpo.nombre} para comprobar su correspondencia.`,
    datos_principales: {
      diametro_km: 1234, rotacion_horas: -72, orbita_dias: 4321,
      ...(cuerpo.tipo === 'satelite' ? { distancia_planeta_km: 56789 } : { distancia_sol_millones_km: 98.7 }),
    },
    curiosidades: [`Primera curiosidad de prueba de ${cuerpo.nombre}.`, `Segunda curiosidad de prueba de ${cuerpo.nombre}.`],
    libros: [{ titulo: `Libro de prueba de ${cuerpo.nombre}`, autor: 'Autora de prueba', editorial: 'Editorial de prueba', anio: 2020, url: `https://example.org/${cuerpo.id}` }],
  }
}
