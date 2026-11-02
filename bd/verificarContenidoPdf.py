"""Coteja la transcripcion SQL con las paginas 3-14 del PDF original.

Uso: python bd/verificarContenidoPdf.py "ruta/al/documento.pdf"
Requiere pypdf. --generar actualiza solo el bloque de datos del SQL.
"""

import argparse
from decimal import Decimal
import json
from pathlib import Path
import re

from pypdf import PdfReader


def normalizarTexto(texto):
    return " ".join(texto.split())


def leerNumero(texto):
    coincidencia = re.match(r"([\d ]+(?:,\d+)?)", texto)
    if not coincidencia:
        raise ValueError(f"No se encontro la cifra: {texto}")
    return Decimal(coincidencia[1].replace(" ", "").replace(",", "."))


def serializarNumero(numero):
    return int(numero) if numero == numero.to_integral() else float(numero)


def leerFichasPdf(rutaPdf):
    lector = PdfReader(rutaPdf)
    fichas = []
    etiquetas = (
        "Diámetro medio", "Diámetro", "Distancia media al Sol", "Distancia orbital media",
        "Duración del día", "Duración del año", "Período de rotación", "Período orbital",
    )
    for pagina in range(3, 15):
        texto = lector.pages[pagina - 1].extract_text()
        identidad = re.search(
            r"Nombre:\s*(.+?)\s*\|\s*Tipo:\s*(.+?)\s*\|\s*Identificador propuesto:\s*(\w+)",
            texto,
        )
        if not identidad:
            raise ValueError(f"No se encontro la identidad en la pagina {pagina}")
        nombre, tipoPdf, slug = (normalizarTexto(v) for v in identidad.groups())
        satelite = tipoPdf == "Satélite natural"
        anfitrion = re.search(r"Planeta anfitrión:\s*(\S+)", texto)
        planetaSlug = None
        if anfitrion:
            planetaSlug = {"Tierra": "tierra", "Júpiter": "jupiter", "Saturno": "saturno", "Neptuno": "neptuno"}[anfitrion[1]]
        etiqueta = normalizarTexto(texto.split("Etiqueta superior propuesta en Metseri:", 1)[1].split("Descripción breve", 1)[0]).removesuffix(".")
        descripcion = normalizarTexto(texto.split("Descripción breve", 1)[1].split("Datos principales", 1)[0])
        datos = []
        bloqueDatos = texto.split("Datos principales", 1)[1].split("¿Sabías que...?", 1)[0]
        for linea in bloqueDatos.splitlines():
            linea = normalizarTexto(linea)
            for etiquetaDato in etiquetas:
                if linea.startswith(etiquetaDato + " "):
                    datos.append({"etiqueta": etiquetaDato, "valor": linea[len(etiquetaDato):].strip()})
                    break
        if len(datos) != 4:
            raise ValueError(f"Se esperaban cuatro datos en {slug}: {datos}")
        curiosidades = [normalizarTexto(v) for v in texto.split("¿Sabías que...?", 1)[1].split("Descubrir libros", 1)[0].split("•") if v.strip()]
        invitacion, respaldo = texto.split("Descubrir libros", 1)[1].split("Respaldo científico:", 1)
        duracionDia = leerNumero(datos[2]["valor"])
        duracionHoras = duracionDia * (24 if "días" in datos[2]["valor"] else 1)
        diaSolar = not satelite and "día solar" in datos[2]["valor"]
        orbita = leerNumero(datos[3]["valor"])
        if "años" in datos[3]["valor"]:
            orbita *= Decimal("365.25")
        fichas.append({
            "slug": slug, "nombre": nombre, "tipo": "satelite" if satelite else "planeta",
            "planeta_slug": planetaSlug, "clasificacion": etiqueta,
            "descripcion_breve": descripcion,
            "contenido_ficha": {
                "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
                "pagina_pdf": pagina, "tipo": tipoPdf,
                "datos_principales": datos,
                "descubrir_libros": normalizarTexto(invitacion),
                "respaldo_cientifico": normalizarTexto(respaldo),
            },
            "diametro_km": serializarNumero(leerNumero(datos[0]["valor"])),
            "distancia_sol_millones_km": None if satelite else serializarNumero(leerNumero(datos[1]["valor"])),
            "distancia_planeta_km": serializarNumero(leerNumero(datos[1]["valor"])) if satelite else None,
            "rotacion_horas": None if diaSolar else serializarNumero(duracionHoras),
            "dia_solar_horas": serializarNumero(duracionHoras) if diaSolar else None,
            "orbita_dias": serializarNumero(orbita),
            "curiosidades": curiosidades,
        })
    return fichas


def verificarContenido(rutaPdf, rutaSql, generar=False):
    fichas = leerFichasPdf(rutaPdf)
    sql = rutaSql.read_text(encoding="utf-8")
    patron = r"\$fichasPdf\$\s*(.*?)\s*\$fichasPdf\$"
    coincidencia = re.search(patron, sql, re.S)
    if not coincidencia:
        raise ValueError("No se encontro el bloque de fichas del SQL")
    if generar:
        contenido = json.dumps(fichas, ensure_ascii=False, indent=2)
        sql = sql[:coincidencia.start(1)] + contenido + sql[coincidencia.end(1):]
        rutaSql.write_text(sql, encoding="utf-8")
    guardadas = json.loads(re.search(patron, sql, re.S)[1])
    if guardadas != fichas:
        diferentes = [f["slug"] for f, g in zip(fichas, guardadas) if f != g]
        raise ValueError(f"La carga no coincide con el PDF: {diferentes}; filas {len(guardadas)}")
    if len(fichas) != 12 or len({f["slug"] for f in fichas}) != 12:
        raise ValueError("Se requieren los doce cuerpos distintos")
    for ficha in fichas:
        if not 30 <= len(ficha["descripcion_breve"].split()) <= 50 or len(ficha["curiosidades"]) != 2:
            raise ValueError(f"Estructura editorial incorrecta: {ficha['slug']}")
    print("PDF y SQL coinciden: 12 fichas, 48 datos, 24 curiosidades y 12 invitaciones a libros.")


if __name__ == "__main__":
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument("pdf", type=Path)
    argumentos.add_argument("--generar", action="store_true")
    opciones = argumentos.parse_args()
    verificarContenido(opciones.pdf, Path(__file__).with_name("corregirContenidoDesdePdf.sql"), opciones.generar)
