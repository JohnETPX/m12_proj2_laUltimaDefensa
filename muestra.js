window.addEventListener('load', () => {
    introduction();
});

let gameOver = false;

function introduction() {
    const gameContainer = document.getElementById('gameContainer');
    const contextContainer = document.getElementById('contextContainer');

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'buttonContainer';

    const startButton = document.createElement('button');
    startButton.id = 'startButton';
    startButton.textContent = 'EMPEZAR';

    buttonContainer.appendChild(startButton);
    contextContainer.appendChild(buttonContainer);
    gameContainer.appendChild(contextContainer);

    startButton.addEventListener('click', () => {
        buttonContainer.remove();

        contextContainer.style.display = 'none';

        inicializarJuego();
    });
}


function inicializarJuego() {
    const gameContainer = document.getElementById('gameContainer');

    const naveJugador = document.createElement('div');
    naveJugador.id = 'naveJugador';
    gameContainer.appendChild(naveJugador);

    const nave = {
        vidas: 3,
        velocidad: 40,
    };

    const tierra = {
        vidas: 5,
    };

    document.addEventListener('keydown', (evento) => {
        moverNave(evento, naveJugador, gameContainer, nave.velocidad); 
        if (evento.key === ' ') {
            dispararProyectil(gameContainer, naveJugador); 
        }
    });

    iniciarRondas(gameContainer, nave, tierra);
}

function iniciarRondas(gameContainer, nave, tierra) {
    let rondaActual = 1; 
    const rondasTotales = 3; 
    let asteroidesRestantes = 0; 

    let iniciarRonda = () => {
        if (rondaActual > rondasTotales) {
            console.log('¡Juego ganado! Todas las rondas completadas.');
            gameOver = true; 
            mostrarMensajeFinal('victoria', 'SOBREVIVISTE Y SALVASTE LA TIERRA'); 
            return;
        }

        console.log(`Iniciando ronda ${rondaActual}`);
        actualizarRondaVisuales('roundCounter', rondaActual);

        asteroidesRestantes = 10 * rondaActual;

        generarAsteroidesPorRonda(
            rondaActual,
            gameContainer,
            nave,
            tierra,
            () => {
                console.log(`Ronda ${rondaActual} completada.`);
                rondaActual++; 
                iniciarRonda();
            },
            asteroidesRestantes
        );
    };

    iniciarRonda(); 
}

function generarAsteroide(gameContainer, nave, tierra, onAsteroideEliminado) {
    const asteroide = document.createElement('div');
    asteroide.classList.add('asteroide');
    asteroide.style.left = `${Math.random() * (gameContainer.offsetWidth - 40)}px`;
    asteroide.style.top = `-50px`;

    gameContainer.appendChild(asteroide);

    asteroide.onAsteroideEliminado = onAsteroideEliminado;

    moverAsteroide(asteroide, gameContainer, nave, tierra, onAsteroideEliminado);
}

function generarAsteroidesPorRonda(ronda, gameContainer, nave, tierra, callback, asteroidesRestantes) {

    const asteroidesPorRonda = 10 * ronda; 
    let asteroidesGenerados = 0;

    const intervalo = setInterval(() => {
        if (gameOver) {
            clearInterval(intervalo); 
            return;
        }

      
        if (asteroidesGenerados >= asteroidesPorRonda) {
            clearInterval(intervalo);
            return;
        }

        generarAsteroide(gameContainer, nave, tierra, () => {
            asteroidesRestantes--;
            console.log(`Asteroide eliminado. Restan ${asteroidesRestantes} asteroides.`);

            if (asteroidesRestantes === 0) {
                callback();
            }
        });

        asteroidesGenerados++;
    }, 1000);
}


function moverNave(evento, naveJugador, gameContainer, velocidad) {

    if (gameOver) return;

    const limiteIzquierdo = 50;
    const limiteDerecho = gameContainer.offsetWidth - naveJugador.offsetWidth - 18;
    const navePosicion = naveJugador.offsetLeft;

    if (evento.key === 'ArrowLeft' && navePosicion > limiteIzquierdo) {
        naveJugador.style.left = `${navePosicion - velocidad}px`;
    }

    if (evento.key === 'ArrowRight' && navePosicion < limiteDerecho) {
        naveJugador.style.left = `${navePosicion + velocidad}px`;
    }
}

function dispararProyectil(gameContainer, naveJugador) {

    if (gameOver) return; 

    const proyectil = document.createElement('div');
    proyectil.classList.add('proyectil');
    proyectil.style.left = `${naveJugador.offsetLeft + naveJugador.offsetWidth / 2 - 24}px`; 
    proyectil.style.top = `${naveJugador.offsetTop}px`;
    gameContainer.appendChild(proyectil);

    const intervalo = setInterval(() => {
        const posicionActual = proyectil.offsetTop;

        if (posicionActual < 0) {
            proyectil.remove();
            clearInterval(intervalo);
            return;
        }

        const asteroides = document.querySelectorAll('.asteroide');
        asteroides.forEach((asteroide) => {
            if (checkColisionProyectil(proyectil, asteroide)) {
                console.log('Colisión: Proyectil - Asteroide');

                if (asteroide.onAsteroideEliminado) {
                    asteroide.onAsteroideEliminado();
                }

                asteroide.remove();
                proyectil.remove();
                clearInterval(intervalo);
            }
        });

        proyectil.style.top = `${posicionActual - 5}px`;
    }, 16);
}

