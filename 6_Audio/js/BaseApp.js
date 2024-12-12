export default class BaseApp {
  constructor() {
    this.createCanvas();
  }

  // addEventListener() {

  //   document.addEventListener('keydown', function(event) {
  //     if (event.key === 'a' || event.key === 'A') {
  //         console.log("La touche A a été pressée !");
  //     }
  // });
  // }

  createCanvas(width = window.innerWidth, height = window.innerHeight) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    document.body.appendChild(this.canvas);
  }
}
