// Verificación aislada de bd/validarDatosLibros.sql; no usa .env ni escribe en Supabase.
// node bd/verificarValidacionLibros.mjs ruta/al/modulo/pglite/dist/index.js
//
// El esquema base de `libros` no está en el repositorio: la fixture de abajo lo reconstruye a
// partir de lo comprobado en Supabase (columnas, restricciones y el trigger trg_libros_actualizado_en).
// Es una aproximación: sirve para probar la migración, no sustituye ejecutarla en Supabase.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const [rutaModulo] = process.argv.slice(2)
assert.ok(rutaModulo, 'Indica la ruta del módulo PGlite (dist/index.js)')
const { PGlite } = await import(pathToFileURL(rutaModulo).href)
const leer = (nombre) => readFile(new URL(nombre, import.meta.url), 'utf8')
const [agregarGestion, publicarActivos, guardarPortadas, validar] = await Promise.all([
  'agregarGestionBibliografica.sql', 'publicarLibrosActivos.sql', 'guardarPortadasLibros.sql', 'validarDatosLibros.sql',
].map(leer))

const ESQUEMA = `
create role anon; create role authenticated; create role service_role;
create table public.cuerpos_celestes (
  id uuid primary key default gen_random_uuid(), slug text not null unique, nombre text not null,
  publicado boolean not null default true, contenido_ficha jsonb);
create table public.libros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null, editorial text, anio smallint, url_ficha text,
  verificado boolean not null default false, verificado_por uuid, verificado_en timestamptz,
  activo boolean not null default true,
  creado_en timestamptz not null default now(), actualizado_en timestamptz not null default now(),
  constraint libros_titulo_check check (btrim(titulo) <> ''),
  constraint libros_anio_check check (anio between 1000 and 2100),
  constraint libros_url_ficha_check check (url_ficha is null or url_ficha ~ '^https?://'),
  constraint ck_libro_verificado_completo check (not verificado
    or (editorial is not null and anio is not null and url_ficha is not null and verificado_en is not null)),
  constraint uq_libro unique (titulo, editorial, anio));
create table public.autores (id uuid primary key default gen_random_uuid(), nombre text not null);
create unique index uq_autor_nombre on public.autores ((lower(btrim(nombre))));
create table public.libros_autores (
  libro_id uuid not null references public.libros(id) on delete cascade,
  autor_id uuid not null constraint libros_autores_autor_id_fkey references public.autores(id) on delete restrict,
  orden smallint not null default 1, primary key (libro_id, autor_id));
create table public.cuerpo_libro (
  cuerpo_id uuid not null references public.cuerpos_celestes(id) on delete cascade,
  libro_id uuid not null references public.libros(id) on delete cascade,
  orden smallint not null default 1, es_fuente_de_ficha boolean not null default false,
  primary key (cuerpo_id, libro_id));
create function public.fijar_actualizado_en() returns trigger language plpgsql as
  $$ begin new.actualizado_en := clock_timestamp(); return new; end $$;
create trigger trg_libros_actualizado_en before update on public.libros
  for each row execute function public.fijar_actualizado_en();
insert into public.cuerpos_celestes (slug, nombre) values ('tierra', 'Tierra'), ('luna', 'Luna');
`

// Libros que ya cumplen las reglas, como los 11 reales.
const SEMILLA = `
insert into public.libros (id, titulo, editorial, anio, url_ficha, verificado, verificado_en) values
  ('00000000-0000-4000-8000-000000000001', 'Cosmos', 'Planeta', 1980, 'https://example.org/cosmos', true, now()),
  ('00000000-0000-4000-8000-000000000002', 'Astrofísica para gente con prisas', 'Paidós', 2017, null, false, null),
  ('00000000-0000-4000-8000-000000000003', 'Sin año', 'Fondo de Cultura Económica', null, null, false, null);
insert into public.autores (id, nombre) values
  ('00000000-0000-4000-8000-0000000000a1', 'Carl Sagan'), ('00000000-0000-4000-8000-0000000000a2', 'Neil deGrasse Tyson');
insert into public.libros_autores (libro_id, autor_id, orden) values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 1),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-0000000000a2', 1),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-0000000000a1', 1);
insert into public.cuerpo_libro (cuerpo_id, libro_id, orden)
  select id, '00000000-0000-4000-8000-000000000001', 1 from public.cuerpos_celestes where slug = 'tierra';
`

