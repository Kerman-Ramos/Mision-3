// Exportamos la función para que el controlador pueda usarla
export async function buscarEnWikipedia(termino) {
    const terminoLimpio = termino.trim();

    if (!terminoLimpio) {
        throw new Error("Debes escribir algo para buscar.");
    }

    const url = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(terminoLimpio)}&format=json&origin=*`;

    const respuesta = await fetch(url);

    // Regla de excepción: Si Wikipedia devuelve un 404 o 500, forzamos el error
    if (!respuesta.ok) {
        throw new Error(`Fallo de conexión: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    // Devolvemos únicamente el array con los resultados brutos
	if (datos.error) throw new Error(datos.error.info);
	return datos.query?.search ?? [];
}