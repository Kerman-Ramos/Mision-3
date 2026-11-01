import CasaIcono from './assest/Casa_Icono.png';
import { esURL } from './funciones.js';
import Input from './Input';

export default function Navegador({ realizarBusqueda = () => {}, mover = () => {}, historial = [], posicionHistorial = 0 }) {

	function handleKeyDown(evento) {
		if (evento.key === "Escape") {
			evento.target.value = urlActual;
		}
		
		if (evento.key === "Enter") {
			const texto = evento.target.value.trim();
			if (!texto)
				return;

			if(esURL(texto)) {
				 const url = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;

				window.open(url, '_blank', 'noopener,noreferrer');
			}else {
				realizarBusqueda(texto);
				evento.currentTarget.blur();
			}
		}
	}
	
	const urlActual = historial[posicionHistorial] ? `https://es.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(historial[posicionHistorial])}&gsrlimit=10&prop=extracts&exintro=1&explaintext=1&exchars=600&format=json&origin=*` : '';
	return (
		<nav id="barra-navegador">
			<button id="retroceder" onClick={() => mover(-1)} disabled={posicionHistorial === 0}>←</button>
			<button id="avanzar" onClick={() => mover(1)} disabled={posicionHistorial - (historial.length - 1) >= 0}>→</button>
			<button id="reiniciar" onClick={() => mover(0)} disabled={posicionHistorial%historial.length === 0}>↺</button>
			<button id="casa" onClick={() => mover('home')} disabled={posicionHistorial%historial.length === 0}>
				<img src={CasaIcono} alt="Inicio" id="icono-casa" />
			</button>
			<Input id="entrada-url" placeholder="Busca o escribe una URL" onKeyDown={handleKeyDown} valor={urlActual} select={true} historial={historial} />
		</nav>
	)
}