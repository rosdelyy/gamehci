//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//jungkook
let kooWidth = 40;
let kooHeight = 60;
let kooX = boardWidth/8;
let kooY = boardHeight/2;
let kooImg;

//tubos
let tuboArray = [];
let tuboWidth = 64
let tuboHeight = 512;
let tuboX = boardWidth;
let tuboY = 0;

let topTuboImg;
let bottomTuboImg;

 //para mover 
 let velocityX = -2; // los tubitos para la izquierda
 let velocityY = 0; // jungkook velocidad
 let gravity = 0.50 // para mantener a jungkook cayendo

 let gameOver = false;

let koo = {
    x : kooX,
    y : kooY,
    width : kooWidth,
    height : kooHeight
}

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //ponemos al jungkook
    //context.fillRect(koo.x, koo.y, koo.width, koo.height) es el cuadro negro cuando no teniamos imagen

    //cargar la imagen
    kooImg = new Image();
    kooImg.src = "./jungkook.png";
    kooImg.onload = function() {
        context.drawImage(kooImg, koo.x, koo.y, koo.width, koo.height);
    }
    topTuboImg = new Image();
    topTuboImg.src = "./toppipe.png";
    bottomTuboImg = new Image();
    bottomTuboImg.src = "./bottompipe.png";
    requestAnimationFrame(update);
    setInterval(placeTubos, 2000); 
    document.addEventListener("keydown", moveBird);
}
//para hacerlo un loop
 function update() {
    requestAnimationFrame(update);
   if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //para mantener a jungkook ahi
    velocityY += gravity;
    koo.y += velocityY;
   koo.y = Math.max(koo.y + velocityY, 0) // para que no se pase de arriba
    context.drawImage(kooImg, koo.x, koo.y, koo.width, koo.height);
    if (koo.y > board.y) {
        gameOver = true;
    }
    //para poner los tubos
    for (let i = 0; i<tuboArray.length; i++) {
        let tubo = tuboArray[i];
        tubo.x += velocityX;
        context.drawImage(tubo.img, tubo.x, tubo.y, tubo.width, tubo.height);

        if (detectChoque(koo, tubo)) {
            gameOver = true;
        }
    }

 }

 function placeTubos() {
    if (gameOver) {
        return;
    }
    let randomTuboY = tuboY - tuboHeight/4 - Math.random()*(tuboHeight/2);
    let espacio = boardHeight / 4; 

    let topTubo = {
        img: topTuboImg,
        x : tuboX,
        y : randomTuboY,
        width : tuboWidth,
        height : tuboHeight,
        passed : false
    }
    tuboArray.push(topTubo);
    let bottomTubo = {
        img : bottomTuboImg,
        x : tuboX,
        y : randomTuboY + tuboHeight + espacio,
        width : tuboWidth,
        height : tuboHeight,
        passed : false
    }
    tuboArray.push(bottomTubo);
 }
 function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //para saltar
        velocityY = -6;
    }
    
 }
 function detectChoque(a, b) {
    return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
 }