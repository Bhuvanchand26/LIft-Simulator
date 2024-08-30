const start = document.getElementById("start-button");

start.addEventListener("click", function () {
  const floors = parseInt(document.querySelector(".floor-input").value);
  const lifts = parseInt(document.querySelector(".lift-input").value);
  const container = document.querySelector(".simulator-Container");
  const headContainer = document.querySelector(".flexbox-container");

  if (isNaN(floors) || isNaN(lifts) || floors < 0 || lifts < 0) {
    alert("Please enter valid numbers for floors and lifts.");
    return;
  }
  if (floors === 0) {
    alert("For floor 0, no lift is required.");
    return;
  }
  headContainer.style.display = "none";
  container.style.display = "block";

  container.innerHTML = "";
  initializeBuilding(floors, lifts, container);
});

let liftsPositionArray = [];
let liftsAvailableArray = [];
let requestedLiftArray = {
  up: [], // Separate list for "up" requests
  down: [], // Separate list for "down" requests
};
let floorServiced = {
  up: [],
  down: [],
};

function initializeBuilding(floors, lifts, container) {
  // Initialize the building with floors and lifts
  for (let i = floors; i >= 0; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");
    floorDiv.dataset.floor = i;

    const floorControls = document.createElement("div");
    floorControls.classList.add("controls-container");
    floorControls.innerHTML = `
      <span>Floor ${i}</span>
      ${i < floors ? `<button class="upBtn" data-floor="${i}">↑</button>` : ""}
      ${i > 0 ? `<button class="downBtn" data-floor="${i}">↓</button>` : ""}
    `;
    floorDiv.appendChild(floorControls);

    if (i === 0) {
      const liftsContainer = document.createElement("div");
      liftsContainer.classList.add("lifts-container");
      for (let j = 0; j < lifts; j++) {
        const liftDiv = document.createElement("div");
        liftDiv.classList.add("lift");
        liftDiv.dataset.lift = j + 1;
        liftDiv.dataset.currentFloor = 0;
        liftDiv.innerHTML = `
          <div class="lift-door left-door"></div>
          <div class="lift-door right-door"></div>
        `;
        liftsContainer.appendChild(liftDiv);
        liftsPositionArray.push(0);
        liftsAvailableArray.push(true);
      }
      floorDiv.appendChild(liftsContainer);
    }
    container.appendChild(floorDiv);
  }

  for (let i = 0; i <= floors; i++) {
    floorServiced.up[i] = false;
    floorServiced.down[i] = false;
  }

  // Attach event listeners for buttons
  document.querySelectorAll(".upBtn").forEach((button) => {
    button.addEventListener("click", function () {
      askForLift(parseInt(this.dataset.floor), "up");
    });
  });

  document.querySelectorAll(".downBtn").forEach((button) => {
    button.addEventListener("click", function () {
      askForLift(parseInt(this.dataset.floor), "down");
    });
  });
}

function askForLift(requestedFloor, direction) {
  // Check if the floor is already being serviced in the requested direction
  if (!floorServiced[direction][requestedFloor]) {
    requestedLiftArray[direction].push(requestedFloor);
    getaLift(direction);
    floorServiced[direction][requestedFloor] = true; // Mark that a lift has been requested for this direction
  }
}

function getaLift(direction) {
  while (requestedLiftArray[direction].length > 0) {
    const requestedFloor = requestedLiftArray[direction][0];
    const liftIndex = findNearestAvailableLift(requestedFloor);
    if (liftIndex !== -1) {
      moveLift(liftIndex, requestedFloor, direction);
      requestedLiftArray[direction].shift(); // Remove the processed request
    } else {
      break;
    }
  }
}

function findNearestAvailableLift(requestedFloor) {
  let nearestLiftIndex = -1;
  let minDistance = Infinity;

  for (let index = 0; index < liftsPositionArray.length; index++) {
    const currentFloor = liftsPositionArray[index];
    if (liftsAvailableArray[index]) {
      const distance = Math.abs(currentFloor - requestedFloor);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLiftIndex = index;
      }
    }
  }
  return nearestLiftIndex;
}

function moveLift(from, to, direction) {
  const liftElement = document.querySelector(`.lift[data-lift="${from + 1}"]`);
  const currentFloor = liftsPositionArray[from];
  const floorHeight = document.querySelector(".floor").offsetHeight;
  const distance = Math.abs(currentFloor - to);
  const travelTime = distance * 2; // 2 seconds per floor

  liftsAvailableArray[from] = false;

  liftElement.style.transition = `transform ${travelTime}s linear`;
  liftElement.style.transform = `translateY(-${floorHeight * to}px)`;

  setTimeout(() => {
    liftsPositionArray[from] = to;
    openLiftDoors(liftElement);

    setTimeout(() => {
      closeLiftDoors(liftElement);
      setTimeout(() => {
        liftsAvailableArray[from] = true;
        floorServiced[direction][to] = false;
        getaLift(direction); // Continue processing lift requests in the same direction
      }, 2500);
    }, 2500);
  }, travelTime * 1000);
}

function openLiftDoors(liftElement) {
  liftElement.querySelector(".left-door").classList.add("open");
  liftElement.querySelector(".right-door").classList.add("open");
}

function closeLiftDoors(liftElement) {
  liftElement.querySelector(".left-door").classList.remove("open");
  liftElement.querySelector(".right-door").classList.remove("open");
}