async function crearBase({ conSemilla = true, migrar = true } = {}) {
  const base = new PGlite()
  await base.exec(ESQUEMA)
  await base.exec(agregarGestion)
  await base.exec(publicarActivos)
  await base.exec(guardarPortadas)
  if (conSemilla) await base.exec(SEMILLA)
  if (migrar) await base.exec(validar)
  return base
}

const guardar = (base, id, datos) => base.query('select public."guardarLibroAdministrativo"($1::uuid, $2::jsonb) as r', [id, JSON.stringify(datos)])
const contar = async (base, tabla = 'libros') => (await base.query(`select count(*)::int as n from public.${tabla}`)).rows[0].n
const valido = (cambios = {}) => ({ titulo: 'Un libro de prueba', autores: ['Ana Prueba'], editorial: 'Editorial Prueba', anio: 2020, ...cambios })
const unaFila = async (base, sql, parametros) => (await base.query(sql, parametros)).rows[0]
const anioMaximo = async (base) => (await unaFila(base, 'select extract(year from now())::int + 1 as a')).a

async function rechaza(base, accion, { codigo, mensaje, detalle } = {}) {
  const antes = await Promise.all(['libros', 'autores', 'libros_autores'].map((t) => contar(base, t)))
  let error
  try { await accion() } catch (e) { error = e }
  assert.ok(error, 'Se esperaba un rechazo de la base')
  if (codigo) assert.equal(error.code, codigo, `código ${error.code}: ${error.message}`)
  if (mensaje) assert.match(error.message, mensaje)
  if (detalle) assert.equal(error.detail, detalle)
  const despues = await Promise.all(['libros', 'autores', 'libros_autores'].map((t) => contar(base, t)))
  assert.deepEqual(despues, antes, 'El rechazo dejó datos parciales')
  return error
}

const resultados = []
async function caso(nombre, funcion) {
  await funcion()
  resultados.push(nombre)
  console.log(`OK  ${nombre}`)
}

// --- Migración y datos existentes ---------------------------------------------------------
{
  const base = await crearBase({ migrar: false })
  await caso('VL-63 la migración se ejecuta dos veces sin errores ni duplicados', async () => {
    await base.exec(validar)
    const definiciones = async () => (await base.query(
      `select conname, pg_get_constraintdef(oid) as definicion from pg_constraint
       where conrelid in ('public.libros'::regclass, 'public.autores'::regclass) order by conname`)).rows
    const primera = await definiciones()
    await base.exec(validar)
    assert.deepEqual(await definiciones(), primera)
    const nombres = primera.map((fila) => fila.conname)
    for (const nombre of ['libros_anio_check', 'ck_libro_titulo', 'ck_libro_editorial', 'ck_autor_nombre', 'uq_libro', 'ck_libro_verificado_completo', 'libros_titulo_check', 'libros_url_ficha_check']) {
      assert.ok(nombres.includes(nombre), `falta ${nombre}`)
    }
    assert.equal(nombres.filter((n) => n === 'libros_anio_check').length, 1)
    assert.match(primera.find((f) => f.conname === 'libros_anio_check').definicion, /1450/)
    assert.equal((await base.query(`select count(*)::int as n from pg_constraint where conname in ('ck_libro_titulo','ck_libro_editorial','ck_autor_nombre') and not convalidated`)).rows[0].n, 0, 'las restricciones deben estar validadas')
  })

  await caso('VL-62 los libros existentes siguen consultables y editables', async () => {
    assert.equal(await contar(base), 3)
    for (const id of ['1', '2', '3']) {
      const libro = (await unaFila(base, 'select public."obtenerLibroAdministrativo"($1::uuid) as r', [`00000000-0000-4000-8000-00000000000${id}`])).r
      assert.ok(libro.titulo && libro.editorial)
    }
    const editado = (await guardar(base, '00000000-0000-4000-8000-000000000002', { activo: false })).rows[0].r
    assert.equal(editado.activo, false)
    assert.equal(editado.editorial, 'Paidós')
  })

  await caso('VL-55 el trigger trg_libros_actualizado_en sigue actualizando actualizado_en', async () => {
    const id = '00000000-0000-4000-8000-000000000003'
    const antes = (await unaFila(base, 'select actualizado_en as t from public.libros where id = $1', [id])).t
    await new Promise((resolver) => setTimeout(resolver, 20))
    await guardar(base, id, { activo: true })
    const despues = (await unaFila(base, 'select actualizado_en as t from public.libros where id = $1', [id])).t
    assert.ok(despues > antes, 'el trigger debe fijar actualizado_en en cada actualización')
  })
}

