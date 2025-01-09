import "./style.css";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import { drawConnectors } from "@mediapipe/drawing_utils";

let letterSize = 30;
let lettersVisible = true;
let isShuffling = false;
let shuffleStartTime = null;
const SHUFFLE_DURATION = 3000; // 3 secondi in millisecondi

const videoElement = document.createElement("video");
const canvasElement = document.createElement("canvas");
const canvasCtx = canvasElement.getContext("2d");

// Modifica le dimensioni per essere a schermo intero
videoElement.style.width = "100vw";
videoElement.style.height = "100vh";
videoElement.style.objectFit = "cover";

canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
canvasElement.style.width = "100vw";
canvasElement.style.height = "100vh";

// Crea container e aggiungi elementi
const container = document.createElement("div");
container.className = "container";
container.appendChild(videoElement);
container.appendChild(canvasElement);

// Crea toolbar
const toolbar = document.createElement("div");
toolbar.className = "toolbar";

// Crea e aggiungi bottone shuffle
const shuffleButton = document.createElement("button");
shuffleButton.id = "shuffle-button";
shuffleButton.textContent = "Shuffle";
toolbar.appendChild(shuffleButton);

// Crea e aggiungi controllo dimensione
const controlGroup = document.createElement("div");
controlGroup.className = "control-group";

const sizeLabel = document.createElement("label");
sizeLabel.htmlFor = "size-slider";
sizeLabel.textContent = "Size";

const sizeSlider = document.createElement("input");
sizeSlider.type = "range";
sizeSlider.id = "size-slider";
sizeSlider.min = "10";
sizeSlider.max = "100";
sizeSlider.value = "30";

controlGroup.appendChild(sizeLabel);
controlGroup.appendChild(sizeSlider);
toolbar.appendChild(controlGroup);

// Crea e aggiungi bottone toggle
const toggleButton = document.createElement("button");
toggleButton.id = "toggle-letters";
toggleButton.textContent = "Toggle Letters";
toolbar.appendChild(toggleButton);

// Aggiungi elementi al DOM
document.body.appendChild(container);
document.body.appendChild(toolbar);

let faceLetters = [];

class FaceLetter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    this.isBlue = Math.random() > 0.5;
    this.fontSize = letterSize;
    this.startX = x;
    this.startY = y;
    this.targetX = x;
    this.targetY = y;
  }

  draw(ctx) {
    if (!lettersVisible) return;

    ctx.fillStyle = this.isBlue
      ? "rgba(0, 0, 255, 0.8)"
      : "rgba(255, 255, 255, 0.8)";
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillText(this.letter, this.x, this.y);
  }

  updatePosition(progress) {
    this.x = this.startX + (this.targetX - this.startX) * progress;
    this.y = this.startY + (this.targetY - this.startY) * progress;
  }
}

function shuffleLetters() {
  if (isShuffling) return;

  isShuffling = true;
  shuffleStartTime = performance.now();

  faceLetters.forEach((letter) => {
    letter.startX = letter.x;
    letter.startY = letter.y;
  });

  const tempPositions = faceLetters.map((letter) => ({
    x: letter.x,
    y: letter.y,
    letter: letter.letter,
    isBlue: letter.isBlue,
    fontSize: letter.fontSize,
  }));

  for (let i = tempPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempPositions[i], tempPositions[j]] = [tempPositions[j], tempPositions[i]];
  }

  faceLetters.forEach((letter, i) => {
    letter.targetX = tempPositions[i].x;
    letter.targetY = tempPositions[i].y;
    letter.letter = tempPositions[i].letter;
    letter.isBlue = tempPositions[i].isBlue;
    letter.fontSize = tempPositions[i].fontSize;
  });
}

function onFaceResults(results) {
  // Evita di accumulare richieste di animazione
  if (window.rafId) {
    cancelAnimationFrame(window.rafId);
  }

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Riduci le chiamate di drawImage usando requestAnimationFrame
  if (!isShuffling) {
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
  }

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      // Aggiorna le posizioni solo se necessario
      if (faceLetters.length === 0) {
        // Inizializzazione lettere
        faceLetters = landmarks.map((landmark) => {
          const x = landmark.x * canvasElement.width;
          const y = landmark.y * canvasElement.height;
          return new FaceLetter(x, y);
        });
      } else if (!isShuffling) {
        // Aggiorna posizioni
        landmarks.forEach((landmark, i) => {
          const letter = faceLetters[i];
          letter.x = landmark.x * canvasElement.width;
          letter.y = landmark.y * canvasElement.height;
          letter.targetX = letter.x;
          letter.targetY = letter.y;
          letter.startX = letter.x;
          letter.startY = letter.y;
        });
      }

      if (isShuffling) {
        const currentTime = performance.now();
        const elapsed = currentTime - shuffleStartTime;
        const progress = Math.min(elapsed / SHUFFLE_DURATION, 1);

        faceLetters.forEach((letter) => {
          letter.updatePosition(progress);
        });

        if (progress === 1) {
          isShuffling = false;
        }
      }

      faceLetters.forEach((letter) => letter.draw(canvasCtx));
    }
  }

  // Usa una singola richiesta di animazione
  window.rafId = requestAnimationFrame(() => onFaceResults(results));
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults(onFaceResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});

camera.start();

// Event Listeners
shuffleButton.addEventListener("click", shuffleLetters);

sizeSlider.addEventListener("input", (e) => {
  letterSize = parseInt(e.target.value);
  faceLetters.forEach((letter) => (letter.fontSize = letterSize));
});

toggleButton.addEventListener("click", () => {
  lettersVisible = !lettersVisible;
});

// Aggiungi gestione del resize per evitare problemi di performance
let resizeTimeout;
window.addEventListener("resize", () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
  }, 250);
});
