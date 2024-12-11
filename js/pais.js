"use strict";
class Pais {
  constructor(nombre, capital, poblacion) {
    this.nombrePais = nombre;
    this.capital = capital;
    this.poblacion = poblacion;
    this.pronosticosDiarios = [];
  }
  completarDatos(formaGobierno, religion, nombreCircuito, latitud, longitud) {
    this.formaGobierno = formaGobierno;
    this.religion = religion;
    this.nombreCircuito = nombreCircuito;
    this.latitud = latitud;
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
    output += "<li>Población: " + this.poblacion + " habitantes </li>";
    output += "<li>Forma de gobierno: " + this.formaGobierno + "</li>";
    output += "<li>Religión Mayoritaria: " + this.religion + "</li>";
    output += "<li>Nombre del circuito: " + this.nombreCircuito + "</li>";
    output += "</ul>";
    return output;
  }
  escribeCoordenadasMeta() {
    document.write("<p>" + "Las coordenadas de la línea de meta son: ");
    document.write(this.#getCoordenadasLegibles() + ".</p>");
  }

  getLatitud() {
    return this.latitud;
  }

  getLongitud() {
    return this.longitud;
  }

  #getCoordenadasLegibles() {
    function aGMS(coordenada) {
      const grados = Math.floor(Math.abs(coordenada));
      const minutosFloat = (Math.abs(coordenada) - grados) * 60;
      const minutos = Math.floor(minutosFloat);
      const segundos = Math.round((minutosFloat - minutos) * 60);
      return { grados, minutos, segundos };
    }

    const latDMS = aGMS(this.latitud);
    const lonDMS = aGMS(this.longitud);

    const latDireccion = this.latitud >= 0 ? "Norte" : "Sur";
    const lonDireccion = this.longitud >= 0 ? "Este" : "Oeste";

    let mensaje = `latitud ${latDMS.grados}º ${latDMS.minutos}' ${latDMS.segundos}" ${latDireccion}`
    mensaje +=`, longitud ${lonDMS.grados}º ${lonDMS.minutos}' ${lonDMS.segundos} ${lonDireccion}`

    return mensaje;
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
    $("main > section:last-of-type").find("article, p").remove();
    // Y la volvemos a generar.
    // Primero los párrafos que describen los pronósticos
    let parrafosDescripcionPronosticos = this.#generarParrafosDescripcionPronosticos();
    parrafosDescripcionPronosticos.forEach((parrafo) => {
      $("main > section:last-of-type").append(parrafo);
    });
    //Y luego se añaden las previsiones de cada dia como artículos
    this.pronosticosDiarios.forEach((pronostico) => {
      $("main > section:last-of-type").append(pronostico.getArticulo());
    });
  }