// --- Verificación previa (VL-61) -----------------------------------------------------------
{
  for (const [descripcion, preparar] of [
    ['un libro sin editorial', (b) => b.exec(`insert into public.libros (titulo) values ('Sin editorial')`)],
    ['un título con espacios repetidos', (b) => b.exec(`insert into public.libros (titulo, editorial) values ('Dos  espacios', 'Editorial')`)],
    ['un año fuera de 1450 a 2100', (b) => b.exec(`insert into public.libros (titulo, editorial, anio) values ('Muy antiguo', 'Editorial', 1200)`)],
    ['un autor que no inicia con letra', (b) => b.exec(`insert into public.autores (nombre) values ('___')`)],
    ['un autor de un solo carácter', (b) => b.exec(`insert into public.autores (nombre) values ('A')`)],
  ]) {
    await caso(`VL-61 la verificación previa se detiene con ${descripcion} y no cambia nada`, async () => {
      const base = await crearBase({ migrar: false })
      await preparar(base)
      const antes = (await base.query(`select conname, pg_get_constraintdef(oid) as d from pg_constraint where conrelid in ('public.libros'::regclass, 'public.autores'::regclass) order by conname`)).rows
      await assert.rejects(() => base.exec(validar), /La migración se detiene: \d+ libro\(s\) y \d+ autor\(es\) incumplen/)
      await base.exec('rollback') // como indica el encabezado del script: el editor deja la transacción abierta tras un error
      const despues = (await base.query(`select conname, pg_get_constraintdef(oid) as d from pg_constraint where conrelid in ('public.libros'::regclass, 'public.autores'::regclass) order by conname`)).rows
      assert.deepEqual(despues, antes)
      assert.equal(despues.some((fila) => fila.conname === 'ck_libro_editorial'), false)
      const funcion = (await unaFila(base, `select pg_get_functiondef('public."guardarLibroAdministrativo"(uuid, jsonb)'::regprocedure) as d`)).d
      assert.equal(funcion.includes('Escribe la editorial del libro.'), false, 'la función no debe haberse reemplazado')
    })
  }
}

