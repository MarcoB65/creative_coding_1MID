import "./style.css";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import { drawConnectors } from "@mediapipe/drawing_utils";
import { FACEMESH_TESSELATION } from "@mediapipe/face_mesh";

// Roba che cià serve per configurare tutto
const config = {
  letterSize: 50,
  lettersVisible: true,
  maskEnabled: false,
  TRAIL_DURATION: 1000,
};

// Setup della videocammera e del canvas dove disegniamo
const videoElement = document.createElement("video");
const canvasElement = document.createElement("canvas");
const canvasCtx = canvasElement.getContext("2d");

// Sistemiamo le dimensioni per far vedere tutto aposto
videoElement.style.width = "100vw";
videoElement.style.height = "100vh";
videoElement.style.objectFit = "cover";
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
canvasElement.style.width = "100vw";
canvasElement.style.height = "100vh";

// Mettiamo tutto in un contenitore
const container = document.createElement("div");
container.className = "container";
container.appendChild(videoElement);
container.appendChild(canvasElement);
document.body.appendChild(container);

// Variabili che cè servono per gli effetti
let faceLetters = [];
let trailEnabled = false;
let faceTrail = [];
let isShuffling = false;
let shuffleInterval = null;
let maskLetters = [];

// Classe per le lettere che ci mette sulla faccia
class FaceLetter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    this.isBlue = Math.random() > 0.5;
    this.fontSize = config.letterSize;
  }

  draw(ctx) {
    if (!config.lettersVisible) return;
    ctx.fillStyle = this.isBlue
      ? "rgba(0, 0, 255, 0.8)"
      : "rgba(255, 255, 255, 0.8)";
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillText(this.letter, this.x, this.y);
  }
}

// Classe per le lettere che cadono nello sfondo blu
class BackgroundLetter {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvasElement.width;
    this.y = Math.random() * canvasElement.height;
    this.char =
      Math.random() > 0.5
        ? String.fromCharCode(65 + Math.floor(Math.random() * 26))
        : Math.floor(Math.random() * 10).toString();
    this.size = 20 + Math.random() * 30;
    this.speed = 2 + Math.random() * 3;
  }

  update() {
    this.y += this.speed;
    if (this.y > canvasElement.height) {
      this.reset();
      this.y = -this.size;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = `${this.size}px monospace`;
    ctx.fillText(this.char, this.x, this.y);
  }
}

// Creiamo un po' di lettere per lo sfondo
for (let i = 0; i < 200; i++) {
  maskLetters.push(new BackgroundLetter());
}

// Funzione per far impazire le lettere per qualche secondo
const shuffleLetters = () => {
  if (isShuffling) return;
  isShuffling = true;
  let duration = 0;

  shuffleInterval = setInterval(() => {
    if (faceLetters) {
      faceLetters.forEach((letter) => {
        letter.letter = String.fromCharCode(
          65 + Math.floor(Math.random() * 26)
        );
        letter.isBlue = Math.random() > 0.5;
      });
    }
    duration += 50;
    if (duration >= 3000) {
      clearInterval(shuffleInterval);
      isShuffling = false;
    }
  }, 50);
};

// Funzione per creare i bottoni e i menu
const createUIElement = (type, props = {}) => {
  const element = document.createElement(type);
  if (props.className) element.className = props.className;
  if (props.textContent) element.textContent = props.textContent;
  if (props.style) Object.assign(element.style, props.style);
  if (props.onclick) element.onclick = props.onclick;
  return element;
};

// Creiamo i bottoni per controllare gli effetti
const shuffleButton = createButton("Shuffle", () => shuffleLetters());
const toggleButton = createButton("Toggle Letters", () => {
  config.lettersVisible = !config.lettersVisible;
  toggleButton.style.background = config.lettersVisible ? "#2196F3" : "#ff4444";
});
const maskButton = createButton("Mask", () => {
  config.maskEnabled = !config.maskEnabled;
  maskButton.style.background = config.maskEnabled ? "#ff4444" : "#2196F3";
});
const trailButton = createButton("Trail", () => {
  trailEnabled = !trailEnabled;
  trailButton.style.background = trailEnabled ? "#ff4444" : "#2196F3";
});

// Slider per cambiare la dimensione delle lettere
const controlGroup = createUIElement("div", {
  className: "control-group",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    width: "100%",
  },
});

const sizeLabel = createUIElement("label", {
  textContent: "Size",
  style: { color: "black", fontWeight: "bold" },
});

const sizeSlider = createUIElement("input", { className: "size-slider" });
sizeSlider.type = "range";
sizeSlider.min = "10";
sizeSlider.max = "100";
sizeSlider.value = "50";
sizeSlider.addEventListener("input", (e) => {
  config.letterSize = parseInt(e.target.value);
  if (faceLetters) {
    faceLetters.forEach((letter) => (letter.fontSize = config.letterSize));
  }
});

controlGroup.appendChild(sizeLabel);
controlGroup.appendChild(sizeSlider);

