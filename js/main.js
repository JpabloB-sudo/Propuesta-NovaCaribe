/* ============================================================
   NOVA CARIBE — JS COMPARTIDO
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Menú de navegación móvil ---------- */
  const btnMenu = document.querySelector(".btn-menu");
  const navPrincipal = document.querySelector(".nav-principal");

  if (btnMenu && navPrincipal) {
    btnMenu.addEventListener("click", function () {
      const abierto = navPrincipal.classList.toggle("abierto");
      btnMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
    });

    // Cierra el menú al elegir un enlace (mejor experiencia en móvil)
    navPrincipal.querySelectorAll("a").forEach(function (enlace) {
      enlace.addEventListener("click", function () {
        navPrincipal.classList.remove("abierto");
        btnMenu.setAttribute("aria-expanded", "false");
      });
    });

    // Cierra el menú con la tecla Escape (accesibilidad de teclado)
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && navPrincipal.classList.contains("abierto")) {
        navPrincipal.classList.remove("abierto");
        btnMenu.setAttribute("aria-expanded", "false");
        btnMenu.focus();
      }
    });
  }

  /* ---------- 2. Resaltado del enlace activo al hacer scroll (página única) ---------- */
  const seccionesConAncla = document.querySelectorAll("main [id].seccion-ancla");
  const enlacesNav = document.querySelectorAll(".nav-principal a[href*='#']");

  if ("IntersectionObserver" in window && seccionesConAncla.length && enlacesNav.length) {
    const observadorSecciones = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          const id = entrada.target.getAttribute("id");
          enlacesNav.forEach(function (enlace) {
            const apuntaAEstaSeccion = enlace.getAttribute("href").endsWith("#" + id);
            if (apuntaAEstaSeccion) {
              enlace.setAttribute("aria-current", "page");
            } else if (enlace.getAttribute("aria-current") === "page") {
              enlace.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    seccionesConAncla.forEach(function (seccion) { observadorSecciones.observe(seccion); });
  }

  /* ---------- 3. Botón flotante "volver arriba" ----------
     Aparece solo después de bajar cierto punto de la página, no es
     intrusivo, y hace scroll suave al inicio respetando
     prefers-reduced-motion. */
  const botonArriba = document.querySelector(".boton-arriba");

  if (botonArriba) {
    const UMBRAL_PX = 480;
    let visible = false;

    function actualizarVisibilidad() {
      const debeVerse = window.scrollY > UMBRAL_PX;
      if (debeVerse === visible) return;
      visible = debeVerse;
      botonArriba.classList.toggle("visible", visible);
      botonArriba.disabled = !visible; // fuera del orden de tabulación cuando está oculto
    }

    let tickeando = false;
    window.addEventListener("scroll", function () {
      if (tickeando) return;
      tickeando = true;
      window.requestAnimationFrame(function () {
        actualizarVisibilidad();
        tickeando = false;
      });
    }, { passive: true });

    // Revisa el estado inicial (por si la página carga ya desplazada,
    // por ejemplo al volver con el botón "atrás" del navegador)
    actualizarVisibilidad();

    botonArriba.addEventListener("click", function () {
      const prefiereReducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefiereReducirMovimiento ? "auto" : "smooth" });
      const marca = document.querySelector(".marca");
      if (marca) marca.focus({ preventScroll: true });
    });
  }

  /* ---------- 4. Botón de WhatsApp en pantallas táctiles ----------
     En escritorio el texto "Escríbenos" aparece con :hover (CSS puro).
     En táctil no existe :hover real, así que el primer toque expande
     el botón y muestra el texto; un segundo toque (o el mismo, ya
     expandido) sigue el enlace con normalidad. Se contrae solo si el
     usuario no vuelve a tocarlo. */
  const botonWhatsapp = document.querySelector(".whatsapp-flotante");
  const esTactil = window.matchMedia("(hover: none)").matches;

  if (botonWhatsapp && esTactil) {
    let expandido = false;
    let temporizador = null;

    botonWhatsapp.addEventListener("click", function (evento) {
      if (!expandido) {
        evento.preventDefault();
        botonWhatsapp.classList.add("expandido");
        expandido = true;
        temporizador = window.setTimeout(function () {
          botonWhatsapp.classList.remove("expandido");
          expandido = false;
        }, 3500);
        return;
      }
      // Ya estaba expandido: deja que el enlace navegue a WhatsApp normalmente
      if (temporizador) window.clearTimeout(temporizador);
    });
  }

  /* La validación y el envío del formulario de contacto viven en
     js/contacto-firebase.js (módulo ES), que se carga solo en
     contacto.html y guarda los mensajes directamente en Firebase. */
})();
