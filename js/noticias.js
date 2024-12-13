"use strict";
class Noticias{
    constructor(){
        //Eliminamos la información ya existente de ejecuciones anteriores
        $("main").find("section").remove();
        if(this.#comprobarSoporteAPIFile()){
            this.#crearSeccionSubirFichero();
        }
        this.#crearSeccionAñadirNoticias();
    }

    readInputFile(){

    }

    #comprobarSoporteAPIFile(){
        if (window.File && window.FileReader && window.FileList && window.Blob)
            return true;
        return false;
    }

    #crearSeccionSubirFichero(){
        
    }

    #crearSeccionAñadirNoticias(){

    }
}