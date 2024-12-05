"use strict";
class Pais {
  constructor(nombre, capital, poblacion) {
    this.nombrePais = nombre;
    this.capital = capital;
    this.poblacion = poblacion;
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
    document.write("<p>" + "Las coordenadas de la línea de meta son ")
    document.write("Latitud: " + this.latitud + ", Longitud: " + this.longitud + "</p>");
  }

  getLatitud() {
    return this.latitud;
  }

  getLongitud() {
    return this.longitud;
  }
}

let canada = new Pais("Canada", "Ottawa", 40381196);
canada.completarDatos("Monarquía parlamentaria", "Cristianismo", "Gilles Villeneuve", -73.52271782342224, 45.50010458094061 );
