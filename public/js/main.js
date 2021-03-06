let currentScreen = '';

// webcam video stuff
let video, vidWidth, vidHeight;

// face tracking stuff
let gamePadImg;
let poseNet;
let poses = [];
let faceX = 0;
let faceY = 0;
let ellipseDiameter; // ellipse for tracking head movement
let ellipseRadius = 15;

// audio stuff
let mic;
let volume;

// asteroids stuff
let shipImg, bulletImg, particleImg;
let bullets, asteroids, ship;

var asteroidNum;
let asteroidImgs = [];
let lasers = [];

let MARGIN = 50;

// other
let canvas;

let start = false;
let pause = false;
let userClicks = 0;
let instructionsText = '';

function preload() {
    gamePadImg = loadImage('assets/gamepad.png');
    shipImg = loadImage('assets/ship.png');
    bulletImg = loadImage('assets/bullet.png');
    particleImg = loadImage('assets/particle.png');

    for (let i = 0 ;i < asteroidNum; i++) {
        let asteroidImg = loadImage(`assets/asteroid${i}.png`);
        asteroidImgs.push(asteroidImg);
    }
}

function setup() {
    asteroidNum = floor(random(5,15))

    // set up webcam video
    vidWidth = windowWidth / 3;
    vidHeight = vidWidth * 0.75;

    // ellipseDiameter = vidHeight * 0.1;
    ellipseDiameter = vidHeight * .3;

    canvas = createCanvas(windowWidth, windowHeight);
    background(0);

    video = createCapture(VIDEO);
    video.size(vidWidth, vidHeight);

    video.hide();

    // set up pose tracking
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', findFaceOnPoses);

    // audio stuff
    getAudioContext().suspend();
    mic = new p5.AudioIn();
    mic.start();

    // asteroids stuff
    ship = createSprite(width/2, height/2);
    ship.maxSpeed = 10;
    ship.friction = 0.08;
    ship.setCollider('circle', 0,0, 30);
    ship.addImage('normal', shipImg);

    // ship.debug = true;
    
    asteroids = new Group();
    bullets = new Group();
    
    for(let i = 0; i<asteroidNum; i++) {
        let ang = random(360);
        let px = width/2 + 1000 * cos(radians(ang));
        let py = height/2+ 1000 * sin(radians(ang));
        createAsteroid(3, px, py);
    }
}

function draw() {

    background(0);

    // double the asteroids if it falls below 50% of the original amount
    if (asteroids.length <= 0.5 * asteroidNum){
        for(let i = 0; i<floor(asteroidNum/2); i++) {
            let ang = random(360);
            let px = width/2 + 1000 * cos(radians(ang));
            let py = height/2+ 1000 * sin(radians(ang));
            createAsteroid(3, px, py);
        }
    }

    switch (currentScreen) {
        case 'moveTutorial':
            drawTutorial('move');
            break;
        case 'shootTutorial':
            drawTutorial('shoot');
            break;
        case 'game':
            playGame();
            break;
        case '':
            textAlign(CENTER);
            textSize(12);
            fill(255);

            text('click to start tutorial.\npress space to skip.', width/2, height/2);
            break;
    }
}

function mousePressed() {
    if (currentScreen != 'game') {
        userClicks += 1;
        if (!start && userClicks == 1) {
            getAudioContext().resume();
            currentScreen = 'moveTutorial';
        }

        if (start && userClicks == 2) {
            currentScreen = 'shootTutorial';
        }
        
        start = true;
    }
}

function keyPressed() {
    if (key == ' ' && currentScreen != 'game') {
        currentScreen = 'game';
        getAudioContext().resume();
    }

    // press 'p' to pause/unpause in game
    if (currentScreen == 'game') {
        if (key == 'p' && !pause){
            noLoop();
            pause = true;
        } else if (key == 'p' && pause){
            loop();
            pause = false;
        }
    }
}

function drawTutorial(tutorialType) {
    translate((windowWidth - vidWidth) / 2, (windowHeight - vidHeight) / 2);
    imageMode(CORNER);

    push();
    translate(video.width, 0);
    scale(-1,1);
    
    image(video, 0, 0, vidWidth, vidHeight);

    if (tutorialType == 'move') {

        // gamepad img
        push();
        imageMode(CENTER);
        image( gamePadImg, video.width/2, video.height/2, ellipseDiameter, ellipseDiameter);

        // draw tiny square for nose
        fill(255);
        textSize(30);
        text('+', faceX, faceY);

        pop();

        // instructions
        scale(-1,1);

        instructionsText = 'place your head in the center by moving your nose within the green circle.\n' + 
            'then, move your head up, down, left, and right for player controls.\n\n' +
            'rotate / aim the ship by moving left and right.\nmove forward and backward by moving your head up and down.';

        fill(255);
        textWrap(WORD);
        textAlign(LEFT);
        text(instructionsText, - video.width, -100, windowWidth / 3);
    
        // head direction text
        scale(-1,1);
        textAlign(CENTER);
        let textPadding = 50;

        if (faceY > video.height/2 + ellipseRadius) {
            push();
            scale(-1,1);
            text('thrust backwards', -video.width/2, constrain(faceY + textPadding, 0, video.height));
            pop();
        } else if (faceY < video.height/2 - ellipseRadius) {
            push();
            scale(-1,1);
            text('thrust forwards', -video.width/2, constrain(faceY - textPadding, 0, video.height));
            pop();
        } else if (faceX < video.width/2 - ellipseRadius) {
            push();
            scale(-1,1);
            text('rotate right', -faceX + textPadding, video.height/2);
            pop();
        } else if (faceX > video.width/2 + ellipseRadius) {
            push();
            scale(-1,1);
            text('rotate left', -faceX - textPadding, video.height/2);
            pop();
        }
    
        scale(-1,1);
        textAlign(LEFT);
        text('click to proceed to the next step.', -video.width, video.height + 50);

        pop();
    } else if (tutorialType == 'shoot') {
        scale(-1,1);

        instructionsText = 'shoot bullets by making noise into your microphone.\nthe louder your noise, the further your bullet will travel.';

        fill(255);
        textWrap(WORD);
        textAlign(LEFT);
        text(instructionsText, -video.width, -50, windowWidth / 3);

        textAlign(LEFT);
        text('ready to play? press space to start.', -video.width, video.height + 50);

        // audio meter
        noStroke();
        fill(227,63,95);
        rect( 20, 0, 15, video.height);

        volume = mic.getLevel();
        let volumeHeight = map (volume * 200, 0, 150, video.height, 0);

        fill(255)
        rect(20,0,15,volumeHeight);
    }
}

function findFaceOnPoses(results) {
    poses = results;
    if (poses.length > 0) {
      let p = poses[0].pose['keypoints']['0']['position'];
      faceX = lerp(faceX, p['x'], 0.5);
      faceY = lerp(faceY, p['y'], 0.5);
    }
}