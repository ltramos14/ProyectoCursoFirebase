import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  ref
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";

import { verAutenticacion } from "./conexion-firebase.js";

const database = getFirestore();
const storage = getStorage();
var usuarioActual;
var fotoActualizada = null;

window.onload = function () {
  verAutenticacion();
}

window.abrirModal = function abrirModal() {
  document.getElementById("alertaErrorRegistro").style.display = "none";
  document.getElementById("alertaErrorRegistro").innerHTML = "";
  document.getElementById("txtNombres").value = "";
  document.getElementById("txtCorreo").value = "";
  document.getElementById("txtContra").value = "";
};

window.registrarUsuario = function registrarUsuario() {
  const nombres = document.getElementById("txtNombres").value;
  const correo = document.getElementById("txtCorreo").value;
  const contrasena = document.getElementById("txtContra").value;

  if (nombres == "") {
    document.getElementById("alertaErrorRegistro").style.display = "block";
    document.getElementById("alertaErrorRegistro").innerHTML =
      "Debe ingresar un nombre de usuario";
  }

  if (correo == "") {
    document.getElementById("alertaErrorRegistro").style.display = "block";
    document.getElementById("alertaErrorRegistro").innerHTML =
      "Debe ingresar un correo";
  }

  if (contrasena == "") {
    document.getElementById("alertaErrorRegistro").style.display = "block";
    document.getElementById("alertaErrorRegistro").innerHTML =
      "Debe ingresar una contraseña";
  }

  const auth = getAuth();
  createUserWithEmailAndPassword(auth, correo, contrasena)
    .then((userCredential) => {
      //Signed In
      const user = userCredential.user;

      updateProfile(auth.currentUser, {
        nombres: nombres,
      })
        .then(() => {
          alert("Usuario registrado correctamente");
          auth.signOut();
          document.location.href = "/views/index.html";
        })
        .catch((error) => {
          const errorMessage = error.message;
          document.getElementById("alertaErrorRegistro").style.display =
            "block";
          document.getElementById("alertaErrorRegistro").innerHTML =
            errorMessage;
        });
    })
    .catch((error) => {
      //const errorCode = error.code;
      const errorMessage = error.message;
      document.getElementById("alertaErrorRegistro").style.display = "block";
      document.getElementById("alertaErrorRegistro").innerHTML = errorMessage;
    });
};

window.iniciarSesion = function iniciarSesion() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email == "" || password == "") {
    document.getElementById("alertErrorLogueo").style.display = "block";
    document.getElementById("alertErrorLogueo").innerHTML = "El correo y/o la contraseña son obligatorios";
    return false;
  } else {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      // Signed in   
      actualizarPerfil(userCredential.user, "EmailAndPassword");
      document.location.href = "/views/usuarios.html";
    })
      .catch((error) => {
        document.getElementById("alertaErrorLogeo").style.display = "block";
        document.getElementById("alertaErrorLogeo").innerHTML = "errorMessage";
      });
  }
};

window.authGoogle = function authGoogle() {
  const provider = new GoogleAuthProvider();
  authGeneric(provider, "Google");
}

window.authMicrosoft = function authMicrosoft() {
  const provider = new OAuthProvider('microsoft.com');
  authGeneric(provider, "Microsoft");
}

window.authFacebook = function authFacebook() {
  const provider = new FacebookAuthProvider();
  authGeneric(provider, "Facebook");
}

window.authTwitter = function authTwitter() {
  const provider = new TwitterAuthProvider();
  authGeneric(provider, "Twitter");
}

window.authGithub = function authGithub() {
  const provider = new GithubAuthProvider();
  authGeneric(provider, "GitHub");
}

function authGeneric(provider, providerName) {
  const auth = getAuth();
  signInWithPopup(auth, provider)
    .then((result) => {
      actualizarPerfil(result.user, providerName);
    }).catch((error) => {
      const errorMessage = error.message;
      document.getElementById("alertErrorLogueo").style.display = "block";
      document.getElementById("alertErrorLogueo").innerHTML = errorMessage;
    });
}

function limpiarModalUpdate() {
  document.getElementById("alertaActulizacionRegistro").style.display = "none";
  document.getElementById("alertaActulizacionRegistro").innerHTML = "";
  document.getElementById("progressUploadPhoto").style.visibility = "hidden";

  document.getElementById("txtDisplayNameUpd").value = "";
  document.getElementById("txtnombre").value = "";
  document.getElementById("txtapellido").value = "";
  document.getElementById("txtemail").value = "";
  document.getElementById("txttelefono").value = "";
  document.getElementById("txtprovider").value = "";
  document.getElementById("imgFoto").src = null;
}

