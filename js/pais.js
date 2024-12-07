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
  #generarArticulos() {
    // Eliminamos de la sección la información de la previsión ya existente
    $("main section:last-of-type").find("article, p").remove();
    // Y la volvemos a generar.
    let parrafoRangoFechas = document.createElement("p");
    parrafoRangoFechas.textContent = this.#generarMensajeRangoFechas();
    $("main section:last-of-type").append(parrafoRangoFechas)
    //Añadimos las previsiones como artículos
    this.pronosticosDiarios.forEach((pronostico) => {
      $("main section:last-of-type").append(pronostico.generarArticulo());
    });
  }

  #generarMensajeError() {
    // Eliminamos de la sección la información de la previsión ya existente
    $("main section:last-of-type").find("article, p").remove();
    // Y añadimos el mensaje de error .
    let parrafoError = document.createElement("p");
    parrafoError.innerHTML = "¡Tenemos problemas! No se pudo obtener información sobre la previsión de <a href='http://openweathermap.org'>OpenWeatherMap</a>";
    $("main section:last-of-type").append(parrafoError); 
  }

  #generarMensajeRangoFechas() {
    let fechaInicioDatos = new Date(this.pronosticosDiarios[0].inicioDatos).toLocaleDateString("es-ES");
    let horaInicioDatos = new Date(this.pronosticosDiarios[0].inicioDatos).toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let fechaFinDatos = new Date(this.pronosticosDiarios[this.pronosticosDiarios.length - 1].finDatos).toLocaleDateString("es-ES");
    let horaFinDatos = new Date(this.pronosticosDiarios[this.pronosticosDiarios.length - 1].finDatos).toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let texto = "Obtenidos datos desde el día " + fechaInicioDatos + " a las " + horaInicioDatos;
    texto += " hasta el día " + fechaFinDatos + " a las " + horaFinDatos;
    return texto;
  }
}

class PronosticoDiario {
  constructor(pronosticos, intervaloPrincipal) {
    this.pronosticos = pronosticos;
    this.intervaloPrincipal = intervaloPrincipal;
    this.pronosticoPrincipal = pronosticos[intervaloPrincipal];
    this.inicioDatos = $(pronosticos[0]).attr("from");
    this.finDatos = $(pronosticos).last().attr("to");
    this.icono = "https://openweathermap.org/img/wn/" + $("symbol", this.pronosticoPrincipal).attr("var") + "@4x.png";
    this.descripcionIcono = $("symbol", this.pronosticoPrincipal).attr("name");
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

  generarArticulo() {
    // Encabezado con la fecha de la previsión
    let h4 = document.createElement("h4");
    h4.textContent = new Date(this.inicioDatos).toLocaleDateString("es-ES");
    // Icono
    let img = document.createElement("img");
    img.setAttribute("src", this.icono);
    img.setAttribute("alt", this.descripcionIcono);
    // Datos meteorológicos en párrafos
    // Temperatura
    let p1 = document.createElement("p");
    p1.textContent = "Temperatura: " + this.temperatura + " ºC";
    // Temperatura mínima
    let p2 = document.createElement("p");
    p2.textContent = "Temperatura mínima: " + this.temperaturaMinima + " ºC";
    // Temperatura máxima
    let p3 = document.createElement("p");
    p3.textContent = "Temperatura máxima: " + this.temperaturaMaxima + " ºC";
    // Sensación termica
    let p4 = document.createElement("p");
    p4.textContent = "Sensación térmica: " + this.sensacionTermica + " ºC";
    // Porcentaje de humedad
    let p5 = document.createElement("p");
    p5.textContent = "Humedad: " + this.porcentajeHumedad + " %";
    // Precipitación
    let p6 = document.createElement("p");
    p6.textContent = "Precipitacion acumulada: " + this.lluvia + " mm";
    // Rango de las previsiones
    let p7 = document.createElement("p");
    if (this.pronosticos.length < 8) {
      let horaInicioDatos = new Date(this.inicioDatos).toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      let horaFinDatos = new Date(this.finDatos).toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      p7.textContent = "Datos desde las " + horaInicioDatos + " hasta las " + horaFinDatos;
    } else {
      p7.textContent = "Datos de todo el día";
    }

    //Creamos el artículo y componemos todos los elementos dentro.
    let article = document.createElement("article");
    article.appendChild(h4);
    article.appendChild(img);
    article.appendChild(p1);
    article.appendChild(p2);
    article.appendChild(p3);
    article.appendChild(p4);
    article.appendChild(p5);
    article.appendChild(p6);
    article.appendChild(p7);
    return article;
  }
}

let canada = new Pais("Canada", "Ottawa", 40381196);
canada.completarDatos("Monarquía parlamentaria", "Cristianismo", "Gilles Villeneuve", -73.52271782342224, 45.50010458094061);
