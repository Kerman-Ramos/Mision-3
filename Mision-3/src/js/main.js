import { obtenerResultados, interpretarEntrada, urlDeArticulo } from "./busqueda.js";
import { mostrarVista, mostrarCarga, mostrarError, renderizarLista, vistaResultados } from "./render.js";

/* ════════════════════════════════════════════════════════════
   MAIN = interfaz. Solo estado, controles y eventos.
   La lógica de búsqueda vive en busqueda.js (y la red en api.js).
   El pintado vive en render.js.

   1. Nodos del DOM (los controles; el pintado tiene los suyos en render.js)
   2. Estado (historial + posición + cargando)
   3. Pintado → ahora en render.js
   4. Núcleo: mostrar() pinta, navegarA() decide qué pintar
   5. Eventos
   ════════════════════════════════════════════════════════════ */

// ───────────── 1. NODOS ─────────────
const inputURL = document.querySelector("#entrada-url");
const inputBusqueda = document.querySelector("#caja-busqueda");

const botonRetroceder = document.querySelector("#retroceder");
const botonAvanzar = document.querySelector("#avanzar");
const botonReiniciar = document.querySelector("#reiniciar");
const botonCasa = document.querySelector("#casa");

// ───────────── 2. ESTADO ─────────────
// Historial = array de términos. "" significa "pantalla de inicio".
// `posicion` apunta a la entrada que se está viendo ahora mismo.
const historial = [""];
let posicion = 0;
let cargando = false;

const terminoActual = () => historial[posicion];

// Fuente única de verdad: cada control se activa según el estado
function actualizarControles() {
	inputBusqueda.disabled = cargando;
	inputURL.disabled = cargando;
	botonCasa.disabled = cargando;
	botonRetroceder.disabled = cargando || posicion === 0;
	botonAvanzar.disabled = cargando || posicion === historial.length - 1;
	botonReiniciar.disabled = cargando || terminoActual() === "";
	botonAvanzar.style.display = historial.length > 1 ? "inline-block" : "none";
}

// ───────────── 4. NÚCLEO ─────────────
// mostrar(): pinta lo que corresponde a un término. NO toca el historial.
async function mostrar(termino, { ignorarCache = false } = {}) {
	inputURL.value = termino;

	try {
		if (termino === "") {
			mostrarVista("buscador");
			inputBusqueda.value = "";
			return;
		}

		mostrarVista("resultados");
		cargando = true;
		actualizarControles();
		mostrarCarga();

		// Caché, red y limpieza ocurren dentro del módulo
		const resultados = await obtenerResultados(termino, { ignorarCache });
		renderizarLista(resultados);
	} catch (error) {
		mostrarError(error.message);
	} finally {
		cargando = false;
		actualizarControles();
		inputURL.focus();
	}
}

// navegarA(): crea una entrada NUEVA en el historial y la pinta.
function navegarA(termino) {
	if (termino === terminoActual()) {
		return mostrar(termino); // mismo destino: no duplicamos entrada
	}
	historial.splice(posicion + 1); // splice con UN argumento borra desde ese índice hasta el final.
	historial.push(termino);
	posicion = historial.length - 1;
	return mostrar(termino);
}

// moverHistorial(): recorre entradas YA existentes (atrás = -1, adelante = +1)
function moverHistorial(delta) {
	const destino = posicion + delta;
	if (destino < 0 || destino >= historial.length) return;
	posicion = destino;
	mostrar(terminoActual());
}

// ───────────── 5. EVENTOS ─────────────

// Buscador central: SOLO frases de texto
inputBusqueda.addEventListener("keydown", (evento) => {
	if (evento.key !== "Enter") return;
	const frase = inputBusqueda.value.trim();
	if (frase) navegarA(frase);
});

// Barra del navegador: URL o texto
inputURL.addEventListener("keydown", (evento) => {
	if (evento.key === "Escape") {
		inputURL.value = terminoActual(); // descarta lo escrito
		return;
	}
	if (evento.key !== "Enter") return;

	const entrada = interpretarEntrada(inputURL.value);
	if (!entrada) return;

	if (entrada.tipo === "url") {
		window.open(entrada.url.href, "_blank", "noopener");
		inputURL.value = terminoActual();
	} else {
		navegarA(entrada.termino);
	}
});

// Al hacer clic en la barra, selecciona todo el texto (como Chrome).
inputURL.addEventListener("focus", () => inputURL.select());

botonRetroceder.addEventListener("click", () => moverHistorial(-1));
botonAvanzar.addEventListener("click", () => moverHistorial(1));
botonReiniciar.addEventListener("click", () => mostrar(terminoActual(), { ignorarCache: true }));
botonCasa.addEventListener("click", () => moverHistorial(-posicion));

// Delegación: UN listener para todas las tarjetas (presentes y futuras)
vistaResultados.addEventListener("click", (evento) => {
	const tarjeta = evento.target.closest(".tarjeta-resultado");
	if (!tarjeta) return;
	window.open(urlDeArticulo(tarjeta.dataset.titulo), "_blank", "noopener");
});

document.addEventListener("dragstart", (evento) => {
    if (evento.target.tagName === "IMG") {
        evento.preventDefault();
    }
});

// Estado inicial
actualizarControles();
inputURL.focus();