function moverAsteroide(asteroide, gameContainer, nave, tierra, onAsteroideEliminado) {
    const velocidad = Math.random() * 3.5 + 1;

    const intervalo = setInterval(() => {
        if (gameOver) {
            clearInterval(intervalo); 
            return;
        }

        const posicionActual = asteroide.offsetTop;

        if (checkColision(asteroide)) {
            console.log('Colisión: Nave - Asteroide');
            nave.vidas--;
            actualizarVidasVisuales('startshipLifeContainer', nave.vidas);
            console.log(`Vidas restantes de la nave: ${nave.vidas}`);

            asteroide.remove();
            clearInterval(intervalo);

            if (nave.vidas <= 0) {
                gameOver = true;
                mostrarMensajeFinal('derrota', 'LA NAVE FUE DESTRUIDA');
            }

            onAsteroideEliminado();
            return;
        }

        if (posicionActual > gameContainer.offsetHeight) {
            console.log('Colisión: Tierra - Asteroide');

            tierra.vidas--;
            actualizarVidasVisuales('earthLifeContainer', tierra.vidas);
            console.log(`Vidas restantes de la Tierra: ${tierra.vidas}`);

            asteroide.remove();
            clearInterval(intervalo);

            if (tierra.vidas <= 0) {
                gameOver = true;
                mostrarMensajeFinal('derrota', 'LA TIERRA FUE DESTRUIDA');
            }

            onAsteroideEliminado();
            return;
        }

        asteroide.style.top = `${posicionActual + velocidad}px`;
    }, 16);
}


function checkColision(asteroide) {
    const naveRect = document.getElementById('naveJugador').getBoundingClientRect();
    const asteroideRect = asteroide.getBoundingClientRect();

    return (
        naveRect.left < asteroideRect.right &&
        naveRect.right > asteroideRect.left &&
        naveRect.top < asteroideRect.bottom &&
        naveRect.bottom > asteroideRect.top
    );
}

function checkColisionProyectil(proyectil, asteroide) {
    const proyectilRect = proyectil.getBoundingClientRect();
    const asteroideRect = asteroide.getBoundingClientRect();

    return (
        proyectilRect.left < asteroideRect.right &&
        proyectilRect.right > asteroideRect.left &&
        proyectilRect.top < asteroideRect.bottom &&
        proyectilRect.bottom > asteroideRect.top
    );
}



function actualizarVidasVisuales(contenedorId, vidasRestantes) {
    const contenedor = document.getElementById(contenedorId);

    const vidas = contenedor.querySelectorAll('li');
    for (let i = vidas.length - 1; i >= vidasRestantes; i--) {
        vidas[i].style.zIndex = '-20';
    }
    gameContainer.style.outline = '4px solid red';
    setTimeout(() => {
        gameContainer.style.outline = '';
    }, 700);
}


function actualizarRondaVisuales(contenedorId, numeroRonda) {
    const contenedor = document.getElementById(contenedorId);

    if (numeroRonda > 1) {
        contenedor.innerHTML = "RONDA " + numeroRonda;
        const gameContainer = document.getElementById('gameContainer');
        const mensajeRonda = document.createElement('div');
        mensajeRonda.id = 'mensajeRonda';
        mensajeRonda.textContent = `PASASTE A LA RONDA ${numeroRonda}`;

        gameContainer.appendChild(mensajeRonda);

        setTimeout(() => {
            mensajeRonda.remove();
        }, 1000);
    }

}

// Mensaje final, dependiendo del tipo y mensaje, muestra una cosa u otra
function mostrarMensajeFinal(tipo, mensaje) {
    const gameContainer = document.getElementById('gameContainer');

    // Crea el contenedor del mensaje final
    const finalMessageContainer = document.createElement('div');
    finalMessageContainer.id = 'finalMessageContainer';

    // Crea el mensaje
    const finalMessage = document.createElement('p');
    finalMessage.id = 'finalMessage';

    // Configura el mensaje según el tipo
    if (tipo === 'derrota') {
        finalMessage.textContent = mensaje;
        finalMessageContainer.style.backgroundColor = 'red';
    } else if (tipo === 'victoria') {
        finalMessage.textContent = mensaje;
        finalMessageContainer.style.backgroundColor = 'green';
    }

    // Crea el botón de reinicio
    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.textContent = 'Reiniciar partida';

    // Agrega el mensaje y el botón al contenedor
    finalMessageContainer.appendChild(finalMessage);
    finalMessageContainer.appendChild(restartButton);

    // Agrega el contenedor al gameContainer
    gameContainer.appendChild(finalMessageContainer);

        // Evento para recargar la página
        restartButton.addEventListener('click', () => {
            location.reload();
        });
};