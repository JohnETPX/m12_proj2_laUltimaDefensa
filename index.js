window.addEventListener('load', () => {
    // Creamos un botón de inicio
    textoIntroIniciador();
});

// Variable que dejo como global, para cambiar a True cuando el juego haya acabado según mis condiciones
let gameOver = false;

function textoIntroIniciador() {
    // Seleccionamos el contenedor principal del juego
    const gameContainer = document.getElementById('gameContainer');

    // Creamos un contenedor para la introducción
    const introContainer = document.createElement('div');
    introContainer.id = 'introContainer';

    // Añadimos el texto de introducción
    const introText = document.createElement('p');
    introText.id = 'introText';
    introText.textContent = `
    Eres el último astronauta, estás en el espacio exterior y debes salvar el planeta Tierra de una inminente lluvia de meteoritos. 
    Sobrevive a tres oleadas de asteroides y destruyelos antes de que lleguen a la Tierra.
    La nave cuenta con 3 vidas (marcado arriba en la izquierda).
    La tierra cuenta con 3 vidas (marcado arriba en medio).
    `;

    // Creamos el botón de inicio
    const startButton = document.createElement('button');
    startButton.id = 'startButton';
    startButton.textContent = 'EMPEZAR';

    // Agregamos un evento para iniciar el juego al hacer clic en el botón
    startButton.addEventListener('click', () => {
        introContainer.remove(); // Eliminamos el contenedor de introducción
        inicializarJuego(); // Llamamos a la función para iniciar el juego
    });

    // Añadimos el texto y el botón al contenedor de introducción
    introContainer.appendChild(introText);
    introContainer.appendChild(startButton);

    // Añadimos el contenedor de introducción al gameContainer
    gameContainer.appendChild(introContainer);
}

/* ===================== Funciones principales del flujo del juego ===================== */

// Función que configura y da inicio al juego, incluyendo los eventos de teclado.
function inicializarJuego() {
    const gameContainer = document.getElementById('gameContainer');

    // Creamos la nave del jugador
    const naveJugador = document.createElement('div');
    naveJugador.id = 'naveJugador';
    gameContainer.appendChild(naveJugador);

    // Propiedades de la nave
    const nave = {
        vidas: 3,
        velocidad: 40,
    };

    // Propiedades de la Tierra
    const tierra = {
        vidas: 5,
    };

    // // Evento para manejar el movimiento y disparos de la nave
    document.addEventListener('keydown', (evento) => {
        moverNave(evento, naveJugador, gameContainer, nave.velocidad); // Movemos la nave
        if (evento.key === ' ') {
            // Disparo
            dispararProyectil(gameContainer, naveJugador); // Disparamos un proyectil con la tecla espacio
        }
    });

    iniciarRondas(gameContainer, nave, tierra); // Iniciamos las rondas del juego
}

// Función que inicia las rondas
function iniciarRondas(gameContainer, nave, tierra) {
    let rondaActual = 1; // Empezamos en la ronda 1
    const rondasTotales = 3; // Total de rondas
    let asteroidesRestantes = 0; // Contador de asteroides

    let iniciarRonda = () => {
        // Esto es en caso de haber ganado, si la ronda actual ya supera el número de rondas totales establecido
        if (rondaActual > rondasTotales) {
            console.log('¡Juego ganado! Todas las rondas completadas.');
            gameOver = true; // Detenemos el juego
            mostrarMensajeFinal('victoria', 'SOBREVIVISTE Y SALVASTE LA TIERRA'); // Mostramos el mensaje de victoria
            return;
        }

        // Muchos console.log los tengo para controlar el rumbo de la partido por si algo sale mal
        console.log(`Iniciando ronda ${rondaActual}`);
        // A medida que van pasando las rondas
        actualizarRondaVisuales('roundCounter', rondaActual);

        // La dificultad por rondas sube 10 asteroides por ronda
        asteroidesRestantes = 10 * rondaActual;

        // Generamos los asteroides
        generarAsteroidesPorRonda(
            rondaActual,
            gameContainer,
            nave,
            tierra,
            () => {
                console.log(`Ronda ${rondaActual} completada.`);
                rondaActual++; // Aquí pasamos de ronda cuando ya no quedan asteroides y la Tierra y la nave aún tienen vidas
                iniciarRonda();
            },
            asteroidesRestantes
        );
    };

    iniciarRonda(); // Iniciamos la primera ronda
}

