import { TYPE } from "./lib/image";
import { init, handleEffectVideo, handleEffectImage, handleStopEffectVideo } from "./lib/index";
import { toBase64 } from "./utils/convert-file-to-img-base64";

let webcamRunning = false;
let image: HTMLImageElement;
let canvas: HTMLCanvasElement;
const enableWebcamButton = document.getElementById("enableWebcamButton");

const toggleWebcam = () => {
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton!.innerText = "ENABLE SEGMENTATION";
    handleStopEffectVideo();
  } else {
    webcamRunning = true;
    enableWebcamButton!.innerText = "DISABLE SEGMENTATION";
  }
};

window.onload = async function () {
  const fileInput = <HTMLInputElement>document.querySelector("input[type=file]");
  fileInput.onchange = async function (ev) {
    const base64 = await toBase64((ev.target as any).files[0] as File);
    const imgEl = document.createElement("img");
    const originalImage = <HTMLImageElement>document.getElementById("image");

    if (typeof base64 === "string") {
      imgEl.src = base64;
      originalImage.setAttribute("src", base64);
    }

    webcamRunning = false;
    enableWebcamButton!.innerText = "ENABLE SEGMENTATION";
    handleStopEffectVideo();

    canvas = <HTMLCanvasElement>document.getElementById("canvas");
    handleEffectImage(canvas, imgEl, { type: TYPE.BLUR });

    canvas = <HTMLCanvasElement>document.getElementById("canvas-bg-color");
    handleEffectImage(canvas, imgEl, { type: TYPE.BG_COLOR, color: "blue" });

    canvas = <HTMLCanvasElement>document.getElementById("canvas-crop");
    handleEffectImage(canvas, imgEl, { type: TYPE.CROP });

    canvas = <HTMLCanvasElement>document.getElementById("canvas-img");
    const bgImg = <HTMLImageElement>document.getElementById("bg-img");
    handleEffectImage(canvas, imgEl, { type: TYPE.IMAGE, imgSrc: bgImg });
  };

  // Create image segmenter
  await init();

  image = <HTMLImageElement>document.getElementById("image");
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  handleEffectImage(canvas, image, { type: TYPE.BLUR });

  canvas = <HTMLCanvasElement>document.getElementById("canvas-bg-color");
  handleEffectImage(canvas, image, { type: TYPE.BG_COLOR, color: "blue" });

  canvas = <HTMLCanvasElement>document.getElementById("canvas-crop");
  handleEffectImage(canvas, image, { type: TYPE.CROP });

  canvas = <HTMLCanvasElement>document.getElementById("canvas-img");
  const bgImg = <HTMLImageElement>document.getElementById("bg-img");
  handleEffectImage(canvas, image, { type: TYPE.IMAGE, imgSrc: bgImg });

  const video = <HTMLVideoElement>document.querySelector("video");

  enableWebcamButton?.addEventListener("click", async function () {
    if (!enableWebcamButton || !video) return;

    canvas = <HTMLCanvasElement>document.getElementById("canvas-video");

    toggleWebcam();

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
    video.addEventListener("loadeddata", () => webcamRunning && handleEffectVideo(canvas, video));
  });
};
