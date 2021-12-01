let score = 0;
let totalLives = 5;
let livesNum = 5;

let rotationSpeed = 5;
let shipAcceleration = 0.5;

let volumeThreshold = 5;

let toggleBullet = false;

function playGame() {
    c1 = color(155,220,48);
    c2 = color(9, 59, 202);

    // gradient background
    setGradient(0, 0, windowWidth, windowHeight, c1, c2, 1);

    let volume = mic.getLevel();
    // console.log(volume);

    for(let i=0; i<allSprites.length; i++) {
        let s = allSprites[i];
        if(s.position.x<-MARGIN) s.position.x = width+MARGIN;
        if(s.position.x>width+MARGIN) s.position.x = -MARGIN;
        if(s.position.y<-MARGIN) s.position.y = height+MARGIN;
        if(s.position.y>height+MARGIN) s.position.y = -MARGIN;
    }

    asteroids.overlap(ship, shipHit);
    asteroids.overlap(bullets, asteroidHit);

    ship.bounce(asteroids);

    // shoot bullet
    if (!ship.removed) {
        if (!toggleBullet && volume * 200 > volumeThreshold) {
            toggleBullet = true;
        }

        if (volume * 200 <= volumeThreshold) {
            toggleBullet = false;
        }
    }

    if (toggleBullet) {
        let bullet = createSprite(ship.position.x, ship.position.y);
        bullet.addImage(bulletImg);
        bullet.setSpeed(10 + ship.getSpeed(), ship.rotation);
        bullet.life = 30;
        bullets.add(bullet);
    }

    // display game
    showPlayerAndControls();
    drawSprites();
    drawUI();

    // check if game is over (no lives left)
    checkForGameOver();
}

function drawUI() {
    // draw lives left
    for (let i = 0; i < totalLives; i++) {
        if (i < livesNum) {
            fill(255,0,0);
        } else {
            fill(255);
        }
        
        noStroke();
        rect(25 * i + 30, 30, 10,10);
    }

    // draw score
    fill(255);
    text(`score: ${score}`, windowWidth - 100, 30);
}

function showPlayerAndControls() {
    push();
        imageMode(CORNER);
        translate(video.width,windowHeight - vidHeight);
        scale(-1,1);

        // webcam video
        image(video, 0, 0, vidWidth, vidHeight);

        // gamepad img
        imageMode(CENTER);
        image( gamePadImg, video.width/2, video.height/2, ellipseDiameter, ellipseDiameter);

        rectMode(CENTER)

        // draw tiny square for nose
        fill(255);
        textSize(30);
        text('+', faceX, faceY);

        // head direction text
        if (faceY > video.height/2 + ellipseRadius) {
            // down
            ship.addSpeed(-shipAcceleration, ship.rotation);
        } else if (faceY < video.height/2 - ellipseRadius) {
            // up
            ship.addSpeed(shipAcceleration, ship.rotation);
        } else if (faceX < video.width/2 - ellipseRadius) {
            // right
            ship.rotation += rotationSpeed;
        } else if (faceX > video.width/2 + ellipseRadius) {
            // left
            ship.rotation -= rotationSpeed;
        }

    pop();
}

function checkForGameOver() {
    if (livesNum <= 0) {
        noLoop(); // freeze game

        // show game over div
        let gameOverDiv = select('#gameover-div');
        gameOverDiv.elt.style.display = "flex";

        // add score
        let playerScore = select('#score');
        playerScore.elt.innerHTML = score;
    }
}

// creates gradients
function setGradient(x, y, w, h, c1, c2, axis) {
	noFill();
	if (axis == 1) {  // Top to bottom gradient
   	for (var i = y; i <= y+h; i++) {
    	var inter = map(i, y, y+h, 0, 1);
    	var c = lerpColor(c1, c2, inter);
    	stroke(c);
    	line(x, i, x+w, i);
   	}
 	}
}