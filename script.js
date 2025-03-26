/*********************************************************************
 * script.js 
 * 
 * Dice Roller with:
 * - Numeric dice (d4, d6, d8, d10, d12, d20)
 * - "Story" dice mode using images from /storyImages
 * - Final results: in story mode, no duplicate image appears (if possible)
 * - Custom row distribution for 1–10 dice; fallback for >10.
 * - A pop animation during rolling.
 *********************************************************************/

// DOM references
const diceTypeSelect = document.getElementById('diceType');
const diceCountInput = document.getElementById('diceCount');
const rollBtn        = document.getElementById('rollBtn');
const diceRows       = document.getElementById('diceRows');
const totalEl        = document.getElementById('total');
const rollSound      = document.getElementById('rollSound');

// We store dice in a single array, which holds either a number (for numeric dice)
// or a string representing the image path (for story dice).
let diceValues = [];

// Array of story images (ensure these paths and filenames match your file structure)
const storyImages = [
  "storyImages/alien.jpg",
  "storyImages/baby.jpg",
  "storyImages/balloon.jpg",
  "storyImages/bicycle.jpg",
  "storyImages/bird.jpg",
  "storyImages/book.jpg",
  "storyImages/car.jpg",
  "storyImages/castle.jpg",
  "storyImages/cat.jpg",
  "storyImages/city.jpg",
  "storyImages/cloud.jpg",
  "storyImages/crown.jpg",
  "storyImages/crystalball.jpg",
  "storyImages/detective.jpg",
  "storyImages/dog.jpg",
  "storyImages/dragon.jpg",
  "storyImages/fish.jpg",
  "storyImages/hole.jpg",
  "storyImages/horse.jpg",
  "storyImages/house.jpg",
  "storyImages/island.jpg",
  "storyImages/key.jpg",
  "storyImages/laugh.jpg",
  "storyImages/lightning.jpg",
  "storyImages/magnifier.jpg",
  "storyImages/map.jpg",
  "storyImages/monster.jpg",
  "storyImages/moon.jpg",
  "storyImages/mountain.jpg",
  "storyImages/mouse.jpg",
  "storyImages/potion.jpg",
  "storyImages/rainbow.jpg",
  "storyImages/robot.jpg",
  "storyImages/rocket.jpg",
  "storyImages/run.jpg",
  "storyImages/sad.jpg",
  "storyImages/school.jpg",
  "storyImages/ship.jpg",
  "storyImages/shout.jpg",
  "storyImages/sleep.jpg",
  "storyImages/snake.jpg",
  "storyImages/star.jpg",
  "storyImages/sun.jpg",
  "storyImages/superhero.jpg",
  "storyImages/swords.jpg",
  "storyImages/think.jpg",
  "storyImages/train.jpg",
  "storyImages/tree.jpg",
  "storyImages/vampire.jpg",
  "storyImages/wizard.jpg"
];

// Custom row distribution for 1–10 dice (adjust as needed)
function getRowDistribution(n) {
  switch (n) {
    case 1: return [1];
    case 2: return [2];
    case 3: return [3];
    case 4: return [2,2];
    case 5: return [3,2];
    case 6: return [3,3];
    case 7: return [4,3];
    case 8: return [4,4];
    case 9: return [3,3,3];
    case 10: return [4,3,3];
  }
  // Fallback for n > 10: 5 dice per row.
  let rows = [];
  let remaining = n;
  const rowSize = 5;
  while (remaining > rowSize) {
    rows.push(rowSize);
    remaining -= rowSize;
  }
  if (remaining > 0) rows.push(remaining);
  return rows;
}

// Fisher-Yates shuffle for arrays
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Renders all dice onto the screen
function renderDice() {
  diceRows.innerHTML = '';
  const diceType = diceTypeSelect.value; // numeric string like "6" or "story"
  let showTotal = (diceType !== "story");

  const dist = getRowDistribution(diceValues.length);
  let idx = 0;
  dist.forEach(rowCount => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'dice-row';
    for (let i = 0; i < rowCount; i++) {
      const val = diceValues[idx];
      idx++;
      const dieDiv = document.createElement('div');
      dieDiv.className = 'die';

      if (diceType === "story") {
        // Render the image
        dieDiv.innerHTML = `<img src="${val}" alt="story face" style="max-width:100%; max-height:100%;">`;
      } else {
        let sides = parseInt(diceType, 10) || 6;
        let faceVal = parseInt(val, 10) || sides;
        if (faceVal < 1) faceVal = 1;
        if (faceVal > sides) faceVal = sides;
        dieDiv.textContent = faceVal;
      }
      rowDiv.appendChild(dieDiv);
    }
    diceRows.appendChild(rowDiv);
  });

  if (showTotal) {
    let sides = parseInt(diceType, 10) || 6;
    let sum = 0;
    for (let i = 0; i < diceValues.length; i++) {
      let faceVal = parseInt(diceValues[i], 10);
      if (faceVal < 1) faceVal = 1;
      if (faceVal > sides) faceVal = sides;
      sum += faceVal;
    }
    totalEl.textContent = 'Total: ' + sum;
  } else {
    totalEl.textContent = '';
  }
}

