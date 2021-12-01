let currentScreen = 'setup';

// webcam video stuff
let video, vidWidth, vidHeight;

// face tracking stuff
let poseNet;
let poses = [];
let faceX = 0;
let faceY = 0;
let ellipseDiameter; // ellipse for tracking head movement

// audio stuff
let mic;

// asteroids stuff
let shipImg, bulletImg, particleImg;
let bullets, asteroids, ship;

let asteroidNum = 3;
let asteroidImgs = [];
let lasers = [];

let MARGIN = 50;

// other
let canvas;

let start = false;
let instructionsText = '';

function preload() {
    shipImg = loadImage('assets/ship.png');
    bulletImg = loadImage('assets/bullet.png');
    particleImg = loadImage('assets/particle.png');

    for (let i = 0 ;i < asteroidNum; i++) {
        let asteroidImg = loadImage(`assets/asteroid${i}.png`);
        asteroidImgs.push(asteroidImg);
    }
}

function setup() {
    // set up webcam video
    vidWidth = windowWidth / 3;
    vidHeight = vidWidth * 0.75;

    ellipseDiameter = vidHeight * 0.1;

    canvas = createCanvas(windowWidth, windowHeight);
    background(0);

    video = createCapture(VIDEO);
    video.size(vidWidth, vidHeight);

    video.hide();

    // set up pose tracking
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', findFaceOnPoses);

    // audio stuff
    mic = new p5.AudioIn();

    // asteroids stuff
    ship = createSprite(width/2, height/2);
    ship.maxSpeed = 10;
    ship.friction = 0.98;
    ship.setCollider('circle', 0,0,20);
    
    ship.addImage('normal', shipImg);
    
    asteroids = new Group();
    bullets = new Group();
    
    for(let i = 0; i<8; i++) {
        let ang = random(360);
        let px = width/2 + 1000 * cos(radians(ang));
        let py = height/2+ 1000 * sin(radians(ang));
        createAsteroid(3, px, py);
    }
}

function draw() {
    switch (currentScreen) {
        case 'setup':
            // console.log('setup screen');
            drawSetup();
            break;
        case 'game':
            console.log('game screen');
            playGame();
            break;
    }
}

function mousePressed() {
    start = true;
}

function keyPressed() {
    if (start && key == ' ') {
        currentScreen = 'game';
    }
}

function drawSetup() {
    background(0);

    textAlign(CENTER);
    textSize(12);
    fill(255);

    if (!start) {
        text('click to start tutorial.', width/2, height/2);
    }
    else { // user clicked start
        mic.start();
        let volume = mic.getLevel();
        console.log(volume);
    
        translate((windowWidth - vidWidth) / 2, (windowHeight - vidHeight) / 2);
        imageMode(CORNER);
        
        push();
        translate(video.width, 0);
        scale(-1,1);
    
        image(video, 0, 0, vidWidth, vidHeight);

        // pose tracking points
        drawKeypoints();
    
        // box to track head position
        let ellipseRadius = ellipseDiameter / 2;
        noStroke();
        fill(159,239,53,90); // translucent green
        // ellipseMode(CORNER);
        ellipse( video.width/2, video.height/2, ellipseDiameter, ellipseDiameter);

        // instructions
        scale(-1,1);
        let millis1 = millis();
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
        let textPadding = 20;

        if (faceY > video.height/2 + ellipseRadius) {
            push();
            scale(-1,1);
            text('down', -video.width/2, faceY + textPadding);
            pop();
        } else if (faceY < video.height/2 - ellipseRadius) {
            push();
            scale(-1,1);
            text('up', -video.width/2, faceY - textPadding);
            pop();
        } else if (faceX < video.width/2 - ellipseRadius) {
            push();
            scale(-1,1);
            text('right', -faceX + textPadding, video.height/2);
            pop();
        } else if (faceX > video.width/2 + ellipseRadius) {
            push();
            scale(-1,1);
            text('left', -faceX - textPadding, video.height/2);
            pop();
        } else if (faceX < video.width/2 + ellipseRadius &&
                    faceX > video.width/2 - ellipseRadius &&
                    faceY < video.height/2 + ellipseRadius &&
                    faceY > video.height/2 - ellipseRadius ) {

        }
    
        scale(-1,1);
        text('ready to start? press space', -video.width/2, video.height + 50);

        pop();
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