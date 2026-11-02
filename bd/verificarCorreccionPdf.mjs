// Verificacion aislada; no usa .env ni escribe en Supabase.
// node bd/verificarCorreccionPdf.mjs esquemaOriginal.sql cargaAnterior.sql moduloPglite.js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { crearConsultaSupabase } from '../api/servicios/consultaSupabase.js'

const [rutaEsquema, rutaCarga, rutaModulo] = process.argv.slice(2)
assert.ok(rutaEsquema && rutaCarga && rutaModulo, 'Indica esquema original, carga anterior y modulo PGlite')
const { PGlite } = await import(pathToFileURL(rutaModulo).href)
const esquema = await readFile(rutaEsquema, 'utf8')
const carga = await readFile(rutaCarga, 'utf8')
const correccion = await readFile(new URL('./corregirContenidoDesdePdf.sql', import.meta.url), 'utf8')
const fichas = JSON.parse(correccion.match(/\$fichasPdf\$([\s\S]*?)\$fichasPdf\$/)[1])
const librosProvisionales = ['940c5977-49c6-456e-9c0e-957218173207', 'b6e140d5-98e8-4fa9-a0d4-f43c4ace3b3b']

async function prepararBase() {
  const base = new PGlite()
  await base.exec('create role anon; create role authenticated;')
  await base.exec(esquema)
  await base.exec(`insert into public.libros
    (id, titulo, editorial, anio, url_ficha, verificado, verificado_en) values
    ('${librosProvisionales[0]}', 'Un punto azul pálido', 'Editorial Planeta', 2006,
     'https://www.planetadelibros.com/libro-un-punto-azul-palido/9700', true, now()),
    ('${librosProvisionales[1]}', 'Astrofísica para gente con prisas', 'Ediciones Paidós', 2026,
     'https://www.planetadelibros.com/libro-astrofisica-para-gente-con-prisas/257363?soporte=450044', true, now());`)
  await base.exec(carga)
  return base
}

async function obtenerEstado(base) {
  const resultado = {}
  for (const tabla of ['cuerpos_celestes', 'datos_planeta', 'datos_satelite', 'curiosidades', 'libros', 'autores', 'cuerpo_libro', 'libros_autores']) {
    resultado[tabla] = (await base.query(`select to_jsonb(t) as fila from public.${tabla} t order by to_jsonb(t)::text`)).rows
  }
  return resultado
}

