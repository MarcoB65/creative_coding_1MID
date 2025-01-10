import "./style.css";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import { drawConnectors } from "@mediapipe/drawing_utils";

// Variabili globali per gestire le lettere
let letterSize = 50;
let lettersVisible = true;

//-- SETUP VIDEO E CANVAS -
// Dai, creiamo gli elementi base per far funzionare sta roba
const videoElement = document.createElement("video");
const canvasElement = document.createElement("canvas");
const canvasCtx = canvasElement.getContext("2d");

// Facciamo il video a tutto schermo, che è più figo
videoElement.style.width = "100vw";
videoElement.style.height = "100vh";
videoElement.style.objectFit = "cover";

// Stesso discorso per il canvas
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
canvasElement.style.width = "100vw";
canvasElement.style.height = "100vh";

// ---------- COSTRUZIONE DELL'INTERFACCIA (roba che si fa in DOM!!!!!!!) ----------
// mettiamo tutto in un container, che è più ordinato
const container = document.createElement("div");
container.className = "container";
container.appendChild(videoElement);
container.appendChild(canvasElement);

// Oora facciamo una bella toolbar con tutti i controlli
const toolbar = document.createElement("div");
toolbar.className = "toolbar";
toolbar.style.display = "flex";
toolbar.style.alignItems = "center";
toolbar.style.gap = "20px";
toolbar.style.background = "rgba(255, 255, 255, 0.2)";
toolbar.style.padding = "10px 20px";

// ---------- BOTTONI E CONTROLLI ----------
// Bottone per mischiare le lettere (quello che fa impazzire tutto)
const shuffleButton = document.createElement("button");
shuffleButton.id = "shuffle-button";
shuffleButton.textContent = "Shuffle";
shuffleButton.style.background = "#2196F3";
shuffleButton.style.color = "white";
shuffleButton.style.border = "none";
shuffleButton.style.padding = "8px 16px";
shuffleButton.style.borderRadius = "4px";
shuffleButton.style.cursor = "pointer";
shuffleButton.style.fontWeight = "bold";
toolbar.appendChild(shuffleButton);

// Slider per cambiare la dimensione delle lettere
const controlGroup = document.createElement("div");
controlGroup.className = "control-group";
controlGroup.style.display = "flex";
controlGroup.style.alignItems = "center";
controlGroup.style.gap = "10px";

const sizeLabel = document.createElement("label");
sizeLabel.htmlFor = "size-slider";
sizeLabel.textContent = "Size";
sizeLabel.style.color = "white";

const sizeSlider = document.createElement("input");
sizeSlider.type = "range";
sizeSlider.id = "size-slider";
sizeSlider.min = "10";
sizeSlider.max = "100";
sizeSlider.value = "30";

controlGroup.appendChild(sizeLabel);
controlGroup.appendChild(sizeSlider);
toolbar.appendChild(controlGroup);

// bottone per far sparire/apparire le lettere (tipo magia)
const toggleButton = document.createElement("button");
toggleButton.id = "toggle-letters";
toggleButton.textContent = "Toggle Letters";
toggleButton.style.background = "#2196F3";
toggleButton.style.color = "white";
toggleButton.style.border = "none";
toggleButton.style.padding = "8px 16px";
toggleButton.style.borderRadius = "4px";
toggleButton.style.cursor = "pointer";
toggleButton.style.fontWeight = "bold";
toolbar.appendChild(toggleButton);

// Buttiamo tutto nella pagina
document.body.appendChild(container);
document.body.appendChild(toolbar);

// --- LETTERE ----------
// Array per tenere tutte le lettere che mettiamo sulla faccia
let faceLetters = [];

// questa è la classe che gestisce ogni singola lettera
class FaceLetter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    this.isBlue = Math.random() > 0.5;
    this.fontSize = letterSize;
  }

  // Questo disegna la lettera sul canvas
  draw(ctx) {
    if (!lettersVisible) return;

    ctx.fillStyle = this.isBlue
      ? "rgba(0, 0, 255, 0.8)"
      : "rgba(255, 255, 255, 0.8)";
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillText(this.letter, this.x, this.y);
  }
}

// ---------- EFFETTO SHUFFLE ----------
// Variabile per controllare l'animazione dello shuffle
let shuffleInterval = null;

// questa funzione fa impazzire tutte le lettere per 3 secondi
function shuffleLetters() {
  if (shuffleInterval) {
    clearInterval(shuffleInterval);
  }

  let duration = 3000; // druata animaizoe al volo
  let startTime = Date.now();

  shuffleInterval = setInterval(() => {
    faceLetters.forEach((letter) => {
      letter.letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      letter.isBlue = Math.random() > 0.5;
    });

    if (Date.now() - startTime >= duration) {
      clearInterval(shuffleInterval);
      shuffleInterval = null;
    }
  }, 100);
}

// ---- GESTIONE FACCIA E RENDERING -----
// questa funzione viene chiamata ogni volta che MediaPipe trova una faccia
function onFaceResults(results) {
  if (window.rafId) {
    cancelAnimationFrame(window.rafId);
  }

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (!shuffleInterval) {
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
      if (faceLetters.length === 0) {
        // Prima volta: creiamo tutte le lettere
        faceLetters = landmarks.map((landmark) => {
          const x = landmark.x * canvasElement.width;
          const y = landmark.y * canvasElement.height;
          return new FaceLetter(x, y);
        });
      } else {
        // Aggiorniamo solo le posizioni delle lettere esistenti
        landmarks.forEach((landmark, i) => {
          const letter = faceLetters[i];
          letter.x = landmark.x * canvasElement.width;
          letter.y = landmark.y * canvasElement.height;
        });
      }

      faceLetters.forEach((letter) => letter.draw(canvasCtx));
    }
  }

  window.rafId = requestAnimationFrame(() => onFaceResults(results));
}

//--- SETUP MEDIAPIPE --
// Configuriamo MediaPipe per tracciare la faccia
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

// AVVI la webcam
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});

camera.start();

//---------- EVENT LISTENERS -------
//gestiscetutti i click e le interazioni
shuffleButton.addEventListener("click", shuffleLetters);

sizeSlider.addEventListener("input", (e) => {
  letterSize = parseInt(e.target.value);
  faceLetters.forEach((letter) => (letter.fontSize = letterSize));
});

toggleButton.addEventListener("click", () => {
  lettersVisible = !lettersVisible;
});

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
