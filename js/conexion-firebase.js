// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwCs_yJZx_DhW82wB1064ijJ3D-G4BD1A",
  authDomain: "cursofirebase-91c8c.firebaseapp.com",
  projectId: "cursofirebase-91c8c",
  storageBucket: "cursofirebase-91c8c.appspot.com",
  messagingSenderId: "546135271848",
  appId: "1:546135271848:web:8e343944dee493b6ce959d",
  measurementId: "G-CRPG3ZR5JE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

window.salir = function salir() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      document.location.href = "/views/index.html";
    })
    .catch((error) => {
      alert("Se produjó un error al cerrar la sesión");
      console.log(error);
    });
};

export function verAutenticacion() {
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      /*Al iniciar sesión
      console.log("Inicio sesión")*/
      if (document.getElementById("divRedes")) {
        document.getElementById("divRedes").style.visibility = "hidden";
      }
      document.getElementById("divDatosUsuario").style.visibility = "visible";

      if (user.photoURL != null)
        document.getElementById("imgFotoUsuario").src = user.photoURL;
      else
        document.getElementById("imgFotoUsuario").src = "../asset/images/noprofile.png";

      if (user.displayName != null)
        document.getElementById("lblNombreUsuario").innerHTML =
          user.displayName;
      else if (user.email != null)
        document.getElementById("lblNombreUsuario").innerHTML = user.email;
      else if (user.reloadUserInfo.screenName != null)
        document.getElementById("lblNombreUsuario").innerHTML =
          user.reloadUserInfo.screenName;
      else document.getElementById("lblNombreUsuario").innerHTML = "";

      if (document.getElementById("divInicioDeSesion")) {
        document.getElementById("divInicioDeSesion").style.visibility =
          "hidden";
      }

      if (document.getElementById("navbarSupportedContent")) {
        document.getElementById("navbarSupportedContent").style.visibility =
          "visible";
      }
    } else {
      /* Al cerrar sesión 
      console.log("Cerro sesión")*/

      if (document.getElementById("divRedes")) {
        document.getElementById("divRedes").style.visibility = "visible";
        document.getElementById("divDatosUsuario").style.visibility = "hidden";
      }

      if (document.getElementById("divInicioDeSesion")) {
        document.getElementById("divInicioDeSesion").style.visibility =
          "visible";
      }

      if (document.getElementById("navbarSupportedContent")) {
        document.getElementById("navbarSupportedContent").style.visibility =
          "hidden";
      }
    }
  });
}
