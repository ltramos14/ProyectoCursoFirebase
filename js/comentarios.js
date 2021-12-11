import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
    limit,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { verAutenticacion } from "./conexion-firebase.js";

const database = getFirestore();
const storage = getStorage();
var operacion;
var idRestauranteGlobal;

window.onload = function () {
    verAutenticacion();
    cargarOpinionesRestaurante();
};

async function cargarOpinionesRestaurante() {
    
    const idRestarunte = "yt2G8SOwXun3jH3wuN3K";
    let contenido = "";

    const q = query(collection(database, "restaurantes"), where("visible", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(rpta => {
        
    const fila = rpta.data();
    contenido+="<div class='col-lg-4 mb-4'>";
    contenido+="<div class='card'>";
    contenido+="<img src=" + fila.foto + " alt=''class='card-img-top imagen'>";
    contenido+="<div class='card-body' style='background-color:#96C7C1'>";
    contenido+="<h5 class='card-title'>" + fila.nombre + "</h5>";
    contenido+="<hr>";
  
    const q = query(
        collection(database, "restaurantes/" + idRestarunte + "/comentarios"),
        orderBy("rating", "asc")
    );

    const subscribe = onSnapshot(q, (querySnapshot) => {
        let contenido = "<table class='table mt-2'>";

        contenido += "<thead>";
        contenido += "<tr>";
        contenido += "<th>Foto</th>";
        contenido += "<th>Nombre</th>";
        contenido += "<th>Comentario</th>";
        contenido += "<th>Rating</th>";
        contenido += "</tr>";
        contenido += "</thead>";
        contenido += "<tbody>";

        querySnapshot.forEach((rpta) => {
            var fila = rpta.data();

            contenido += "<tr>";
            contenido +="<td><img src=" + fila.usuario.foto + ' width="100" height="100" /></td>';
            contenido += "<td>" + fila.usuario.displayName + "</td>";
            contenido += "<td>" + fila.comentario + "</td>";
            contenido += "<td>" + calcularRating(fila.rating) + "</td>";
            contenido += "</tr>";
        });
        contenido += "</tbody>";
        contenido += "</table>";
         document.getElementById("prueba").innerHTML = contenido;
    });
    contenido+="</div>";
    contenido+="</div>";
    contenido+="</div>";
    });
        
    document.getElementById("comentarios").innerHTML=contenido;


    
   
}

function calcularRating(rating) {
    let contenido = "<div>";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) contenido += '<span class="fa fa-star checked"></span>';
        else contenido += '<span class="fa fa-star "></span>';
    }
    contenido += "</div>";
    return contenido;
}
