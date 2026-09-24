// Board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Jungkook
let kooWidth = 40;
let kooHeight = 60;
let kooX = boardWidth / 6;
let kooY = boardHeight / 2;
let kooImg;

let koo = {
    x: kooX,
    y: kooY,
    width: kooWidth,
    height: kooHeight
}

// Tubos
let tuboArray = [];
let tuboWidth = 64;
let tuboHeight = 512;
let tuboX = boardWidth;
let tuboY = 0;

let topTuboImg;
let bottomTuboImg;

// Velocidad 
let velocityX = -2; // Velocidad con la que se mueven los tubos a la izquierda
let velocityY = 0;  // Velocidad inicial del salto
let gravity = 0.4;  // Gravedad constante

// Para empezar y la puntuación
let gameStarted = false;
let gameOver = false;
let score = 0;

// Soniditos
let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let pointSound = new Audio("./sfx_point.wav");
let dieSound = new Audio("./sfx_die.wav");

// Control de gesto
let manoEstabaAbierta = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Cargar imagen de Jungkook
    kooImg = new Image();
    kooImg.src = "./jungkook.png";
    kooImg.onload = function() {
        context.drawImage(kooImg, koo.x, koo.y, koo.width, koo.height);
    }

    // Cargar imágenes de los tubos
    topTuboImg = new Image();
    topTuboImg.src = "./toppipe.png";

    bottomTuboImg = new Image();
    bottomTuboImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placeTubos, 2200); // Genera tubos cada 2.2 segundos (más separados)
    // Eventos de teclado y clic
    document.addEventListener("keydown", moveBird);
    document.addEventListener("mousedown", moveBird);

    // Inicializar Detección Gestual con la cámara
    iniciarCamaraYGestos();
}

function update() {
    requestAnimationFrame(update);
    
    if (gameOver) {
        return;
    }

    // Pantalla de inicio antes de dar el primer salto
    if (!gameStarted) {
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(kooImg, koo.x, koo.y, koo.width, koo.height);

        context.fillStyle = "white";
        context.font = "16px sans-serif";
        context.fillText("Abre la mano o presiona ESPACIO", 20, 300);
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Aplicar gravedad a Jungkook
    velocityY += gravity;
    koo.y = Math.max(koo.y + velocityY, 0); // Evita que se salga por arriba
    context.drawImage(kooImg, koo.x, koo.y, koo.width, koo.height);

    // Si cae al suelo
    if (koo.y + koo.height >= boardHeight) {
        if (!gameOver) {
            dieSound.play();
        }
        gameOver = true;
    }

    // Mover y dibujar los tubos
    for (let i = 0; i < tuboArray.length; i++) {
        let tubo = tuboArray[i];
        tubo.x += velocityX;
        context.drawImage(tubo.img, tubo.x, tubo.y, tubo.width, tubo.height);

        // Sumar puntos al pasar el tubo
        if (!tubo.passed && koo.x > tubo.x + tubo.width) {
            score += 0.5; // Suma 0.5 por cada tubo (un par suma 1 punto)
            tubo.passed = true;

            if (score % 1 === 0) {
                pointSound.play();
            }
        }

        // Detectar choque con los tubos
        if (detectChoque(koo, tubo)) {
            if (!gameOver) {
                hitSound.play();
            }
            gameOver = true;
        }
    }

    // Limpiar tubos fuera de pantalla
    while (tuboArray.length > 0 && tuboArray[0].x < -tuboWidth) {
        tuboArray.shift();
    }

    // Dibujar la puntuación
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(Math.floor(score), 10, 45);

    // Mensaje de Game Over
    if (gameOver) {
        context.fillText("GAME OVER", 40, 300);
    }
}

function placeTubos() {
    if (gameOver || !gameStarted) {
        return;
    }

    let randomTuboY = tuboY - tuboHeight / 4 - Math.random() * (tuboHeight / 2);
    let espacio = boardHeight / 4; // Espacio libre entre tubos

    let topTubo = {
        img: topTuboImg,
        x: tuboX,
        y: randomTuboY,
        width: tuboWidth,
        height: tuboHeight,
        passed: false
    }
    tuboArray.push(topTubo);

    let bottomTubo = {
        img: bottomTuboImg,
        x: tuboX,
        y: randomTuboY + tuboHeight + espacio,
        width: tuboWidth,
        height: tuboHeight,
        passed: false
    }
    tuboArray.push(bottomTubo);
}

function moveBird(e) {
    // Si la llamada viene por un evento o por el gesto (e.isGesture)
    if (e.isGesture || e.type === "mousedown" || e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        
        // Iniciar el juego en la primera interacción
        if (!gameStarted) {
            gameStarted = true;
        }

        // Reiniciar el juego si perdiste
        if (gameOver) {
            koo.y = kooY;
            tuboArray = [];
            score = 0;
            gameOver = false;
            gameStarted = true;
        }

        // Impulso de salto
        velocityY = -6;
        wingSound.currentTime = 0;
        wingSound.play();
    }
}

function detectChoque(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// --- CONFIGURACIÓN DE MEDIAPIPE Y GESTOS ---
function iniciarCamaraYGestos() {
    const videoElement = document.getElementById('webcam');

    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const puntos = results.multiHandLandmarks[0];

            // Punto 0: Muñeca / Punto 8: Punta del dedo índice
            const muneca = puntos[0];
            const indice = puntos[8];

            // Distancia Euclidiana en 2D
            const distancia = Math.hypot(indice.x - muneca.x, indice.y - muneca.y);

            const UMBRAL = 0.35; // Ajustar sensibilidad si la mano es pequeña o está lejos

            if (distancia > UMBRAL) {
                if (!manoEstabaAbierta) {
                    // Disparamos el salto simulando la llamada
                    moveBird({ isGesture: true });
                    manoEstabaAbierta = true;
                }
            } else {
                manoEstabaAbierta = false;
            }
        }
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    camera.start();
}