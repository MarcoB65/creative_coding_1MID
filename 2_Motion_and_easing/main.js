const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

let circles = [];
let cols = 10;
let rows = 10;
let size;
let offsetX;
let offsetY;
let lastClickedCircle = null;

function resizeCanvas() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  size = Math.min(width / cols, height / rows) * 0.8;
  offsetX = (width - cols * size) / 2;
  offsetY = (height - rows * size) / 2;

  circles = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * size + size / 2 + offsetX;
      const y = i * size + size / 2 + offsetY;
      const circle = new Circle(x, y, size / 4);
      circles.push(circle);
    }
  }
}

class Circle {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.originalX = x;
    this.originalY = y;
    this.targetX = this.x;
    this.targetY = this.y;
    this.isMoving = false;
    this.easingFactor = 0.1;
  }

  update() {
    if (this.isMoving) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.5) {
        this.x += dx * this.easingFactor;
        this.y += dy * this.easingFactor;
      } else {
        this.isMoving = false;
      }
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "blue";
    context.fill();
    context.closePath();
  }

  moveTo(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.isMoving = true;
  }

  moveToOriginal() {
    this.moveTo(this.originalX, this.originalY);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach((circle) => {
    circle.update();
    circle.draw(ctx);
  });
  requestAnimationFrame(animate);
}

canvas.addEventListener("click", (event) => {
  const clickX = event.clientX;
  const clickY = event.clientY;

  let clickedCircle = null;
  circles.forEach((circle) => {
    const dx = clickX - circle.x;
    const dy = clickY - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle.radius) {
      clickedCircle = circle;
    }
  });

  if (clickedCircle) {
    if (lastClickedCircle === clickedCircle) {
      circles.forEach((circle) => {
        circle.moveToOriginal();
      });
      lastClickedCircle = null;
    } else {
      circles.forEach((circle) => {
        circle.moveTo(clickedCircle.x, clickedCircle.y);
      });
      lastClickedCircle = clickedCircle;
    }
  }
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
animate();
