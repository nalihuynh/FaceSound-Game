// webcam video stuff
let video, vidWidth, vidHeight;

// face tracking stuff
let poseNet;
let poses = [];
let faceX = 0;
let faceY = 0;

// asteroids stuff
let shipImg, bulletImg, particleImg;

let asteroidNum = 3;
let asteroidImgs = [];

let bullets, asteroids, ship;
let MARGIN = 40;

// other
let canvas;
let moveDir = '';

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
    vidWidth = windowWidth / 4;
    vidHeight = vidWidth * 0.75;

    canvas = createCanvas(windowWidth, windowHeight);
    background(0);

    video = createCapture(VIDEO);
    video.size(vidWidth, vidHeight);

    video.hide();

    // set up pose tracking
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', findFaceOnPoses);

    // asteroids stuff
    ship = createSprite(width/2, height/2);
    ship.maxSpeed = 6;
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
    background(0);

    for(let i=0; i<allSprites.length; i++) {
        let s = allSprites[i];
        if(s.position.x<-MARGIN) s.position.x = width+MARGIN;
        if(s.position.x>width+MARGIN) s.position.x = -MARGIN;
        if(s.position.y<-MARGIN) s.position.y = height+MARGIN;
        if(s.position.y>height+MARGIN) s.position.y = -MARGIN;
    }

    asteroids.overlap(ship, asteroidHit);
    asteroids.overlap(bullets, asteroidHit);

    ship.bounce(asteroids);

    if (keyWentDown('x')) {
        let bullet = createSprite(ship.position.x, ship.position.y);
        bullet.addImage(bulletImg);
        bullet.setSpeed(10+ship.getSpeed(), ship.rotation);
        bullet.life = 30;
        bullets.add(bullet);
    }

    drawSprites();
    showVideoFeed();
}

function showVideoFeed() {
    push();
        imageMode(CORNER);
        translate(video.width,windowHeight - vidHeight);
        scale(-1,1);

        // webcam video
        image(video, 0, 0, vidWidth, vidHeight);

        // box to track head position
        let ellipseDiameter = vidHeight * 0.15;
        let ellipseRadius = ellipseDiameter / 2;
        noStroke();
        fill(159,239,53,90);
        ellipseMode(CENTER);
        ellipse( video.width / 2, (video.height / 2), ellipseDiameter, ellipseDiameter);
        

        // pose tracking points
        drawKeypoints();

        // head direction text
        if (faceY > video.height/2 + ellipseRadius) {
            moveDir = 'down';
        } else if (faceY < video.height/2 - ellipseRadius) {
            moveDir = 'up';
            ship.addSpeed(0.2, ship.rotation);
        } else if (faceX < video.width/2 - ellipseRadius) {
            moveDir = 'right';
            ship.rotation += 4;
        } else if (faceX > video.width/2 + ellipseRadius) {
            moveDir = 'left';
            ship.rotation -= 4;
        } else if (faceX < video.width/2 + ellipseRadius &&
                    faceX > video.width/2 - ellipseRadius &&
                    faceY < video.height/2 + ellipseRadius &&
                    faceY > video.height/2 - ellipseRadius ) {
            moveDir = 'none';
        }

        scale(-1,1);
        // console.log(moveDir);

        textSize(12);
        fill(255);
        textAlign(CENTER);
        text('direction: ' + moveDir, - video.width/2, 25);
    pop();
}

function findFaceOnPoses(results) {
    poses = results;
    if (poses.length > 0) {
      let p = poses[0].pose['keypoints']['0']['position'];
      faceX = lerp(faceX, p['x'], 0.5);
      faceY = lerp(faceY, p['y'], 0.5);
    }
}