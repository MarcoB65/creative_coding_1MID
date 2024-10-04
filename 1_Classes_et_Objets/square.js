export default class Square {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    const letters = "A%FS/@012+F!E";
    this.text = letters[Math.floor(Math.random() * letters.length)];

    this.frameCount = 0;
    this.changeRate = Math.floor(Math.random() * 100) + 400;
  }

  update() {
    this.frameCount++;

    if (this.frameCount >= this.changeRate) {
      const letters = "A%FS/@012+F!E";
      this.text = letters[Math.floor(Math.random() * letters.length)];
      this.frameCount = 0;
    }
  }

  draw(context) {
    context.fillText(this.text, this.x, this.y);
  }
}
