// Get references to game elements
const gameBoard = document.getElementById('gameBoard');
const striker = document.getElementById('striker');
const shootBtn = document.getElementById('shootBtn');
const predictBtn = document.getElementById('predictBtn'); // Button for prediction
const speedControl = document.getElementById('speedControl');
const angleControl = document.getElementById('angleControl');
const directionBar = document.querySelector('.direction-bar');
const predictionCanvas = document.getElementById("predictionCanvas");
const ctx = predictionCanvas.getContext("3d");
const horizontalControl = document.getElementById('horizontalControl'); // Get the horizontal control slider



// Constants for physics
const friction = 0.98;
const strikerRadius = 20;
const coinRadius = 15;
const pocketRadius = 25;

let strikerPosition = { x: 238, y: 460 }; // Starting position
let strikerVelocity = { x: 0, y: 0 };
let isStrikerMoving = false;

const pockets = [
  { x: 0, y: 0 },
  { x: 460, y: 0 },
  { x: 0, y: 460 },
  { x: 460, y: 460 },
];

const coins = [
  { id: "white1", x: 270, y: 270, vx: 0, vy: 0, radius: coinRadius },
  { id: "white2", x: 290, y: 256, vx: 0, vy: 0, radius: coinRadius },
  { id: "black1", x: 244, y: 244, vx: 0, vy: 0, radius: coinRadius },
  { id: "black2", x: 270, y: 230, vx: 0, vy: 0, radius: coinRadius },
  { id: "black3", x: 235, y: 230, vx: 0, vy: 0, radius: coinRadius },
  { id: "black4", x: 220, y: 245, vx: 0, vy: 0, radius: coinRadius },
  { id: "white3", x: 250, y: 270, vx: 0, vy: 0, radius: coinRadius },
  { id: "white4", x: 230, y: 270, vx: 0, vy: 0, radius: coinRadius },
  { id: "redCoin", x: 255, y: 255, vx: 0, vy: 0, radius: coinRadius },
];

function updateDirectionBar() {
  const angle = parseFloat(angleControl.value); // Get angle value
  const radians = (angle * Math.PI) / 180;

  // Position and rotate the direction bar
  directionBar.style.transform = `rotate(${angle}deg)`;
  directionBar.style.left = `${strikerPosition.x + strikerRadius}px`; // Adjust direction bar position based on striker
  directionBar.style.top = `${strikerPosition.y}px`; // Place the direction bar at the striker's position
}


// Shoot the striker
function shootStriker() {
  const angle = parseFloat(angleControl.value); // Use the selected angle
  const speed = parseFloat(speedControl.value) * 2;
  const radians = (angle * Math.PI) / 180;

  // Assign initial velocity based on angle and speed
  strikerVelocity.x = Math.cos(radians) * speed;
  strikerVelocity.y = Math.sin(radians) * speed;
  isStrikerMoving = true;

  // Disable the shoot button to prevent further clicks while the striker is moving
  shootBtn.disabled = true;
}

// Function to draw direction line (arrow) on the prediction canvas
function drawDirectionLine() {
  ctx.clearRect(0, 0, predictionCanvas.width, predictionCanvas.height); // Clear canvas

  const angle = parseFloat(angleControl.value); // Get selected angle
  const radians = (angle * Math.PI) / 180;

  const lineLength = 100; // Length of the arrow/line
  const endX = strikerPosition.x + Math.cos(radians) * lineLength; // End position X of the arrow
  const endY = strikerPosition.y - Math.sin(radians) * lineLength; // End position Y of the arrow

  // Draw the line (arrow) to indicate direction
  ctx.beginPath();
  ctx.moveTo(strikerPosition.x, strikerPosition.y); // Starting point (striker position)
  ctx.lineTo(endX, endY); // Ending point (calculated based on angle)
  ctx.strokeStyle = "blue"; // Arrow color
  ctx.lineWidth = 2; // Arrow line width
  ctx.stroke(); // Draw the line

  // Optionally, draw an arrowhead
  const arrowSize = 10; // Size of the arrowhead
  const angleOffset = Math.PI / 6; // Angle for the arrowhead
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - arrowSize * Math.cos(radians - angleOffset), endY + arrowSize * Math.sin(radians - angleOffset)); // Left arrowhead
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - arrowSize * Math.cos(radians + angleOffset), endY + arrowSize * Math.sin(radians + angleOffset)); // Right arrowhead
  ctx.strokeStyle = "blue"; // Arrowhead color
  ctx.lineWidth = 2; // Arrowhead line width
  ctx.stroke();
}

