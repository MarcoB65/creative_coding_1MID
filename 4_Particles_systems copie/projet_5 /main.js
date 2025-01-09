const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let worms = [];

const wormLength = 30;
const wormSpeed = 2;
const amplitude = 3;
const speed = 0.2;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Worm {
  constructor(x, y, letters) {
    this.segments = Array.from({ length: wormLength }, () => ({ x, y }));
    this.headAngle = Math.random() * Math.PI * 2;
    this.speed = wormSpeed + Math.random();
    this.color = "rgb(3, 28, 252)";
    this.oscillationPhase = Math.random() * Math.PI * 2;
    this.letters = letters;
  }

  update() {
    const head = this.segments[0];
    head.x += Math.cos(this.headAngle) * this.speed;
    head.y += Math.sin(this.headAngle) * this.speed;
    head.y += Math.sin(this.oscillationPhase) * amplitude;

    this.oscillationPhase += speed;

    if (head.x < 0 || head.x > canvas.width) {
      this.headAngle = Math.PI - this.headAngle;
      head.x = Math.max(0, Math.min(canvas.width, head.x));
    }
    if (head.y < 0 || head.y > canvas.height) {
      this.headAngle = -this.headAngle;
      head.y = Math.max(0, Math.min(canvas.height, head.y));
    }

    for (let i = this.segments.length - 1; i > 0; i--) {
      this.segments[i].x += (this.segments[i - 1].x - this.segments[i].x) * 0.2;
      this.segments[i].y += (this.segments[i - 1].y - this.segments[i].y) * 0.2;
    }
  }

  draw(ctx) {
    this.segments.forEach((segment, index) => {
      if (index < this.letters.length) {
        ctx.font = "40px Arial";
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.letters[index], segment.x, segment.y);
      }
    });
  }
}

canvas.addEventListener("click", (event) => {
  const xClick = event.clientX;
  const yClick = event.clientY;
  const letters = Array.from({ length: wormLength }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  );
  worms.push(new Worm(xClick, yClick, letters));
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  worms.forEach((worm) => {
    worm.update();
    worm.draw(ctx);
  });
  requestAnimationFrame(animate);
}

animate();
