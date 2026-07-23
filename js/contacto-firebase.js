/* ============================================================
   NOVA CARIBE — CONTACTO + FIREBASE
   Módulo ES, se carga solo en contacto.html.
   Valida el formulario en el cliente y guarda cada mensaje como
   un documento en la colección "mensajes" de Firestore.

   CONFIGURACIÓN :
   1. Se crea un proyecto en https://console.firebase.google.com
   2. Activada Firestore Database (modo producción).
   3. Registrada laa app web y copia su config en firebaseConfig abajo.
   4. Se define reglas de seguridad en Firestore, por ejemplo:

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /mensajes/{docId} {
            allow create: if request.resource.data.keys().hasAll(
              ['nombre', 'correo', 'mensaje', 'creadoEn']
            );
            allow read, update, delete: if false; // solo lectura desde el panel de Firebase
          }
        }
      }
      Para evitar la manipulación de datos por parte de externos
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC6h1UmU4UllC_VXkh1q10GARCTVcXgDBo",
    authDomain: "fir-novacaribe.firebaseapp.com",
    projectId: "fir-novacaribe",
    storageBucket: "fir-novacaribe.firebasestorage.app",
    messagingSenderId: "899731810933",
    appId: "1:899731810933:web:77e7a60ddc088c0de5663c",
    measurementId: "G-EXL28D0M9P"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

const formulario = document.querySelector("#form-contacto");

if (formulario) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const campos = formulario.querySelectorAll("input[required], textarea[required]");
  const estado = formulario.querySelector(".form-estado");
  const botonEnviar = document.querySelector("#btn-enviar");

  function validarCampo(campo) {
    campo.dataset.tocado = "true";
    const errorEl = document.getElementById(campo.id + "-error");
    if (!errorEl) return campo.checkValidity();

    if (campo.validity.valueMissing) {
      errorEl.textContent = "Este campo es obligatorio.";
    } else if (campo.validity.typeMismatch && campo.type === "email") {
      errorEl.textContent = "Ingresa un correo electrónico válido.";
    } else if (campo.validity.patternMismatch) {
      errorEl.textContent = "El formato ingresado no es válido.";
    } else {
      errorEl.textContent = "";
    }
    return campo.checkValidity();
  }

  function mostrarEstado(mensaje, esError) {
    if (!estado) return;
    estado.textContent = mensaje;
    estado.classList.add("visible");
    estado.style.background = esError ? "#F7DAD3" : "";
    estado.style.color = esError ? "#8A2E1B" : "";
  }

  campos.forEach(function (campo) {
    campo.addEventListener("blur", function () { validarCampo(campo); });
    campo.addEventListener("input", function () {
      if (campo.dataset.tocado === "true") validarCampo(campo);
    });
  });

  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    let formularioValido = true;
    campos.forEach(function (campo) {
      if (!validarCampo(campo)) formularioValido = false;
    });

    if (!formularioValido) {
      const primerError = formulario.querySelector(":invalid");
      if (primerError) primerError.focus();
      return;
    }

    const datos = {
      nombre: formulario.nombre.value.trim(),
      correo: formulario.correo.value.trim(),
      telefono: formulario.telefono.value.trim(),
      motivo: formulario.motivo.value,
      mensaje: formulario.mensaje.value.trim(),
      creadoEn: serverTimestamp(),
      origen: "sitio-web",
    };

    if (botonEnviar) {
      botonEnviar.disabled = true;
      botonEnviar.textContent = "Enviando…";
    }

    try {
      await addDoc(collection(db, "mensajes"), datos);
      mostrarEstado("¡Gracias! Tu mensaje quedó registrado. Te contactaremos pronto por correo o WhatsApp.", false);
      formulario.reset();
      campos.forEach(function (campo) { campo.dataset.tocado = "false"; });
    } catch (error) {
      console.error("Error al guardar el mensaje en Firebase:", error);
      mostrarEstado("No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos directo por WhatsApp.", true);
    } finally {
      if (botonEnviar) {
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar mensaje";
      }
    }
  });
}
