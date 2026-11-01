import LogoImg from './assest/Logo.png';
import Input from './Input';





export default function Home({ realizarBusqueda = () => {}, compacto = false, mover = () => {}, termino = '', historial = [] }) {

	function handleKeyDown(evento) {
		if (evento.key === "Enter") {
			realizarBusqueda(evento.target.value);
			evento.currentTarget.blur();
		}
	}

	return (
		<section id="vista-buscador" className={compacto ? 'compacto' : ''}>
			<img id="logo" src={LogoImg} alt="Logo de Booble" onClick={compacto && (() => mover('home'))} />
			<Input id="caja-busqueda" placeholder="Buscar en Booble..." onKeyDown={handleKeyDown} valor={termino} historial={historial} />
		</section>
	);
}