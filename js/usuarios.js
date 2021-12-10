import { getFirestore, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { verAutenticacion } from "./conexion-firebase.js";

const database = getFirestore();

window.onload = function() {
    verAutenticacion();
    cargarUsuarios();
}

async function cargarUsuarios() {
    let contenido = "";
    const q = query(collection(database, "usuarios"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(users => {
    const fila = users.data();
    contenido+="<div class='col-lg-3 mb-4'>";
    contenido+="<div class='card'>";
    contenido+="<img  width=\"200\" height=\"230\"  src=" + fila.imgFoto + " alt='' class='card-img-top imagen'>";
    contenido+="<div class='card-body' style='background-color:#FEC260'>";
    contenido+="<h5 class='card-title'>" +  fila.nombre + "&nbsp;" + fila.apellido + "</h5>";
    contenido+="<hr>";
    contenido+="<p class='card-text'><strong>Username: </strong>" + fila.displayName + " </strong></p>";
    contenido+="<p class='card-text'><strong>Correo: </strong>" + fila.email + "</p>";
    contenido+="<p class='card-text'><strong>Teléfono: </strong>" + fila.telefono + "</p>";
    contenido+="<hr>";
    contenido+="<div style='text-align:center;'>";
    contenido+="<p class='card-text'><strong>PROVEEDOR: </strong>" + fila.provedor + "</p>";
    contenido+="</div>"
    contenido+="</div>";
    contenido+="</div>";
    contenido+="</div>";
    });
    document.getElementById("usuario").innerHTML=contenido;
}
