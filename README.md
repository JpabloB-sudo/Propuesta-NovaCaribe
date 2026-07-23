# Sitio web — Textilería Nova Caribe Ltda.

## Estructura (página única + formulario con Firebase)
```
nova-caribe/
├── index.html                  (Página única: inicio + nosotros + precios + productos)
├── contacto.html                (Formulario de contacto conectado a Firebase)
├── css/styles.css               (única hoja de estilos, todo el sitio)
├── js/main.js                   (menú móvil, scroll-spy del nav, botón "volver arriba")
├── js/contacto-firebase.js      (módulo ES: validación + guardado en Firestore)
└── images/                      (carpeta para tus fotos/logo)
```

## Cómo funciona la navegación
- `index.html` tiene todo el contenido en una sola página, dividido en
  secciones con id: `#inicio`, `#nosotros`, `#precios`, `#productos`.
- El menú del header (Nosotros / Precios / Productos) hace scroll suave
  a cada sección. Mientras el usuario baja, el enlace correspondiente se
  resalta solo (scroll-spy con `aria-current="true"`).
- "Contacto" es la única página aparte: aquí vive el formulario.
- Los enlaces del menú usan `index.html#seccion`, así que funcionan igual
  estando en `index.html` o en `contacto.html`  siempre te llevan a la
  sección correcta.

## Botón de volver arriba pensado para celulares y navegación vertical
- Aparece solo después de bajar ~480px (aprox. después de pasar el hero).
- No es intrusivo: abajo a la derecha, opuesto al botón de WhatsApp
  (abajo a la izquierda), así nunca se superponen.
- Hace scroll suave al inicio y respeta `prefers-reduced-motion`.
- Cuando está oculto queda `disabled`, así los usuarios de teclado no
  caen en un botón invisible al tabular.

## Formulario de contacto + Firebase
El formulario de `contacto.html` guarda cada mensaje como un documento
en la colección `mensajes` de Firestore (nombre, correo, teléfono,
motivo, mensaje y fecha con `serverTimestamp()`).

### Pasos para activarlo
1. Ve a https://console.firebase.google.com y crea un proyecto (gratis).
2. Dentro del proyecto, activa **Firestore Database** (modo producción).
3. En "Configuración del proyecto" → "Tus apps", registra una app web
   y copia el objeto de configuración que te entrega Firebase.
4. Pega esa configuración en `js/contacto-firebase.js`, reemplazando el
   bloque `firebaseConfig` (está marcado con `TODO`).
5. En Firestore → Reglas, define reglas que permitan **crear** pero no
   leer/editar/borrar desde el navegador (para que nadie pueda ver los
   mensajes de otros ni manipular los tuyos):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /mensajes/{docId} {
         allow create: if request.resource.data.keys().hasAll(
           ['nombre', 'correo', 'mensaje', 'creadoEn']
         );
         allow read, update, delete: if false;
       }
     }
   }
   ```
6. Para leer los mensajes que lleguen, usa la consola de Firebase
   (Firestore Database → colección `mensajes`), o crea un panel propio
   más adelante.

No se necesita backend propio ni servidor: todo el guardado ocurre
directo desde el navegador del cliente hacia Firestore.

## Dónde van tus imágenes
| Archivo esperado | Dónde se usa |
|---|---|
| `images/logo-nova-caribe.png` | Logo en el header (ambas páginas) |
| `images/logo-nova-caribe-blanco.png` | Logo en el footer |
| `images/hero-textil.jpg` | Imagen grande del hero en `index.html` |

Exporta en WebP/JPG comprimido, menos de 300 KB cada una.

## Pendiente antes de producción
- Reemplazar `https://wa.me/573219988XX` por el número real de WhatsApp
  (con indicativo de país, sin espacios ni símbolos) en ambas páginas.
- Completar `firebaseConfig` en `js/contacto-firebase.js` con tu proyecto real.
- Definir las reglas de seguridad de Firestore (paso 5 arriba) antes de publicar.
- Configurar dominio propio con certificado SSL.

## Accesibilidad (WCAG) — se mantiene todo lo anterior
- Enlace "Saltar al contenido", foco visible, contraste verificado.
- `aria-current` dinámico en el menú según la sección visible (scroll-spy)
  y estático (`page`) en "Contacto".
- Formulario con `label` por campo, errores anunciados, estado de envío
  con `aria-live="polite"` para lectores de pantalla.
- Botón "volver arriba" y botón de WhatsApp con `aria-label` descriptivo.
- Respeta `prefers-reduced-motion` en el scroll suave.
