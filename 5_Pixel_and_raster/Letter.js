export default class Letter {
  constructor(ctx, letter, x, y) {
    this.ctx = ctx;
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.color = "white";
    this.scale = 1;
  }

  drawSquare() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(-10, -10, 20, 20); // x il quadrato
    this.ctx.restore();
  }

  drawCircle() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI * 2); // x il un cerchio
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

  drawLetter() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.fillStyle = this.color;
    this.ctx.fillText(this.letter, 0, 0); // x la lettera
    this.ctx.restore();
  }
}
