/* ════════════════════════════════════════════════════════════
   RENDER = pintado. Solo sabe dibujar en la pantalla.
   No conoce el historial, ni la caché, ni la red: recibe datos y los pinta.

   API pública (lo que usa main.js):
     · mostrarVista(vista)        → alterna inicio / resultados
     · mostrarCarga()             → pinta "Cargando resultados..."
     · mostrarError(mensaje)      → pinta el error en rojo
     · renderizarLista(lista)     → pinta las tarjetas (o el aviso de vacío)
     · vistaResultados            → el contenedor, para la delegación de clics
   ════════════════════════════════════════════════════════════ */

// ───────────── NODOS DEL PINTADO ─────────────
const vistaBuscador = document.querySelector("#vista-buscador");
export const vistaResultados = document.querySelector("#vista-resultados");

const textoEspera = document.createElement("p");
textoEspera.textContent = "Cargando resultados...";

// ───────────── PINTADO ─────────────
export function mostrarVista(vista) { // "buscador" | "resultados"
	const enResultados = vista === "resultados";
	vistaBuscador.style.display = enResultados ? "none" : "flex";
	vistaResultados.style.display = enResultados ? "block" : "none";
}

export function mostrarCarga() {
	vistaResultados.replaceChildren(textoEspera);
}

export function mostrarError(mensaje) {
	const errorP = document.createElement("p");
	errorP.className = "mensaje-error";
	errorP.textContent = `Error en la búsqueda: ${mensaje}`;
	vistaResultados.replaceChildren(errorP);
}

export function renderizarLista(lista) {
	if (lista.length === 0) {
		const vacioP = document.createElement("p");
		vacioP.textContent = "Booble no encontró ningún documento.";
		vistaResultados.replaceChildren(vacioP);
		return;
	}

	const fragmento = document.createDocumentFragment();

	lista.forEach((item) => {
		const article = document.createElement("article");
		article.className = "tarjeta-resultado";
		article.dataset.titulo = item.titulo;

		const h3 = document.createElement("h3");
		h3.textContent = item.titulo;

		const p = document.createElement("p");
		p.textContent = `${item.resumen}...`;

		article.append(h3, p);
		fragmento.appendChild(article);
	});

	vistaResultados.replaceChildren(fragmento);
}
