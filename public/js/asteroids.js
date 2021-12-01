function createAsteroid(type, x, y) {
  var a = createSprite(x, y);
  var img = loadImage('assets/asteroid'+floor(random(0, 3))+'.png');
  img.resize(50,50);
  a.addImage(img);
  a.setSpeed(2.5-(type/2), random(360));
  a.rotationSpeed = 0.5;
  // a.debug = true;
  a.type = type;
  
  if (type == 2) {
    a.scale = 0.6;
  }
  if (type == 1) {
    a.scale = 0.3;
  }
  
  a.mass = 2+a.scale;
  a.setCollider('circle', 0, 0, 50);
  asteroids.add(a);
  return a;
}

function asteroidHit(asteroid, bullet) {
  let particleNum = 10;

  if (bullet.removed) {return;}

  var newType = asteroid.type-1;
  
  // split hit asteroid into smaller pieces
  if(newType>0) {
    createAsteroid(newType, asteroid.position.x, asteroid.position.y);
    createAsteroid(newType, asteroid.position.x, asteroid.position.y);
  } else {
    console.log('hit ship');
  }
  
  // add explosion particles
  for(var i=0; i<particleNum; i++) {
    var p = createSprite(bullet.position.x, bullet.position.y);
    p.addImage(particleImg);
    p.setSpeed(random(3, 5), random(360));
    p.friction = 0.95;
    p.life = 15;
  }
  
  score += 10;
  
  bullet.remove();
  asteroid.remove();
}

function shipHit(bullet) {
  let particleNum = 5;

  if (bullet.removed) {return;}
  
  // add explosion particles
  for(var i=0; i<particleNum; i++) {
    var p = createSprite(bullet.position.x, bullet.position.y);
    p.addImage(particleImg);
    p.setSpeed(random(3, 5), random(360));
    p.friction = 0.95;
    p.life = 15;
  }

  livesNum -= 1;
  
  bullet.remove();
}