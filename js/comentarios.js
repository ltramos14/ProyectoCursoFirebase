import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import {
    getStorage,
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { verAutenticacion } from "./conexion-firebase.js";

const database = getFirestore();

window.onload = function () {
    verAutenticacion();
    cargarOpinionesRestaurante();
};

async function cargarOpinionesRestaurante() {
    let contenido = "";

    const q = query(collection(database, "restaurantes"), where("visible", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(rpta => {

        const fila = rpta.data();
        const q1 = query(
            collection(database, "restaurantes/" + rpta.id + "/comentarios"),
            orderBy("rating", "asc")
        );
        const subscribe = onSnapshot(q1, (querySnapshot) => {
            contenido += "<div class='col-lg-4 mb-4'>";
            contenido += "<div class='card-body' style='background-color:#EFF0B6'>";
            contenido += "<h5 class='card-title'>" + fila.nombre + "</h5>";
            contenido += "<img src=" + fila.foto + " alt=''class='card-img-top imagen'>";
            contenido += "<hr>";
            contenido += "<h5 class='card-title text-center'>Calificaciones & Opiniones</h5>";
            contenido += "<hr>";

            querySnapshot.forEach((rpta) => {
                var fila2 = rpta.data();
                
                contenido += "<div style='display: flex; justify-content: space-around;' >"; 
                contenido += "<div style='text-align:left' >"; 
                contenido += "<img style='border-radius: 150px;' src=" + fila2.usuario.foto + ' width="100" height="100" />';
                contenido += "</div>";      
                contenido += "<div class='text-center'>";
                contenido += "<h4>" + fila2.usuario.displayName + "</h4>"; 
                contenido += "<p>" + calcularRating(fila2.rating) + "</p>";
                contenido += "<p>" + fila2.comentario + "</p>";
                contenido += "</div>";
                contenido += "</div>";
                contenido += "<hr>";         
            });
            contenido += "</div>";
            contenido += "</div>";
            document.getElementById("comentarios").innerHTML = contenido;
        });
    });
    document.getElementById("restaurantes").innerHTML = contenido;
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
