import type { ManualSection, ManualCategory } from './types';

export const categoriesES: ManualCategory[] = [
  { id: 'introducere', label: 'Primeros pasos', order: 1 },
  { id: 'calculatoare', label: 'Calculadoras 3D', order: 2 },
  { id: 'vanzari', label: 'Ventas', order: 3 },
  { id: 'productie', label: 'Producción', order: 4 },
  { id: 'operational', label: 'Operacional', order: 5 },
  { id: 'setari', label: 'Configuración', order: 6 },
];

export const sectionsES: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Bienvenido a iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'Pantalla de iSoftGlass — Información de la empresa',
    content: `# Bienvenido a iSoftGlass

iSoftGlass es la plataforma **SaaS** para fabricantes y distribuidores de vidrio. Cubre todo el flujo: configuración 3D → oferta → pedido → producción → entrega → servicio.

## Qué puedes hacer en 5 minutos

1. **Completa los datos de la empresa** en *Configuración → Empresa* (CUI, dirección, IBAN, logo).
2. **Verifica los precios** en *Configuración → Precios* — el catálogo estándar se carga automáticamente, solo ajusta lo que sea diferente.
3. **Añade tu primer cliente** en *Clientes → Nuevo cliente* (o deja que se cree automáticamente al guardar la primera oferta).
4. **Abre una calculadora 3D** desde el menú lateral (ej: *Mamparas de ducha*) y configúrala en 6 pasos.
5. **Guarda como oferta** — aparecerá en *Pedidos* con un PDF listo para enviar.
6. **Envía a producción** cuando el cliente confirme — el stock se descontará automáticamente.`,
    tips: [
      'La barra superior tiene un conmutador RON / EUR — los precios internos están siempre en RON, es solo una visualización.',
      'Haz clic en el icono 📖 (verde azulado) en cualquier momento para reabrir este manual exactamente en la sección actual.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Barra superior y accesos directos',
    content: `# Barra superior

En la esquina superior derecha tienes todos los comandos globales:

1. 🔔 **Campana amarilla (ámbar)** — anuncios y novedades publicados por el equipo de iSoftGlass. El número rojo = anuncios no leídos.
2. 📖 **Manual (contorno verde azulado)** — el manual que estás viendo ahora. Se abre en la sección relevante para la página actual.
3. **RON / EUR** — cambia la moneda mostrada en toda la aplicación. La conversión utiliza el tipo de cambio de *Configuración → Empresa*.
4. **🇪🇸 ES** — selector de idioma. Soportamos 9 idiomas (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Cerrar sesión** — desconexión segura de la cuenta.

## Barra lateral — menú izquierdo

- **Principal** — Panel, Calculadoras 3D, Configuración
- **Operacional** — Pedidos, Producción, Escáner, Clientes, Informes, Montaje
- Haz clic en el botón **⬅** junto al logo para colapsar la barra lateral (más espacio en pantalla).`,
    tips: [
      'El almacenamiento interno de los precios siempre es en RON — el cambio a EUR es solo de visualización.',
      'El cambio de idioma solo afecta a la interfaz; los datos introducidos permanecen en el idioma original.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: 'Los 6 pasos en una calculadora 3D',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Paso 6 - finalizar oferta con datos del cliente y botones PDF/Guardar/Añadir al carrito',
    content: `# Los 6 pasos en una calculadora 3D

Cualquier calculadora 3D (mampara de ducha, puerta, barandilla, espejo, frente de cocina, panel) sigue **el mismo flujo lineal de 6 pasos**. En cada paso, tienes a la derecha la visualización 3D que se actualiza en tiempo real, y el progreso se marca en la barra superior.

---

## Paso 1 — Tipo de producto

Eliges la forma o tipología (ej: **Esquina 90°**, **Walk-in / Nicho**, **Pentagonal**, **Panel para bañera**, **Panel fijo**). Cada tipo precarga la geometría base y la lista de perfiles adecuados.

![Paso 1 - selección de tipo de producto](/manual/calc-step1-tip.png)

## Paso 2 — Sistema de apertura

Eliges el modo de operación: **con bisagras** (clásico), **pivotante** superior-inferior (minimalista) o **corredero** sobre riel (ahorro de espacio). La selección aquí determina automáticamente qué accesorios podrás añadir en el Paso 5.

![Paso 2 - sistema de apertura](/manual/calc-step2-dimensiuni.png)

## Paso 3 — Vidrio

Estableces el **grosor** (6/8/10/12 mm), el **acabado** (transparente, gris, bronce, arenado) y opciones: **tratamiento antical**, **pulido de cantos**, **templado**, **laminado**. El precio del vidrio se recalcula al instante.

![Paso 3 - elección de vidrio](/manual/calc-step3-sticla.png)

## Paso 4 — Configuración de puerta y dimensiones

Estableces el **lado de apertura** (frontal / lateral), la **dirección** (interior / exterior), el **lado de la bisagra** (izquierda / derecha) y las **dimensiones** finales (ancho × alto × profundidad). Haz clic en cualquier cota de la escena 3D para una edición rápida (Enter / Tab guarda).

![Paso 4 - puerta y dimensiones](/manual/calc-step4-profile.png)

## Paso 5 — Perfiles y accesorios

Eliges de listas personalizadas: **perfiles de junta**, **perfiles en U / perimetrales**, **barras estabilizadoras**, **kits extra**. Para los detalles completos sobre cómo funciona este paso, consulta la sección **«Cómo funcionan los accesorios en las calculadoras»**.

![Paso 5 - perfiles y accesorios](/manual/calc-step5-accesorii.png)

---

## Paso 6 — Finalizar oferta (detallado)

Aquí transformas la configuración en una acción comercial. El Paso 6 tiene 3 zonas claras: **datos del cliente**, **importe adicional y total**, **botones de acción**.

![Paso 6 - finalización](/manual/calc-step6-finalizare.png)

### Datos del cliente (Client info)

- **Tipo de Cliente** — Particular / Empresa / Distribuidor. **Muy importante**: el tipo elegido aquí aplica automáticamente el margen configurado en **Configuración → Margen por Cliente**, por lo que el precio mostrado ya tiene en cuenta el margen por tipo.
- **Nombre del cliente** — el nombre que aparece en la oferta y en el PDF.
- **Teléfono** & **Email** — datos de contacto utilizados en el CRM y para enviar la oferta.

> Al guardar, si el nombre del cliente no existe en la base de datos del CRM, el sistema **crea automáticamente una nueva ficha**. Si existe, utiliza la existente (coincidencia por nombre).

### Importe adicional (Extra amount)

El campo **«Extra amount» / «Importe adicional»** te permite añadir un importe libre sobre el subtotal calculado. Para qué sirve en la práctica:

- **Transporte** al cliente (ej: +150 RON por entrega).
- **Montaje adicional** más allá del paquete estándar.
- **Mano de obra especial** (ej: perforación en granito, piezas no estándar).
- **Recargo por urgencia** cuando el trabajo debe realizarse con prioridad.
- **Descuento comercial** — introduces un valor **negativo** (ej: -50 RON) y se resta del total.

El importe se suma al subtotal **antes** del IVA y aparece por separado en el PDF, de forma transparente para el cliente.

### Subtotal, IVA y total

La tarjeta muestra en tiempo real: **Subtotal (sin IVA)**, **IVA %** (de la configuración) y **Total con IVA**. La modificación de cualquier parámetro (vidrio, accesorio, importe adicional) recalcula todo al instante.

### Los 3 botones de acción

1. **Descargar PDF** — genera la oferta en PDF (logo de la empresa, datos del cliente, lista de productos con instantánea 3D de 70×47 px, accesorios agregados por código, mano de obra, total con IVA). **Se usa para** enviar rápidamente por correo electrónico / WhatsApp, **sin** guardar en el sistema. Útil cuando solo quieres una cotización orientativa.

2. **Guardar oferta** — crea en la base de datos una oferta con el número **OFR-YYYYMMDD-HHMMSS** y un **pedido con estado «Oferta»**. **Se usa cuando** la oferta es firme y quieres encontrarla más tarde en **Pedidos**, volver a editarla o convertirla en un trabajo.

3. **Añadir al carrito** — añade el producto actual al **carrito activo** (icono inferior derecho con contador) **sin** cerrar el pedido. **Se usa para** ofertas con múltiples productos: ej. ducha + espejo + frente de cocina para el mismo cliente — los añades uno por uno y luego finalizas todo el carrito como un solo pedido.

---

## Qué sucede después de «Añadir al carrito»

![El carrito con los productos añadidos](/manual/cos-flow.png)

### 1. El carrito (icono inferior derecho)

Haz clic en el icono del carrito con el contador y se abrirá el panel lateral **Order Products**:

- Lista todos los productos añadidos, cada uno con sus **dimensiones**, **grosor del vidrio** y **precio**.
- Botones **+ / -** para la cantidad de cada artículo.
- El icono de la **papelera** roja elimina el artículo.
- El botón **«Empty» / «Vaciar»** elimina todo el carrito.
- Abajo: **Order total** (la suma de todos los productos).

### 2. Finalizar el pedido

Pulsas **«Finalize» / «Finalizar»** y se abre el cuadro de diálogo **Create order from cart**:

![Diálogo para finalizar el pedido](/manual/cos-finalizare.png)

- **Cart products** — resumen de los productos del carrito con el total.
- **Client** — datos del cliente (tomados automáticamente del último producto añadido).
- **Delivery Address** — dirección de entrega / montaje.
- **Delivery Date** — plazo estimado.
- **Notes** — observaciones internas.

Pulsas **Create Order**: el sistema genera un número de pedido único y lo coloca en la **Gestión de Pedidos** con el estado **«Oferta»**.

### 3. En Gestión de Pedidos

El pedido aparece inmediatamente en la lista. Desde aquí:

- **Descargas el PDF** consolidado (todos los productos agregados, los accesorios sumados por código).
- **Envías a producción** — descuenta automáticamente el stock, crea la ficha de producción y la tarjeta Kanban.
- **Emites una factura** o una **proforma (anticipo)**.
- **Programas el montaje** para el equipo de instalación.
- **Abres el pedido** (haciendo clic en la fila) para ver las pestañas **Detalles / Productos / Historial / Vista previa**.

### 4. Edición posterior

Desde la pestaña **Productos** de un pedido, el botón **Editar** te lleva de vuelta a la calculadora original con **toda la configuración restaurada** desde \`full_config\` — incluyendo tipo de cliente, importe adicional, accesorios. Modificas → Guardas → el pedido se actualiza automáticamente.`,
    tips: [
      'En el Paso 6, cambiar el **Tipo de Cliente** entre Particular / Empresa / Distribuidor recalcula al instante todo el subtotal con el margen correcto.',
      'Usa **Descargar PDF** para cotizaciones rápidas por correo electrónico, y **Guardar oferta** solo cuando la oferta sea firme — así evitas llenar el historial de borradores.',
      'El carrito te permite configurar múltiples productos para el mismo cliente y enviarlos en un **único pedido** con un solo PDF agregado.',
      'Toda la configuración (incluido el importe adicional y el tipo de cliente) se guarda en `full_config` — al reabrir, todo vuelve a estar exactamente como estaba.',
    ],
    warnings: [
      'El importe adicional negativo (descuento) NO verifica que el total no baje de cero — ten cuidado con el valor.',
      'Si cambias los precios en Configuración **después** de haber guardado una oferta, las ofertas antiguas **no** se recalcularán automáticamente — conservan sus valores iniciales.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Cómo funcionan los accesorios en las calculadoras',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Catálogo de accesorios — botón Importar a mi lista',
    content: `# Cómo funcionan los accesorios en las calculadoras

Todas las calculadoras 3D (Mamparas de ducha, Puertas, Barandillas, Espejos, Frentes de cocina, Paredes divisorias) utilizan **el mismo sistema** para los accesorios: bisagras, tiradores, perfiles en U, barras estabilizadoras, kits de corredera, topes, cerraduras, etc.

La lógica es simple y se realiza **una sola vez**:

> **Importas desde el catálogo → se guarda en «Seleccionar producto» → los usas en cualquier lugar, en cualquier oferta.**

No tienes que buscar el accesorio de nuevo en cada trabajo — una vez importado, permanece en tu lista personal hasta que decidas eliminarlo.

---

## Paso 1 — Abrir el catálogo de accesorios

Ve a **Configuración → Precios → Accesorios** (o directamente **Configuración → Catálogo de accesorios**, según la versión de la interfaz).

Aquí ves el catálogo global del sistema — miles de códigos agrupados por categorías: bisagras, tiradores, perfiles en U, kits de corredera, juntas, barras estabilizadoras, topes, cerraduras, soportes, tapas.

![Catálogo de accesorios](/manual/accesorii-import.png)

- Utiliza la **búsqueda transversal** (arriba) — busca por código, nombre o acabado, en todas las categorías.
- Los filtros laterales restringen por categoría / subcategoría.

## Paso 2 — Importa los accesorios que necesites

En la fila de cada accesorio del catálogo tienes un botón **«Importar»** (o «Añadir a mi lista»). Haz clic en él — el accesorio entra inmediatamente en tu **lista personal**, aislada por empresa (RLS estricto).

Marca varias filas y pulsa **«Importar selección»** para añadir un grupo entero (ej: todo el juego de bisagras para mamparas de ducha).

> **Haces esto una sola vez.** Después de la importación, el accesorio está disponible para todos los usuarios de la empresa, en todas las calculadoras.

## Paso 3 — Verifica los precios y las unidades

En tu lista local, cada accesorio muestra:

- **Código** y **nombre** (tomados del catálogo).
- **Precio** (puedes hacer un override propio — no afecta al catálogo global).
- **Unidad** (pza, ml, set) — también admite valores decimales para ml.
- **Acabado** disponible (cromo, mate, cepillado, etc.).

Modifica el precio directamente en la celda — se guarda automáticamente y aparece inmediatamente en las calculadoras.

## Paso 4 — En la calculadora, abre «Seleccionar producto»

Entras en una calculadora (ej: **Mamparas de ducha**), llegas al paso de **Accesorios** (bisagras, tirador, perfil en U, barra, etc.).

Para cada espacio, el menú desplegable **«Seleccionar producto»** muestra **solo los accesorios que has importado** — restringido al tipo adecuado (ej: en el espacio del Tirador solo ves tiradores).

![Menú desplegable «Seleccionar producto» en la calculadora](/manual/accesorii-selecteaza-produs.png)

- La lista está limpia: no te confundes con miles de códigos irrelevantes.
- Búsqueda rápida en el menú desplegable por código o nombre.

## Paso 5 — Ajusta la cantidad y el acabado

Después de elegir el accesorio:

- **Cantidad** — para las bisagras puedes elegir 2 o 3 (tu elección es autoritaria, anula la regla automática).
- **Acabado** — color/acabado de las variantes disponibles (con fallback al padre si la variante exacta falta).
- **Posición** — las bisagras se miden de arriba hacia abajo, el tirador de abajo hacia arriba (convención de la industria, ya preconfigurada).

## Paso 6 — Guarda la configuración → los accesorios se añaden a la oferta

Presiona **«Guardar como oferta»** o **«Añadir al carrito»**. Los accesorios seleccionados:

1. Se adjuntan al producto con su precio en RON (visualización convertible a EUR).
2. Aparecen en **OrderPreview** y en el PDF de la oferta, agregados automáticamente por código (mismo código = suma de cantidades).
3. Se guardan en el JSON \`full_config\` — la fuente de verdad para el PDF, DXF y la edición posterior.
4. Al enviar a producción, **el stock se reduce automáticamente** según las cantidades de la oferta.

![Accesorio añadido en la oferta](/manual/accesorii-in-oferta.png)`,
    tips: [
      'Importas una sola vez — luego los accesorios permanecen en «Seleccionar producto» para todos los compañeros de la empresa.',
      'Los precios pueden ser sobrescritos localmente (override por empresa) sin afectar el catálogo del sistema.',
      'Utilizas el mismo flujo en TODAS las calculadoras: ducha, puertas, barandilla, espejo, frente de cocina, paredes.',
    ],
    warnings: [
      'Si eliminas un accesorio de tu lista personal, las ofertas antiguas siguen siendo válidas (la configuración está guardada en `full_config`), pero ya no podrás seleccionarlo en trabajos nuevos hasta que lo vuelvas a importar.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Calculadora de Mampara de Ducha',
    image: '/manual/calc-dus.png',
    imageAlt: 'Configurador 3D de mampara de ducha',
    content: `# Calculadora de Mampara de Ducha

Configura visualmente en 3D cualquier tipo de mampara: esquina 90°, walk-in, pentagonal, panel para bañera, panel fijo.

## Los 6 pasos

1. **Tipo de mampara** — eliges la forma (esquina 90°, nicho, pentagonal, panel para bañera, fijo).
2. **Dimensiones** — haz clic en la cota de la escena 3D para editarla (Enter / Tab guarda).
3. **Vidrio** — grosor (8/10/12 mm), acabado (claro, gris, bronce), templado opcional.
4. **Perfiles** — en U, de pared, de esquina 90°, kit de corredera (cuando corresponda).
5. **Accesorios** — bisagras (2 o 3), tirador, barra estabilizadora, juntas.
6. **Guardar** — como oferta o directamente como un nuevo trabajo.`,
    tips: [
      'Las bisagras se miden de **arriba hacia abajo**, y el tirador de **abajo hacia arriba** — es la convención de la industria.',
      'El panel fijo NO tiene una deducción implícita de 10 mm — solo la suma de los perfiles y las juntas.',
      'El sistema corredero no requiere bisagras y calcula automáticamente el solapamiento del kit.',
    ],
    warnings: [
      'En la esquina de 90°, los perfiles en U se fuerzan a estar ocultos en la intersección para evitar la duplicación.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Calculadora de Puertas de Vidrio',
    image: '/manual/calc-usa.png',
    imageAlt: 'Configurador 3D de puerta de vidrio',
    content: `# Calculadora de Puertas

Para puertas interiores con bisagras, pivotantes o correderas sobre riel.

## Pasos

1. **Sistema** — Con bisagras, Pivotante superior-inferior, Corredera sobre riel.
2. **Dimensiones** — ancho, alto, hueco de la puerta.
3. **Vidrio** — grosor y acabado.
4. **Juntas laterales** — array \`lateralSelections\` con opciones separadas para izquierda/derecha/arriba/abajo.
5. **Recortes** — para tirador o cerradura (umbral >50 mm = grande, ≤50 mm = pequeño).
6. **Accesorios** — bisagras, tirador, tope, cerradura.`,
    tips: [
      'El pivote se calcula automáticamente en función del peso del vidrio.',
      'En el sistema corredero, el riel y la guía están incluidos en el kit — no los añadas por separado.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Calculadora de Barandillas',
    image: '/manual/calc-balustrada.png',
    imageAlt: 'Configurador 3D de barandilla',
    content: `# Calculadora de Barandillas

Configuración de barandillas de vidrio: interior, exterior (laminado obligatorio), escaleras (paneles inclinados).

## Pasos

1. **Tipo** — Interior, Exterior, Escaleras.
2. **Longitud total** y **altura** — en mm.
3. **Vidrio** — laminado 8+8, 10+10 o templado simple (solo interior).
4. **Fijación** — perfil en U continuo, clips puntuales, balaustres.
5. **Pasamanos** — opcional (madera, acero inoxidable, aluminio).
6. **Tapas** — para el perfil en U.`,
    warnings: [
      'Para exteriores, el vidrio DEBE ser laminado — es una norma de seguridad obligatoria.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Calculadora de Espejos',
    image: '/manual/calc-oglinda.png',
    imageAlt: 'Configurador 3D de espejo',
    content: `# Calculadora de Espejos

Para espejos simples o con mecanizados especiales.

## Pasos

1. **Forma** — Rectángulo, Cuadrado, Círculo, Óvalo, Personalizada.
2. **Dimensiones** — en mm; para forma personalizada, dibujas en el editor CAD.
3. **Tipo de espejo** — plateado estándar, envejecido, ahumado, bronce.
4. **Canto** — pulido, biselado, esmerilado.
5. **Recortes** — para interruptores, enchufes, soportes.
6. **Iluminación LED** — opcional, perimetral o trasera.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Calculadora de Frentes de Cocina',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: 'Configurador 3D de frente de cocina',
    content: `# Calculadora de Frentes de Cocina

Frentes de mobiliario de vidrio lacado, impresión digital o arenado mate.

## Pasos

1. **Acabado** — Lacado RAL, Impresión digital, Arenado mate.
2. **Dimensiones** — ancho × alto por frente; se multiplica por el número de frentes.
3. **Color / Impresión** — seleccionas RAL o cargas el archivo de impresión.
4. **Recortes** — para tiradores o push-to-open.
5. **Sistema de fijación** — adhesivo sobre MDF, tornillos traseros, perfil de aluminio.
6. **Guardar** — agregación automática para cocinas enteras.`,
    tips: [
      'Para la impresión digital, la resolución mínima recomendada es de 150 dpi al tamaño final.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Paneles y Paredes Divisorias',
    image: '/manual/calc-panouri.png',
    imageAlt: 'Configurador 3D de panel y pared divisoria',
    content: `# Paneles y Paredes Divisorias

Dos submódulos:

- **Panel simple** — vidrio sin mecanizados (vidrio a medida).
- **Pared divisoria** — cuadrícula configurable con puertas integradas.

## Paredes divisorias — pasos clave

1. **Cuadrícula** — defines cuántas columnas × filas; redimensionas arrastrando con enclavamiento (la suma del ancho se mantiene constante).
2. **Perfiles perimetrales** — superior, inferior, lateral; se interrumpen automáticamente donde hay puertas.
3. **Perfiles interiores** — verticales y horizontales; \`usableWidth/Height\` aseguran que los paneles encajen.
4. **Puertas integradas** — en cualquier celda; se deducen automáticamente del perfil perimetral.
5. **Paneles laterales a 90°** — la altura se sincroniza con la de la puerta.
6. **Vidrio y acabados** — por celda o globalmente.`,
    warnings: [
      'Al redimensionar una columna, las adyacentes se ajustan automáticamente para mantener el ancho total.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Gestión de Pedidos',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Lista de pedidos con estados',
    content: `# Pedidos

Todas las ofertas y pedidos, con filtros rápidos por estado: Oferta → Confirmado → En producción → Finalizado → Entregado → Cancelado.

## Acciones rápidas en la fila del pedido

1. **Cambiar estado** — botones de colores directamente en la fila (Confirmar, Finalizar, Entregar).
2. **Enviar a producción** — descuenta automáticamente el stock y crea la ficha de producción.
3. **Generar DXF** — para CNC, en cada panel.
4. **Editar** — reabre la oferta en la calculadora original (todos los datos restaurados).
5. **Eliminar** — solo si aún no está en producción.

## Abrir un pedido en detalle

Haz clic en el número de pedido (o en su fila) de la **Lista de Pedidos** y se abrirá un cuadro con el encabezado del pedido (n.º, estado, botón **Descargar PDF**) y 4 pestañas:

![Cuadro de pedido abierto](/manual/comenzi-detalii.png)

### 1. Detalles
Datos del cliente, fecha de creación, subtotal, IVA, total. Aquí verificas rápidamente los datos comerciales y tienes los botones para **Programar montaje**, **Emitir factura** y **Proforma (anticipo)**.

### 2. Productos
Lista de productos configurados, con cantidad, precio unitario e importe adicional (si existe). El botón **Editar** en cada producto te lleva de vuelta a la calculadora para ajustes.

![Pestaña Productos](/manual/comenzi-produse.png)

### 3. Historial
Registro de cambios: cambios de estado, ediciones, pagos, generación de documentos. Útil para la trazabilidad y auditoría — ves quién y cuándo hizo cada modificación.

![Pestaña Historial](/manual/comenzi-istoric.png)

### 4. Vista previa
Renderizado detallado de la oferta tal como aparece en el **PDF enviado al cliente**: para cada producto ves el tipo de configuración, dimensiones y superficie de vidrio, los mecanizados aplicados, la lista de accesorios con código y precio unitario, la mano de obra y el total. **Se usa para la verificación final** antes de enviar la oferta al cliente o el pedido a producción — confirmas que los precios de los productos, accesorios y mano de obra son correctos.

![Pestaña Vista previa](/manual/comenzi-previzualizare.png)

## Las tarjetas superiores

Resumen instantáneo: total de pedidos, valor en RON, distribución por estados.`,
    tips: [
      'La configuración completa (`full_config`) se mantiene intacta desde el carrito hasta el pedido — no se pierden datos.',
      'Los accesorios idénticos se agregan automáticamente en el PDF final (suma de cantidades, código único).',
      'La pestaña Vista previa siempre refleja los valores actuales — si cambias un precio en Configuración, se actualiza aquí.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Facturación',
    image: '/manual/facturare.png',
    imageAlt: 'Módulo de facturación con KPIs y gráficos',
    content: `# Facturación

Emisión de facturas desde pedidos confirmados, con series personalizadas y exportación e-Factura (CIUS-RO y FatturaPA para IT).

## Pasos

1. **Configura las series** en *Configuración → Facturación → Series* (prefijo, año, contador).
2. **Genera la factura** desde el pedido: botón **€** en la fila del pedido.
3. **Edita las líneas** — añade/elimina, ajusta precios, IVA por línea.
4. **Emite** — número asignado automáticamente, el estado cambia a "Emitida".
5. **Registra el pago** — diálogo de pago parcial o total.
6. **Exporta XML** — para ANAF (RO) o SDI (IT).

## KPI

Tarjetas superiores: facturado, cobrado, pendiente, anulado.`,
    warnings: [
      'Una factura emitida no se puede eliminar — solo se puede anular con un motivo y reemplazarla con un abono.',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Clientes y CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'Lista de clientes del CRM con tipos',
    content: `# Clientes

La base de datos completa de clientes: particulares, empresas, distribuidores.

## Pasos

1. **Añade un cliente** — botón "Nuevo cliente" o automáticamente al guardar una oferta para un email nuevo.
2. **Tipo de cliente** — Particular / Empresa / Distribuidor (con descuento global).
3. **Datos de contacto** — teléfono, email, dirección, CUI (si es una empresa).
4. **Pipeline del CRM** (admin) — leads, etapas, conversiones.
5. **Historial** — todas las ofertas y pedidos del cliente en un solo lugar.
6. **Margen específico** — en *Configuración → Margen por Cliente* estableces un margen diferente para cada tipo.

## Los filtros superiores

Búsqueda por nombre/email, filtro por tipo de cliente.`,
    tips: [
      'Los clientes se crean automáticamente desde las calculadoras 3D al guardar la primera oferta con un email nuevo.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Flujo de Producción Kanban',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Tablero Kanban con columnas de Corte, Procesamiento, Templado',
    content: `# Producción Kanban

El flujo visual por etapas: **Corte → Procesamiento → Templado → Recubrimiento/Impresión → Ensamblaje → Listo para entrega**.

## Pasos diarios

1. **Verifica los KPIs** superiores: total activos, en proceso, en espera, listos para entrega.
2. **Arrastra y suelta** una tarjeta entre columnas para avanzar manualmente.
3. **Haz clic en una tarjeta** — abre la ficha de producción con dibujos técnicos, materiales y accesorios.
4. **Asignación de operario** — pre-planificado en *Pedidos → Planificación de operario*; se guarda en \`operator_name\` para trazabilidad.
5. **Vista de Calendario** — pestaña alternativa para la planificación por fecha.

## Etiquetas con código de barras

Desde la ficha de cada orden de producción (y desde la página **Escáner**) tienes el botón **«Imprimir Etiqueta»**:

- El código de barras es **CODE128**, generado automáticamente a partir del número de ficha (con la librería JsBarcode).
- La etiqueta contiene: **n.º de ficha**, **n.º de pedido**, **cliente**, **fecha de entrega** y la **etapa actual**.
- Se abre directamente el diálogo de impresión del navegador — puedes usar impresoras normales A4 o impresoras de etiquetas dedicadas (Zebra, Brother, etc.).
- Pegas la etiqueta en el vidrio / marco / paquete y la reutilizas en cada etapa del flujo.

## Escaneo en el taller

La página **Producción → Escáner** está optimizada para el ritmo del taller:

1. **Auto-foco** en el campo de escaneo — no necesitas hacer clic antes de cada escaneo.
2. **Lectores HID** — cualquier escáner USB tipo «teclado» funciona plug-and-play (no requiere drivers).
3. **Escaneas el código** de la etiqueta → el pedido **avanza automáticamente** a la siguiente etapa del flujo.
4. **Confirmación visual** instantánea: la tarjeta muestra el nuevo estado y el Kanban se actualiza.

Así, los operarios no pierden tiempo arrastrando y soltando manualmente y no hay errores como «olvidé marcar que he terminado».

## Seguimiento en tiempo real

El tablero Kanban se **actualiza automáticamente** en segundo plano:

- Los escaneos hechos en el taller aparecen **inmediatamente** en las pantallas de la oficina — sin recargar manualmente.
- Los KPIs superiores (activos, en proceso, listos para entrega) se recalculan en vivo.
- Varios operarios pueden trabajar simultáneamente en diferentes etapas sin interferir entre sí.
- El gerente ve en cualquier momento **dónde está cada pedido** y **quién está trabajando en él**.

## Fecha estimada de entrega

Se calcula automáticamente cuando un pedido entra en producción, en función de la carga de trabajo de las columnas.`,
    tips: [
      'Imprime la etiqueta con el código de barras justo después de que el pedido entre en producción y pégala en el paquete — se convierte en la fuente de verdad para todo el flujo.',
      'Deja la página del Escáner abierta en una tableta/portátil en el taller; el auto-foco asegura que cualquier escaneo se capture aunque no haya nadie en el teclado.',
      'Para un flujo 24/7, abre el Kanban en una TV grande — verás el progreso en tiempo real sin tocar nada.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Stock e Inventario',
    image: '/manual/stoc.png',
    imageAlt: 'Módulo de inventario con listas de materiales',
    content: `# Stock

Gestión de materiales: vidrio, accesorios (hardware), consumibles. Descuento automático al entrar en producción.

## Pasos

1. **Añade material** — botón "Nuevo material" (código, tipo, precio, stock mínimo).
2. **Ajusta el stock** — botón por fila para entradas/salidas manuales.
3. **Movimientos de stock** — pestaña con el historial de transacciones (entradas, salidas, motivo).
4. **Informe de consumo mensual** — botón superior, exportación a CSV/Excel.
5. **Alertas de stock mínimo** — KPI rojo "Min. Stock" en la tarjeta superior.
6. **Ubicación** — opcional, para múltiples almacenes.

## Descuento automático

Cuando un pedido cambia al estado **"En producción"**, el stock se reduce automáticamente según la lista de materiales de cada producto.`,
    warnings: [
      'Se permite el stock negativo pero se marca en rojo — el gestor debe hacer un inventario físico y un ajuste.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Optimización de Corte',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Módulo de optimización de corte con selección de hojas',
    content: `# Optimización de Corte

Algoritmo de anidamiento de guillotina para hasta 50 pedidos simultáneamente — minimiza el desperdicio de vidrio.

## Pasos

1. **Tipo de hoja** — seleccionas del catálogo (ej: 3210×2250 mm).
2. **Grosor de la cuchilla** — por defecto 3 mm, ajustable.
3. **Selecciona pedidos** — de la lista con búsqueda y filtro de estado (puedes "Seleccionar todo 26").
4. **Presiona Optimizar** — el algoritmo se ejecuta y muestra las hojas con los paneles anidados.
5. **Visualiza SVG** — cada hoja con cotas, etiquetas de panel, desperdicio coloreado.
6. **Exporta DXF/PDF** — para enviar a la máquina de corte.

## Gestionar láminas de vidrio

![Diálogo Gestionar láminas con los tamaños estándar en la página de Optimización de Corte](/manual/manage-glass-sheets.png)

Los tamaños estándar (2550×3210, 2250×3210, Jumbo 6000×3210) se cargan automáticamente en el primer uso. Puedes editarlos en cualquier momento sin salir de la página de corte — pulsa el botón **⚙ Gestionar láminas** junto al selector *Tipo de lámina*.

1. **Añadir una lámina nueva** — rellena *Nombre* (ej. "Custom 2000×3000"), *Ancho (mm)* y *Alto (mm)*, luego pulsa **+ Añadir**.
2. **Activar / desactivar** — el interruptor junto a cada tamaño lo oculta del selector *Tipo de lámina* sin eliminarlo (útil para tamaños estacionales).
3. **Eliminar** — el botón rojo (papelera) elimina un tamaño definitivamente; úsalo solo si estás seguro.
4. **Cerrar el diálogo** — los cambios se aplican al instante y el selector *Tipo de lámina* se refresca automáticamente con las nuevas dimensiones y superficie en m².

> Las láminas se guardan por empresa — todo tu equipo ve la misma lista, aislada de otras cuentas.

## Estadísticas

Porcentaje de utilización, superficie de desecho, número de hojas.`,
    tips: [
      'Límite de 50 pedidos por sesión para mantener un tiempo de cálculo razonable.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Reclamaciones e Intervenciones de Servicio',
    image: '/manual/service.png',
    imageAlt: 'Módulo de reclamaciones con gráficos y lista de tickets',
    content: `# Reclamaciones y Servicio

Gestión de incidencias post-entrega: reclamaciones de clientes, defectos de fábrica, intervenciones planificadas.

## Pasos

1. **Nueva reclamación** — botón superior derecho.
2. **Asocia un pedido** — opcional, para trazabilidad.
3. **Prioridad** — Baja / Media / Alta / Crítica.
4. **Tipo de defecto** — Reclamación del cliente, Defecto de fábrica, Daños en el transporte, Garantía.
5. **Programa una intervención** — eliges fecha y equipo de montaje.
6. **Cierra el ticket** — con resolución y costes.

## Gráficos

Frecuencia de defectos, distribución de prioridades, estado de los tickets.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Montaje y Equipos',
    image: '/manual/montaj.png',
    imageAlt: 'Calendario de montaje con pestañas de Equipos, Vehículos, Checklist',
    content: `# Montaje

Planificación de montajes, equipos, vehículos, checklists y optimización de ruta.

## Pestañas

1. **Calendario de Montaje** — vista mensual con arrastrar y soltar.
2. **Equipos de Montaje** — añades miembros, los asignas a equipos.
3. **Checklist** — plantillas clonadas en cada trabajo al crearse.
4. **Optimización de Ruta** — calcula el orden óptimo de los montajes del día.
5. **Vehículos** — flota con alertas de 30 días para ITV y seguro.

## Pasos de planificación

1. Botón **"Programar montaje"** arriba a la derecha.
2. Seleccionas el pedido, equipo, vehículo y fecha.
3. Adjuntas una checklist (por defecto o personalizada).
4. Guardas — aparece en el calendario.
5. **Aplazamiento** — cierra el trabajo actual y pre-completa uno nuevo.`,
    tips: [
      'Los vehículos con ITV/seguro que expiran en menos de 30 días reciben una alerta automática.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Configuración de Empresa y Branding',
    image: '/manual/setari-companie.png',
    imageAlt: 'Configuración de empresa — información general',
    content: `# Configuración → Empresa

Los datos que aparecen en TODOS los documentos generados (ofertas, pedidos, facturas, fichas de producción).

## Campos esenciales

1. **Nombre de la Empresa** — aparece en el encabezado del PDF.
2. **CUI / CIF** — con prefijo RO para Rumanía.
3. **Dirección completa** — Calle, N.º, Ciudad, Provincia, Código Postal.
4. **Teléfono y Email** — para contacto en los documentos.
5. **Cuenta Bancaria y BIC/SWIFT** — para las facturas.
6. **Logo de la Empresa** — PNG/JPG/WebP/SVG, máx. 2 MB.

## Personalización del PDF

- **Tamaño del logo** y **posición** — para ofertas y facturas.
- **Textos personalizados** — términos, condiciones, pie de página (texto enriquecido vía Tiptap).
- **Tipo de cambio EUR/RON** — usado para la conversión global.

## White label

Los suscriptores pueden personalizar completamente los PDF con su propio logo y textos HTML.`,
    tips: [
      'El logo ideal es un PNG transparente, con una relación de 3:1 o cuadrado, de al menos 400×400 px para una buena calidad de impresión.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Configuración de Precios y Catálogo',
    content: `# Configuración → Precios

Tu catálogo local de precios: materiales, accesorios, kits, acabados.

## Pasos

1. **Pestaña Materiales** — vidrio, perfiles, accesorios agrupados.
2. **Busca** — búsqueda transversal por categorías.
3. **Edita el precio** — haz clic en la celda, se guarda automáticamente.
4. **Restablecer al sistema** — botón para anular tu cambio y volver al precio base.
5. **Variantes privadas** — añades tus propios materiales con un código único por empresa.
6. **Importar / Exportar** — Excel + ZIP para imágenes, mapeo automático a las categorías del sistema.

## Jerarquía de precios

Empresa (anulación propia) > Usuario global > Sistema (catálogo por defecto).`,
    tips: [
      'Las anulaciones de la empresa no son visibles para otras empresas — estrictamente aislado por RLS.',
      'Las imágenes de los materiales tienen cachebusting con timestamp para ver inmediatamente la nueva versión.',
    ],
    warnings: [
      'Restablecer un precio elimina la anulación y no se puede deshacer — verifica antes.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Configuración de Equipo y Permisos',
    content: `# Configuración → Equipo

Invita a miembros del equipo y gestiona los permisos por módulos.

## Pasos

1. **Invitar miembro** — por email; recibe un enlace de registro.
2. **Rol** — Suscriptor (ventas), Producción, Montaje, Admin de la empresa.
3. **Módulos permitidos** — marcas el acceso: Pedidos, Producción, Stock, Facturación, Servicio, etc.
4. **Activar/Desactivar** — conservas el historial, solo bloqueas el inicio de sesión.
5. **Transferir admin** — en un solo clic, a otro miembro.
6. **Trazabilidad** — todas las acciones se registran con \`created_by\`.

## Niveles de acceso

- **Basic (60)** — Pedidos + 1-2 calculadoras.
- **Plus (100)** — Todas las calculadoras + Stock.
- **Operational (150)** — Todo, incluyendo Servicio, Montaje, Optimización.

## Facturación

La suscripción está vinculada al **propietario de la empresa** — los empleados son gratis.`,
    tips: [
      'Reparar cuenta huérfana (admin) — los usuarios sin empresa pueden ser asignados manualmente.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Margen por tipo de cliente (Particular / Empresa / Distribuidor)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Configuración → Margen por Cliente — Particular, Empresa, Distribuidor',
    content: `# Margen porcentual por tipo de cliente

En **Configuración → Margen por Cliente** puedes definir **3 listas de precios diferenciadas** partiendo del mismo catálogo, sin duplicar artículos.

## Los 3 tipos

- **Particular** — clientes finales (retail). Típicamente aquí pones un margen positivo (ej.: +10% … +20%) porque no se benefician de descuentos comerciales.
- **Empresa** — empresas y socios comerciales. Generalmente se deja en **0%** (precio base).
- **Distribuidor** — socios de reventa. Aquí sueles poner un **valor negativo** (ej.: −10% … −25%) para ofrecerles un precio preferencial.

## Cómo funciona

- El porcentaje se aplica **automáticamente** sobre el precio base de cada artículo en la oferta (vidrio, accesorios, mano de obra, kits).
- Valores **positivos** = margen sobre el precio estándar. Valores **negativos** = descuento.
- El campo acepta valores entre **−100% y +500%**, con incrementos de 0,5%.
- Los cambios se activan después de pulsar **«Guardar Márgenes»** (el botón inferior derecho). La tarjeta resalta las filas modificadas con la insignia «modificado».

## Dónde se aplica

En cada **calculadora 3D**, en la tarjeta de **Información del Cliente**, existe el selector **Tipo de Cliente** (Particular / Empresa / Distribuidor). Cuando lo cambias:

1. La calculadora detecta el tipo elegido.
2. Aplica automáticamente el porcentaje configurado aquí sobre el subtotal.
3. El precio mostrado en la oferta (y más tarde en el PDF) ya refleja el nuevo tipo.

## Para qué ayuda

- **Una sola lista de catálogo**, pero precios diferentes por categoría de cliente — sin duplicar manualmente los artículos.
- Puedes conceder **rápidamente un descuento a los distribuidores** sin modificar los catálogos base.
- A los particulares se les puede facturar con un margen comercial estándar, sin cálculos manuales en cada oferta.
- Los cambios solo son **retroactivos para ofertas nuevas** — los pedidos ya guardados conservan sus precios iniciales (\`full_config\` es la fuente de verdad).`,
    tips: [
      'Puedes establecer valores negativos (ej.: −15%) para ofrecer un descuento permanente a una categoría sin tocar el catálogo.',
      'Si tienes dudas, empieza con Empresa = 0% (precio de referencia) y ajusta los otros dos en relación a él.',
      'El selector de Tipo de Cliente en la calculadora se guarda en la oferta, por lo que una oferta reabierta conserva el tipo elegido inicialmente.',
    ],
    warnings: [
      'El cambio del porcentaje solo afecta a las ofertas nuevas. Los pedidos existentes deben ser reeditados si quieres recalcularlos.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Precios — vista general',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Configuración → Precios — lista de categorías',
    content: `# Configuración → Precios

Aquí controlas **todos los precios** utilizados en las calculadoras 3D, ofertas y PDF.

## Categorías disponibles

- **Accesorios** — bisagras, tiradores, barras, rodillos, topes, juntas, conectores
- **Vidrio** — por grosor y tipo (claro, mate, ahumado, espejo)
- **Mano de obra** — montaje, corte, pulido, taladrado, recorte
- **Perfiles** — en U, de pared, de esquina 90°, perfiles correderos
- **Kits** — grupos de accesorios vendidos como un solo artículo
- **Mecanismos correderos** — sistemas completos (con perfil + rodillos + topes)

## Catálogo global vs. anulación personal

- El **Catálogo global** (gestionado por el admin) es el punto de partida — lo ves automáticamente.
- Cuando modificas un precio o una deducción, se guarda una **anulación personal** en tu espacio (\`pricing_config\`). El catálogo global permanece intacto.
- Puedes restablecer la anulación en cualquier momento con el botón **«Restablecer al valor del catálogo»** (ver la sección dedicada).

## Moneda

Los precios se almacenan internamente en **RON**. El conmutador **RON / EUR** de la barra superior solo convierte la visualización — no se realiza ninguna conversión en la base de datos.`,
    tips: [
      'El filtro de búsqueda funciona en todas las categorías simultáneamente (código, nombre, acabado).',
      'Si no ves un artículo, comprueba si lo has desactivado desde el menú de la fila (campana tachada).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Añadir un nuevo accesorio',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Diálogo Añadir elemento — accesorio',
    content: `# Cómo añadir un nuevo accesorio

1. Entra en **Configuración → Precios** y selecciona la pestaña **Accesorios**.
2. Pulsa **«Añadir elemento»** (arriba a la derecha).
3. Completa:
   - **Código** — único; se usa para deduplicación, escaneo de código de barras y agregación en el PDF.
   - **Nombre** — mostrado en la calculadora y en el PDF.
   - **Categoría / Tipo** — bisagra, tirador, barra estabilizadora, rodillos, tope, junta, etc.
   - **Precio** — en la moneda activa (se almacena en RON).
   - **U.M.** — \`pcs\` para piezas, \`ml\` para metros lineales, \`m²\` para superficie, \`kg\` para peso.
   - **Acabado y color** — eliges entre preajustes o introduces un hex personalizado; se utiliza también en el renderizado 3D.
   - **Imagen** — se carga en el storage; aparece en el selector de accesorios y en el PDF.
4. Marca los **«Tipos de producto»** donde aparece el accesorio (ducha, puerta, barandilla, espejo, paneles, frente de cocina).
5. Marca los **«Tipos de procesamiento»** compatibles (laminado, templado, mate).
6. **Guarda** — el accesorio estará disponible inmediatamente en las calculadoras marcadas.`,
    tips: [
      'Para U.M. diferentes de `pcs` puedes usar decimales (ej: 2.5 ml).',
      'Si no estableces la imagen, se hereda automáticamente de la categoría padre.',
    ],
    warnings: [
      'El código debe ser único. Si ya existe, el sistema actualiza el artículo existente en lugar de crear uno nuevo.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Editar elemento — campos avanzados',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Diálogo Editar elemento con deducciones de vidrio',
    content: `# Editar elemento — campo por campo

Haz clic en el lápiz de la fila (o doble clic) para abrir **Editar elemento**. Además del precio y la U.M., tienes estos campos técnicos:

## Precio y U.M.

- El precio se introduce en la moneda activa del encabezado (RON o EUR) y se almacena internamente en RON.
- La U.M. determina cómo se multiplica el precio en la calculadora: \`pcs\` × cantidad, \`ml\` × longitud, \`m²\` × superficie.

## Acabado y color

- **Hex color** + **roughness** se utilizan tanto en la lista de precios como en el renderizado 3D — sincronizados a través de \`MetalMaterial\`.
- Si lo dejas en blanco, se hereda del elemento padre (ej: la variante de un perfil hereda el color del perfil base).

## Deducción de vidrio por lado (\`glass_deduction\`)

Cuántos **mm** entra el perfil en el vidrio en cada lado donde está montado. La calculadora resta automáticamente este valor de la dimensión bruta para obtener el vidrio real a cortar.

> Ejemplo: perfil en U de 8 mm en vidrio laminado de 8 mm → \`8 + 0.38 + 8 = 16.38 mm\` de deducción total (perfiles + lámina + perfiles, acumulativo).

## Deducciones detalladas por lado (\`glass_deductions\`)

JSON con \`top\`, \`bottom\`, \`left\`, \`right\` separados. Se usa cuando el perfil tiene valores diferentes en cada borde (ej: perfil de suelo profundo + perfil de pared delgado). **Se acumula** con las juntas.

- **\`profile_height\`** (en el mismo JSON) — sobrescribe la suma de \`top + bottom\` para el perfil en U, si quieres un único valor total.

## Solapamiento (\`width_overlap\`)

Cuántos mm se **solapan** los paneles correderos sobre el otro panel o la pared. El sistema resta este valor del **ancho útil** del kit corredero.

> Ejemplo: kit corredero de 1200 mm con un solapamiento de 40 mm → ancho útil efectivo de 1160 mm.

## Deducción de altura de la puerta (\`door_height_deduction\`)

mm restados de la altura total para la **puerta con bisagras** (espacio para bisagra superior + umbral inferior). Típicamente 5–20 mm dependiendo de la bisagra.

## Deducción de altura del panel fijo (\`fixed_panel_height_deduction\`)

Idéntico, pero para el panel fijo. **Por defecto 0** — el panel fijo no tiene una deducción automática de 10 mm.

## Tipos de producto / procesamiento

Marca dónde aparece el accesorio (ducha, puerta, barandilla...) y qué procesamientos soporta (laminado, templado). Si no están marcados = no aparece en la calculadora correspondiente.`,
    tips: [
      'Las deducciones son **acumulativas**: perfil + junta + lámina laminada se suman en el mismo lado.',
      'Las bisagras se miden de **arriba hacia abajo**, y el tirador de **abajo hacia arriba** — es una convención que se mantiene en todas las calculadoras.',
      'El sistema corredero **no utiliza bisagras** — el campo de cantidad de bisagras permanece en 0 automáticamente.',
    ],
    warnings: [
      'Cualquier modificación de las deducciones afecta inmediatamente a **todos los cálculos 3D futuros**, incluidas las ofertas no confirmadas. Los pedidos ya guardados tienen sus datos congelados en `full_config` y no se modifican.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Añadir tipo de vidrio',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Configuración → Precios → Vidrio',
    content: `# Vidrio

1. Pestaña **Vidrio** → **«Añadir elemento»**.
2. Elige el **grosor**: 4 / 6 / 8 / 10 / 12 mm.
3. Elige el **tipo**: claro, ahumado, mate (arenado), espejo, bronce, gris.
4. Establece el **precio / m²** (en la moneda activa).
5. Marca los **procesamientos** disponibles para este vidrio: templado, laminado, pulido, mate.

## Templado

Para el templado, el precio se calcula con la fórmula:

\`\`\`text
Precio templado = Precio_templado × Grosor_mm × Superficie_m²
\`\`\`

Estableces un único precio base; el sistema aplica automáticamente la fórmula en función del grosor y el área del vidrio.

## Laminado

En el vidrio laminado, las deducciones en los lados se acumulan con el **grosor de la lámina** (por defecto 0.38 mm) en cada borde. Consulta el ejemplo en la sección «Editar elemento».`,
    tips: [
      'El vidrio mate (arenado) suele tener un margen porcentual sobre el claro — lo configuras como un multiplicador en el campo de procesamiento.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Añadir mano de obra',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Configuración → Precios → Mano de obra',
    content: `# Mano de obra

1. Pestaña **Mano de obra** → **«Añadir elemento»**.
2. Elige el **tipo**: montaje, corte, pulido de cantos, taladrado, recorte, transporte.
3. Establece la **U.M.**:
   - \`hora\` — para montaje
   - \`ml\` — para pulido de cantos
   - \`pza\` — para agujeros, recortes
   - \`m²\` — para mano de obra de superficie
4. **Precio** por unidad.
5. **Porcentaje vs. valor fijo** — marca si es un multiplicador (ej: 15% sobre el valor del vidrio) o una suma fija.
6. Asocia con los **tipos de producto** donde se aplica automáticamente.`,
    tips: [
      'La mano de obra porcentual no se ve afectada por el conmutador EUR/RON — permanece igual en cualquier moneda.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Kits de accesorios',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Configuración → Kits',
    content: `# Kits

Un **kit** es un grupo de accesorios vendido como un solo artículo. Útil para sistemas correderos de ducha: el kit incluye el perfil, rodillos, topes y guía.

## Crear un kit

1. Entra en **Configuración → Kits** (o la pestaña Kits en Precios).
2. **«Añadir kit»** → código, nombre, **precio del kit** (final), **ancho útil** cubierto.
3. Añade **componentes** — seleccionas de la lista de accesorios y pones la cantidad.
4. Los componentes se **deduplican por código** — si el mismo código aparece dos veces, se suman las cantidades.

## Uso en la calculadora

En la calculadora de **ducha corredera**, eliges el kit del menú desplegable. El sistema calcula:

\`\`\`text
Ancho útil efectivo = Ancho_kit - width_overlap
\`\`\`

y aplica automáticamente **0 bisagras** (el sistema corredero no tiene bisagras).`,
    tips: [
      'Los precios de los componentes son informativos — el **precio del kit prevalece** en la oferta.',
      'La imagen del kit aparece en el PDF; si falta, se utiliza la imagen del perfil principal.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Restablecer al valor del catálogo',
    image: '/manual/setari-reset.png',
    imageAlt: 'Botón Restablecer al valor del catálogo',
    content: `# Restablecer anulación personal

Si has modificado un precio o una deducción y quieres volver al **valor estándar del catálogo global**:

1. Abre **Editar elemento**.
2. Pulsa **«Restablecer al valor del catálogo»** (abajo a la izquierda en el diálogo).
3. Tu anulación en \`pricing_config\` se elimina y el artículo vuelve a mostrar el valor del admin.

> El restablecimiento afecta **solo al artículo respectivo**. El resto de tus anulaciones permanecen intactas.`,
    warnings: [
      'La acción es inmediata y no se puede deshacer. Si necesitas un historial, exporta los precios (Configuración → Exportar datos) antes de restablecer.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Nuevas secciones — para suscriptores ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Panel principal',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Panel principal',
    content: `# Panel principal

Después de iniciar sesión, llegarás a la **página de inicio (\`/\`)**, un panel de control con los indicadores clave de tu negocio, actualizados en tiempo real.

## ¿Qué verás?

- **KPIs superiores**: volumen de negocio, pedidos en curso, pedidos entregados este mes, valor medio del pedido.
- **Gráfico de ventas** de los últimos 12 meses (barras, con comparación del año anterior).
- **Gráfico de ingresos** por categorías de productos (ducha, puertas, barandillas, espejos, cocina, paneles).
- **Top productos** vendidos en el período seleccionado.
- **Stock crítico** — materiales con cantidad por debajo del umbral mínimo configurado.
- **Pedidos recientes** — los últimos 10 pedidos con estado y cliente, con acceso directo al pedido.

## Filtros

El conmutador **RON / EUR** de la barra superior afecta a todos los valores mostrados aquí (conversión dinámica, sin IVA).
`,
    tips: [
      'El panel se recarga automáticamente con cada cambio de moneda o idioma.',
      'Para una vista operativa (producción, montaje, servicio), utiliza el menú *Panel Operativo*.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Anuncios y notificaciones',
    image: '/manual/announcements.png',
    imageAlt: 'Anuncios y notificaciones',
    content: `# Anuncios y notificaciones

El icono 🔔 de la **campana amarilla** en la barra superior muestra los anuncios publicados por el equipo de iSoftGlass: actualizaciones, nuevas funcionalidades, mantenimiento planificado.

## Cómo funciona

- El número rojo en la campana = anuncios **no leídos**.
- Haz clic en la campana para abrir la lista; cada anuncio tiene un título, una categoría (**Update** o **Info**), la fecha y el contenido completo.
- Los anuncios se marcan automáticamente como leídos cuando los abres.
- Los anuncios importantes de tipo **Update** también aparecen como una **notificación en la parte superior de la página** al lanzar una nueva versión.

## Categorías

- **Update** — nueva versión, funcionalidades añadidas, correcciones.
- **Info** — información general, consejos, eventos.

Los anuncios se traducen automáticamente al idioma de tu interfaz.
`,
    tips: [
      'Revisa los anuncios periódicamente para enterarte de nuevas funcionalidades que pueden ahorrarte tiempo.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Moneda e idioma',
    image: '/manual/currency-language.png',
    imageAlt: 'Moneda e idioma',
    content: `# Moneda e idioma

## Conmutador RON / EUR

El botón **RON / EUR** en la barra superior cambia la moneda mostrada en toda la aplicación: calculadoras 3D, ofertas, pedidos, informes, panel.

- El **almacenamiento interno** se realiza **siempre en RON**. El EUR es solo para visualización, calculado dinámicamente al tipo de cambio establecido en *Configuración → Empresa*.
- **Todos los valores son sin IVA** en los cálculos internos; el IVA se aplica solo al generar la factura.
- Puedes introducir valores en EUR; se convierten automáticamente a RON al guardar.

## Selector de idioma

El botón **🇷🇴 RO** abre la lista con los **9 idiomas disponibles**: Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- El cambio de idioma afecta **solo a la interfaz** (menús, botones, etiquetas, manual).
- Los datos que introduces (nombres de clientes, descripciones, notas) permanecen en el idioma original.
- La configuración se guarda para tu cuenta entre sesiones.
`,
    tips: [
      'El tipo de cambio del EUR solo se actualiza cuando lo modificas manualmente en Configuración → Empresa.',
      'El manual de usuario está completamente traducido a los 9 idiomas.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Trabajar exclusivamente en EUR (recomendado para suscriptores no-RO)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Ajustes → Precios — Tipo EUR',
    content: `# Trabajar exclusivamente en EUR

Esta guía es para suscriptores que trabajan **100% en EUR** — compran a proveedores en EUR y venden a clientes en EUR, sin mezclar RON en su catálogo.

## Cómo funciona el almacenamiento interno

- Todos los precios se guardan en la base de datos como un único número.
- La etiqueta técnica interna es "RON", pero es **irrelevante para ti** — nunca la ves en la interfaz.
- El interruptor **EUR** en la barra superior realiza una conversión de visualización usando el tipo de cambio definido en *Ajustes → Precios*.

## El problema que evitas

Si dejas el tipo predeterminado (ej. \`Tipo EUR = 4,97\`) e introduces una bisagra a **100 EUR**, el sistema almacena internamente \`497\`. Mañana, si el tipo cambia a \`5,02\`, el mismo producto aparece como **99,00 EUR** en el catálogo — sin que hayas modificado nada.

Este "drift" es matemáticamente correcto pero genera confusión y parece un error.

## Configuración recomendada — 3 pasos

1. **Ajustes → Precios** → establece **Tipo EUR = 1**.
2. En la barra superior, selecciona **EUR** como moneda activa.
3. Introduce todos los precios directamente en EUR en *Ajustes → Precios* (y en los pedidos nuevos).

## Qué ganas

- Los precios se mantienen **absolutamente estables** — 100 EUR hoy = 100 EUR dentro de un año.
- Cero conversión al guardar, **cero drift**.
- Los PDF de presupuestos, pedidos e informes salen naturalmente en EUR.
- Los pedidos históricos ya no se "mueven" con el tiempo.

## Qué NO cambia

- La etiqueta técnica "RON" permanece en la base de datos (invisible en la interfaz).
- Toda la lógica de la aplicación funciona de forma idéntica — no se pierde ninguna funcionalidad.

## Limitaciones — cuándo NO usar esta configuración

- Si tienes **proveedores en RON** y clientes en EUR (flujo mixto) → necesitas el tipo de cambio real.
- Si trabajas en otra moneda (PLN, HRK, etc.) → contacta al equipo iSoftGlass para una extensión.
`,
    tips: [
      'Establecer Tipo EUR = 1 solo afecta a la conversión de visualización — no modifica ningún valor ya guardado.',
      'Se recomienda hacer esta configuración antes de introducir los primeros precios en el catálogo.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Escáner de producción (códigos de barras)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Escáner de producción (códigos de barras)',
    content: `# Escáner de producción

La página **Producción → Escáner** (\`/productie/scanner\`) te permite avanzar rápidamente los pedidos entre las etapas del Kanban utilizando un **escáner de códigos de barras CODE128** conectado como un teclado HID.

## Cómo funciona

1. Abre la página **Escáner**. El campo de entrada tiene enfoque automático permanente.
2. **Escanea el código de barras** de la ficha de producción o de la etiqueta del producto.
3. La aplicación identifica automáticamente el pedido y lo **avanza a la siguiente etapa** del Kanban (p. ej.: *Corte* → *Pulido*, *Pulido* → *Templado*).
4. La confirmación aparece en pantalla con un sonido y un color verde; el error (código desconocido) con color rojo.

## Requisitos

- Escáner CODE128 configurado como **teclado HID** (modo estándar, sin controladores).
- Sufijo **Enter (\\r)** después de cada escaneo (configuración predeterminada en la mayoría de los modelos).

## Ventajas

- El operario ya no tiene que buscar pedidos manualmente en el Kanban.
- Trazabilidad completa: el tiempo de cada etapa se guarda automáticamente.
- Funciona también en una tableta con un escáner Bluetooth.
`,
    tips: [
      'Si el campo de entrada pierde el foco (al hacer clic en otro lugar), un simple escaneo lo restaurará automáticamente.',
      'El campo ignora la escritura manual más lenta de 50 ms; solo el escáner activa el avance.',
    ],
    warnings: [
      'Escanear un código que ya está en la última etapa no produce ningún efecto; el pedido permanece allí.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Procesamientos y Editor CAD',
    image: '/manual/processing-cad.png',
    imageAlt: 'Procesamientos y Editor CAD',
    content: `# Procesamientos y Editor CAD

La página **Procesamientos** (\`/prelucrari\`) es el taller técnico para las fichas de producción: agujeros, bisagras, tiradores, recortes, procesamientos de borde, todo visualizado sobre el vidrio en un editor CAD interactivo.

## Ficha de procesamiento

- Lista completa de los paneles del pedido (con dimensiones y tipo de vidrio).
- Para cada panel: lista de procesamientos (código de plantilla + parámetros: distancia, diámetro, offset).
- Muchos procesamientos se **completan automáticamente** desde la configuración 3D (bisagras, tiradores, cerraduras); solo editas las excepciones.

## Editor CAD — atajos de teclado

| Tecla | Acción |
|---|---|
| **J** | JOIN — une dos procesamientos cercanos (tolerancia 10 mm) |
| **Ctrl + D** | Duplica el procesamiento seleccionado |
| **Ctrl + Shift + D** | Duplica **todos** los procesamientos en otro panel (reflejo automático en X) |
| **Delete** | Elimina el procesamiento seleccionado |
| **Clic izquierdo + arrastrar** | Mueve el procesamiento |
| **Rueda del ratón** | Zoom |

## Plantillas

El catálogo de **Plantillas de procesamiento** (categorías: **30. bisagras & recortes**, **51. agujeros para tiradores**) se sincroniza automáticamente con los accesorios elegidos en 3D. Añadir una nueva bisagra en el catálogo genera el recorte correcto en el vidrio.

## Exportar

- **DXF** (R9 → R2010) — para CNC industrial, con mapeo de capas.
- **PDF** — para el taller, con cotas y leyenda de procesamientos.
- El botón **"Enviar a CNC"** genera DXF + lista de corte combinados.
`,
    tips: [
      'El paso de posicionamiento es de 0.5 mm; utiliza la coma para los decimales.',
      'Los elementos no seleccionados se muestran en negro; selecciona uno para ver sus cotas y parámetros.',
    ],
    warnings: [
      'Los cambios en el panel solo se guardan al pulsar **Guardar procesamiento**; cambiar de página sin guardar los perderá.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Panel Operativo',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Panel Operativo',
    content: `# Panel Operativo

La página **Panel Operativo** (\`/operational\`) es el panel único para el taller y la logística: ve en tiempo real lo que está sucediendo en producción, montaje, servicio y corte.

## Tarjetas de resumen

- **Producción**: número de pedidos en cada etapa del Kanban (corte, pulido, templado, ensamblaje, embalaje).
- **Montaje**: trabajos programados para hoy / esta semana, retrasos.
- **Servicio**: intervenciones abiertas, prioridad, SLA.
- **Corte**: paneles en la cola de optimización, vidrio asignado por plancha.

## Actualización automática

La página se recarga **automáticamente cada 60 segundos**; puedes dejar una pantalla de TV en el taller mostrándola permanentemente.

## Acciones rápidas

- Haz clic en cualquier tarjeta para ir directamente a la página detallada (Kanban de producción, lista de montaje, etc.).
- El botón **"Actualizar ahora"** fuerza una actualización inmediata.
`,
    tips: [
      'Usa esta página en una pantalla grande en el taller para tener visibilidad a nivel de equipo.',
      'Para los indicadores financieros (volumen de negocio, márgenes), utiliza el Panel principal.',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Informes',
    image: '/manual/reports.png',
    imageAlt: 'Informes',
    content: `# Informes

La página **Informes** (\`/rapoarte\`) te ofrece una visibilidad completa sobre las ventas y el consumo de materiales.

## Informes disponibles

1. **Ventas mensuales** — volumen de negocio por mes, desglosado por categorías (ducha, puertas, barandillas, etc.) y por agente de ventas.
2. **Consumo de materiales** — las cantidades de vidrio, perfiles y accesorios consumidos en un intervalo, agregadas por código de producto.
3. **Top clientes** — clasificación por valor de los pedidos en el período seleccionado.
4. **Márgenes** — diferencia entre el coste de producción y el precio de venta, por pedido.

## Filtros

- **Intervalo de fechas** (calendario desde / hasta).
- **Categoría de producto**.
- **Agente** (vendedor).
- **Estado del pedido** (oferta, confirmado, en producción, entregado).

## Exportar

Todos los informes se exportan en **CSV** con **BOM UTF-8** (Excel abre correctamente los caracteres con tilde).

Los valores respetan el conmutador global **RON / EUR**.
`,
    tips: [
      'Para análisis externos en Excel, utiliza la exportación a CSV; el BOM garantiza que los caracteres con tilde se muestren correctamente.',
      'Los filtros se guardan para tu cuenta entre sesiones.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Informes de montaje',
    image: '/manual/installation-reports.png',
    imageAlt: 'Informes de montaje',
    content: `# Informes de montaje

La página **Informes de montaje** (\`/rapoarte-montaj\`) supervisa el rendimiento de los equipos de instalación y optimiza la planificación.

## ¿Qué verás?

- **Rendimiento por equipo**: número de montajes finalizados, tiempo medio por trabajo, distancia recorrida.
- **Mapa con rutas optimizadas** — el sistema propone el orden óptimo de los trabajos del día para cada equipo (algoritmo de minimización de distancia).
- **Checklist de finalización** — porcentaje de checklists completados correctamente, firmas de clientes.
- **Incidentes** — trabajos aplazados, reclamaciones, devoluciones.

## Filtros

- **Intervalo** (día / semana / mes).
- **Equipo** o **vehículo**.
- **Zona geográfica**.

## Acciones rápidas

- Haz clic en un trabajo para abrir los detalles completos: cliente, dirección, productos, fotos de antes/después, firma.
- El botón **"Reprogramar"** mueve el trabajo en el calendario sin perder el checklist completado.
`,
    tips: [
      'La ruta optimizada tiene en cuenta el horario de cada equipo y las franjas horarias confirmadas con los clientes.',
      'Las alertas de ITV/Seguro para los vehículos aparecen 30 días antes de su vencimiento.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Exportación e importación de datos',
    image: '/manual/export-date.png',
    imageAlt: 'Ajustes › Datos — exportación e importación',
    accent: 'green',
    content: `# Exportación e importación de datos

En **Ajustes → Datos** tienes control completo sobre los datos introducidos en la plataforma. Todos los datos pertenecen al suscriptor, están estrictamente aislados por empresa (RLS en \`company_id\`) y **pueden exportarse o reimportarse en cualquier momento, sin ninguna restricción**.

---

## 1. Exportación de datos

![Zona de exportación](/manual/export-date.png)

La tarjeta **Exportación de datos** ofrece 5 botones:

- **Clientes (CSV)** — lista completa con nombre, tipo, empresa, contacto, dirección, NIF, descuento, notas.
- **Presupuestos (CSV)** — todos los presupuestos con nº ref, producto, cliente, precio, IVA, margen, estado, fecha.
- **Pedidos (CSV)** — pedidos con número, estado, subtotal, descuento, total, pagado, entrega, notas.
- **Materiales (CSV)** — tu propio catálogo con código, nombre, tipo, unidad, precio, stock, proveedor.
- **Exportación completa (JSON)** — un único archivo con las 4 tablas + marca de tiempo (\`exported_at\`).

### Cómo exportar

1. Ve a **Ajustes → pestaña Datos**.
2. Pulsa el botón de la categoría deseada (o **Exportación completa** para todo).
3. El archivo se descarga automáticamente. El nombre contiene la fecha: \`clientes_2026-05-22.csv\`, \`export_completo_2026-05-22.json\`.
4. Abre los CSV directamente en Excel / LibreOffice (BOM UTF-8 garantiza los caracteres correctos) o el JSON en un editor de texto.

> **Importante para suscriptores:** tienes el derecho RGPD a la **portabilidad de datos**. Puedes exportar y guardar localmente todos tus datos, siempre y cuantas veces quieras, sin límite.

---

## 2. Importación de datos

![Zona de importación](/manual/export-date-import.png)

La tarjeta **Importación de datos** te permite volver a cargar en la plataforma archivos CSV (por categoría) o un JSON completo guardado previamente. Útil para:

- **migración** desde otro sistema (preparar el CSV con las mismas cabeceras que la exportación),
- **restauración** tras una eliminación accidental (con la última exportación completa),
- **carga masiva** de clientes, materiales o presupuestos.

### Cómo importar

1. En la tarjeta **Importación de datos** pulsa el botón de la categoría (Clientes / Presupuestos / Pedidos / Materiales) para CSV, o **Importación completa** para JSON.
2. Selecciona el archivo del ordenador.
3. Se abre un **diálogo de vista previa** que muestra: tabla de destino, número de registros detectados y primeras columnas encontradas.
4. Verifica los datos y pulsa **Confirmar importación** (o Cancelar).
5. Al final aparece una notificación con el número de filas importadas con éxito / errores.

### Claves de conflicto (duplicados)

La importación usa una clave única por tabla:

| Tabla | Clave de conflicto |
|---|---|
| Clientes | \`name\` |
| Presupuestos | \`ref_number\` |
| Pedidos | \`order_number\` |
| Materiales | \`code\` |

Las filas con clave ya existente pueden ser **sobrescritas** — haz una exportación antes de la importación si quieres una copia de seguridad.

### Formato esperado

- **CSV** — mismo conjunto de cabeceras que en la exportación correspondiente, codificación UTF-8.
- **JSON** — exactamente la estructura producida por **Exportación completa** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Detalles técnicos

- La exportación descarga **todos los registros**, con paginación automática de 1000 en segundo plano.
- La importación procesa lotes de 100 filas e inyecta automáticamente el contexto de empresa (RLS).
- Todo lo que exportas/importas está aislado a tu empresa.
`,
    tips: [
      'Haz una exportación completa (JSON) mensual — es la forma más segura de copia de seguridad local.',
      'Antes de cualquier importación masiva, exporta la tabla de destino para tener la versión anterior a mano.',
      'Para CSVs con caracteres especiales, abre en Excel vía *Datos → Desde texto/CSV* con UTF-8.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Protección de datos',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Tarjetas Copia / Recuperación / Seguridad',
    content: `# Protección de datos

La seguridad y disponibilidad de tus datos son la prioridad absoluta. La plataforma funciona sobre **infraestructura Lovable Cloud**, con protección multicapa y cumplimiento RGPD.

## Copia automática

- **Copia diaria automática**, sin intervención por tu parte.
- Historial mantenido al menos 7 días (Point-in-Time Recovery).
- Copias cifradas y almacenadas de forma redundante en centros de datos europeos.

## Recuperación

- En caso de pérdida accidental, los datos pueden recuperarse a petición mediante el equipo de soporte.
- Recomendamos también **exportación local periódica** (sección *Exportar datos*).

## Seguridad

- **Aislamiento multi-tenant estricto** mediante Row-Level Security en \`company_id\`.
- **Cifrado en tránsito** (HTTPS/TLS) y **en reposo** en disco.
- **JWT** para sesiones, **hashing fuerte** para contraseñas.
- Verificación **HIBP** al crear cuenta y al cambiar contraseña.
- Centros de datos europeos, cumplimiento **RGPD**.

## Tus derechos RGPD

| Derecho | Cómo ejercerlo |
|---|---|
| Portabilidad | Exportar desde Configuración → Datos |
| Acceso | Ver todos tus datos en la plataforma |
| Rectificación | Editar cualquier campo en las interfaces dedicadas |
| Supresión | A petición vía soporte (\`isoftplustech@gmail.com\`) |

## Recomendaciones

- Usa una **contraseña fuerte y única**.
- No compartas la cuenta — crea usuarios dedicados para colegas (Configuración → Equipo).
- **Cierra sesión** en dispositivos públicos o compartidos.
- Haz una **exportación mensual** y guárdala en lugar seguro.
- Consulta la [Política de Privacidad](/privacy-policy) y la [Política de Cookies](/cookie-policy).
`,
    tips: [
      'Tus datos siguen siendo tuyos: exportables en formato abierto (CSV/JSON) en cualquier momento.',
      'Combinación más segura: copia automática de plataforma + exportación local mensual.',
    ],
    warnings: [
      'Nunca envíes la contraseña por email, chat o teléfono — el soporte nunca te la pedirá.',
    ],
  },
];