// --- Función de guardado -------------------------------------------------------------------
{
  const base = await crearBase()
  const maximo = await anioMaximo(base)

  await caso('VL-55 alta y edición válidas con la función', async () => {
    const creado = (await guardar(base, null, valido({ cuerpos: [{ slug: 'luna', orden: 2 }] }))).rows[0].r
    assert.equal(creado.titulo, 'Un libro de prueba')
    assert.equal(creado.editorial, 'Editorial Prueba')
    assert.equal(creado.anio, 2020)
    assert.deepEqual(creado.autores.map((a) => a.nombre), ['Ana Prueba'])
    assert.equal(creado.cuerpos[0].slug, 'luna')
    const editado = (await guardar(base, creado.id, { titulo: 'Otro título', anio: null, autores: ['Ana Prueba', 'Beto Prueba'] })).rows[0].r
    assert.equal(editado.titulo, 'Otro título')
    assert.equal(editado.anio, null)
    assert.equal(editado.autores.length, 2)
    assert.equal(editado.editorial, 'Editorial Prueba')
  })

  await caso('VL-55 guardarLibroConPortada sigue funcionando (alta con portada y edición)', async () => {
    const portada = { x: 50, y: 50, datos: Buffer.from('ffd8ff00ffd9', 'hex').toString('base64') }
    const creado = (await unaFila(base, 'select public."guardarLibroConPortada"(null, $1::jsonb) as r',
      [JSON.stringify(valido({ titulo: 'Con portada', portada }))])).r
    assert.ok(creado.portada.version)
    const editado = (await unaFila(base, 'select public."guardarLibroConPortada"($1::uuid, $2::jsonb) as r',
      [creado.id, JSON.stringify({ editorial: 'Otra editorial', portada: { x: 10, y: 20, version: creado.portada.version } })])).r
    assert.equal(editado.editorial, 'Otra editorial')
    assert.equal(editado.portada.x, 10)
  })

  await caso('VL-49 el alta sin editorial falla y no deja ni un libro con solo el título', async () => {
    const sinEditorial = valido({ titulo: 'Solo título' })
    delete sinEditorial.editorial
    await rechaza(base, () => guardar(base, null, sinEditorial), { codigo: '23514', mensaje: /Escribe la editorial del libro\./, detalle: 'editorial' })
    assert.equal((await base.query(`select 1 from public.libros where titulo = 'Solo título'`)).rows.length, 0)
    for (const editorial of [null, '', '   ', 5]) await rechaza(base, () => guardar(base, null, valido({ editorial })), { codigo: '23514' })
    await rechaza(base, () => guardar(base, '00000000-0000-4000-8000-000000000001', { editorial: null }), { codigo: '23514', detalle: 'editorial' })
    await rechaza(base, () => guardar(base, '00000000-0000-4000-8000-000000000001', { editorial: '  ' }), { codigo: '23514', detalle: 'editorial' })
  })

  await caso('VL-50 año fuera de rango en la función; límites inclusivos', async () => {
    for (const anio of [1449, 1000, maximo + 1, 2100]) {
      await rechaza(base, () => guardar(base, null, valido({ anio, titulo: `Año ${anio}` })), { codigo: '23514', mensaje: new RegExp(`entre 1450 y ${maximo}`), detalle: 'anio' })
    }
    for (const anio of [20, 999, 12345, 2020.5, '2020']) {
      await rechaza(base, () => guardar(base, null, valido({ anio, titulo: `Formato ${anio}` })), { codigo: '23514', mensaje: /cuatro cifras/, detalle: 'anio' })
    }
    assert.equal((await guardar(base, null, valido({ anio: 1450, titulo: 'Mínimo' }))).rows[0].r.anio, 1450)
    assert.equal((await guardar(base, null, valido({ anio: maximo, titulo: 'Máximo' }))).rows[0].r.anio, maximo)
    assert.equal((await guardar(base, null, valido({ anio: null, titulo: 'Sin año nuevo' }))).rows[0].r.anio, null)
  })

  await caso('VL-51 título de 201 y editorial de 101 caracteres', async () => {
    await rechaza(base, () => guardar(base, null, valido({ titulo: 'a'.repeat(201) })), { codigo: '23514', mensaje: /hasta 200/, detalle: 'titulo' })
    await rechaza(base, () => guardar(base, null, valido({ editorial: 'E'.repeat(101) })), { codigo: '23514', mensaje: /hasta 100/, detalle: 'editorial' })
    assert.equal((await guardar(base, null, valido({ titulo: 'a'.repeat(200) }))).rows[0].r.titulo.length, 200)
    assert.equal((await guardar(base, null, valido({ titulo: 'Editorial de 100', editorial: 'E'.repeat(100) }))).rows[0].r.editorial.length, 100)
  })

  await caso('VL-52 autores que no inician con letra o de un carácter', async () => {
    for (const nombre of ['#x', '3x', 'A', '___', '¿Quién', "'t Hooft", '$$%^&*()']) {
      await rechaza(base, () => guardar(base, null, valido({ autores: [nombre] })), { codigo: '23514', detalle: 'autores' })
    }
    await rechaza(base, () => guardar(base, null, valido({ autores: ['Ana Prueba', 'ana prueba'] })), { codigo: '23514', mensaje: /una sola vez/ })
    await rechaza(base, () => guardar(base, null, valido({ autores: [] })), { codigo: '23514' })
    await rechaza(base, () => guardar(base, null, valido({ autores: ['A'.repeat(101)] })), { codigo: '23514' })
    await rechaza(base, () => guardar(base, null, valido({ autores: Array.from({ length: 51 }, (_, i) => `Autor${'x'.repeat(i + 1)}`) })), { codigo: '23514' })
    for (const nombre of ['Li', 'NASA', 'Ana', 'A'.repeat(100)]) {
      assert.equal((await guardar(base, null, valido({ autores: [nombre], titulo: `Autor ${nombre.slice(0, 5)}` }))).rows[0].r.autores[0].nombre, nombre)
    }
  })

  await caso('VL-53 título con salto de línea o tabulador, y textos sin letra ni dígito', async () => {
    await rechaza(base, () => guardar(base, null, valido({ titulo: 'Cosmos\ninfinito' })), { codigo: '23514', mensaje: /saltos de línea/, detalle: 'titulo' })
    await rechaza(base, () => guardar(base, null, valido({ titulo: 'Cosmos\tinfinito' })), { codigo: '23514', detalle: 'titulo' })
    await rechaza(base, () => guardar(base, null, valido({ editorial: 'Fondo\nde Cultura' })), { codigo: '23514', mensaje: /saltos de línea/, detalle: 'editorial' })
    await rechaza(base, () => guardar(base, null, valido({ titulo: '!!!' })), { codigo: '23514', mensaje: /letra o un número/, detalle: 'titulo' })
    await rechaza(base, () => guardar(base, null, valido({ editorial: '....' })), { codigo: '23514', mensaje: /letra o un número/, detalle: 'editorial' })
  })

  await caso('VL-54 la función normaliza los espacios antes de guardar', async () => {
    const libro = (await guardar(base, null, valido({ titulo: '  Cosmos    infinito  ', editorial: ' Fondo   de  Cultura ' }))).rows[0].r
    assert.equal(libro.titulo, 'Cosmos infinito')
    assert.equal(libro.editorial, 'Fondo de Cultura')
  })

  await caso('VL-48 duplicado exacto y VL-47 duplicado tras normalizar responden 23505', async () => {
    await guardar(base, null, valido({ titulo: 'Duplicable', anio: 1999 }))
    await rechaza(base, () => guardar(base, null, valido({ titulo: 'Duplicable', anio: 1999 })), { codigo: '23505' })
    await rechaza(base, () => guardar(base, null, valido({ titulo: 'Duplicable   ', anio: 1999 })), { codigo: '23505' })
    await guardar(base, null, valido({ titulo: 'Cosmos infinito', anio: 1999 }))
    await rechaza(base, () => guardar(base, null, valido({ titulo: 'Cosmos    infinito', anio: 1999 })), { codigo: '23505' })
  })

  await caso('VL-64 limitación conocida: mismo título y editorial sin año no chocan', async () => {
    await guardar(base, null, valido({ titulo: 'Sin año repetido', anio: null }))
    await guardar(base, null, valido({ titulo: 'Sin año repetido', anio: null }))
    assert.equal((await base.query(`select 1 from public.libros where titulo = 'Sin año repetido'`)).rows.length, 2)
  })

  await caso('VL-60 un libro verificado sigue cumpliendo ck_libro_verificado_completo', async () => {
    const verificado = (await guardar(base, '00000000-0000-4000-8000-000000000001', { verificado: true })).rows[0].r
    assert.equal(verificado.verificado, true)
    await rechaza(base, () => guardar(base, '00000000-0000-4000-8000-000000000003', { verificado: true, url_ficha: null }), { codigo: '23514' })
  })

  await caso('VL-51 las acentuadas y la ñ cuentan como letras y los emoji, como caracteres', async () => {
    for (const nombre of ['Álvaro Mutis', 'Ñandú Pérez', 'Ünal Yilmaz']) {
      assert.equal((await guardar(base, null, valido({ autores: [nombre], titulo: `Acentos ${nombre}` }))).rows[0].r.autores[0].nombre, nombre)
    }
    assert.equal((await guardar(base, null, valido({ titulo: '𝔸'.repeat(200) }))).rows[0].r.titulo.length, 400, 'cada carácter ocupa 2 unidades UTF-16 y cuenta como uno')
  })
}