function actualizarPerfil(user, providerName) {

  const docRef = doc(database, "usuarios", user.uid);
  getDoc(docRef).then(docSnap => {
    if (docSnap.exists()) {
    } else {
      usuarioActual = user;
      limpiarModalUpdate();

      document.getElementById("txtDisplayNameUpd").value = user.displayName != null ? user.displayName : "";
      document.getElementById("txtemail").value = user.email != null ? user.email : "";
      document.getElementById("txttelefono").value = user.phoneNumber != null ? user.phoneNumber : "";
      document.getElementById("imgFoto").src = user.photoURL != null ? user.photoURL : "../asset/images/noprofile.png";
      //document.getElementById("txtprovider").value = providerName;
      document.getElementById("txtprovider").value = user.reloadUserInfo.providerUserInfo[0].providerId;

      if (providerName === "google") {
        document.getElementById("txtnombre").value = user.displayName != null ? user.displayName : "";
      } else if (providerName === "EmailAndPassword") {
        document.getElementById("txtnombre").value = "";
      } else if (providerName === "Twitter") {
        document.getElementById("txtemail").removeAttribute('readonly');
        document.getElementById("txtnombre").value = "";
      } else if (providerName === "GitHub") {
        document.getElementById("txtemail").removeAttribute('readonly');
        document.getElementById("txtnombre").value = "";
      }

      $("#exampleModalUpdate").modal('show');

    }
  }).catch((error) => {
    document.getElementById("alertErrorLogueo").style.display = "block";
    document.getElementById("alertErrorLogueo").innerHTML = error.message;
  });
}
window.cambiarFoto = function cambiarFoto(archivo) {

  document.getElementById("buttonEditPerfil").disabled = true;
  const file = archivo.files[0];
  const reader = new FileReader();
  reader.onloadend = function () {
    document.getElementById("progressUploadPhoto").style.visibility = "visible";

    document.getElementById("imgFoto").src = reader.result;
    const imageRef = ref(storage, 'fotoPerfil/' + usuarioActual.uid);
    const uploadTask = uploadBytesResumable(imageRef, file);
    uploadTask.on('state_changed',
      (snapshot) => {

        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        $('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);
      },
      (error) => {
        document.getElementById("buttonEditPerfil").disabled = false;
        document.getElementById("progressUploadPhoto").style.visibility = "hidden";
        $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = error.message;
      },
      () => {
        document.getElementById("buttonEditPerfil").disabled = false;
        document.getElementById("progressUploadPhoto").style.visibility = "hidden";
        $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          fotoActualizada = downloadURL;
        });
      }
    );

  }
  reader.readAsDataURL(file);
}

window.editarPerfil = function editarPerfil() {

  const displayName = document.getElementById("txtDisplayNameUpd").value;
  const nombre = document.getElementById("txtnombre").value;
  const apellido = document.getElementById("txtapellido").value;
  const email = document.getElementById("txtemail").value;
  const telefono = document.getElementById("txttelefono").value;
  const provedor = document.getElementById("txtprovider").value;
  let imgFoto = document.getElementById("imgFoto").src;


  if (displayName == "") {
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un display Name";
    return;
  }
  if (email == "") {
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un email";
    return;
  }
  if (nombre == "") {
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un nombre";
    return;
  }
  if (apellido == "") {
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un apellido";
    return;
  }
  if (imgFoto.includes('../asset/images/noprofile.png')) {
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe seleccionar una foto";
    return;
  }
  if (telefono == "") {
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un telefono";
    return;
  }

  if (fotoActualizada != null)
    imgFoto = fotoActualizada;


  setDoc(doc(database, "usuarios", usuarioActual.uid), {
    nombre: nombre,
    apellido: apellido,
    email: email,
    displayName: displayName,
    telefono: telefono,
    provedor: provedor,
    imgFoto: imgFoto,
  }).then(() => {
    editarAutorizacion(displayName, imgFoto);
  }).catch((error) => {
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = error.message;
  });

}

function editarAutorizacion(displayName, photoURL) {

  const auth = getAuth();
  updateProfile(auth.currentUser, {
    displayName: displayName,
    photoURL: photoURL
  }).then(() => {
    alert("Usuario editado correctamente");
    document.location.href = "/views/usuarios.html";
  }).catch((error) => {
    const errorMessage = error.message;
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = errorMessage;
  });
}

