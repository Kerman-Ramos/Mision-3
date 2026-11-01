import Navegador from './Navegador.jsx';
import Home from './Home.jsx';
import { useState } from 'react';
import Resultados from './Resultados.jsx';
import { claveCache } from './funciones.js';


export default function App() {
	const [vista, setVista] = useState('home');
	const [historial, setHistorial] = useState(['']);
	const [posicionHistorial, setPosicionHistorial] = useState(0);

	function realizarBusqueda(texto) {
		const textoLimpio = texto.trim();

		if (!textoLimpio) return;

		const nuevoHistorial = historial.slice(0, posicionHistorial + 1);

		if (nuevoHistorial[nuevoHistorial.length - 1] !== textoLimpio) {
			nuevoHistorial.push(textoLimpio);
		}

		setHistorial(nuevoHistorial);
		setPosicionHistorial(nuevoHistorial.length - 1);
		setVista('resultados');
	}

	function mover(posicion) {
		if (typeof posicion === 'number') {
			if (posicion < 0) {
				retroceder();
			} else if (posicion > 0) {
				avanzar();
			} else {
				refrescar();
			}
		} else if (posicion === 'home') {
			casa();
		}
	}
	
	function retroceder() {
		if (posicionHistorial > 1) {
			const nuevaPosicion = posicionHistorial - 1;

			setPosicionHistorial(nuevaPosicion);
			setVista('resultados');
		} else if (posicionHistorial === 1) {
			setPosicionHistorial(0);
			setVista('home');
		}
	}

	function avanzar() {
		const nuevaPosicion = posicionHistorial + 1;

		setPosicionHistorial(nuevaPosicion);
		setVista('resultados');
	}

	function refrescar() {
		try {
			localStorage.removeItem(claveCache(historial[posicionHistorial]));
		} catch {
			// Si el almacenamiento falla, seguimos con la aplicación.
		}
		setHistorial([...historial]);
	}

	function casa() {
		setHistorial(historial.slice(0, posicionHistorial + 1));
		setPosicionHistorial(posicionHistorial + 1);
		setVista('home');
	}

	const esResultados = vista === 'resultados';

	return (
		<>
			<Navegador
				realizarBusqueda={realizarBusqueda}
				mover={mover}
				historial={historial}
				posicionHistorial={posicionHistorial}
			/>
			<main id="pantalla-principal" className={esResultados ? 'resultados' : 'home'}>
				<Home
					realizarBusqueda={realizarBusqueda}
					compacto={esResultados}
					mover={mover}
					termino={historial[posicionHistorial%historial.length]}
					historial={historial}
				/>
				{vista === 'resultados' && <Resultados historial={historial} posicionHistorial={posicionHistorial} />}
				
			</main>
		</>
	);
}

