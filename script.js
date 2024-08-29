const start = document.getElementById("start-button");

start.addEventListener("click", function () {
  const floors = parseInt(document.querySelector(".floor-input").value);
  const lifts = parseInt(document.querySelector(".lift-input").value);
  const container = document.querySelector(".simulator-Container");

  if (isNaN(floors) || isNaN(lifts) || floors < 0 || lifts < 1) {
    alert("Please enter valid numbers for floors and lifts.");
    return;
  }

  // Check if only floor 0 is present or only one lift
  if (floors === 0) {
    alert("for floor 0, No lift is required ");
    return;

  }
  container.innerHTML = "";
  initializeBuilding(floors, lifts, container);
});

let liftsPositionArray = [];
let liftsAvailableArray = [];
let requestedLiftArray = [];
let floorServiced = [];

function initializeBuilding(floors, lifts, container) {
  // Initialize the building with floors and lifts
  for (let i = floors; i >= 0; i--) { // Start from floor 0
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

    if (i === 0) { // Change from floor 1 to floor 0
      const liftsContainer = document.createElement("div");
      liftsContainer.classList.add("lifts-container");
      for (let j = 0; j < lifts; j++) {
        const liftDiv = document.createElement("div");
        liftDiv.classList.add("lift");
        liftDiv.dataset.lift = j + 1; // as j starts from 0
        liftDiv.dataset.currentFloor = 0; // Set current floor to 0
        liftDiv.innerHTML = `
          <div class="lift-door left-door"></div>
          <div class="lift-door right-door"></div>
        `;
        liftsContainer.appendChild(liftDiv);
        liftsPositionArray.push(0); // All lifts start from the ground floor (0).
        liftsAvailableArray.push(true); // All lifts start as available.
      }
      floorDiv.appendChild(liftsContainer);
    }
    container.appendChild(floorDiv);
  }

  for (let i = 0; i <= floors; i++) { // Adjust to include floor 0
    floorServiced[i] = false; // Lifts haven't serviced any floor.
  }
  document.querySelectorAll(".upBtn, .downBtn").forEach((button) => {
    button.addEventListener("click", function () {
      askForLift(parseInt(this.dataset.floor));
    });
  });
}

function askForLift(requestedFloor) {
  // Check if the floor is already being serviced
  if (!floorServiced[requestedFloor]) {
    requestedLiftArray.push(requestedFloor);
    getaLift();
    floorServiced[requestedFloor] = true; // Mark that a lift has been requested
  }
}

function getaLift() {
  while (requestedLiftArray.length > 0) {
    const requestedFloor = requestedLiftArray[0]; // Get the first requested floor
    const liftIndex = findNearestAvailableLift(requestedFloor);
    if (liftIndex !== -1) {
      moveLift(liftIndex, requestedFloor);
      requestedLiftArray.shift(); // Remove the processed request
    } else {
      break; // No available lift, wait for one to become available
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

function moveLift(from, to) {
  const liftElement = document.querySelector(`.lift[data-lift="${from + 1}"]`);
  const currentFloor = liftsPositionArray[from];
  const floorHeight = document.querySelector(".floor").offsetHeight;
  const distance = Math.abs(currentFloor - to);
  const travelTime = distance * 2; // 2 seconds per floor

  liftsAvailableArray[from] = false; // Mark lift as busy

  liftElement.style.transition = `transform ${travelTime}s linear`;
  liftElement.style.transform = `translateY(-${floorHeight * to}px)`; // Adjust for floor 0

  setTimeout(() => {
    liftsPositionArray[from] = to; // Update lift position
    openLiftDoors(liftElement);

    setTimeout(() => {
      closeLiftDoors(liftElement);
      setTimeout(() => {
        liftsAvailableArray[from] = true; // Mark lift as available
        floorServiced[to] = false;
        getaLift();
      }, 2500);
    }, 2500); // Doors stay open for 2.5 seconds
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
