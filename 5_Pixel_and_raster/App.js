import BaseApp from "./BaseApp";
import Webcam from "./Webcam";
import Letter from "./Letter";

export default class App extends BaseApp {
  constructor() {
    super();
    this.ctx.willReadFrequently = true;
    this.ctx.font = "50px monospace";
    this.letters = [];
    this.pixelColors = [];
    this.shapeType = "square"; // x la forma iniziale
    this.resolution = 20;
    this.init();
  }

  initWebcam() {
    this.webcam = new Webcam();
    document.body.appendChild(this.webcam.video);
  }

  async init() {
    this.initWebcam();

    const shapeSlider = document.getElementById("shapeSlider");
    const shapeText = document.getElementById("shapeText");
    const resolutionSlider = document.getElementById("resolutionSlider");
    const resolutionText = document.getElementById("resolutionText");

    // Slider per la forma
    shapeSlider.addEventListener("input", (event) => {
      const value = parseFloat(event.target.value);
      const fraction = value / 100;

      if (fraction < 1 / 3) {
        this.shapeType = "square";
        shapeText.textContent = "Contents: Squares";
      } else if (fraction < 2 / 3) {
        this.shapeType = "circle";
        shapeText.textContent = "Contents: Circles";
      } else {
        this.shapeType = "letter";
        shapeText.textContent = "Contents: ASCII Letters";
      }
    });

    // Slider per la risoluzione
    resolutionSlider.addEventListener("input", (event) => {
      const steps = parseInt(event.target.value, 10);
      this.resolution = Math.max(0, 20 + steps * 10); // questa funzione aiuta a ridurre la risoluzione del 25% x step
      resolutionText.textContent = `Resolution: ${this.resolution}px`;
      this.updateGrid();
    });

    this.createGrid();
    this.draw();
  }

  createGrid() {
    const cols = Math.floor(this.canvas.width / this.resolution);
    const rows = Math.floor(this.canvas.height / this.resolution);
    this.letters = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        this.letters.push(
          new Letter(this.ctx, "M", i * this.resolution, j * this.resolution)
        );
      }
    }
  }

  updateGrid() {
    this.createGrid();
  }

  draw() {
    this.ctx.drawImage(
      this.webcam.video,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    const pixels = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    ).data;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const letters = "WEBCAM";

    this.letters.forEach((letter, index) => {
      const i = (letter.y * this.canvas.width + letter.x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const luminance = this.getLuminance([r, g, b]) * 255;

      const segment = Math.floor(luminance / (255 / letters.length));
      const selectedLetter = letters[Math.min(segment, letters.length - 1)];

      letter.color = `rgb(${r}, ${g}, ${b})`;
      letter.letter = selectedLetter;
      letter.scale = this.getLuminance([r, g, b]);

      if (this.shapeType === "square") {
        letter.drawSquare();
      } else if (this.shapeType === "circle") {
        letter.drawCircle();
      } else {
        letter.drawLetter();
      }
    });

    requestAnimationFrame(this.draw.bind(this));
  }

  getLuminance(rgb) {
    return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  }
}

new App();