function generarAsteroide(gameContainer, nave, tierra, onAsteroideEliminado) {
    // Creamos el asteroide
    const asteroide = document.createElement('div');
    asteroide.classList.add('asteroide');
    // En una posición aleatoria IMPORTANTE DENTRO del GAME CONTAINER (offsetWidth agarra el ancho total de un elemento HTML)
    asteroide.style.left = `${Math.random() * (gameContainer.offsetWidth - 40)}px`;
    asteroide.style.top = `-50px`;
    // Añadimos el asteroide
    gameContainer.appendChild(asteroide);

    // Asociamos el callback en caso de que se elimine uno
    asteroide.onAsteroideEliminado = onAsteroideEliminado;

    // Movimiento del asteroide
    moverAsteroide(asteroide, gameContainer, nave, tierra, onAsteroideEliminado);
}

// Función que genera asteroides según la ronda
function generarAsteroidesPorRonda(ronda, gameContainer, nave, tierra, callback, asteroidesRestantes) {

    const asteroidesPorRonda = 10 * ronda; // Generamos 10 * ronda
    let asteroidesGenerados = 0;

    // setInterval hace repetir lo que queramos x periodo de tiempo
    const intervalo = setInterval(() => {
        // Si gameOver es true el juego se acaba por lo que se detienen los intervalos
        if (gameOver) {
            clearInterval(intervalo); // Detenemos el intervalo si el juego ha terminado
            return;
        }

        // Si ya se generaron todos pues paramos el setInterval
        if (asteroidesGenerados >= asteroidesPorRonda) {
            // Ya se generaron todos los asteroides de la ronda
            clearInterval(intervalo);
            return;
        }

        // Esto es lo que queremos que genere cada x tiempo elegido
        generarAsteroide(gameContainer, nave, tierra, () => {
            // Cuando un asteroide es eliminado (por proyectil o colisión)
            asteroidesRestantes--;
            console.log(`Asteroide eliminado. Restan ${asteroidesRestantes} asteroides.`);

            if (asteroidesRestantes === 0) {
                // Ya no queda ningún asteroide en esta ronda
                callback();
            }
        });

        asteroidesGenerados++;
    }, 1000);
}

/* ===================== Funciones relacionadas con elementos interactivos del juego ===================== */

// Función que muestra un botón para reiniciar el juego.
function mostrarBotonReiniciar(mensaje) {
    const gameContainer = document.getElementById('gameContainer');

    const botonReiniciar = document.createElement('button');
    botonReiniciar.classList.add('botonInteractivo');
    botonReiniciar.textContent = mensaje;
    // Reinicia la página al hacer clic en el botón
    botonReiniciar.addEventListener('click', () => {
        // Reiniciamos la página para empezar de nuevo
        location.reload();
    });

    // Añadimos el botón al contenedor
    gameContainer.appendChild(botonReiniciar);
}

