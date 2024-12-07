"use strict";
class Pais {
  constructor(nombre, capital, poblacion) {
    this.nombrePais = nombre;
    this.capital = capital;
    this.poblacion = poblacion;
    this.pronosticosDiarios = [];
  }
  completarDatos(formaGobierno, religion, nombreCircuito, longitud, latitud) {
    this.latitud = latitud;
    this.formaGobierno = formaGobierno;
    this.religion = religion;
    this.nombreCircuito = nombreCircuito;
    this.longitud = longitud;
  }
  getNombrePais() {
    return this.nombrePais;
  }
  getCapital() {
    return this.capital;
  }
  getPoblacion() {
    return this.poblacion;
  }
  getFormaGobierno() {
    return this.formaGobierno;
  }
  getReligion() {
    return this.religion;
  }
  getInformacionSecundaria() {
    let output = "<ul>";
    output += "<li>Población: " + this.poblacion + "</li>";
    output += "<li>Forma de gobierno: " + this.formaGobierno + "</li>";
    output += "<li>Religión Mayoritaria: " + this.religion + "</li>";
    output += "<li>Nombre del circuito: " + this.nombreCircuito + "</li>";
    output += "</ul>";
    return output;
  }
  escribeCoordenadasMeta() {
    document.write("<p>" + "Las coordenadas de la línea de meta son ");
    document.write("Latitud: " + this.latitud + ", Longitud: " + this.longitud + "</p>");
  }

  getLatitud() {
    return this.latitud;
  }

  getLongitud() {
    return this.longitud;
  }

  getPrevisionMeteorologica() {
    let lat = "lat=" + this.latitud;
    let long = "&lon=" + this.longitud;
    let APIKey = "&appid=60a4a544be5876f5f553c8b7ddd64f5a";
    let formatoRespuesta = "&mode=xml";
    let unidades = "&units=metric";
    let idioma = "&lang=es";
    let urlPeticion = "http://api.openweathermap.org/data/2.5/forecast?" + lat + long + APIKey + formatoRespuesta + unidades + idioma;
    let thisPrevisionMeteorologica = this; // Guardamos el contexto de 'this'
    $.ajax({
      dataType: "xml",
      url: urlPeticion,
      method: "GET",
      success: function (respuesta) {
        //console.log("Datos en bruto:");
        //console.log(respuesta);
        //console.log("Datos serializados:");
        //console.log(new XMLSerializer().serializeToString(respuesta));
        thisPrevisionMeteorologica.#procesarDatos(respuesta);
        //console.log("Imprimimos array objetos pronosticosDiarios:");
        //this.pronosticosDiarios.forEach((pronostico) => {
        //  console.log(pronostico);
        //});
        thisPrevisionMeteorologica.#procesarDatos(respuesta);
        thisPrevisionMeteorologica.#generarArticulos();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Sacamos el error por consola.
        console.error("Error:", textStatus, errorThrown);
        thisPrevisionMeteorologica.#generarMensajeError();
      },
    });
  }

  #procesarDatos(respuesta) {
    //Obtenemos la lista de pronósticos del XML.
    let pronosticosXML = $("time", respuesta);
    //Determinamos en que intervalo horario comienzan los datos.
    let cadenaHoraInicioDatos = $(pronosticosXML[0]).attr("from");
    let horaInicioDatos = new Date(cadenaHoraInicioDatos).getHours();
    //Los datos se dividen en intervalos de 3 horas.
    let intervaloInicial = Math.trunc(horaInicioDatos / 3);
    let numeroIntervalosPrimerDia = 8 - intervaloInicial;
    let numeroIntervalosUltimoDia = 8 - numeroIntervalosPrimerDia;
    let primerDia = new PronosticoDiario(pronosticosXML.slice(0, numeroIntervalosPrimerDia), 0);
    this.pronosticosDiarios.push(primerDia);
    for (let i = 0; i < 4; i++) {
      let inicioArray = i * 8 + numeroIntervalosPrimerDia;
      this.pronosticosDiarios.push(new PronosticoDiario(pronosticosXML.slice(inicioArray, inicioArray + 8), intervaloInicial));
    } //Si el intervalo inicial es entre las 00:00 y las 03:00 solo se tienen datos de 5 días.
    if (numeroIntervalosUltimoDia > 0) {
      let ultimoDia = new PronosticoDiario(pronosticosXML.slice(pronosticosXML.length - numeroIntervalosUltimoDia), numeroIntervalosUltimoDia - 1);
      this.pronosticosDiarios.push(ultimoDia);
    }
  }
  #generarArticulos(){
    
  }
  #generarMensajeError(){

  }
}

class PronosticoDiario {
  constructor(pronosticos, intervaloPrincipal) {
    this.pronosticos = pronosticos;
    this.intervaloPrincipal = intervaloPrincipal;
    this.pronosticoPrincipal = pronosticos[intervaloPrincipal];
    this.inicioDatos = $(pronosticos[0]).attr("from");
    this.finDatos = $(pronosticos).last().attr("to");
    this.icono = "https://openweathermap.org/img/wn/" + $("symbol", this.pronosticoPrincipal).attr("var") + "@2x.png";
    this.temperatura = $("temperature", this.pronosticoPrincipal).attr("value");
    this.temperaturaMaxima = $("temperature", this.pronosticoPrincipal).attr("max");
    this.temperaturaMinima = $("temperature", this.pronosticoPrincipal).attr("min");
    this.sensacionTermica = $("feels_like", this.pronosticoPrincipal).attr("value");
    this.porcentajeHumedad = $("humidity", this.pronosticoPrincipal).attr("value");
    this.lluvia = this.#calcularAcumuladoLluvia(pronosticos);
  }

  #calcularAcumuladoLluvia(pronosticos) {
    let precipitacionAcumulada = new Number(0.0);
    pronosticos.each(function (index, pronostico) {
      if ($("precipitation", pronostico).attr("probability") != "0") {
        let precipitacion = Number.parseFloat($("precipitation", pronostico).attr("value"));
        //Acumulamos la precipitación solo si el dato de precipitación es válido.
        if (!Number.isNaN(Number(precipitacion))) {
          precipitacionAcumulada += precipitacion;
        }
      }
    });
    return precipitacionAcumulada.toFixed(2);
  }
}

let canada = new Pais("Canada", "Ottawa", 40381196);
canada.completarDatos("Monarquía parlamentaria", "Cristianismo", "Gilles Villeneuve", -73.52271782342224, 45.50010458094061);
