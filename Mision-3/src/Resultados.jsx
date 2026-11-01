import { useEffect, useState } from "react";
import { claveCache } from "./funciones.js";



export default function Resultados({ historial, posicionHistorial = 0 }) {
	const [resultados, setResultados] = useState([]);
	const [cargando, setCargando] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const busqueda = historial[posicionHistorial];
		if (!busqueda) return;

		let cancelado = false;

		async function buscarWikipedia() {
			setCargando(true);
			setError('');

			const clave = claveCache(busqueda);
			
			try {
                const resultado = localStorage.getItem(clave);

                if (resultado !== null) {
                    const resultadosGuardados = JSON.parse(resultado);

                    if (Array.isArray(resultadosGuardados)) {
                        if (!cancelado) {
                            setResultados(resultadosGuardados);
                            setCargando(false);
                        }

                        return;
                    }

                    localStorage.removeItem(clave);

                }
            } catch {
                try {
                    localStorage.removeItem(clave);
                } catch {
                    // Si el almacenamiento está bloqueado, seguimos igualmente.
                }
            }

			
			try {
				const parametros = new URLSearchParams({
					action: 'query',
					generator: 'search',
					gsrsearch: busqueda,
					gsrlimit: '10',
					prop: 'extracts',
					exintro: '1',
					explaintext: '1',
					exchars: '600',
					format: 'json',
					origin: '*',
				});

				const respuesta = await fetch(
					`https://es.wikipedia.org/w/api.php?${parametros}`
				);

				if (!respuesta.ok) {
					throw new Error('No se pudo consultar Wikipedia.');
				}

				const datos = await respuesta.json();
				const paginas  = datos?.query?.pages;

				const resultadosLimpios = paginas ? Object.values(paginas) : [];

				if (!Array.isArray(resultadosLimpios)) {
					throw new Error('La respuesta de Wikipedia no es válida.');
				}

				try {
					localStorage.setItem(clave, JSON.stringify(resultadosLimpios));
				} catch {
					// Storage lleno o bloqueado: la búsqueda funciona igual, solo sin caché
				}

				if (!cancelado) {
                    setResultados(resultadosLimpios);
                }
			} catch (error) {
				if (!cancelado) {
                    setError(error.message);
                }
			} finally {
				if (!cancelado) {
					setCargando(false);
				}
			}
		}

		
		buscarWikipedia();

		return () => {cancelado = true;};
	}, [historial, posicionHistorial]);

	if (cargando) return <p className="mensaje-espera">Buscando...</p>;
	if (error) return <p className="mensaje-error">{error}</p>;
	if (resultados.length === 0) return <p className="mensaje-vacio">No hay ningun resultado.</p>;

	return (
		<section id="vista-resultados">
			{resultados.map((resultado) => (
				<article className="tarjeta-resultado" key={resultado.pageid}
					onClick={() => {
						window.open(`https://es.wikipedia.org/?curid=${resultado.pageid}`, '_blank');
					}}
				>
					<h3>{resultado.title}</h3>
					<p>{resultado.extract || 'No hay descripción disponible.'}</p>
				</article>
			))}
		</section>
	);
}