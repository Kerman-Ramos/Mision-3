import { buscarEnWikipedia } from "./api.js";

/* ════════════════════════════════════════════════════════════
   MÓDULO DE BÚSQUEDA (no toca la página, solo datos)

   API pública (lo único que importa main.js):
     · obtenerResultados(termino, opciones)  → Promise<Array>
     · interpretarEntrada(texto)             → { tipo, ... } | null
     · urlDeArticulo(titulo)                 → string

   Todo lo demás es privado (no se exporta).
   ════════════════════════════════════════════════════════════ */

// ───────────── Caché (privado) ─────────────
// "v2" invalida entradas antiguas que guardaban HTML sin limpiar
const claveCache = (termino) => `booble_v2_${termino.toLowerCase()}`;

function leerCache(termino) {
	try {
		const guardada = localStorage.getItem(claveCache(termino));
		return guardada ? JSON.parse(guardada) : null;
	} catch {
		return null; // JSON corrupto o storage bloqueado: como si no hubiera caché
	}
}

function guardarCache(termino, resultados) {
	try {
		localStorage.setItem(claveCache(termino), JSON.stringify(resultados));
	} catch {
		// Storage lleno o bloqueado: la búsqueda funciona igual, solo sin caché
	}
}

// ───────────── Limpieza (privado) ─────────────
// Wikipedia devuelve snippets con etiquetas y entidades (&quot;).
// DOMParser las quita y decodifica sin ejecutar nada.
function textoPlano(html) {
	// Wikipedia envía: 'el <span class="searchmatch">gato</span> es un...'
	// Si lo mostraras tal cual, verías las etiquetas.
	//
	// DOMParser crea un documento HTML "virtual" (invisible, nunca se
	// inserta en tu página) a partir del texto.
	// .body.textContent extrae SOLO el texto, sin etiquetas, y además
	// convierte entidades como &quot; en ".
	return new DOMParser().parseFromString(html, "text/html").body.textContent;
}

// ¿Es una URL? Devuelve un objeto URL o null.
function DetectarURL(texto) {
	if (/\s/.test(texto)) return null; // una URL nunca lleva espacios

	// /^https?:\/\//i  significa:
	//   ^        al principio del texto
	//   http     literal
	//   s?       una "s" opcional
	//   :\/\/    "://" (las barras llevan \ para escaparlas)
	//   i        ignora mayúsculas
	//
	// Si ya empieza por http:// o https:// → se queda igual.
	// Si no → le ponemos "https://" delante, porque new URL() exige protocolo.
	const candidato = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
	try {
		const url = new URL(candidato);
		return url.hostname.includes(".") ? url : null; // "hola" no es dominio, "hola.com" sí
	} catch {
		return null; // new URL falló → no es URL
	}
}

// ───────────── API pública ─────────────

/**
 * Clasifica lo escrito en la barra del navegador.
 *   "wikipedia.org"  → { tipo: "url", url: URL }
 *   "gatos negros"   → { tipo: "busqueda", termino: "gatos negros" }
 *   "   "            → null
 */
export function interpretarEntrada(texto) {
	const limpio = texto.trim();
	if (!limpio) return null;

	const url = DetectarURL(limpio);
	// { tipo: "url", url }  es abreviatura de  { tipo: "url", url: url }
	return url ? { tipo: "url", url } : { tipo: "busqueda", termino: limpio };
}

/** Enlace público de un artículo a partir de su título. */
export function urlDeArticulo(titulo) {
	return `https://es.wikipedia.org/wiki/${encodeURIComponent(titulo.replaceAll(" ", "_"))}`;
}

/**
 * Pipeline completo: caché → red → limpieza → guardar.
 * Devuelve [{ titulo, resumen }]. Lanza Error si la red falla.
 */
export async function obtenerResultados(termino, { ignorarCache = false } = {}) {
	if (!ignorarCache) {
		const guardada = leerCache(termino);
		if (guardada) return guardada; // regla de eficiencia: caché → sin petición HTTP
	}

	const resultadosCrudos = await buscarEnWikipedia(termino);

	const resultadosLimpios = resultadosCrudos
		.map(({ title, snippet }) => ({
			titulo: title,
			resumen: textoPlano(snippet ?? ""),
		}))
		.filter(({ resumen }) => resumen.length > 10); // descarta fragmentos vacíos

	guardarCache(termino, resultadosLimpios);
	return resultadosLimpios;
}
