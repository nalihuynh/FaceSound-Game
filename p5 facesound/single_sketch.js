// Single-sketch example
var ship;
var asteroids = [];
var lasers = [];

function setup() {
  mic = new p5.AudioIn();
  mic.start();
  createCanvas(windowWidth, windowHeight);
  ship = new Ship();
  for (var i = 0; i < 5; i++) {
    asteroids.push(new Asteroid())
  }
}

function draw() {
  background(0);
  var volume = mic.getLevel();

  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].render();
    asteroids[i].update();
    asteroids[i].edges();
  }

  for (var i = lasers.length - 1; i >= 0; i--) {
    lasers[i].render();
    lasers[i].update();
    for (var j = asteroids.length - 1; j >= 0; j--) {
      if (lasers[i].hits(asteroids[j])) {
        var newAsteroids = asteroids[j].breakup();
        console.log(newAsteroids);
        asteroids = asteroids.concat(newAsteroids)
        asteroids.splice(j, 1);
        lasers.splice(i, 1);
        break;
      }
    }
  }

  ship.render();
  ship.turn();
  ship.update();
  ship.edges();

  if (volume * 200 > 5) {
    lasers.push(new Laser(ship.pos, ship.heading));
  }
}

function keyReleased() {
  ship.setRotation(0);
  ship.boosting(false);
}

function keyPressed() {
  if (keyCode == RIGHT_ARROW) {
    ship.setRotation(0.1);
  }
  else if (keyCode == LEFT_ARROW) {
    ship.setRotation(-0.1);
  }
  else if (keyCode == UP_ARROW) {
    ship.boosting(true);
  }
}

