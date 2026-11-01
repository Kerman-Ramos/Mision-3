import { useEffect, useState } from "react";

export default function Input({ id, placeholder = "Ingrese un texto", onKeyDown = () => {}, valor, select = false, historial = null }) {
	const [value, setValue] = useState('');
	
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setValue(valor || '');
	}, [valor, historial]);

	return (
		<input type="text" id={id} placeholder={placeholder} autoComplete="off" required
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onKeyDown={onKeyDown}
			onFocus={select && ((e) => e.target.select())}
		/>
	)
}