import BaseApp from "../js/BaseApp";

export default class App extends BaseApp {
  constructor() {
    super();

    // audio setup
    this.audioFile = "./Sound.wav";
    this.audio = new Audio(this.audioFile);
    this.isPlaying = false;

    //canvas setup
    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // // Initialisation du canvas et du contexte de dessin
    // this.canvas = document.createElement("canvas");
    // this.canvas.width = window.innerWidth;
    // this.canvas.height = window.innerHeight;
    // document.body.appendChild(this.canvas);
    // this.ctx = this.canvas.getContext("2d");
    // this.width = this.canvas.width;
    // this.height = this.canvas.height;

    this.letters = "SOUND";
    this.lineYCenter = this.height / 2;
    this.lineSpacing = 100; // Ddistanza linee
    this.lineWidth = this.width * 0.4;
    this.lineXStart = (this.width - this.lineWidth) / 2;

    this.init();
  }

  init() {
    document.addEventListener("click", () => {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.setupAudio();
      }

      this.toggleAudio();
    });
  }

  setupAudio() {
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.analyser.fftSize = 2048;
    this.waveArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.render();
  }

  toggleAudio() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  analyseWaveform() {
    this.analyser.getByteFrequencyData(this.waveArray);
  }

  drawLine() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.lineWidth = 5;

    // linea base
    this.ctx.beginPath();
    this.ctx.moveTo(this.lineXStart, this.lineYCenter);
    this.ctx.lineTo(this.lineXStart + this.lineWidth, this.lineYCenter);
    this.ctx.stroke();

    // linea specchiata
    this.ctx.beginPath();
    this.ctx.moveTo(this.lineXStart, this.lineYCenter - this.lineSpacing);
    this.ctx.lineTo(
      this.lineXStart + this.lineWidth,
      this.lineYCenter - this.lineSpacing
    );
    this.ctx.stroke();
  }

  drawLetters() {
    const totalPoints = this.waveArray.length / 2; // mirror
    const segmentWidth = this.lineWidth / totalPoints;
    const fontSize = 25;

    //non sovrappone
    let letterIndex = 0;

    for (let i = 0; i < totalPoints; i += 12) {
      const frequency = this.waveArray[i];
      const offsetX = segmentWidth * i;
      const xLeft = this.lineXStart + this.lineWidth / 2 - offsetX;
      const xRight = this.lineXStart + this.lineWidth / 2 + offsetX;
      const yOffset = (frequency - 128 / 2) * 2;

      const letter = this.letters[letterIndex % this.letters.length];

      this.ctx.fillStyle = `blue`;
      this.ctx.font = `bold ${fontSize}px Roboto`;

      this.ctx.fillText(letter, xLeft, this.lineYCenter + yOffset);
      this.ctx.fillText(letter, xRight, this.lineYCenter + yOffset);

      this.ctx.fillText(
        letter,
        xLeft,
        this.lineYCenter - this.lineSpacing - yOffset
      );
      this.ctx.fillText(
        letter,
        xRight,
        this.lineYCenter - this.lineSpacing - yOffset
      );

      letterIndex++;
    }
  }

  render() {
    this.analyseWaveform();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawLine();
    this.drawLetters();

    requestAnimationFrame(this.render.bind(this));
  }
}
