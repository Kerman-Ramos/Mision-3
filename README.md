# M3 · Reactor Core — Booble

_«Todo es un componente.»_

Booble es un buscador con aspecto de navegador web. Esta versión reconstruye la aplicación de la misión anterior con **React 19**, dividiendo la interfaz en componentes reutilizables y haciendo que responda al estado de la aplicación. Las búsquedas consultan la **API pública de Wikipedia en español** y muestran los resultados en tarjetas con una descripción más extensa.

> Proyecto de la unidad _React Core_ (Web Development I, the Client · U-tad).

## Qué hace

- **Buscador principal:** permite escribir una frase y lanzar la búsqueda con `Enter`.
- **Barra del navegador:** acepta un término de búsqueda o una URL. Las direcciones web se abren en una pestaña nueva.
- **Historial:** permite retroceder y avanzar entre búsquedas, volver a Inicio y recargar los resultados actuales.
- **Inicio y navegación:** al pulsar Inicio desde una búsqueda, Atrás permite regresar a la búsqueda anterior.
- **Resultados:** muestra hasta diez páginas de Wikipedia, con título y extracto del artículo. Al hacer clic en una tarjeta se abre el artículo correspondiente.
- **Estados visibles:** muestra los estados de carga, error y ausencia de resultados.
- **Caché en `localStorage`:** guarda los resultados por término para evitar repetir peticiones. El botón ↺ elimina la entrada correspondiente a la búsqueda actual y vuelve a consultar la API.
- **Interfaz adaptable:** cuando se muestran resultados, el buscador principal se compacta y permanece visible como cabecera.

## Cómo arrancarlo