// --- Restricciones de tabla (escrituras directas) -----------------------------------------
{
  const base = await crearBase()
  const insertar = (titulo, editorial, anio = null) => base.query('insert into public.libros (titulo, editorial, anio) values ($1, $2, $3)', [titulo, editorial, anio])
  const viola = (accion, restriccion) => rechaza(base, accion, { codigo: '23514', mensaje: new RegExp(restriccion) })

  await caso('VL-56 insert directo sin editorial viola ck_libro_editorial', async () => {
    await viola(() => insertar('Directo', null), 'ck_libro_editorial')
    await viola(() => insertar('Directo', '   '), 'ck_libro_editorial')
    await viola(() => insertar('Directo', 'E'.repeat(101)), 'ck_libro_editorial')
    await viola(() => insertar('Directo', '....'), 'ck_libro_editorial')
    await viola(() => insertar('Directo', 'a\nb'), 'ck_libro_editorial')
    await viola(() => insertar('Directo', 'a  b'), 'ck_libro_editorial')
  })

  await caso('VL-57 insert directo con título inválido viola ck_libro_titulo', async () => {
    await viola(() => insertar('a\nb', 'Editorial'), 'ck_libro_titulo')
    await viola(() => insertar('a\tb', 'Editorial'), 'ck_libro_titulo')
    await viola(() => insertar('a  b', 'Editorial'), 'ck_libro_titulo')
    await viola(() => insertar('!!!', 'Editorial'), 'ck_libro_titulo')
    await viola(() => insertar('a'.repeat(201), 'Editorial'), 'ck_libro_titulo')
    await insertar('a'.repeat(200), 'Editorial', null)
  })

  await caso('VL-58 el año se limita a 1450–2100 en la tabla', async () => {
    await viola(() => insertar('Año bajo', 'Editorial', 1449), 'libros_anio_check')
    await viola(() => insertar('Año alto', 'Editorial', 2101), 'libros_anio_check')
    await viola(() => base.query(`update public.libros set anio = 1200 where id = '00000000-0000-4000-8000-000000000001'`), 'libros_anio_check')
    await viola(() => base.query(`update public.libros set anio = 2101 where id = '00000000-0000-4000-8000-000000000001'`), 'libros_anio_check')
    await insertar('Año límite bajo', 'Editorial', 1450)
    await insertar('Año límite alto', 'Editorial', 2100)
  })

  await caso('VL-59 insert directo en autores viola ck_autor_nombre', async () => {
    for (const nombre of ['#x', '3x', 'A', '___', 'A'.repeat(101)]) {
      await viola(() => base.query('insert into public.autores (nombre) values ($1)', [nombre]), 'ck_autor_nombre')
    }
    await base.query('insert into public.autores (nombre) values ($1)', ['Álvaro Mutis'])
  })
}

console.log(`\n${resultados.length} comprobaciones superadas.`)
