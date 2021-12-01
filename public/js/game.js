function playGame() {
    background(0);
    let volume = mic.getLevel();
    console.log(volume);

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

    if (!ship.removed && volume * 200 > 5) {
        let bullet = createSprite(ship.position.x, ship.position.y);
        bullet.addImage(bulletImg);
        bullet.setSpeed(10 + ship.getSpeed(), ship.rotation);
        bullet.life = 30;
        bullets.add(bullet);
    }

    drawSprites();
    showPlayer();
}

function showPlayer() {
    push();
        imageMode(CORNER);
        translate(video.width,windowHeight - vidHeight);
        scale(-1,1);

        // webcam video
        image(video, 0, 0, vidWidth, vidHeight);

        // box to track head position
        let ellipseRadius = ellipseDiameter / 2;
        noStroke();
        fill(159,239,53,90); // translucent green
        ellipseMode(CENTER);
        ellipse( video.width / 2, (video.height / 2), ellipseDiameter, ellipseDiameter);

        // pose tracking points
        drawKeypoints();

        // head direction text
        if (faceY > video.height/2 + ellipseRadius) {
            // down
            if (ship.position.y < windowHeight - 50) {
                ship.velocity.y = 75;
            }
        } else if (faceY < video.height/2 - ellipseRadius) {
            // up
            if (ship.position.y > 50) {
                ship.velocity.y = -75;
            }
            
        } else if (faceX < video.width/2 - ellipseRadius) {
            // right
            
            ship.rotation += 4;
        } else if (faceX > video.width/2 + ellipseRadius) {
            // left
            
            ship.rotation -= 4;
        } else if (faceX < video.width/2 + ellipseRadius &&
                    faceX > video.width/2 - ellipseRadius &&
                    faceY < video.height/2 + ellipseRadius &&
                    faceY > video.height/2 - ellipseRadius ) {
            // center
            ship.velocity.x = 0;
            ship.velocity.y = 0;
        }
    pop();
}