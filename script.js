// Get references to game elements
const gameBoard = document.getElementById('gameBoard');
const striker = document.getElementById('striker');
const shootBtn = document.getElementById('shootBtn');
const predictBtn = document.getElementById('predictBtn'); // Button for prediction
const speedControl = document.getElementById('speedControl');
const angleControl = document.getElementById('angleControl');
const directionBar = document.querySelector('.direction-bar');

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
  { id: "white1", x: 230, y: 180, vx: 0, vy: 0, radius: coinRadius },
  { id: "white2", x: 260, y: 180, vx: 0, vy: 0, radius: coinRadius },
  { id: "black1", x: 200, y: 230, vx: 0, vy: 0, radius: coinRadius },
  { id: "white3", x: 250, y: 180, vx: 0, vy: 0, radius: coinRadius },
  { id: "redCoin", x: 230, y: 230, vx: 0, vy: 0, radius: coinRadius },
];

// Update the direction bar to show the selected angle
function updateDirectionBar() {
  const angle = parseFloat(angleControl.value); // Get angle value
  const radians = (angle * Math.PI) / 180;

  // Position and rotate the direction bar
  directionBar.style.transform = `rotate(${angle}deg)`;
  directionBar.style.left = `${strikerPosition.x + strikerRadius}px`;
  directionBar.style.top = `${strikerPosition.y}px`;
}

// Shoot the striker
function shootStriker() {
  const angle = parseFloat(angleControl.value); // Use the selected angle
  const speed = parseFloat(speedControl.value);
  const radians = (angle * Math.PI) / 180;

  // Assign initial velocity based on angle and speed
  strikerVelocity.x = Math.cos(radians) * speed;
  strikerVelocity.y = Math.sin(radians) * speed;
  isStrikerMoving = true;

  // Disable the shoot button to prevent further clicks while the striker is moving
  shootBtn.disabled = true;
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

// Update striker position
function updateStriker() {
  if (isStrikerMoving) {
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