// Función que controla el movimiento de la nave
function moverNave(evento, naveJugador, gameContainer, velocidad) {

    if (gameOver) return; // Si el juego ha terminado, no hacer nada

    // Límites a donde puede llegar la nave
    const limiteIzquierdo = 25; // Límite izquierdo
    const limiteDerecho = gameContainer.offsetWidth - naveJugador.offsetWidth; // Límite derecho
    const navePosicion = naveJugador.offsetLeft; // Posición de la nave

    // Mover hacia la izquierda
    if (evento.key === 'ArrowLeft' && navePosicion > limiteIzquierdo) {
        naveJugador.style.left = `${navePosicion - velocidad}px`;
    }

    // Mover hacia la derecha
    if (evento.key === 'ArrowRight' && navePosicion < limiteDerecho) {
        naveJugador.style.left = `${navePosicion + velocidad}px`;
    }
}
// Disparo proyectil y control de destrucción de asteroides por disparo
function dispararProyectil(gameContainer, naveJugador) {

    if (gameOver) return; // Si el juego ha terminado, no disparar

    // Creamos el proyectil
    const proyectil = document.createElement('div');
    proyectil.classList.add('proyectil');
    proyectil.style.left = `${naveJugador.offsetLeft + naveJugador.offsetWidth / 2 - 24}px`; // Los calculos de esto lo he sacado probando y probando
    proyectil.style.top = `${naveJugador.offsetTop}px`;
    gameContainer.appendChild(proyectil);

    const intervalo = setInterval(() => {
        const posicionActual = proyectil.offsetTop;

        if (posicionActual < 0) {
            proyectil.remove();
            clearInterval(intervalo);
            return;
        }

        // Revisamos colisión del proyectil con asteroides
        const asteroides = document.querySelectorAll('.asteroide');
        asteroides.forEach((asteroide) => {
            // Check si hay colisión proyecto asteroide
            if (checkColisionProyectil(proyectil, asteroide)) {
                console.log('Colisión: Proyectil - Asteroide');

                // Llamamos la función de eliminación asociada al asteroide
                if (asteroide.onAsteroideEliminado) {
                    asteroide.onAsteroideEliminado();
                }

                // Eliminamos los elementos
                asteroide.remove();
                proyectil.remove();
                clearInterval(intervalo); // Paramos el intervalo
            }
        });

        // Mover proyectil hacia arriba
        proyectil.style.top = `${posicionActual - 5}px`;
    }, 16); // Cada 16 milisegundos (simula los 60FPS) se mueve el proyectil, mientras verifica el estado si hay 
}

// Movimiento asteroides y control de chocques
function moverAsteroide(asteroide, gameContainer, nave, tierra, onAsteroideEliminado) {
    const velocidad = Math.random() * 3.5 + 1; // Velocidad a la que baja el asteroide, cada uno baja a velocidad diferente

    // Intervalo que funciona según los ms, que 16 son unos 60 frames por segundo
    const intervalo = setInterval(() => {

        if (gameOver) {
            clearInterval(intervalo); // Detenemos el intervalo si el juego ha terminado
            return;
        }

        const posicionActual = asteroide.offsetTop;

        // En caso de colisión debemos mirar las condiciones de ese momento
        if (checkColision(asteroide)) {
            console.log('Colisión: Nave - Asteroide');
            // Si choca con la nave quitamos una vida a la nave
            nave.vidas--;
            // Actualizo las vidas
            actualizarVidasVisuales('startshipLifeContainer', nave.vidas);
            console.log(`Vidas restantes de la nave: ${nave.vidas}`);

            // Una vez chocado hemos de eliminar el asteroide
            asteroide.remove();
            clearInterval(intervalo); // Aquí he aprendido que he de detener el invertalo o me generaría errores porque el proceso de ese ateroide a pesar de estar eliminado sigue

            // En caso de que la nave se quede sin vidas el juego termina
            if (nave.vidas <= 0) {
                gameOver = true;
                mostrarMensajeFinal('derrota', 'LA NAVE FUE DESTRUIDA');
            }

            onAsteroideEliminado(); // Notifica que el asteroide fue eliminado
            return;
        }

        // Colisión con la tierra (sale por la parte inferior)
        if (posicionActual > gameContainer.offsetHeight) {
            console.log('Colisión: Tierra - Asteroide');
            // Si llega a la parte baja del contenedor es que ha llegado a la Tierra entonces la Tierra pierde una vida
            tierra.vidas--;
            // Actualizo las vidas
            actualizarVidasVisuales('earthLifeContainer', tierra.vidas);
            console.log(`Vidas restantes de la Tierra: ${tierra.vidas}`);

            // Eliminamos el asteroide
            asteroide.remove();
            clearInterval(intervalo); // Detenemos el intervalo inmediatamente

            // Si la Tierra pierde todas las vidas entonces se pierde
            if (tierra.vidas <= 0) {
                gameOver = true;
                mostrarMensajeFinal('derrota', 'LA TIERRA FUE DESTRUIDA');
            }

            onAsteroideEliminado(); // Notifica que el asteroide fue eliminado
            return;
        }

        // Sigue cayendo
        asteroide.style.top = `${posicionActual + velocidad}px`;
    }, 16); // Ejecutar este bloque cada 16 ms (~60 frames por segundo)
}