Requisito: [Node.js](https://nodejs.org/) instalado.

Desde la carpeta del proyecto:

```bash
npm install        # instala las dependencias
npm run dev        # inicia el servidor de desarrollo
npm run build      # genera la versión optimizada para producción
npm run preview    # sirve la versión de producción para probarla
```

Los comandos de desarrollo y compilación corresponden a los scripts habituales de Vite; comprueba que estén definidos en `package.json`.

## API utilizada

[API de Wikipedia (MediaWiki)](https://www.mediawiki.org/wiki/API:Search) · La búsqueda utiliza `action=query` junto con `generator=search`. Para cada página solicitada, `prop=extracts` obtiene el texto introductorio del artículo. La petición limita la búsqueda a diez resultados y solicita extractos de hasta 600 caracteres. No necesita clave y utiliza `origin=*` para permitir la consulta desde el navegador.

Ejemplo de petición:

```text
https://es.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=gatos&gsrlimit=10&prop=extracts&exintro=1&explaintext=1&exchars=600&format=json&origin=*
```

La respuesta contiene las páginas dentro de `query.pages`. El proyecto convierte ese objeto en un array con `Object.values()` para poder recorrerlo con `map()`.

## Estructura

Componentes y utilidades principales:

```text
src/
├── main.jsx             PUNTO DE ENTRADA: monta React y activa StrictMode
├── App.jsx              COMPONENTE PRINCIPAL: vista, historial y navegación
├── Navegador.jsx        BARRA: entrada de búsqueda/URL y controles
├── Home.jsx             INICIO: logo y buscador principal
├── Input.jsx            COMPONENTE REUTILIZABLE: campo de texto
├── Resultados.jsx       RESULTADOS: consulta a Wikipedia, caché y tarjetas
├── funciones.js         UTILIDADES: detectar URL y generar claves de caché
├── index.css            ESTILOS
└── assest/              RECURSOS: logo e icono de Inicio
```

La interfaz se reparte entre componentes y se comunica mediante `props`:

```text
App
 ├── Navegador ──► Input
 ├── Home ───────► Input
 └── Resultados ─► funciones.js

Navegador ───────► funciones.js
```

`App` mantiene el estado compartido porque el historial y la vista afectan a varios componentes. `Input` se reutiliza tanto en `Home` como en `Navegador`, mientras que `Resultados` se encarga de consultar y presentar los datos.

## Decisiones técnicas

| Requisito                            | Dónde y cómo                                                                                                                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Componentización**                 | La interfaz se divide en `App`, `Navegador`, `Home`, `Input` y `Resultados`. Cada componente tiene una responsabilidad concreta.                                                                                                                               |
| **Props**                            | `App` pasa funciones de búsqueda y navegación, historial, posición actual y datos necesarios para mostrar el término. `Input` recibe el valor inicial/actual, el placeholder y el evento de teclado.                                                           |
| **`useState`**                       | `App` mantiene la vista, el historial y la posición de navegación. `Input` mantiene el texto editable de cada campo. El término de búsqueda se obtiene del historial y de la posición, en lugar de guardarse una segunda vez en `App`.                         |
| **Historial**                        | El historial empieza con `['']`, que representa Inicio. Al pulsar Inicio desde una búsqueda, `App` conserva las entradas anteriores y coloca la posición en un paso lógico posterior al array. Así, Atrás vuelve a la búsqueda desde la que se llegó a Inicio. |
| **Recarga**                          | `refrescar()` elimina de `localStorage` la caché del término actual y crea una nueva copia del array de historial. El cambio de referencia vuelve a activar el efecto de `Resultados` y sincroniza los campos `Input` con los valores derivados del historial. |
| **`useEffect` en `Resultados`**      | Se ejecuta cuando cambia el historial o la posición actual. Primero busca los datos en `localStorage`; si no hay una entrada válida, consulta Wikipedia con `fetch`. Sus dependencias son `[historial, posicionHistorial]`.                                    |
| **Cleanup del efecto**               | La función de limpieza marca la ejecución anterior como cancelada. De este modo, una respuesta antigua no actualiza el estado si el usuario ya ha cambiado de búsqueda o el componente se ha desmontado. No aborta la petición de red.                         |
| **`useEffect` en `Input`**           | Sincroniza el texto editable con la prop `valor`. También depende de `historial`, que cambia de referencia al navegar o recargar, para restaurar el término correspondiente en el campo.                                                                       |
| **Listas y renderizado condicional** | Los resultados se generan con `map()` y utilizan `pageid` como `key` estable. `Resultados` muestra condicionalmente carga, error, lista vacía o tarjetas; `App` solo monta `Resultados` cuando la vista activa es la de resultados.                            |
| **Caché y robustez**                 | La caché utiliza una clave por término. La lectura, eliminación y escritura se protegen con `try/catch`, para que un almacenamiento bloqueado o lleno no impida consultar Wikipedia.                                                                           |
| **Detección de URL**                 | `esURL()` utiliza el constructor `URL` para comprobar si la entrada parece una dirección web antes de decidir si abrirla o realizar una búsqueda.                                                                                                              |
| **Bonus: custom hook**               | No se ha extraído un custom hook en esta versión. La lógica de efectos permanece en los componentes que la necesitan.                                                                                                                                          |

## Declaración de uso de IA

He utilizado **ChatGPT (OpenAI)** como apoyo durante la migración de Booble a React y durante la revisión del proyecto.

**Qué hizo la IA**

- **Me guio en la componentización:** propuso separar la interfaz en componentes y explicó cómo repartir sus responsabilidades.
- **Me ayudó a gestionar el estado:** explicó cómo mantener el historial en `App`, compartir datos mediante `props` y derivar el término actual a partir de la posición del historial.
- **Me explicó los hooks:** revisó el uso de `useState` y `useEffect`, sus dependencias y la función de limpieza de los efectos.
- **Me ayudó con la lógica de datos:** explicó la consulta a Wikipedia, el uso de `localStorage`, los estados de carga y error y la transformación de `query.pages` en un array.
- **Revisó el proyecto frente a los requisitos de la misión** y explicó los cambios paso a paso para que pudiera entenderlos y decidir cuáles aplicar.

**Qué hice yo**

- La idea de Booble y la dirección visual de la aplicación, conservando el planteamiento de la misión anterior.
- La integración y adaptación de los componentes a mi proyecto.
- Las decisiones sobre el comportamiento del historial, la barra de navegación, Inicio y la recarga.
- La revisión de las propuestas y la aplicación de los cambios que decidí incorporar.

**Cómo lo verifiqué**

Marcar los casos después de probarlos manualmente en el navegador:

- [ ] Buscar desde el buscador principal y desde la barra del navegador.
- [ ] Comprobar que una entrada vacía o formada solo por espacios no lanza una búsqueda.
- [ ] Retroceder y avanzar entre varias búsquedas.
- [ ] Pulsar Inicio desde una búsqueda y comprobar que Atrás vuelve a ella.
- [ ] Editar el término del buscador compacto y pulsar ↺; comprobar que se recupera el término del historial y se vuelve a consultar Wikipedia.
- [ ] Repetir una búsqueda y comprobar que se utilizan los datos guardados en caché.
- [ ] Introducir una URL y comprobar que se abre en una pestaña nueva.
- [ ] Probar una búsqueda sin resultados y una situación sin conexión para revisar los mensajes de estado.

## Autopsia

> Qué parte fue más delicada, por qué y qué aprendí.

### El reto: coordinar el historial, los campos de texto y los efectos

La parte más delicada fue conseguir que el comportamiento de navegador de Booble siguiera funcionando después de dividir la aplicación en componentes React. El historial controla la vista, la búsqueda que se muestra, la barra superior y la petición a Wikipedia. Un cambio en una de esas piezas tiene que reflejarse en las demás.

### Por qué era difícil

React vuelve a dibujar la interfaz a partir del estado. Por eso había que decidir qué información debía vivir en `App`, qué componentes debían recibirla por `props` y qué valores podían derivarse del historial. Además, los campos de texto son editables: el usuario puede cambiar lo que ve sin haber lanzado todavía una búsqueda. Al navegar o recargar, el campo debe recuperar el término asociado a la posición actual, no conservar el texto provisional.

```text
Acción del usuario
       ↓
App actualiza vista / historial / posición
       ↓
React vuelve a renderizar los componentes
       ↓
Home, Navegador y Resultados reflejan el estado
       ↓
useEffect consulta o recupera los resultados
```

### Cómo está resuelto

1. **Estado compartido en `App`:** el historial y la posición se mantienen en un único lugar para que `Home`, `Navegador` y `Resultados` trabajen con la misma información.
2. **Componentes reutilizables:** `Input` se utiliza en dos lugares con distintas props, sin duplicar el marcado del campo de texto.
3. **Búsqueda con `useEffect`:** `Resultados` consulta primero la caché y, si no encuentra datos, realiza la petición a Wikipedia.
4. **Sincronización de los campos:** `Input` actualiza su texto cuando cambia `valor` o cambia la referencia del historial. La recarga aprovecha ese cambio de referencia para restaurar el término actual.
5. **Limpieza del efecto:** la ejecución anterior deja de poder actualizar el estado cuando cambia la búsqueda o se desmonta `Resultados`.

### Qué mejoraría en una siguiente versión

Separaría la lógica de consulta y caché en un custom hook reutilizable, por ejemplo `useResultados`, y haría que `Input` recibiera `value` y `onChange` desde su componente padre para reducir la sincronización de estado interno. También mejoraría la gestión de los errores que pueda devolver la API dentro del JSON y la accesibilidad de los elementos que actúan como botones o enlaces.

### Una decisión de navegación

Mantuve un historial lineal, no circular. Inicio no se guarda como una búsqueda nueva: se representa mediante una posición lógica posterior a las búsquedas guardadas. Así, al pulsar Inicio desde los resultados, Atrás recupera la búsqueda anterior sin convertir Inicio en un término de búsqueda ni añadirlo como una entrada normal del array.
