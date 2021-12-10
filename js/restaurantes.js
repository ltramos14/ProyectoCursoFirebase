import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { verAutenticacion } from "./conexion-firebase.js";

const database = getFirestore();
const storage = getStorage();
var operacion;
var idRestauranteGlobal;

window.onload = function () {
    verAutenticacion();
    cargarRestaurantes();
}

async function cargarRestaurantes() {
    let contenido = "";
    const q = query(collection(database, "restaurantes"), where("visible", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(rpta => {
    const fila = rpta.data();
    contenido+="<div class='col-lg-4 mb-4'>";
    contenido+="<div class='card'>";
    contenido+="<img src=" + fila.foto + " alt=''class='card-img-top imagen'>";
    contenido+="<div class='card-body' style='background-color:#EDD2F3'>";
    contenido+="<h5 class='card-title'>" + fila.nombre + "</h5>";
    contenido+= calcularRating(fila.rating);
    contenido+="<hr>";
    contenido+="<p class='card-text'><strong>Dirección: </strong>" + fila.direccion + "</p>";
    contenido+="<p class='card-text'><strong>Horarios: </strong>" + fila.horarios + "</p>";
    contenido+="<hr>";
    contenido+="<div style='text-align:center;'>";
    contenido+="<a class='btn btn-warning' href='"+ fila.menu + "' target='_blank'><i class='fa fa-eye'></i>Abrir menú</a>"
    contenido+="<button type='button' class='btn btn-info' onclick='verComentarios(\""+rpta.id+"\")'><i class='fa fa-comments'></i> Ver comentarios</button>"
    contenido+="</div>"
    contenido+="<hr>";
    contenido+="<div style='text-align:end;'>";
    contenido+="<button type='button'  class='btn btn-primary' data-toggle='modal' data-target='#commentModal' onclick='abrirModalComentario(\""+ fila.nombre +"\", \""+rpta.id+"\")'><i class='fa fa-comment'></i></button>"
    contenido+="<button type='button'  class='btn btn-success' onclick='abrirModal(\""+rpta.id+"\")' data-toggle='modal' data-target='#exampleModal'><i class='fa fa-edit'></i></button>"
    contenido+="<button type='button'  class='btn btn-danger'  onclick='eliminar(\""+rpta.id+"\")' ><i class='fa fa-trash'></i></button>"
    contenido+="</div>";
    contenido+="</div>";
    contenido+="</div>";
    contenido+="</div>";
    });
    document.getElementById("restaurante").innerHTML=contenido;
}

function calcularRating(rating) {
    let contenido = "<div>";
    for (let i = 1; i <= 5; i++) {
        if (rating >= i)
            contenido += "<span class=\"fa fa-star checked\"></span>";
        else
            contenido += "<span class=\"fa fa-star \"></span>";
    }
    contenido += "</div>";
    return contenido;
}

window.abrirModal = function abrirModal(idRestaurante) {
    limpiarDatos();
    if (idRestaurante == 0) {
        operacion = 1;
        document.getElementById("lblTitulo").innerHTML = "AÑADIR RESTAURANTE";
    } else {
        operacion = 2;
        document.getElementById("lblTitulo").innerHTML = "EDITAR INFORMACIÓN RESTAURANTE";
        idRestauranteGlobal = idRestaurante;
        cargarDatos(idRestaurante);
    }

}

function cargarDatos(idRestaurante) {

    const docRef = doc(database, "restaurantes", idRestaurante);
    getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {

            const data = docSnap.data();
            document.getElementById("txtnombre").value = data.nombre;
            document.getElementById("txtdireccion").value = data.direccion;
            document.getElementById("txthorarios").value = data.horarios;
            document.getElementById("imgFoto").src = data.foto;
            document.getElementById("iframePreview").src = data.menu;

        } else {
            alert("No se puede encontrar el restaurante");
        }
    }).catch((error) => {
        alert("Ha ocurrido un error" + error.message);
    });

}

function limpiarDatos() {
    document.getElementById("txtnombre").value = "";
    document.getElementById("txtdireccion").value = "";
    document.getElementById("txthorarios").value = "";
    document.getElementById("imgFoto").src = '../asset/images/norestaurant.jpg';
    document.getElementById("iframePreview").src = "";
    document.getElementById("alertaErrorCrearRestaurante").style.display = "none";
    document.getElementById("alertaErrorCrearRestaurante").innerHTML = "";
}

window.subirImage = function subirImage(e) {
    const file = e.files[0];
    let reader = new FileReader();
    reader.onloadend = function () {
        document.getElementById("imgFoto").src = reader.result;
    }
    reader.readAsDataURL(file);
}

window.subirArchivo = function subirArchivo(e) {
    const file = e.files[0];
    let reader = new FileReader();
    reader.onloadend = function () {
        document.getElementById("iframePreview").src = reader.result;
    }
    reader.readAsDataURL(file);
}

window.descargarArchivo = function descargarArchivo() {
    const linkSource = document.getElementById("iframePreview").src;
    const downloadLink = document.createElement("a");
    const filename = "menuSoprte.pdf";
    downloadLink.href = linkSource;
    downloadLink.download = filename;
    downloadLink.target = "_black";
    downloadLink.click();
}

window.operar = function operar() {
    if (operacion == 1) {
        guardar();
    } else {
        editar();
    }
}