// Event listener for when the angle control slider is adjusted
angleControl.addEventListener("input", function() {
  drawDirectionLine(); // Redraw the direction line whenever the angle is changed
});


function updateStriker() {
  if (isStrikerMoving) {
    // Calculate speed magnitude
    const speed = Math.sqrt(strikerVelocity.x ** 2 + strikerVelocity.y ** 2);
    const maxSpeed = 20; // Maximum speed limit

    // Apply speed limit
    if (speed > maxSpeed) {
      strikerVelocity.x *= maxSpeed / speed;
      strikerVelocity.y *= maxSpeed / speed;
    }

    // Update position and check for collisions
    strikerPosition.x += strikerVelocity.x;
    strikerPosition.y += strikerVelocity.y;

    // Apply friction
    strikerVelocity.x *= friction;
    strikerVelocity.y *= friction;

    // Other existing logic...
  }
}

// Check for collision between two circular objects
function detectCollision(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < obj1.radius + obj2.radius;
}

// Resolve collision by updating velocities
function resolveCollision(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return; // Prevent division by zero

  // Calculate collision response
  const normal = { x: dx / distance, y: dy / distance };
  const tangent = { x: -normal.y, y: normal.x };

  const v1n = normal.x * obj1.vx + normal.y * obj1.vy;
  const v2n = normal.x * obj2.vx + normal.y * obj2.vy;
  const v1t = tangent.x * obj1.vx + tangent.y * obj1.vy;
  const v2t = tangent.x * obj2.vx + tangent.y * obj2.vy;

  const v1nFinal = v2n;
  const v2nFinal = v1n;

  obj1.vx = v1nFinal * normal.x + v1t * tangent.x;
  obj1.vy = v1nFinal * normal.y + v1t * tangent.y;
  obj2.vx = v2nFinal * normal.x + v2t * tangent.x;
  obj2.vy = v2nFinal * normal.y + v2t * tangent.y;

  const overlap = obj1.radius + obj2.radius - distance;
  obj1.x -= overlap * normal.x / 2;
  obj1.y -= overlap * normal.y / 2;
  obj2.x += overlap * normal.x / 2;
  obj2.y += overlap * normal.y / 2;
}

// Check if a coin or striker falls into a pocket
function checkPocket(obj, isStriker = false) {
  pockets.forEach((pocket) => {
    const dx = pocket.x - obj.x;
    const dy = pocket.y - obj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < pocketRadius) {
      // Remove from play if it falls into a pocket
      if (isStriker) {
        isStrikerMoving = false;
        striker.style.display = 'none'; // Hide the striker
        console.log('Striker fell into the pocket!');
        resetStrikerPosition(); // Reset striker position

        // Re-enable the shoot button when striker falls into a pocket
        shootBtn.disabled = false;
      } else {
        const coinElement = document.getElementById(obj.id);
        coinElement.style.display = 'none'; // Hide the coin
        obj.inPlay = false;
        console.log(`Coin ${obj.id} fell into the pocket!`);
      }
    }
  });
}

// Reset striker position to the starting point
function resetStrikerPosition() {
  strikerPosition = { x: 238, y: 419 };
  strikerVelocity = { x: 0, y: 0 };
  striker.style.left = `${strikerPosition.x}px`;
  striker.style.top = `${strikerPosition.y}px`;
  striker.style.display = 'block'; // Show the striker again
}

