"use strict";
class Memoria {
    elements = [    
        {"element":"RedBull", "source":"https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg"},
        {"element":"RedBull", "source":"https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg"},
        {"element":"McLaren", "source":"https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg"},
        {"element":"McLaren", "source":"https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg"},
        {"element":"Alpine", "source":"https://upload.wikimedia.org/wikipedia/fr/b/b7/Alpine_F1_Team_2021_Logo.svg"},
        {"element":"Alpine", "source":"https://upload.wikimedia.org/wikipedia/fr/b/b7/Alpine_F1_Team_2021_Logo.svg"},
        {"element":"AstonMartin", "source":"https://upload.wikimedia.org/wikipedia/fr/7/72/Aston_Martin_Aramco_Cognizant_F1.svg"},
        {"element":"AstonMartin", "source":"https://upload.wikimedia.org/wikipedia/fr/7/72/Aston_Martin_Aramco_Cognizant_F1.svg"},
        {"element":"Ferrari", "source":"https://upload.wikimedia.org/wikipedia/de/c/c0/Scuderia_Ferrari_Logo.svg"},
        {"element":"Ferrari", "source":"https://upload.wikimedia.org/wikipedia/de/c/c0/Scuderia_Ferrari_Logo.svg"},
        {"element":"Mercedes", "source":"https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg"},
        {"element":"Mercedes", "source":"https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg"}
    ]  
    
    constructor (){
        console.log("[Clase Memoria] \t --> constructor -- inicio");
        this.hasFlippedCard = false;
        this.lockBoadr = false;
        this.firstCard = null;
        this.secondCard = null;
        this.numberOfMoves = 0;
        this.shuffleElements();
        this.createElements();
        this.addEventListeners();
        this.log();
        console.log("[Clase Memoria] \t --> constructor -- fin");          
    }
    //Baraja los elementos del objeto JSON
    shuffleElements(){
        console.log("[Clase Memoria]  \t --> shuffleElements -- inicio \n");
        //Barajamos los elementos 3 veces
        for(let h = 0; h < 3; h++){
            //Algoritmo Durstenfeld
            for (let i = this.elements.length - 1; i > 0; i--) { 
                const j = Math.floor(Math.random() * (i + 1)); 
                [this.elements[i], this.elements[j]] = [this.elements[j], this.elements[i]]; // Intercambiar elementos 
            }
        }
        console.log("[Clase Memoria] \t --> shuffleElements -- fin \n");
    }
    
    flipCard(card){
        console.log("[Clase Memoria] \t --> flip -- inicio");
        let cardState = card.getAttribute("data-state")
        //Tablero bloqueado
        if (this.lockBoadr === true){
            console.log("[Clase Memoria] \t --> flip -- tablero bloqueado");
            return;
        }
            
        //Tarjeta pulsada por el usuario ya revelada.
        if (cardState === "revealed"){
            console.log("[Clase Memoria] \t --> flip -- carta ya revelada");
            return;
        }
            
        //Tarjeta ya pulsada
        if (card === this.firstCard){
            console.log("[Clase Memoria] \t --> flip -- pulsacion repetida sobre la primera carta");
            return;
        }
            
        card.setAttribute("data-state","flip");
        if(this.hasFlippedCard === false){
            console.log("[Clase Memoria] \t --> flip -- primera carta girada");
            this.hasFlippedCard = true;
            this.firstCard = card;
        }else{
            console.log("[Clase Memoria] \t --> flip -- segunda carta girada");
            this.secondCard = card;
            //Bloqueamos el tablero
            this.lockBoadr = true;
            //Chequeamos con retardo para poder ver la segunda carta
            setTimeout(() => {
                this.checkForMatch();
            }, 2000); 
        }
    }
    
    unflipCards(){
        console.log("[Clase Memoria] \t --> unflipCards");
        //Bloquear el tablero
        this.lockBoadr = true;
        //Voltear cartas boca arriba
        this.firstCard.setAttribute("data-state","inicial");
        this.secondCard.setAttribute("data-state","inicial");
        this.resetBoard();
    }

    resetBoard(){
        console.log("[Clase Memoria] \t --> resetBoard");
        this.firstCard = null;
        this.secondCard = null;
        this.hasFlippedCard = false;
        this.lockBoadr = false;
    }

    checkForMatch(){
        console.log("[Clase Memoria] \t --> checkForMatch -- inicio");
        if (this.firstCard === null || this.secondCard === null){
            console.log("[Clase Memoria] \t --> checkForMatch -- primera o segunda carta son nulas");
            this.resetBoard();
            return;
        }
        this.numberOfMoves++; //Incrementamos el número de movimientos de la partida
        const card1 = this.firstCard.getAttribute("data-element");
        const card2 = this.secondCard.getAttribute("data-element");
        console.log("[Clase Memoria] \t --> checkForMatch -- card1: "+ card1);
        console.log("[Clase Memoria] \t --> checkForMatch -- card2: "+ card2);
        card1 === card2 
            ? this.disableCards() 
            : this.unflipCards();    
    }

    disableCards(){
        console.log("[Clase Memoria] \t --> disableCards -- inicio");
        this.firstCard.setAttribute("data-state","revealed");
        this.secondCard.setAttribute("data-state","revealed");
        this.resetBoard();
        //Aqui se comprueba si se terminó el juego.
        if (this.checkFinish()){
            alert("Felicidades. Completado en " + this.numberOfMoves + " movimientos.");
        }
    }

    createElements(){
        console.log("[Clase Memoria] \t --> createElements -- inicio");
        let sectionJuego = document.querySelector("body section:nth-of-type(1)");
        for (const element of this.elements) {
            let article = document.createElement("article");
            article.setAttribute("data-element",element.element);
            article.setAttribute("data-state","inicial");
            
            let h3 = document.createElement("h3");
            h3.textContent = "Tarjeta de memoria";
            
            let img = document.createElement("img");
            img.setAttribute("src",element.source);
            img.setAttribute("alt",element.element);
            
            article.appendChild(h3);
            article.appendChild(img);
            
            sectionJuego.appendChild(article);
        } 
    }

    checkFinish(){
        console.log("[Clase Memoria] \t --> checkFinish() -- inicio");
        let articles = document.querySelectorAll("body section:nth-of-type(1) article");
        for (let article of articles) {
            if (article.getAttribute("data-state") == "inicial"){
                console.log("[Clase Memoria] \t --> checkFinish() -- Juego no finalizado");
                return false;
            }
        }
        console.log("[Clase Memoria] \t --> checkFinish() -- Juego finalizado");
        return true;
    }

    addEventListeners(){
        console.log("[Clase Memoria] \t --> addEventListeners() -- inicio");
        let articles = document.querySelectorAll("body section:nth-of-type(1) article");
        for (let article of articles) {
            article.addEventListener("click",() =>{
                console.log("[Clase Memoria] \t --> card.addEventListeners \t card-> data-state: "+ article.getAttribute("data-state"));
                this.flipCard(article);
            });
         }
    }

    log(){
        console.log("[Clase " +this.constructor.name + "] \t Propiedades del objeto: "); 
        Object.getOwnPropertyNames(this).sort().forEach((val, idx, array) => {
            console.log("\t "+ val + " -> "+ JSON.stringify(this[val]));
        });
    }

}

let memoria = new Memoria();