function editar() {
    const nombre = document.getElementById("txtnombre").value;
    const direccion = document.getElementById("txtdireccion").value;
    const horarios = document.getElementById("txthorarios").value;
    const promises = [];

    let uploadTask, uploadTaskFile;
    if (document.getElementById("imgFoto").src.includes('data:image/')) {
        const foto = document.getElementById("fileImage").files[0];
        const imageRef = ref(storage, 'restaurantes/foto/' + idRestauranteGlobal);
        uploadTask = uploadBytesResumable(imageRef, foto);
        promises.push(uploadTask);
    }

    if (document.getElementById("iframePreview").src.includes('data:application/')) {
        const archivo = document.getElementById("file").files[0];
        const pdfRef = ref(storage, 'restaurantes/menu/' + idRestauranteGlobal);
        uploadTaskFile = uploadBytesResumable(pdfRef, archivo);
        promises.push(uploadTaskFile);
    }

    Promise.all(promises).then(values => {

        let flagSuccess = true;
        values.forEach(rpta => {
            if (rpta.state !== "success") {
                flagSuccess = false;
                return;
            }
        });

        if (flagSuccess) {

            let downloadUrlFoto, downloadUrlPdf;
            let fotoBoolean = false;
            let documentoBoolean = false;
            const promises2 = [];
            if (document.getElementById("imgFoto").src.includes('data:image/')) {
                downloadUrlFoto = getDownloadURL(uploadTask.snapshot.ref);
                promises2.push(downloadUrlFoto);
                fotoBoolean = true;
            }
            if (document.getElementById("iframePreview").src.includes('data:application/')) {
                downloadUrlPdf = getDownloadURL(uploadTaskFile.snapshot.ref);
                promises2.push(downloadUrlPdf);
                documentoBoolean = true;
            }

            Promise.all(promises2).then(values => {
                let fotoUrlFinal, documentoUrlFinal;
                if (fotoBoolean && documentoBoolean) {
                    fotoUrlFinal = values[0];
                    documentoUrlFinal = values[1];
                } else if (fotoBoolean && !documentoBoolean) {
                    fotoUrlFinal = values[0];
                    documentoUrlFinal = document.getElementById("iframePreview").src;
                } else if (!fotoBoolean && documentoBoolean) {
                    fotoUrlFinal = document.getElementById("imgFoto").src;
                    documentoUrlFinal = values[0];
                } else {
                    fotoUrlFinal = document.getElementById("imgFoto").src;
                    documentoUrlFinal = document.getElementById("iframePreview").src;
                }

                const restauranteRef = doc(database, "restaurantes", idRestauranteGlobal);
                updateDoc(restauranteRef, {
                    nombre: nombre,
                    direccion: direccion,
                    horarios: horarios,
                    foto: fotoUrlFinal,
                    menu: documentoUrlFinal
                }).then(() => {
                    alert("Editado correctamente");
                    $("#exampleModal").modal('hide');
                    cargarRestaurantes();
                }).catch(error => {
                    document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                    document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
                });
            });

        } else {
            document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
            document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Error al cargar documentos";
        }
    });
}

function guardar() {

    //Agregar validaciones

    const nombre = document.getElementById("txtnombre").value;
    const direccion = document.getElementById("txtdireccion").value;
    const horarios = document.getElementById("txthorarios").value;
    const foto = document.getElementById("fileImage").files[0];
    const archivo = document.getElementById("file").files[0];

    const newRestaurant = doc(collection(database, "restaurantes"));
    setDoc(newRestaurant, {
        nombre: nombre,
        direccion: direccion,
        horarios: horarios,
        visible: true,
        rating: 5
    }).then(() => {
        const imageRef = ref(storage, 'restaurantes/foto/' + newRestaurant.id);
        const uploadTask = uploadBytesResumable(imageRef, foto);

        const pdfRef = ref(storage, 'restaurantes/menu/' + newRestaurant.id);
        const uploadTaskFile = uploadBytesResumable(pdfRef, archivo);

        Promise.all([uploadTask, uploadTaskFile]).then(values => {

            let flagSuccess = true;
            values.forEach(rpta => {
                if (rpta.state !== "success") {
                    flagSuccess = false;
                    return;
                }
            });

            if (flagSuccess) {
                const downloadUrlFoto = getDownloadURL(uploadTask.snapshot.ref);
                const downloadUrlPdf = getDownloadURL(uploadTaskFile.snapshot.ref);

                Promise.all([downloadUrlFoto, downloadUrlPdf]).then(valuesUpload => {

                    const restauranteRef = doc(database, "restaurantes", newRestaurant.id);
                    updateDoc(restauranteRef, {
                        foto: valuesUpload[0],
                        menu: valuesUpload[1]
                    }).then(() => {
                        alert("Agregado correctamente");
                        $("#exampleModal").modal('hide');
                        cargarRestaurantes();
                    }).catch(error => {
                        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                        document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
                    });
                });

            } else {
                document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Ocurrio un error al cargar datos";
            }

        }).catch((error) => {
            document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
            document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
        });

    }).catch(error => {
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
    });
}

window.eliminar = function eliminar(idRestaurante) {
    const restauranteRef = doc(database, "restaurantes", idRestaurante);
    updateDoc(restauranteRef, {
        visible: false
    }).then(() => {
        alert("Restaurante eliminado correctamente");
        cargarRestaurantes();
    }).catch((error) => {
        alert("Ha occurido un error inesperado al eliminar el restaurante");
    });
}