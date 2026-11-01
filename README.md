# M3 · Reactor Core — Booble

_«Todo es un componente.»_

Booble es un buscador con aspecto de navegador web. Esta versión reconstruye la aplicación de la misión anterior con **React 19**, separando la interfaz en componentes y haciendo que la vista responda al estado de la aplicación. Las búsquedas consultan la **API pública de Wikipedia en español** y se muestran en tarjetas.

> Proyecto de la unidad _React Core_ (Web Development I, the Client · U-tad).

## Qué hace

- **Buscador central:** permite introducir una frase y lanzar la búsqueda con `Enter`.
- **Barra del navegador:** acepta búsquedas o direcciones web. Las URL se abren en una pestaña nueva.
- **Historial:** permite retroceder y avanzar entre búsquedas, volver a Inicio y recargar una búsqueda.
- **Resultados:** muestra tarjetas con título y fragmento descriptivo; al hacer clic se abre el artículo correspondiente de Wikipedia.
- **Estados visibles:** contempla la carga, los errores y la ausencia de resultados.
- **Caché en `localStorage`:** guarda los resultados por término para evitar repetir peticiones. El botón ↺ elimina la entrada de caché de la búsqueda actual y vuelve a consultar la API.
- **Interfaz adaptable al estado:** al mostrar resultados, el buscador se compacta y permanece visible como cabecera.

## Cómo arrancarlo

