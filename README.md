# Mar Alegría Spa — Sitio web

Sitio multipágina para un salón de belleza y spa en Cusco. El salón de belleza para mujeres es el servicio principal; los tratamientos faciales y los masajes aparecen como complemento. Incluye **modo claro / oscuro**, **español / inglés / portugués** y reservas por WhatsApp.

Construido con **HTML, CSS y JavaScript nativo**, sin dependencias ni proceso de compilación.

## Estructura

```
Mar_Alegria_Spa/
├── index.html          Inicio (hero, salón, quiénes somos, CTA)
├── nosotros.html       Historia, hitos, espacio, valores y equipo
├── servicios.html      Menú de servicios (salón, faciales y masajes)
├── contacto.html       Datos de contacto, redes y formulario
├── assets/
│   ├── css/styles.css  Sistema de diseño, temas y responsive
│   ├── js/i18n.js      Diccionarios ES/EN/PT y aplicación de traducciones
│   ├── js/main.js      Tema, idioma, menú, carrusel, formulario y WhatsApp
│   └── img/
│       ├── favicon.svg      Flor de loto con la paleta de la marca
│       ├── logo.png         Logotipo a color (fondos claros)
│       └── logo-light.png   Logotipo claro (fondos oscuros)
└── README.md
```

## Cómo abrirlo

1. Abre `index.html` en el navegador (doble clic) para una revisión rápida.
2. Para una experiencia fiel al servidor final, ejecuta un servidor local:

```bash
python -m http.server 8080
# o
npx serve .
```

Visita `http://localhost:8080`.

## Páginas

- **Inicio:** hero con carrusel, presentación del salón con tres servicios destacados, teaser de “Nosotros” y llamada a la acción.
- **Nosotros:** relato de la marca, hitos, el espacio, valores y equipo.
- **Servicios:** bloque destacado del salón (6 servicios), luego faciales (3) y masajes (3). Las píldoras de categoría son anclas a cada bloque.
- **Contacto:** dirección, horarios, teléfono, correo, redes y formulario que abre WhatsApp con la solicitud redactada. La dirección también aparece dentro del formulario.

## Personalización esencial

### 1. Número de WhatsApp

El número vive en **dos lugares**:

- **`assets/js/main.js`** → objeto `CONFIG.whatsapp` (código de país + número, sin `+`, espacios ni guiones).
- Los `href="https://wa.me/..."` de respaldo en las cuatro páginas (para cuando JavaScript está desactivado).

```js
const CONFIG = {
  whatsapp: '51942865182' // ← cámbialo aquí
};
```

### 2. Teléfono, correo, dirección y horarios

Busca y reemplaza en los cuatro HTML:

- `+51 942 865 182` (texto visible, enlaces `tel:` y WhatsApp)
- `hola@maralegriaspa.com` (correo de ejemplo)
- `Av. El Sol 224, C.C. Club Cusco`, `Int. C-11, Cusco, Perú`
- Redes sociales: [Instagram](https://www.instagram.com/maralegriaspa/), [Facebook](https://www.facebook.com/maralegria.spa) y [TikTok](https://www.tiktok.com/@maralegriaspa)
- No hay enlace de Google Maps todavía; la dirección se muestra en el bloque “Visítanos” y dentro del formulario de contacto.

> El correo, los precios y los enlaces legales siguen siendo **de ejemplo**. Reemplázalos antes de publicar. Los enlaces de “Política de privacidad” y “Términos y condiciones” usan `href="#"`: apúntalos a tus páginas legales reales.

### 3. Servicios y precios

Cada tarjeta es un `<article class="service-card">` en `servicios.html`:

- El título, la descripción, la duración y el precio están escritos en el HTML y traducidos con claves `svc.*` en `i18n.js`.
- El botón “Reservar” usa `data-service-key="svc.…"` para construir el mensaje de WhatsApp con el nombre del servicio en el idioma activo. Si añades una tarjeta, agrega su clave al diccionario y al `<select id="service">` del formulario.
- Las categorías se agrupan por bloques con `id="salon"`, `id="faciales"` e `id="masajes"`; las píldoras superiores enlazan a esos anclajes.

Los precios en COP (`$ 90.000`, etc.) son de ejemplo.

### 4. Traducciones

Los textos viven en `assets/js/i18n.js`, organizados por idioma (`es`, `en`, `pt`). En el HTML se marcan así:

| Atributo | Uso |
| --- | --- |
| `data-i18n="clave"` | Reemplaza el texto del elemento. |
| `data-i18n-html="clave"` | Reemplaza el HTML interno (usa `<br>`, `<strong>`, etc.). |
| `data-i18n-attr="aria-label:clave; placeholder:otraClave"` | Traduce atributos. |

El título y la descripción de cada página se eligen con `data-page` en `<body>` y las claves `meta.<página>.title` / `meta.<página>.desc`.

Para añadir un idioma: agrega su tabla en `i18n.js`, súmalo a `supported`, añade la opción en los `<select class="js-lang">` y crea las claves `meta.*` correspondientes. El idioma se guarda en `localStorage` (`ma-lang`).

### 5. Logotipo

El logotipo oficial vive en `assets/img/logo.png` (versión a color, para fondos claros) y `assets/img/logo-light.png` (versión clara con el detalle cian, para fondos oscuros). El header alterna entre ambas según el fondo —hero transparente, header sólido o tema oscuro— y el footer usa siempre la versión clara. El favicon reproduce la flor de loto con la nueva paleta.

Al reemplazar el logo, conserva la transparencia y actualiza ambos archivos con las mismas dimensiones. El HTML declara `width="600" height="209"` para evitar saltos de layout.

### 6. Tema claro / oscuro

Los colores están centralizados como variables CSS en `assets/css/styles.css` (`:root` para claro y `[data-theme="dark"]` para oscuro). El tema se guarda en `localStorage` (`ma-theme`) y, en la primera visita, respeta la preferencia del sistema. Un pequeño script en el `<head>` aplica el tema antes de pintar para evitar el destello inicial.

### 7. Fotografías

Las imágenes se sirven desde Pexels (CDN). Para usar fotos propias:

1. Guárdalas en `assets/img/`.
2. Sustituye los `src` / `srcset` de cada `<img>`.
3. Mantén `width`, `height`, `loading="lazy"` y un `alt` descriptivo.
4. Conserva la primera imagen del hero con `fetchpriority="high"`.

Las fotos actuales son de uso libre según la [licencia de Pexels](https://www.pexels.com/license/). Se recomienda reemplazarlas por fotos reales del salón.

## Dirección de arte

- **Paleta:** blanco y arena como base; azul real profundo (`#0A2560`), azul royal (`#0B3FA8`), cian (`#00C2D4`) y azul cielo (`#009FE3`), tomados del logotipo, como acentos y llamadas a la acción. Los fondos oscuros usan un azul marino profundo (`#05122F`).
- **Logotipo:** el original a color y una variante clara para fondos oscuros; el header alterna según el contexto y el footer usa la variante clara.
- **Tipografías:** Cormorant Garamond (títulos) y Jost (texto), desde Google Fonts con `display=swap`.
- **Formas:** bordes suaves, arcos, tarjetas redondeadas y separadores ondulados. Sin formas literales de gotas.
- **Movimiento:** carrusel con fundido y zoom lento, revelados al hacer scroll y microinteracciones. Todo respeta `prefers-reduced-motion`.

## Accesibilidad

- Enlace “saltar al contenido”, navegación por teclado y foco visible.
- Menú móvil con `aria-expanded`, bloqueo de scroll, cierre con `Escape` y trampa de foco.
- Selector de idioma y botón de tema con etiquetas accesibles que se traducen.
- Formulario con `label`, validación accesible (`aria-invalid`, `aria-describedby`) y estado `aria-live`; los errores se muestran en el idioma activo.
- Áreas táctiles de al menos 44 px.
- Imágenes decorativas con `alt=""`; imágenes de contenido con descripciones.
- Contraste cuidado: el cian se reserva para acentos sobre fondos oscuros; el turquesa oscuro (`#006C93`) se usa para texto sobre fondos claros.
- El logotipo enlaza al inicio con un nombre accesible (`Mar Alegría Spa`).

## Rendimiento

- Sin frameworks, sin librerías y sin paso de build.
- Imágenes por CDN con `srcset`, `sizes`, `loading="lazy"` y dimensiones declaradas.
- Precarga de la imagen principal del hero, `preconnect` a fuentes e imágenes y JS con `defer`.
- Animaciones con `transform` / `opacity` e `IntersectionObserver`.

## Formulario

No requiere backend: al enviar, valida nombre, teléfono y servicio, y abre WhatsApp con el mensaje ya redactado (nombre, teléfono, servicio y mensaje). Si necesitas recibir solicitudes por correo o guardarlas en una base de datos, sustituye el manejador `submit` de `main.js` por una petición a tu API o servicio de formularios.

## Compatibilidad

Navegadores modernos (Chrome, Edge, Firefox, Safari) con soporte para `IntersectionObserver`, `svh` y `backdrop-filter`. En navegadores antiguos el contenido sigue siendo funcional; solo se pierden algunos efectos visuales.

---

Hecho con calma para **Mar Alegría Spa**.
