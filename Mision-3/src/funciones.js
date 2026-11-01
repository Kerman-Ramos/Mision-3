export const claveCache = (termino) => `booble_v2_${termino.toLowerCase()}`;

export function esURL(texto) {
	if (/\s/.test(texto)) return false;

	const candidato = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;

	try {
		const url = new URL(candidato);
		return url.hostname.includes('.');
	} catch {
		return false;
	}
}