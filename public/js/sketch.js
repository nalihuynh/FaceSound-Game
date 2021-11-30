let video, vidWidth, vidHeight;

let poseNet;
let poses = [];
let faceX = 0;
let faceY = 0;

let canvas;

let moveDir = '';

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
}

function draw() {
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
        } else if (faceX < video.width/2 - ellipseRadius) {
            moveDir = 'right';
        } else if (faceX > video.width/2 + ellipseRadius) {
            moveDir = 'left';
        } else if (faceX < video.width/2 + ellipseRadius &&
                    faceX > video.width/2 - ellipseRadius &&
                    faceY < video.height/2 + ellipseRadius &&
                    faceY > video.height/2 - ellipseRadius ) {
            moveDir = 'none';
        }

        scale(-1,1);
        console.log(moveDir);

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