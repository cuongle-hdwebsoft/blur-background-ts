import { TYPE } from "./lib/image";
import { imageSegmenter, init, handleEffectVideo, handleEffectImage } from "./lib/index";

let webcamRunning = false;

window.onload = async function () {
  let canvas: HTMLCanvasElement;

  // Create image segmenter
  await init();

  let image = <HTMLImageElement>document.getElementById("image");
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  handleEffectImage(canvas, image, { type: TYPE.BLUR });

  canvas = <HTMLCanvasElement>document.getElementById("canvas-bg-color");
  handleEffectImage(canvas, image, { type: TYPE.BG_COLOR, color: "blue" });

  canvas = <HTMLCanvasElement>document.getElementById("canvas-crop");
  handleEffectImage(canvas, image, { type: TYPE.CROP });

  canvas = <HTMLCanvasElement>document.getElementById("canvas-img");
  const bgImg = <HTMLImageElement>document.getElementById("bg-img");
  handleEffectImage(canvas, image, { type: TYPE.IMAGE, imgSrc: bgImg });

  await imageSegmenter.setOptions({
    runningMode: "VIDEO",
  });

  const video = <HTMLVideoElement>document.querySelector("video");
  const enableWebcamButton = document.getElementById("enableWebcamButton");

  enableWebcamButton?.addEventListener("click", async function () {
    if (!enableWebcamButton || !video) return;

    canvas = <HTMLCanvasElement>document.getElementById("canvas-video");

    if (webcamRunning === true) {
      webcamRunning = false;
      enableWebcamButton.innerText = "ENABLE SEGMENTATION";
    } else {
      webcamRunning = true;
      enableWebcamButton.innerText = "DISABLE SEGMENTATION";
    }

    // GetUsermedia parameters.
    const constraints = {
      video: {
        deviceId: undefined,
        width: { ideal: 300, max: 1920 },
        height: { ideal: 150, max: 1080 },
      },
    };

    // Activate the webcam stream.
    video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
    video.addEventListener("loadeddata", () => handleEffectVideo(canvas, video));
  });
};