Requisito: [Node.js](https://nodejs.org/) instalado.

Desde la carpeta del proyecto:

```bash
npm install        # instala las dependencias
npm run dev        # inicia el servidor de desarrollo
npm run build      # genera la versión de producción en /dist
npm run preview    # permite probar la versión de producción
```

## API utilizada

[API de Wikipedia (MediaWiki)](https://www.mediawiki.org/wiki/API:Search) · Se utiliza `action=query&list=search` para buscar páginas por término. No necesita clave y la petición incluye `origin=*` para permitir la consulta desde el navegador.

Ejemplo de petición:

```text
https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=gatos&format=json&origin=*
```

## Estructura

Componentes y utilidades principales:

```text
src/
├── App.jsx             COMPONENTE PRINCIPAL: vista e historial de navegación
├── Navegador.jsx       BARRA: entrada de búsqueda/URL y controles del historial
├── Home.jsx            INICIO: logo y buscador principal
├── Input.jsx           COMPONENTE REUTILIZABLE: campo de texto
├── Resultados.jsx      RESULTADOS: petición a Wikipedia, caché y tarjetas
├── funciones.js        UTILIDADES: detectar URL y generar claves de caché
├── index.css           ESTILOS
└── assest/             RECURSOS: logo e icono de Inicio
```

Las responsabilidades están repartidas y los componentes se comunican mediante `props`:

```text
App
 ├── Navegador ──► Input
 ├── Home ───────► Input
 └── Resultados ─► funciones.js
       ▲
       └── recibe el historial y la posición actual

Navegador ───────► funciones.js
```

`App` mantiene el estado compartido porque el historial y la vista afectan a más de un componente. `Home`, `Navegador` y `Resultados` reciben mediante `props` los datos y las funciones que necesitan, en lugar de mantener copias independientes del historial.

## Decisiones técnicas

| Requisito                          | Dónde y cómo                                                                                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Componentización**               | La interfaz se divide en `App`, `Navegador`, `Home`, `Input` y `Resultados`. `Input` se reutiliza en el buscador central y en la barra del navegador.                                                                               |
| **Props**                          | `App` pasa a los componentes las funciones de búsqueda y navegación, el historial, la posición actual y el estado compacto del buscador.                                                                                            |
| **`useState` y estado compartido** | `App` gestiona la vista, el historial y la posición dentro de él. El término actual se obtiene del historial y de su posición, evitando mantener otra copia del mismo dato. `Input` conserva el texto que el usuario está editando. |
| **`useEffect` en `Resultados`**    | Cuando cambia el historial o su posición, consulta primero la caché y, si hace falta, hace el `fetch` a Wikipedia. Las dependencias son `[historial, posicionHistorial]`.                                                           |
| **Cleanup del efecto**             | La función de limpieza marca la petición anterior como cancelada. Así se evita que una respuesta antigua actualice el estado después de cambiar de búsqueda o desmontar el componente.                                              |
| **`useEffect` en `Input`**         | Sincroniza el texto interno del campo con el valor recibido por `props`; depende de `valor`.                                                                                                                                        |
| **Listas y condicionales**         | Los resultados se dibujan con `map` y usan `pageid` como `key` estable. La vista muestra de forma condicional los estados de carga, error, lista vacía o resultados.                                                                |
| **Caché y robustez**               | `localStorage` conserva los resultados por término. La lectura y escritura de la caché se protegen frente a datos corruptos o almacenamiento no disponible; si falla la caché, la búsqueda puede continuar consultando la API.      |
| **Interacción original**           | La aplicación combina la experiencia de un buscador con controles de navegación de navegador, historial lineal, apertura de URL y buscador compacto en la vista de resultados.                                                      |
| **Bonus: custom hook**             | No se ha extraído un custom hook en esta versión. La lógica de efectos permanece en los componentes que la necesitan.                                                                                                               |

## Declaración de uso de IA

He utilizado **ChatGPT (OpenAI)** como apoyo durante el desarrollo y la migración de Booble a React.

**Qué hizo la IA**

- **Me guio en la componentización:** propuso separar la interfaz en componentes y explicó qué responsabilidad podía tener cada uno.
- **Me ayudó a gestionar el estado:** explicó cómo mantener el historial en `App`, compartirlo mediante `props` y derivar de él la búsqueda actual.
- **Me explicó los hooks:** revisó el uso de `useState` y `useEffect`, sus dependencias y la limpieza del efecto cuando cambia la búsqueda.
- **Me ayudó a revisar la lógica asíncrona:** caché con `localStorage`, petición `fetch` a Wikipedia, estados de carga y error, y prevención de actualizaciones de estado de peticiones anteriores.
- **Revisó el código frente a los requisitos de la misión** y explicó los cambios paso a paso para que pudiera entenderlos y decidir cuáles aplicar.

**Qué hice yo**

- La idea de Booble y la dirección visual de la aplicación, conservando el planteamiento de la misión anterior.
- La integración y adaptación de los componentes a mi proyecto.
- Las decisiones sobre el comportamiento del historial: navegación lineal, botones desactivados cuando no se puede avanzar o retroceder y regreso a Inicio sin crear una búsqueda nueva.
- La revisión de las propuestas, los cambios posteriores y las decisiones finales sobre el funcionamiento de la interfaz.

**Cómo lo verifiqué**

Antes de entregar, comprobar manualmente estos casos en el navegador y marcar los que se hayan probado:

- [ ] Una búsqueda normal desde el inicio y desde la barra del navegador.
- [ ] Una búsqueda vacía o formada solo por espacios.
- [ ] Retroceder, avanzar, volver a Inicio y comprobar que los botones se desactivan en los límites del historial.
- [ ] Recargar una búsqueda y comprobar que se vuelve a consultar Wikipedia sin usar la entrada de caché anterior.
- [ ] Repetir una búsqueda y comprobar el uso de la caché.
- [ ] Probar una URL y comprobar que se abre en una pestaña nueva.
- [ ] Probar un término sin resultados y una situación sin conexión para revisar los mensajes de estado.

## Autopsia

> Qué fue lo más difícil, por qué costó tanto y qué aprendí.

### El problema: coordinar el historial y la vista

Una de las partes más delicadas fue trasladar a React el comportamiento de navegador que ya tenía Booble. No bastaba con cambiar el contenido de la pantalla: la barra, la vista de inicio, los resultados y el historial tenían que mantenerse sincronizados.

### Por qué era difícil

El mismo historial controla varias interacciones. Una búsqueda nueva debe guardar el término y situar el índice al final; retroceder o avanzar debe cambiar la búsqueda visible; volver a Inicio debe mostrar el buscador sin añadir una entrada; y recargar debe repetir la petición sin reutilizar la caché.

En React, la interfaz se deriva del estado. Por eso fue importante decidir qué estado debía vivir en `App` y qué información podían recibir los componentes por `props`:

```text
Evento del usuario
      ↓
App actualiza historial / posición / vista
      ↓
React vuelve a renderizar
      ↓
Navegador, Home y Resultados reflejan el nuevo estado
```

### Cómo lo resolví

1. **Elevé el estado compartido a `App`:** así la barra y la pantalla principal trabajan con el mismo historial.
2. **Separé las responsabilidades:** `Navegador` gestiona los controles y la entrada; `Home` presenta el buscador; `Resultados` consulta y muestra los datos; `Input` se reutiliza en ambos campos.
3. **Conecté la consulta con `useEffect`:** el efecto depende de la búsqueda seleccionada, consulta la caché antes de hacer `fetch` y limpia la ejecución anterior cuando deja de ser válida.
4. **Revisé los estados de la interfaz:** carga, error, ausencia de resultados y lista de tarjetas.

### Qué haría distinto

Construiría y probaría cada parte por separado desde el principio: primero la navegación y el historial con datos de prueba; después el buscador y los componentes; y por último la conexión con Wikipedia y la caché. Así sería más fácil localizar en qué parte aparece un fallo.

### Una decisión que tomé yo

Decidí que el historial fuera **lineal y no circular**: cuando se llega a la primera búsqueda no se puede seguir retrocediendo, y cuando se llega a la última no se puede avanzar. Por eso los botones correspondientes se desactivan en los límites. También mantuve Inicio como una vista propia, no como una búsqueda nueva que se añade al historial.
