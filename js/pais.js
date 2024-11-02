"use strict";
class Pais {
    constructor (nombre, capital, poblacion){
        this.nombre=nombre;
        this.capital=capital;
        this.poblacion=poblacion;
    }
    completarDatos(nombreCircuito, longitud, latitud, formaGobierno,religion){
        this.nombreCircuito=nombreCircuito;
        this.longitud=longitud;
        this.latitud=latitud;
        this.formaGobierno=formaGobierno;
        this.religion=religion;
    }
    getNombre(){
        return this.nombre;
    }
    getCapital(){
        return this.capital;
    }
    getPoblacion(){
        return this.poblacion;
    }
    getFormaGobierno(){
        return this.formaGobierno;
    }
    getReligion(){
        return this.religion;
    }
    getInformacionSecundaria(){
        let output = "<ul>";
        output += "<li>Nombre del circuito: " + this.nombreCircuito + "</li>";
        output += "<li>Población: " + this.poblacion + "</li>";
        output += "<li>Forma de gobierno: " + this.formaGobierno + "</li>";
        output += "<li>Religión Mayoritaria: " + this.religion + "</li>";
        output += "</ul>";
        return output;
    }
    escribeCoordenadasMeta(){
        document.write("Latitud: "+this.latitud + " Longitud: "+this.longitud);
    }

    getLatitud(){
        return this.latitud;
    }

    getLongitud(){
        return this.longitud;
    }
}
var Canada = new Pais("Canada","Ottawa",40381196);
Canada.completarDatos("Gilles Villeneuve",-73.52271782342224,45.50010458094061,"Monarquía parlamentaria","Cristianismo")