// Funzione per creare i menu a tendina
const createDropdown = ({ title, content }) => {
  const dropdown = createUIElement("div", {
    className: "dropdown",
    style: {
      width: "200px",
      marginBottom: "15px",
      position: "relative",
    },
  });

  const header = createUIElement("div", {
    className: "dropdown-header",
    textContent: title,
    style: {
      background: "#2196F3",
      color: "white",
      padding: "10px 15px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      userSelect: "none",
    },
  });

  const contentContainer = createUIElement("div", {
    className: "dropdown-content",
    style: {
      display: "none",
      position: "absolute",
      left: "105%",
      top: "0",
      background: "rgba(255, 255, 255, 0.95)",
      padding: "15px",
      borderRadius: "6px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      minWidth: "200px",
      zIndex: "1000",
    },
  });

  content.forEach((element) => contentContainer.appendChild(element));

  header.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      if (content !== contentContainer) content.style.display = "none";
    });
    contentContainer.style.display =
      contentContainer.style.display === "none" ? "block" : "none";
  });

  dropdown.appendChild(header);
  dropdown.appendChild(contentContainer);
  return dropdown;
};

// Creiamo la barra degli strumenti con tutti i controlli
const createToolbar = () => {
  const toolbar = createUIElement("div", {
    className: "toolbar",
    style: {
      position: "fixed",
      top: "50%",
      left: "20px",
      transform: "translateY(-50%)",
      background: "rgba(255, 255, 255, 0.1)",
      padding: "15px",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      zIndex: "999",
    },
  });

  const dropdowns = [
    createDropdown({
      title: "Letters Effects",
      content: [shuffleButton, controlGroup, toggleButton],
    }),
    createDropdown({
      title: "Mask Effect",
      content: [maskButton],
    }),
    createDropdown({
      title: "Trail Effect",
      content: [trailButton],
    }),
  ];

  dropdowns.forEach((dropdown) => toolbar.appendChild(dropdown));

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.style.display = "none";
    });
  });

  return toolbar;
};

// Funzione per creare bottoni carini
function createButton(text, onClick) {
  const button = createUIElement("button", {
    textContent: text,
    style: {
      background: "#2196F3",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      width: "100%",
      marginBottom: "10px",
      display: "block",
      boxSizing: "border-box",
      transition: "background-color 0.3s ease",
    },
  });

  button.addEventListener("click", onClick);
  button.addEventListener("mouseover", () => {
    if (button.style.background === "rgb(33, 150, 243)") {
      button.style.background = "#1976D2";
    }
  });
  button.addEventListener("mouseout", () => {
    if (button.style.background === "rgb(25, 118, 210)") {
      button.style.background = "#2196F3";
    }
  });

  return button;
}

// Mettiamo la toolbar nella pagina
const toolbar = createToolbar();
document.body.appendChild(toolbar);

// Setup di FaceMesh per tracciare la faccia
const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Accendiamo la videocamera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1920,
  height: 1080,
});

// Questa funzione viene chiamata ogni volta che FaceMesh trova una faccia
faceMesh.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (config.maskEnabled) {
    // Facciamo lo sfondo blu con le lettere che cadono
    canvasCtx.fillStyle = "rgb(0, 0, 255)";
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    maskLetters.forEach((letter) => {
      letter.update();
      letter.draw(canvasCtx);
    });
  }

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      if (config.maskEnabled) {
        // Ritagliamo solo la faccia
        canvasCtx.save();
        canvasCtx.beginPath();
        const faceContourIndices = [
          10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
          379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
          234, 127, 162, 21, 54, 103, 67, 109,
        ];
        faceContourIndices.forEach((index, i) => {
          const point = landmarks[index];
          const x = point.x * canvasElement.width;
          const y = point.y * canvasElement.height;
          if (i === 0) canvasCtx.moveTo(x, y);
          else canvasCtx.lineTo(x, y);
        });
        canvasCtx.closePath();
        canvasCtx.clip();
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        canvasCtx.restore();
      } else {
        // Modalità normale con le lettere sulla faccia
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        if (!config.maskEnabled) {
          const numPoints = 400;
          const points = [];
          for (let i = 0; i < numPoints; i++) {
            const index = Math.floor((landmarks.length / numPoints) * i);
            const point = landmarks[index];
            points.push({
              x: point.x * canvasElement.width,
              y: point.y * canvasElement.height,
            });
          }

          if (!faceLetters.length) {
            faceLetters = points.map(
              (point) => new FaceLetter(point.x, point.y)
            );
          } else {
            points.forEach((point, i) => {
              if (faceLetters[i]) {
                faceLetters[i].x = point.x;
                faceLetters[i].y = point.y;
              }
            });
          }
          faceLetters.forEach((letter) => letter.draw(canvasCtx));
        }
      }

      // Effetto scia
      if (trailEnabled) {
        const now = Date.now();
        const trailPoint = {
          points: landmarks.map((l) => ({
            x: l.x * canvasElement.width,
            y: l.y * canvasElement.height,
          })),
          letters: faceLetters.map((letter) => ({
            ...letter,
            x: letter.x,
            y: letter.y,
            letter: letter.letter,
            isBlue: letter.isBlue,
          })),
          timestamp: now,
        };

        faceTrail.push(trailPoint);
        faceTrail = faceTrail.filter(
          (t) => now - t.timestamp < config.TRAIL_DURATION
        );

        faceTrail.forEach((trail) => {
          const alpha =
            (config.TRAIL_DURATION - (now - trail.timestamp)) /
            config.TRAIL_DURATION;
          if (!config.maskEnabled && trail.letters) {
            trail.letters.forEach((letterData) => {
              canvasCtx.fillStyle = letterData.isBlue
                ? `rgba(0, 0, 255, ${alpha * 0.3})`
                : `rgba(255, 255, 255, ${alpha * 0.3})`;
              canvasCtx.font = `${letterData.fontSize}px Arial`;
              canvasCtx.fillText(letterData.letter, letterData.x, letterData.y);
            });
          }
        });
      }
    }
  }
  canvasCtx.restore();
});

camera.start();
