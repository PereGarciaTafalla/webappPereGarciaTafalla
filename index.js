let validat = false;
let nom, contrasenya;
let scriptURL = "https://script.google.com/macros/s/AKfycbyHa4Q8TbuIMnbDo6Fj7mpzyHT0QTaT5nen3uuUstWo90H0cH9mrO85Zggl7wwXXDB0/exec";

function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length - 1; // L'últim és el logout
    for (let i = 1; i <= num_botons; i++) {
        let boto = document.getElementById("boto_" + i);
        let seccio = document.getElementById("seccio_" + i);
        if (i === num_boto) {
            boto.classList.add('active');
            boto.style.color = "#950E17";
            boto.style.backgroundColor = "#FCDEE0";
            seccio.style.display = "block";
        } else {
            boto.classList.remove('active');
            boto.style.color = "white";
            boto.style.backgroundColor = "#950E17";
            seccio.style.display = "none";
        }
    }
    document.getElementById("superior").classList.remove("ocult");
    document.getElementById("menu").style.display = "flex";
    document.getElementById("div_gran").style.display = "none";
}

function validacio_sessio() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&where=usuari&is=" + nom + "&and=contrasenya&equal=" + contrasenya;
    fetch(consulta)
        .then((resposta) => resposta.json())
        .then((resposta) => {
            if(resposta.length === 0) {
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            } else {
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();
            }
        });
}

function inicia_sessio() {
    validat = true;
    document.getElementById("seccio_0").style.display = "none";
    canvia_seccio(1);
}

function nou_usuari() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = scriptURL + "?query=select&where=usuari&is=" + nom;
    fetch(consulta_1)
        .then((resposta) => resposta.json())
        .then((resposta) => {
            if(resposta.length === 0) {
                let consulta_2 = scriptURL + "?query=insert&values=" + nom + "$$" + contrasenya;
                fetch(consulta_2)
                    .then((resposta) => {
                        if (resposta.ok) {
                            window.alert("S'ha completat el registre d'usuari.");
                            inicia_sessio();
                        } else {
                            alert("S'ha produït un error en el registre d'usuari.");
                        }
                    });
            } else {
                alert("Ja existeix un usuari amb aquest nom.");
            }
        });
}

window.onload = () => {
    let base_de_dades = localStorage.getItem("base_de_dades");
    if(base_de_dades == null) {
        indexedDB.open("Dades").onupgradeneeded = event => {
            event.target.result.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true}).createIndex("Usuari_index", "Usuari");
        };
        localStorage.setItem("base_de_dades","ok");
    }
    document.getElementById("obturador").addEventListener("change", function() {
        if(this.files[0] !== undefined) {
            let canvas = document.getElementById("canvas");
            let context = canvas.getContext("2d");
            let imatge = new Image();
            imatge.src = URL.createObjectURL(this.files[0]);
            imatge.onload = () => {
                canvas.width = imatge.width;
                canvas.height = imatge.height;
                context.drawImage(imatge,0,0,imatge.width,imatge.height);
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");
                document.getElementById("icona_camera").style.display = "none";
                document.getElementById("desa").style.display = "inline-block";
            };
        }
    });
};

function desa_foto() {
    let nou_registre = {
        Usuari: nom,
        Data: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString(),
        Foto: document.getElementById("foto").src
    };
    indexedDB.open("Dades").onsuccess = event => {
        event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").add(nou_registre).onsuccess = () => {
            document.getElementById("desa").style.display = "none";
            alert("La foto s'ha desat correctament.");
        };
    };
}

function mostra_foto(id) {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let imatge = new Image();
    if (id == 0) {
        document.getElementById("seccio_2").style.display = "none";
        imatge.src = document.getElementById("foto").src;
    } else {
        indexedDB.open("Dades").onsuccess = event => {
            event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").get(id).onsuccess = event2 => {
                document.getElementById("seccio_3").style.display = "none";
                imatge.src = event2.target.result["Foto"];
            };
        };
    }
    imatge.onload = () => {
        if (imatge.width > imatge.height) {
            canvas.width = imatge.height;
            canvas.height = imatge.width;
            context.translate(imatge.height, 0);
            context.rotate(Math.PI / 2);
        } else {
            canvas.width = imatge.width;
            canvas.height = imatge.height;
        }
        context.drawImage(imatge,0,0,imatge.width,imatge.height);
        document.getElementById("foto_gran").src = canvas.toDataURL("image/jpeg", 0.5);
    };
    document.getElementById("superior").classList.add("ocult");
    document.getElementById("menu").style.display = "none";
    document.getElementById("div_gran").style.display = "flex";
}

function tanca_foto_gran() {
    document.getElementById("div_gran").style.display = "none";
    document.getElementById("superior").classList.remove("ocult");
    document.getElementById("menu").style.display = "flex";
}