async function comprobarCasoCorrecto(conDatosAjenos) {
  const base = await prepararBase()
  try {
    if (conDatosAjenos) {
      await base.exec(`
        insert into public.cuerpos_celestes (slug, nombre, tipo, orden)
        values ('pluton', 'Plutón', 'planeta', 13);
        insert into public.libros (id, titulo) values
          ('00000000-0000-4000-8000-000000000001', 'Libro de un compañero');
        insert into public.libros_autores (libro_id, autor_id)
        select '00000000-0000-4000-8000-000000000001', id from public.autores where nombre = 'Carl Sagan';
        insert into public.cuerpo_libro (cuerpo_id, libro_id)
        select id, '00000000-0000-4000-8000-000000000001'
        from public.cuerpos_celestes where slug = 'tierra';`)
    }
    const anterior = await obtenerEstado(base)
    const politicas = (await base.query('select schemaname, tablename, policyname, roles, qual from pg_policies order by tablename, policyname')).rows
    await base.exec(correccion)
    const actual = await obtenerEstado(base)
    assert.deepEqual((await base.query('select schemaname, tablename, policyname, roles, qual from pg_policies order by tablename, policyname')).rows, politicas)
    assert.equal(actual.cuerpos_celestes.length, anterior.cuerpos_celestes.length)
    for (const { fila: cuerpo } of actual.cuerpos_celestes) {
      const original = anterior.cuerpos_celestes.find(({ fila }) => fila.id === cuerpo.id).fila
      for (const campo of ['id', 'slug', 'nombre', 'tipo', 'planeta_id', 'orden', 'imagen_path', 'imagen_alt', 'imagen_credito', 'imagen_origen_url']) {
        assert.deepEqual(cuerpo[campo], original[campo], `${cuerpo.slug}: ${campo}`)
      }
      const fuente = fichas.find((ficha) => ficha.slug === cuerpo.slug)
      if (!fuente) {
        assert.deepEqual(cuerpo, { ...original, contenido_ficha: null })
        continue
      }
      assert.equal(cuerpo.descripcion_breve, fuente.descripcion_breve)
      assert.equal(cuerpo.clasificacion, fuente.clasificacion)
      assert.equal(cuerpo.subtitulo, null)
      assert.deepEqual(cuerpo.contenido_ficha, fuente.contenido_ficha)
      const tabla = fuente.tipo === 'planeta' ? 'datos_planeta' : 'datos_satelite'
      const datos = actual[tabla].find(({ fila }) => fila.cuerpo_id === cuerpo.id).fila
      for (const campo of ['diametro_km', 'rotacion_horas', 'orbita_dias', ...(fuente.tipo === 'planeta' ? ['distancia_sol_millones_km', 'dia_solar_horas'] : ['distancia_planeta_km'])]) {
        assert.equal(datos[campo] === null ? null : Number(datos[campo]), fuente[campo], `${fuente.slug}: ${campo}`)
      }
      for (const { fila: curiosidad } of actual.curiosidades.filter(({ fila }) => fila.cuerpo_id === cuerpo.id)) {
        assert.equal(curiosidad.texto, fuente.curiosidades[curiosidad.orden - 1])
        assert.ok(anterior.curiosidades.some(({ fila }) => fila.id === curiosidad.id), 'Conserva UUID de curiosidades')
      }
    }
    assert.equal(actual.libros.length, conDatosAjenos ? 1 : 0)
    assert.equal(actual.autores.length, conDatosAjenos ? 1 : 0)
    assert.equal(actual.cuerpo_libro.length, conDatosAjenos ? 1 : 0)
    assert.equal((await base.query('select count(*)::int as total from public.v_pendientes_astronomicos where slug <> $1', ['pluton'])).rows[0].total, 0)
    const respaldo = (await base.query('select * from respaldo_pdf_20261102.contenido_anterior')).rows
    assert.equal(respaldo.length, 1)
    assert.equal(respaldo[0].contenido.libros.length, 2)
    assert.equal(respaldo[0].contenido.cuerpo_libro.length, 24)
    assert.equal(respaldo[0].contenido.curiosidades.length, 24)

    await base.exec('set role anon;')
    const consulta = crearConsultaSupabase({
      entorno: { SUPABASE_URL: 'https://prueba.invalid', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_prueba' },
      async solicitar(url) {
        const ruta = new URL(url)
        let contenido
        if (ruta.pathname.endsWith('/rpc/ficha_cuerpo')) {
          contenido = (await base.query('select public.ficha_cuerpo($1) as ficha', [ruta.searchParams.get('p_slug')])).rows[0].ficha
        } else if (ruta.pathname.endsWith('/v_cuerpos_exploracion')) {
          contenido = (await base.query('select * from public.v_cuerpos_exploracion order by orden, slug')).rows
        } else {
          contenido = (await base.query('select * from public.v_libros_por_cuerpo where cuerpo_slug = $1', [ruta.searchParams.get('cuerpo_slug').slice(3)])).rows
        }
        return Response.json(contenido)
      },
    })
    assert.equal((await consulta.listarCuerpos()).length, 12)
    for (const ficha of fichas) {
      const respuesta = await consulta.obtenerFicha(ficha.slug)
      assert.deepEqual(respuesta.contenido_ficha, ficha.contenido_ficha)
      assert.deepEqual(respuesta.curiosidades, ficha.curiosidades)
      assert.deepEqual(respuesta.libros, [])
      assert.deepEqual(await consulta.listarLibros(ficha.slug), [])
    }
    assert.equal(await consulta.obtenerFicha('pluton'), null)
    await assert.rejects(base.query('select * from respaldo_pdf_20261102.contenido_anterior'), /permission denied/)
    await base.exec('reset role;')
    await base.exec(correccion)
    assert.deepEqual((await base.query('select * from respaldo_pdf_20261102.contenido_anterior')).rows, respaldo)
    assert.equal((await base.query('select count(*)::int as total from public.curiosidades')).rows[0].total, 24)
    console.log(`Correccion y repeticion correctas${conDatosAjenos ? ', conservando datos y autor compartido' : ''}; API anon y respaldo privado comprobados.`)
  } finally {
    await base.close()
  }
}

async function comprobarCancelacion(preparar, mensaje) {
  const base = await prepararBase()
  try {
    await preparar(base)
    const anterior = await obtenerEstado(base)
    await assert.rejects(base.exec(correccion), mensaje)
    await base.exec('rollback;')
    assert.deepEqual(await obtenerEstado(base), anterior)
    assert.equal((await base.query("select to_regnamespace('respaldo_pdf_20261102') as esquema")).rows[0].esquema, null)
    console.log(`Cancelacion atomica comprobada: ${mensaje}.`)
  } finally {
    await base.close()
  }
}

await comprobarCasoCorrecto(false)
await comprobarCasoCorrecto(true)
await comprobarCancelacion((base) => base.exec(`update public.libros set verificado_por = '00000000-0000-4000-8000-000000000099' where id = '${librosProvisionales[0]}'`), /libro provisional fue modificado/)
await comprobarCancelacion((base) => base.exec(`update public.cuerpos_celestes set planeta_id = (select id from public.cuerpos_celestes where slug = 'saturno') where slug = 'europa'`), /difiere su identidad\/planeta/)
await comprobarCancelacion((base) => base.exec(`
  create function public.forzarFalloPrueba() returns trigger language plpgsql as $$
    begin new.texto := new.texto || ' cambio'; return new; end $$;
  create trigger forzarFalloPrueba before update on public.curiosidades
    for each row execute function public.forzarFalloPrueba();`), /difiere de la transcripcion/)
console.log('Verificacion SQL finalizada sin conexion a Supabase.')
