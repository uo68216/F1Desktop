class Agenda {
  constructor() {
    this.url = "https://api.jolpi.ca/ergast/f1/current/?format=json";
    this.carreras = [];
  }

  getAgendaCarreras() {
    let thisGetAgendaCarreras = this; // Guardamos el contexto de 'this'
    $.ajax({
      dataType: "json",
      url: thisGetAgendaCarreras.url,
      method: "GET",
      success: function (datos) {
        thisGetAgendaCarreras.#procesarDatos(datos);
        thisGetAgendaCarreras.#generarArticulos();
      },
      error: function (xhr, status, error) {
        // Sacamos el error por consola.
        console.error("Error:", status, error);
        thisGetAgendaCarreras.#generarMensajeError();
      },
    });
  }

  #procesarDatos(datos) {
    //console.log ("Respuesta completa")
    //console.log(JSON.stringify(datos, null, 2));
    // Obtener la lista de carrejas del JSON
    let carrerasJSON = datos.MRData.RaceTable.Races;
    console.log(JSON.stringify(carrerasJSON, null, 2));
    //Creamos los objetos carrera a partir del JSON
    for (const element of carrerasJSON) {
        this.carreras.push(new Carrera(element))    ;
    }

    console.log(this.carreras); 
  }
  #generarArticulos() {
    console.log("Pendiente");
  }

  #generarMensajeError() {
    console.log("Pendiente");
  }
}

class Carrera {
  constructor(datosCarreraJSON) {
    this.numeroCarrera = datosCarreraJSON.round;
    this.nombreCarrera = datosCarreraJSON.raceName;
    this.urlCarrera = datosCarreraJSON.url;
    this.dateFechaCarrera = new Date(datosCarreraJSON.date+"T"+datosCarreraJSON.time);
    this.fechaCarrera = this.dateFechaCarrera.toLocaleDateString("es-ES");
    this.horaCarrera = this.dateFechaCarrera.toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    this.nombreCircuito = datosCarreraJSON.Circuit.circuitName;
    this.urlCircuito = datosCarreraJSON.Circuit.url;
    this.latitudCircuito = datosCarreraJSON.Circuit.Location.lat;
    this.longitudCircuito = datosCarreraJSON.Circuit.Location.long;
    }

  getArticulo() {
    // PTE
    let h4 = document.createElement("h4");
    h4.textContent = this.nombreCarrera;

    //Creamos el artículo y componemos todos los elementos dentro.
    let article = document.createElement("article");
    article.appendChild(h4);
    return article;
  }
}

let agenda = new Agenda();