// Check if a coin or striker falls into a pocket
function checkPocket(obj, isStriker = false) {
  pockets.forEach((pocket) => {
    const dx = pocket.x - obj.x;
    const dy = pocket.y - obj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < pocketRadius) {
      // If the striker falls into the pocket
      if (isStriker) {
        isStrikerMoving = false;
        striker.style.display = 'none'; // Hide the striker
        console.log('Striker fell into the pocket!');
        resetStrikerPosition(); // Reset striker position

        // Re-enable the shoot button when striker falls into a pocket
        shootBtn.disabled = false;

        // Re-enable the horizontal control when striker falls into a pocket
        horizontalControl.disabled = false;
      } else {
        const coinElement = document.getElementById(obj.id);
        coinElement.style.display = 'none'; // Hide the coin
        obj.inPlay = false;
        console.log(`Coin ${obj.id} fell into the pocket!`);
      }
    }
  });
}


// Function to draw navigation path (predicted movement of striker)
function drawNavigationLine() {
  ctx.clearRect(0, 0, predictionCanvas.width, predictionCanvas.height); // Clear previous drawing

  const angle = parseFloat(angleControl.value); // Get the selected angle
  const speed = parseFloat(speedControl.value) * 2; // Get the selected speed
  const radians = (angle * Math.PI) / 180;

  const navigationLineLength = 200; // Length of the navigation path
  let x = strikerPosition.x;
  let y = strikerPosition.y;
  let velocityX = Math.cos(radians) * speed;
  let velocityY = Math.sin(radians) * speed;

  // Draw the predicted path
  ctx.beginPath();
  ctx.moveTo(x, y); // Start from the striker's current position

  for (let i = 0; i < 50; i++) { // 50 steps for path prediction
    x += velocityX;
    y += velocityY;

    // Apply friction to simulate deceleration
    velocityX *= friction;
    velocityY *= friction;

    // Draw a small segment to form the navigation line
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = "green"; // Navigation line color
  ctx.lineWidth = 1; // Line width
  ctx.stroke(); // Draw the path

  // Optionally, we can add a fading effect (to simulate distance) or a color gradient to make it look more realistic.
}

// Event listener for the angle control slider to update the navigation line
angleControl.addEventListener("input", function() {
  drawDirectionLine();  // Redraw direction line
  drawNavigationLine(); // Redraw navigation path
});

speedControl.addEventListener("input", function() {
  drawNavigationLine(); // Redraw navigation path when speed changes
});



// Update the striker position and check if it is still moving
function updateStriker() {
  if (isStrikerMoving) {
    // Disable horizontal control when the striker is moving
    horizontalControl.disabled = true;

    strikerPosition.x += strikerVelocity.x;
    strikerPosition.y += strikerVelocity.y;

    // Apply friction
    strikerVelocity.x *= friction;
    strikerVelocity.y *= friction;

    // Check for board edges (but don't hide striker here)
    if (strikerPosition.x <= 0 || strikerPosition.x >= 460) strikerVelocity.x *= -1;
    if (strikerPosition.y <= 0 || strikerPosition.y >= 460) strikerVelocity.y *= -1;

    // Update striker position on screen
    striker.style.left = `${strikerPosition.x}px`;
    striker.style.top = `${strikerPosition.y}px`;

    // Stop movement if velocity is minimal
    if (Math.abs(strikerVelocity.x) < 0.1 && Math.abs(strikerVelocity.y) < 0.1) {
      isStrikerMoving = false;
      resetStrikerPosition(); // Reset the striker position when it stops

      // Re-enable the shoot button since the striker has stopped
      shootBtn.disabled = false;

      // Re-enable the horizontal control when the striker stops
      horizontalControl.disabled = false;
    }

    // Check if striker falls into a pocket
    checkPocket({ x: strikerPosition.x, y: strikerPosition.y }, true);

    // Check for collisions with coins
    coins.forEach((coin) => {
      if (
        coin.inPlay !== false &&
        detectCollision(
          { x: strikerPosition.x, y: strikerPosition.y, radius: strikerRadius },
          coin
        )
      ) {
        resolveCollision(
          {
            x: strikerPosition.x,
            y: strikerPosition.y,
            vx: strikerVelocity.x,
            vy: strikerVelocity.y,
            radius: strikerRadius,
          },
          coin
        );
      }
    });
  }
}
// Update coin positions
function updateCoins() {
  coins.forEach((coin) => {
    if (coin.inPlay === false) return;

    coin.x += coin.vx;
    coin.y += coin.vy;

    // Apply friction
    coin.vx *= friction;
    coin.vy *= friction;

    // Check if the coin falls into a pocket
    checkPocket(coin);

    // Update coin position
    const coinElement = document.getElementById(coin.id);
    coinElement.style.left = `${coin.x}px`;
    coinElement.style.top = `${coin.y}px`;
  });
}
// Predict the best shot
function predictShot() {
  if (isStrikerMoving) return; // Avoid predictions while the striker is in motion

  let bestCoin = null;
  let bestPocket = null;
  let shortestPath = Infinity;

  // Find the best coin and pocket combination
  coins.forEach((coin) => {
    if (coin.inPlay === false) return;

    pockets.forEach((pocket) => {
      const coinToPocketDistance = Math.sqrt(
        Math.pow(pocket.x - coin.x, 2) + Math.pow(pocket.y - coin.y, 2)
      );

      const strikerToCoinDistance = Math.sqrt(
        Math.pow(coin.x - strikerPosition.x, 2) + Math.pow(coin.y - strikerPosition.y, 2)
      );

      const totalPath = coinToPocketDistance + strikerToCoinDistance;

      if (totalPath < shortestPath) {
        shortestPath = totalPath;
        bestCoin = coin;
        bestPocket = pocket;
      }
    });
  });

  if (bestCoin && bestPocket) {
    // Calculate the angle to aim at the best coin
    const dx = bestCoin.x - strikerPosition.x;
    const dy = bestCoin.y - strikerPosition.y;
    const angle = Math.atan2(-dy, dx) * (180 / Math.PI); // Convert to degrees

    // Update angle slider and direction bar
    angleControl.value = angle.toFixed(2);
    updateDirectionBar();

    console.log(`Aim at coin: ${bestCoin.id}, Angle: ${angle.toFixed(2)}`);
  }
}



// Event listener for horizontal movement of the striker
horizontalControl.addEventListener('input', function() {
  strikerPosition.x = parseFloat(horizontalControl.value);
  striker.style.left = `${strikerPosition.x}px`; // Update the striker's position visually
});


// Update coin positions and handle border collisions
function updateCoins() {
  coins.forEach((coin) => {
    if (coin.inPlay === false) return;

    coin.x += coin.vx;
    coin.y += coin.vy;

    // Apply friction
    coin.vx *= friction;
    coin.vy *= friction;

    // Check for board edges
    if (coin.x - coin.radius <= 0 || coin.x + coin.radius >= gameBoard.offsetWidth) {
      coin.vx *= -1; // Reverse horizontal velocity
      coin.x = Math.max(coin.radius, Math.min(coin.x, gameBoard.offsetWidth - coin.radius)); // Keep coin within bounds
    }
    if (coin.y - coin.radius <= 0 || coin.y + coin.radius >= gameBoard.offsetHeight) {
      coin.vy *= -1; // Reverse vertical velocity
      coin.y = Math.max(coin.radius, Math.min(coin.y, gameBoard.offsetHeight - coin.radius)); // Keep coin within bounds
    }
    // Check if the coin falls into a pocket
    checkPocket(coin);

    // Update coin position on screen
    const coinElement = document.getElementById(coin.id);
    coinElement.style.left = `${coin.x - coin.radius}px`;
    coinElement.style.top = `${coin.y - coin.radius}px`;
  });
}

// Game loop
function gameLoop() {
  updateStriker();
  updateCoins();
  requestAnimationFrame(gameLoop);
}

// Event listeners
shootBtn.addEventListener('click', shootStriker);
predictBtn.addEventListener('click', predictShot);
angleControl.addEventListener('input', updateDirectionBar);

// Start the game loop
gameLoop();
