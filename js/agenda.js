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
    console.log("Respuesta completa");
    console.log(JSON.stringify(datos, null, 2));
    // Obtener la lista de carrejas del JSON
    let carrerasJSON = datos.MRData.RaceTable.Races;
    console.log(JSON.stringify(carrerasJSON, null, 2));
    //Creamos los objetos carrera a partir del JSON
    for (const element of carrerasJSON) {
      this.carreras.push(new Carrera(element));
    }
  }
  #generarArticulos() {
    // Eliminamos la información ya existente de las carreras
    $("main").find("article, p").remove();
    // Y la volvemos a generar.
    this.carreras.forEach((carrera) => {
      $("main").append(carrera.getArticulo());
    });
  }

  #generarMensajeError() {
    // Eliminamos de la sección la información de la previsión ya existente
    $("main").find("article, p").remove();
    // Y añadimos el mensaje de error .
    let parrafoError = document.createElement("p");
    parrafoError.innerHTML =
      "¡Tenemos problemas! No se pudo obtener información sobre la previsión de <a href='https://api.jolpi.ca/ergast/f1/current/?format=json'>Jolpica F1</a>";
    $("main > section:last-of-type").append(parrafoError);
  }
}

class Carrera {
  constructor(datosCarreraJSON) {
    this.numeroCarrera = datosCarreraJSON.round;
    this.nombreCarrera = datosCarreraJSON.raceName;
    this.urlCarrera = datosCarreraJSON.url;
    this.dateFechaCarrera = new Date(datosCarreraJSON.date + "T" + datosCarreraJSON.time);
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
    // Encabezado
    let aCarrera = document.createElement("a");
    aCarrera.setAttribute("href", this.urlCarrera);
    aCarrera.textContent = this.numeroCarrera + "." + this.nombreCarrera;
    let h3 = document.createElement("h3");
    h3.appendChild(aCarrera);
    //Fecha y hora
    let h4Horario = document.createElement("h4");
    h4Horario.textContent = "Horario";
    let pFecha = document.createElement("p");
    pFecha.textContent = "Fecha: " + this.fechaCarrera;
    let pHora = document.createElement("p");
    pHora.textContent = "Hora: " + this.horaCarrera;
    let seccionHorario = document.createElement("section");
    seccionHorario.appendChild(h4Horario);
    seccionHorario.appendChild(pFecha);
    seccionHorario.appendChild(pHora);
    //Circuito
    let aCircuito = document.createElement("a");
    aCircuito.setAttribute("href", this.urlCircuito);
    aCircuito.textContent = this.nombreCircuito;
    let h4Circuito = document.createElement("h4");
    h4Circuito.appendChild(aCircuito);
    let pLatitud = document.createElement("p");
    pLatitud.textContent = "Latitud: " + this.#getLatitudGMS(this.latitudCircuito);
    console.log(this.latitudCircuito);
    console.log(Number.parseFloat(this.latitudCircuito));
    let pLongitud = document.createElement("p");
    pLongitud.textContent = "Longitud: " + this.#getLongitudGMS(this.longitudCircuito);
    let seccionCircuito = document.createElement("section");
    seccionCircuito.appendChild(h4Circuito);
    seccionCircuito.appendChild(pLatitud);
    seccionCircuito.appendChild(pLongitud);
    //Creamos el artículo y componemos todos los elementos dentro.
    let article = document.createElement("article");
    article.appendChild(h3);
    article.appendChild(seccionHorario);
    article.appendChild(seccionCircuito);
    return article;
  }

  #aGMS(coordenada) {
    const grados = Math.floor(Math.abs(coordenada));
    const minutosFloat = (Math.abs(coordenada) - grados) * 60;
    const minutos = Math.floor(minutosFloat);
    const segundos = Math.round((minutosFloat - minutos) * 60);
    return { grados, minutos, segundos };
  }

  #getLatitudGMS(latitud) {
    const latDMS = this.#aGMS(Number.parseFloat(latitud));
    const latDireccion = this.latitud >= 0 ? "Norte" : "Sur";
    return `${latDMS.grados}º ${latDMS.minutos}' ${latDMS.segundos}" ${latDireccion}`;
  }

  #getLongitudGMS(longitud) {
    const lonDMS = this.#aGMS(Number.parseFloat(longitud));
    const lonDireccion = this.longitud >= 0 ? "Este" : "Oeste";
    return `${lonDMS.grados}º ${lonDMS.minutos}' ${lonDMS.segundos}" ${lonDireccion}`;
  }
}

let agenda = new Agenda();
