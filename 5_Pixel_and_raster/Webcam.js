export default class Webcam {
  constructor() {
    this.video = document.createElement("video");
    this.video.width = 800;
    this.video.height = 800;
    navigator.mediaDevices
      .getUserMedia({
        video: { width: window.innerWidth, height: window.innerHeight },
      })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.play();
      });
  }
}
