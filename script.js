const start = document.getElementById("start-button");

start.addEventListener("click", function () {
  const floors = parseInt(document.querySelector(".floor-input").value);
  const lifts = parseInt(document.querySelector(".lift-input").value);
  const container = document.querySelector(".simulator-Container");

  if (isNaN(floors) || isNaN(lifts) || floors < 1 || lifts < 1) {
    alert("Please enter valid numbers for floors and lifts.");
    return;
  }
  if (floors == 1) {
    alert("For 1 floor we donot need a lift bro");
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
  for (let i = floors; i > 0; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");
    floorDiv.dataset.floor = i;

    const floorControls = document.createElement("div");
    floorControls.classList.add("controls-container");
    floorControls.innerHTML = `
      <span>Floor ${i}</span>
      ${i < floors ? `<button class="upBtn" data-floor="${i}">↑ </button>` : ""}
      ${i > 1 ? `<button class="downBtn" data-floor="${i}">↓</button>` : ""}
    `;
    floorDiv.appendChild(floorControls);

    if (i === 1) {
      const liftsContainer = document.createElement("div");
      liftsContainer.classList.add("lifts-container");
      for (let j = 0; j < lifts; j++) {
        const liftDiv = document.createElement("div");
        liftDiv.classList.add("lift");
        liftDiv.dataset.lift = j + 1; // as j startes from 0
        liftDiv.dataset.currentFloor = 1;
        liftDiv.innerHTML = `
          <div class="lift-door left-door"></div>
          <div class="lift-door right-door"></div>
        `;
        liftsContainer.appendChild(liftDiv);
        liftsPositionArray.push(1); // All lifts start from the ground floor.
        liftsAvailableArray.push(true); // All lifts start as available.
      }
      floorDiv.appendChild(liftsContainer);
    }
    container.appendChild(floorDiv);
  }

  for (let i = 1; i <= floors; i++) {
    floorServiced[i] = false; // Lifts havent serviced to any floor.
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
    floorServiced[requestedFloor] = true; // Marking as that particluar floor has a lift
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
  liftElement.style.transform = `translateY(-${floorHeight * (to - 1)}px)`;

  setTimeout(() => {
    liftsPositionArray[from] = to; // Update lift position
    openLiftDoors(liftElement);

    setTimeout(() => {
      closeLiftDoors(liftElement);
      liftsAvailableArray[from] = true; // Mark lift as available
      floorServiced[to] = false;
      getaLift(); // Process the next request in the queue
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