// Updates the dice count; new dice are set to default face (numeric: equals diceType, story: random image)
function updateDiceCount() {
  const diceType = diceTypeSelect.value;
  let count = parseInt(diceCountInput.value, 10) || 1;
  if (count < 1) {
    count = 1;
    diceCountInput.value = '1';
  } else if (count > 20) {
    count = 20;
    diceCountInput.value = '20';
  }
  if (count > diceValues.length) {
    const extra = count - diceValues.length;
    for (let i = 0; i < extra; i++) {
      if (diceType === "story") {
        const randIdx = Math.floor(Math.random() * storyImages.length);
        diceValues.push(storyImages[randIdx]);
      } else {
        diceValues.push(diceType);
      }
    }
  } else if (count < diceValues.length) {
    diceValues.splice(count);
  }
  renderDice();
}

// When dice type changes, reset all dice to the new default
function updateDiceType() {
  const diceType = diceTypeSelect.value;
  for (let i = 0; i < diceValues.length; i++) {
    if (diceType === "story") {
      const rIdx = Math.floor(Math.random() * storyImages.length);
      diceValues[i] = storyImages[rIdx];
    } else {
      diceValues[i] = diceType;
    }
  }
  renderDice();
}

/**
 * Returns an array of unique random images from storyImages,
 * so that no image repeats in the final result (if possible).
 * If count exceeds available images, returns random images (duplicates allowed).
 */
function pickUniqueStoryImages(count) {
  if (count > storyImages.length) {
    console.warn(`Not enough story images for ${count} dice. Duplicates may occur.`);
    let result = [];
    for (let i = 0; i < count; i++) {
      let rIdx = Math.floor(Math.random() * storyImages.length);
      result.push(storyImages[rIdx]);
    }
    return result;
  } else {
    let copy = [...storyImages];
    shuffle(copy);
    return copy.slice(0, count);
  }
}

// Rolling animation (using a pop effect)
function rollDice() {
  const diceType = diceTypeSelect.value;
  const startTime = performance.now();
  const duration = 1000; // 1 second
  const interval = 100;  // update every 100ms

  let finalValues = [];
  if (diceType === "story") {
    finalValues = pickUniqueStoryImages(diceValues.length);
  } else {
    let sides = parseInt(diceType, 10) || 6;
    finalValues = diceValues.map(() => Math.floor(Math.random() * sides) + 1);
  }

  rollSound.currentTime = 0;
  rollSound.play();

  function animateRoll() {
    const now = performance.now();
    const elapsed = now - startTime;
    if (elapsed < duration) {
      if (diceType === "story") {
        for (let i = 0; i < diceValues.length; i++) {
          let rIdx = Math.floor(Math.random() * storyImages.length);
          diceValues[i] = storyImages[rIdx];
        }
      } else {
        let sides = parseInt(diceType, 10) || 6;
        for (let i = 0; i < diceValues.length; i++) {
          diceValues[i] = Math.floor(Math.random() * sides) + 1;
        }
      }
      renderDice();
      document.querySelectorAll('.die').forEach(die => {
        die.classList.add('animate');
      });
      setTimeout(() => {
        document.querySelectorAll('.die').forEach(die => {
          die.classList.remove('animate');
        });
      }, 80);
      setTimeout(animateRoll, interval);
    } else {
      diceValues = finalValues.slice();
      renderDice();
    }
  }
  animateRoll();
}

// Event listeners
diceTypeSelect.addEventListener('change', updateDiceType);
diceCountInput.addEventListener('input', updateDiceCount);
rollBtn.addEventListener('click', rollDice);

// Initialization
diceValues = [];
updateDiceCount();