  #generarMensajeError() {
    // Eliminamos de la sección la información de la previsión ya existente
    $("main > section:last-of-type").find("article, p").remove();
    // Y añadimos el mensaje de error .
    let parrafoError = document.createElement("p");
    parrafoError.innerHTML =
      "¡Tenemos problemas! No se pudo obtener información sobre la previsión de <a href='http://openweathermap.org'>OpenWeatherMap</a>";
    $("main > section:last-of-type").append(parrafoError);
  }

  #generarParrafosDescripcionPronosticos() {
    let parrafos = [];
    let dateInicioDatos = new Date(this.pronosticosDiarios[0].inicioDatos);
    let dateFinDatos = new Date(this.pronosticosDiarios[this.pronosticosDiarios.length - 1].finDatos);
    let dateHoraFinPronostico = new Date(dateInicioDatos);
    dateHoraFinPronostico.setHours(dateInicioDatos.getHours() + 3);
    let dateHoraInicioPronosticoUltimoDia = new Date(dateFinDatos);
    dateHoraInicioPronosticoUltimoDia.setHours(dateFinDatos.getHours() - 3);
    let fechaInicioDatos = dateInicioDatos.toLocaleDateString("es-ES");
    let fechaFinDatos = dateFinDatos.toLocaleDateString("es-ES");
    let horaInicioDatos = dateInicioDatos.toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let horaFinDatos = dateFinDatos.toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let horaInicioPronostico = horaInicioDatos;
    let horaFinPronostico = dateHoraFinPronostico.toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let parrafoRangoDatos = document.createElement("p");
    parrafoRangoDatos.textContent = "Datos obtenidos desde el día " + fechaInicioDatos + " a las " + horaInicioDatos;
    parrafoRangoDatos.textContent += " hasta el día " + fechaFinDatos + " a las " + horaFinDatos + ".";
    parrafos.push(parrafoRangoDatos);

    let parrafoHorasPronosticos = document.createElement("p");
    parrafoHorasPronosticos.textContent = "Los datos mostrados corresponden a la previsión entre las ";
    parrafoHorasPronosticos.textContent += horaInicioPronostico + " y las " + horaFinPronostico + " horas.";
    parrafos.push(parrafoHorasPronosticos);
    //Si hay datos de 6 días el rango horario del último día es diferente.
    if (this.pronosticosDiarios.length == 6) {
      let horaInicioPronosticoUltimoDia = dateHoraInicioPronosticoUltimoDia.toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      let horaFinPronosticoUltimoDia = horaFinDatos;
      let parrafoUltimoDia = document.createElement("p");
      parrafoUltimoDia.textContent = "El último día los datos son de la previsión entre las " + horaInicioPronosticoUltimoDia;
      parrafoUltimoDia.textContent += " y las " + horaFinPronosticoUltimoDia + " horas.";
      parrafos.push(parrafoUltimoDia);
    }
    let parrafoPrecipitacionAcumulada = document.createElement("p");
    parrafoPrecipitacionAcumulada.textContent =
      "La precipitación acumulada corresponde al total diario. Si los datos del día no están completos se especificará la franja horaria.";
    parrafos.push(parrafoPrecipitacionAcumulada);
    return parrafos;
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
    this.iconoGrande = "https://openweathermap.org/img/wn/" + $("symbol", this.pronosticoPrincipal).attr("var") + "@4x.png";
    this.descripcionIcono = $("symbol", this.pronosticoPrincipal).attr("name");
    this.temperatura = $("temperature", this.pronosticoPrincipal).attr("value");
    this.temperaturaMaxima = $("temperature", this.pronosticoPrincipal).attr("max");
    this.temperaturaMinima = $("temperature", this.pronosticoPrincipal).attr("min");
    this.sensacionTermica = $("feels_like", this.pronosticoPrincipal).attr("value");
    this.probabilidadPrecipitacion = $("precipitation", this.pronosticoPrincipal).attr("probability");
    if (this.probabilidadPrecipitacion != "0") {
      this.valorPrecipitacion = $("precipitation", this.pronosticoPrincipal).attr("value");
      this.tipoPrecipitacion = $("precipitation", this.pronosticoPrincipal).attr("type");
    } else {
      this.valorPrecipitacion = "0";
      this.tipoPrecipitacion = "-";
    }
    this.precipitacionAcumulada = this.#calcularAcumuladoLluvia(pronosticos);
    this.porcentajeHumedad = $("humidity", this.pronosticoPrincipal).attr("value");
    this.presion = $("pressure", this.pronosticoPrincipal).attr("value");
    this.velocidadViento = $("windSpeed", this.pronosticoPrincipal).attr("mps");
    this.velocidadRafagaViento = $("windGust", this.pronosticoPrincipal).attr("gust");
  }

  getArticulo() {
    // Encabezado con la fecha de la previsión
    let h4 = document.createElement("h4");
    h4.textContent = new Date(this.inicioDatos).toLocaleDateString("es-ES");
    let icono = this.#generarFigureIcono();
    // Datos meteorológicos
    // * Sección temperatura
    let seccionTemperatura = this.#generarSeccionTemperatura();
    // * Sección precipitación
    let seccionPrecipitacion = this.#generarSeccionPrecipitacion();
    // Sección Otros datos
    let seccionOtros = this.#generarSeccionOtros();
    //Creamos el artículo y componemos todos los elementos dentro.
    let article = document.createElement("article");
    article.appendChild(h4);
    article.appendChild(icono);
    article.appendChild(seccionTemperatura);
    article.appendChild(seccionPrecipitacion);
    article.appendChild(seccionOtros);
    return article;
  }

  #generarFigureIcono() {
    // Crear el elemento <figure>
    let figure = document.createElement("figure");
    // Crear el elemento <picture>
    let picture = document.createElement("picture");
    // Crear las alternativas <source> para el <picture>
    const sourceLarge = document.createElement("source");
    sourceLarge.setAttribute("media", "(min-width: 1000px)");
    sourceLarge.setAttribute("srcset", this.iconoGrande);
    const sourceSmall = document.createElement("source");
    sourceSmall.setAttribute("media", "(max-width: 999px)");
    sourceSmall.setAttribute("srcset", this.icono);
    // Crear la imagen predeterminada para el <picture>
    let img = document.createElement("img");
    img.setAttribute("src", this.icono);
    img.setAttribute("alt", "Icono que representa " + this.descripcionIcono);
    // Añadir los elementos <source> y <img> al <picture>
    picture.appendChild(sourceLarge);
    picture.appendChild(sourceSmall);
    picture.appendChild(img);
    // Crear el <figcaption> con la descripción
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = this.descripcionIcono.toUpperCase();
    // Añadir <figcaption> y <picture> al <figure>
    figure.appendChild(figcaption);
    figure.appendChild(picture);
    // Devolvemos la figura.
    return figure;
  }

  #generarSeccionTemperatura() {
    let h5 = document.createElement("h5");
    h5.textContent = "Temperatura";
    let p1 = document.createElement("p");
    p1.textContent = "Valor: " + this.temperatura + " ºC";
    // Temperatura mínima
    let p2 = document.createElement("p");
    p2.textContent = "Mínima: " + this.temperaturaMinima + " ºC";
    // Temperatura máxima
    let p3 = document.createElement("p");
    p3.textContent = "Máxima: " + this.temperaturaMaxima + " ºC";
    // Sensación termica
    let p4 = document.createElement("p");
    p4.textContent = "Sensación térmica: " + this.sensacionTermica + " ºC";
    let seccion = document.createElement("section");
    seccion.appendChild(h5);
    seccion.appendChild(p1);
    seccion.appendChild(p2);
    seccion.appendChild(p3);
    seccion.appendChild(p4);
    return seccion;
  }

  #generarSeccionPrecipitacion() {
    let h5 = document.createElement("h5");
    h5.textContent = "Precipitación";
    // Valor
    let p1 = document.createElement("p");
    p1.textContent = "Valor: " + this.valorPrecipitacion + " mm";
    //Probabilidad de precipitación
    let probabilidad = Number.parseFloat(this.probabilidadPrecipitacion) * 100;
    let p2 = document.createElement("p");
    p2.textContent = "Probabilidad: " + probabilidad.toFixed(2) + " %";
    // Tipo de precipitación
    let p3 = document.createElement("p");
    if (this.tipoPrecipitacion == "rain") {
      p3.textContent = "Tipo: " + "lluvia";
    } else if (this.tipoPrecipitacion == "snow") {
      p3.textContent = "Tipo: " + "nieve";
    } else {
      p3.textContent = "Tipo: " + this.tipoPrecipitacion;
    }
    // Precipitación acumulada
    let p4 = document.createElement("p");
    p4.textContent = "Acumulada: " + this.precipitacionAcumulada + " mm";
    // Rango de las previsiones
    let p5 = document.createElement("p");
    if (this.pronosticos.length < 8) {
      let horaInicioDatos = new Date(this.inicioDatos).toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      let horaFinDatos = new Date(this.finDatos).toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      p5.textContent = "(Acumulado desde las " + horaInicioDatos + " hasta las " + horaFinDatos + ")";
    }

    let seccion = document.createElement("section");
    seccion.appendChild(h5);
    seccion.appendChild(p1);
    seccion.appendChild(p2);
    seccion.appendChild(p3);
    seccion.appendChild(p4);
    if (this.pronosticos.length < 8) {
      seccion.appendChild(p5);
    }
    return seccion;
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

  #generarSeccionOtros() {
    let h5 = document.createElement("h5");
    h5.textContent = "Otros";
    let p1 = document.createElement("p");
    p1.textContent = "Humedad: " + this.porcentajeHumedad + " %";
    // Temperatura mínima
    let p2 = document.createElement("p");
    p2.textContent = "Presión : " + this.presion + " hPa";
    // Temperatura máxima
    let p3 = document.createElement("p");
    p3.textContent = "Viento: " + this.velocidadViento + " m/s";
    // Sensación termica
    let p4 = document.createElement("p");
    p4.textContent = "Ráfaga: " + this.velocidadRafagaViento + " m/s";
    let seccion = document.createElement("section");
    seccion.appendChild(h5);
    seccion.appendChild(p1);
    seccion.appendChild(p2);
    seccion.appendChild(p3);
    seccion.appendChild(p4);
    return seccion;
  }
}

let canada = new Pais("Canada", "Ottawa", "40.381.196");
canada.completarDatos("Monarquía parlamentaria", "Cristianismo", "Gilles Villeneuve", 45.50010458094061, -73.52271782342224);
