import Square from "./square.js";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d");

ctx.fillStyle = "blue";
ctx.font = "20px Helvetica";
ctx.fontSize = "bold";

const cols = 110;
const rows = 64;
const size = 10;

let squares = [];

for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    const x = j * (size * 2);
    const y = i * (size * 2);
    const newSquare = new Square(x, y, size);
    squares.push(newSquare);
  }
}

console.log(squares);

squares.forEach((s) => {
  s.update();
  s.draw(ctx);
});

function animate() {
  ctx.clearRect(0, 0, width, height);
  squares.forEach((s) => {
    s.update();
    s.draw(ctx);
  });
  requestAnimationFrame(animate);
}

animate();
