"use strict";
class Fondo {
  constructor(pais, capital, circuito) {
    this.pais = pais;
    this.capital = capital;
    this.circuito = circuito;
    //Fondo por defecto si no se pueden recuperar imágenes de flickr
    this.url = "multimedia/imagenes/Fondo-Por-Defecto.jpg";
  }
  getImagenFondo() {
    let flickrAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
    //Se omite a propósito la capital. Salían fotos no relacionadas con el tema de la práctica.
    let cadenaTags = '"circuit ' + this.circuito + '","' + this.pais + '"';
    let thisGetImagenFondo = this; // Guardamos el contexto de 'this'
    $.getJSON(flickrAPI, {
      tags: cadenaTags,
      tagmode: "all",
      format: "json",
    })
      .done(function (data) {
        //Comprobamos si se han devuelto imágenes
        if (data.items.length > 0) {
          //Seleccionamos al azar una de las imágenes devueltas
          let numeroAleatorio = Math.floor(Math.random() * data.items.length);
          thisGetImagenFondo.url = data.items[numeroAleatorio].media.m;
          thisGetImagenFondo.url = thisGetImagenFondo.url.replace('_m','_b');
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        // Mostramos los errores en la solicitud AJAX
        console.error("Error al consultar los datos en Flickr:", textStatus, errorThrown);
      })
      .always(function () {
        // Este bloque siempre se ejecuta, éxito o error
        thisGetImagenFondo.cargarImagenFondo();
      });
  }
  cargarImagenFondo() {
    $("body").css({ "background-image": "url(" + this.url + ")" });
    $("body").css({ "background-size": "cover" });
    $("body").css({ "background-position": "center" });
    $("body").css({ "background-repeat": "no-repeat" });
    $("body").css({ height: "100vh" });
  }
}

let fondo = new Fondo("Canada", "Ottawa", "Gilles Villeneuve");
fondo.getImagenFondo();