/* ===================== Funciones de detección de colisiones ===================== */

// Chequeo de colisión con la nave
function checkColision(asteroide) {
    const naveRect = document.getElementById('naveJugador').getBoundingClientRect();
    const asteroideRect = asteroide.getBoundingClientRect();

    // Devuelve true or false dependiendo de si están superpuestos
    return (
        naveRect.left < asteroideRect.right &&
        naveRect.right > asteroideRect.left &&
        naveRect.top < asteroideRect.bottom &&
        naveRect.bottom > asteroideRect.top
    );
}

// Chequeo de colisión con proyectil
function checkColisionProyectil(proyectil, asteroide) {
    const proyectilRect = proyectil.getBoundingClientRect();
    const asteroideRect = asteroide.getBoundingClientRect();

    // Devuelve true or false dependiendo de si están superpuestos
    return (
        proyectilRect.left < asteroideRect.right &&
        proyectilRect.right > asteroideRect.left &&
        proyectilRect.top < asteroideRect.bottom &&
        proyectilRect.bottom > asteroideRect.top
    );
}

/* ===================== Funciones de actualización visual ===================== */

// Elimina imágenes (vidas) según cuántas quede
function actualizarVidasVisuales(contenedorId, vidasRestantes) {
    // Agarra el contenedor
    const contenedor = document.getElementById(contenedorId);
    // Agarra la lista de li donde están gráficamente señalando las vidas y se quita ese li cuando se ejecuta la función
    const vidas = contenedor.querySelectorAll('li');
    for (let i = vidas.length - 1; i >= vidasRestantes; i--) {
        vidas[i].remove();
    }
    gameContainer.style.outline = '4px solid red';
    setTimeout(() => {
        gameContainer.style.outline = '';
    }, 700);
}

// Actualiza contador de ronda en pantalla
function actualizarRondaVisuales(contenedorId, numeroRonda) {
    const contenedor = document.getElementById(contenedorId);

    // Condición para no mostrar el letrero de ronda cuanod es ronda 1, no me gustaba
    if (numeroRonda > 1) {
        contenedor.innerHTML = "RONDA " + numeroRonda;
        // Crear el mensaje temporal
        const gameContainer = document.getElementById('gameContainer');
        const mensajeRonda = document.createElement('div');
        mensajeRonda.id = 'mensajeRonda';
        mensajeRonda.textContent = `PASASTE A LA RONDA ${numeroRonda}`;

        // Añadir el mensaje temporal al gameContainer
        gameContainer.appendChild(mensajeRonda);

        // Eliminar el mensaje después de 1 segundo
        setTimeout(() => {
            mensajeRonda.remove();
        }, 1000); // 1 segundo
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

    // Evento para recargar la página
    restartButton.addEventListener('click', () => {
        location.reload();
    });

    // Agrega el mensaje y el botón al contenedor
    finalMessageContainer.appendChild(finalMessage);
    finalMessageContainer.appendChild(restartButton);

    // Agrega el contenedor al gameContainer
    gameContainer.appendChild(finalMessageContainer);
}
