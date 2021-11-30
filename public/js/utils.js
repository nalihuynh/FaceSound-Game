function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // checks if pose keypoints are within video frame
  function checkKeypointWithinFrame(x,y,r) {
    if (x-r < 0 || x+r > vidWidth || y-r < 0 || y+r > vidHeight) {
      return false;
    }
    return true;
  }
  
  // checks if skeleton lines are within video frame
  function checkLineWithinFrame(x1, y1, x2, y2) {
    if (x1 < 0 || x1 > vidWidth || x2 < 0 || x2 > vidWidth ||
      y1 < 0 || y1 > vidHeight || y2 < 0 || y2 > vidHeight) {
      return false;
    }
    return true;
  }
  
  // draws ellipses over the detected keypoints
  function drawKeypoints()  {
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i].pose;
      for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j];
        // if keypoint probablity is greater than 0.2, draw it
        if (keypoint.score > 0.2) {
          fill(255);
          noStroke();
          let r = 5;
          if (checkKeypointWithinFrame(keypoint.position.x, keypoint.position.y, r)) {
            ellipse(keypoint.position.x, keypoint.position.y, r, r);
          }
        }
      }
    }
  }
  
  // draws skeletons
  function drawSkeleton() {
    for (let i = 0; i < poses.length; i++) {
      let skeleton = poses[i].skeleton;
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        stroke(255);
        if (checkLineWithinFrame(partA.position.x, partA.position.y, partB.position.x, partB.position.y)) {
          line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
      }
    }
  }
  
  // change status message on pose model creation
  function modelReady() {
    // select('#message').html('webcam connected!');
    console.log('webcam connected!');
  }
  