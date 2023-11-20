import { ImageSegmenter, ImageSegmenterResult } from "@mediapipe/tasks-vision";
import { TYPE, createImageSegmenter, handleEffectImage } from "./lib/image";

let enableWebcamButton = document.getElementById("enableWebcamButton");
let webcamRunning = false;
const video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const backgroundCanvas = <HTMLCanvasElement>canvas?.cloneNode(true);

const canvasCtx = canvas?.getContext("2d");
const backgroundCtx = backgroundCanvas.getContext("2d");

const legendColors = [
  [255, 197, 0, 255], // Vivid Yellow
  [128, 62, 117, 255], // Strong Purple
  [255, 104, 0, 255], // Vivid Orange
  [166, 189, 215, 255], // Very Light Blue
  [193, 0, 32, 255], // Vivid Red
  [206, 162, 98, 255], // Grayish Yellow
  [129, 112, 102, 255], // Medium Gray
  [0, 125, 52, 255], // Vivid Green
  [246, 118, 142, 255], // Strong Purplish Pink
  [0, 83, 138, 255], // Strong Blue
  [255, 112, 92, 255], // Strong Yellowish Pink
  [83, 55, 112, 255], // Strong Violet
  [255, 142, 0, 255], // Vivid Orange Yellow
  [179, 40, 81, 255], // Strong Purplish Red
  [244, 200, 0, 255], // Vivid Greenish Yellow
  [127, 24, 13, 255], // Strong Reddish Brown
  [147, 170, 0, 255], // Vivid Yellowish Green
  [89, 51, 21, 255], // Deep Yellowish Brown
  [241, 58, 19, 255], // Vivid Reddish Orange
  [35, 44, 22, 255], // Dark Olive Green
  [0, 161, 194, 255], // Vivid Blue
];

function callbackForVideo(result: ImageSegmenterResult) {
  if (!video || !canvasCtx || !result || !result.categoryMask) return;

  let imageData = canvasCtx.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
  let segmentationMask = backgroundCtx?.getImageData(0, 0, video.videoWidth, video.videoHeight).data;

  if (!segmentationMask) return;

  // Clone data from original video image
  const cloneCanvas = <HTMLCanvasElement>document.createElement("canvas");
  const cloneContext = <CanvasRenderingContext2D>cloneCanvas.getContext("2d", { willReadFrequently: true });
  cloneCanvas.width = result.categoryMask.width;
  cloneCanvas.height = result.categoryMask.height;
  cloneContext.drawImage(video, 0, 0, result.categoryMask?.width, result.categoryMask?.height);
  const cloneImageData = cloneContext.getImageData(0, 0, result.categoryMask.width, result.categoryMask.height).data;

  const mask = result.categoryMask?.getAsFloat32Array();

  if (!mask) return;
  const obj = {};
  for (let i = 0; i < mask.length; i++) {
    const maskVal = Math.round(mask[i] * 255.0);

    const r = cloneImageData[i * 4 + 0];
    const b = cloneImageData[i * 4 + 1];
    const g = cloneImageData[i * 4 + 2];
    const a = cloneImageData[i * 4 + 3];

    if (!obj[maskVal]) obj[maskVal] = 1;
    else obj[maskVal]++;

    if (maskVal === 15) {
      imageData[i * 4 + 0] = r;
      imageData[i * 4 + 1] = b;
      imageData[i * 4 + 2] = g;
      imageData[i * 4 + 3] = a;

      // Collect background pixels
      segmentationMask[i * 4 + 0] = 0;
      segmentationMask[i * 4 + 1] = 0;
      segmentationMask[i * 4 + 2] = 0;
      segmentationMask[i * 4 + 3] = 0;

      continue;
    }

    // Transparent other pixels that are not person class
    imageData[i * 4 + 0] = 0;
    imageData[i * 4 + 1] = 0;
    imageData[i * 4 + 2] = 0;
    imageData[i * 4 + 3] = 0;

    // Collect background pixels
    segmentationMask[i * 4 + 0] = r;
    segmentationMask[i * 4 + 1] = b;
    segmentationMask[i * 4 + 2] = g;
    segmentationMask[i * 4 + 3] = a;
  }

  // console.log("imageData", imageData);
  // console.log("obj", obj);

  let uint8Array = new Uint8ClampedArray(imageData.buffer);
  let dataNew = new ImageData(uint8Array, result.categoryMask.width, result.categoryMask.height);
  canvasCtx.putImageData(dataNew, 0, 0);

  uint8Array = new Uint8ClampedArray(segmentationMask.buffer);
  dataNew = new ImageData(uint8Array, result.categoryMask.width, result.categoryMask.height);
  backgroundCtx?.putImageData(dataNew, 0, 0);

  // Apply background
  canvasCtx.save();
  canvasCtx.globalCompositeOperation = "destination-over";

  // Blur background
  // canvasCtx.filter = "blur(1px)";
  // canvasCtx.drawImage(
  //   backgroundCanvas,
  //   0,
  //   0,
  //   result.categoryMask.width,
  //   result.categoryMask.height,
  //   0,
  //   0,
  //   result.categoryMask.width,
  //   result.categoryMask.height
  // );
  canvasCtx.beginPath();
  canvasCtx.fillStyle = "red";
  canvasCtx.rect(0, 0, result.categoryMask.width, result.categoryMask.height);
  canvasCtx.fill();

  canvasCtx.restore();

  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}

let lastWebcamTime = -1;
let imageSegmenter: ImageSegmenter;
const predictWebcam = () => {
  // Do not segmented if imageSegmenter hasn't loaded
  if (!video || !canvasCtx || imageSegmenter === undefined) return;

  // NOTE: Dont understand?
  if (video.currentTime === lastWebcamTime) {
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
    return;
  }

  lastWebcamTime = video.currentTime;
  const startTimeMs = performance.now();

  // Start segmenting the stream.
  imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
};

window.onload = async function () {
  console.log("video", video?.width, video?.height, video?.videoWidth, video?.videoHeight);

  // Create image segmenter
  imageSegmenter = await createImageSegmenter();

  await imageSegmenter.setOptions({
    runningMode: "VIDEO",
  });

  enableWebcamButton?.addEventListener("click", async function () {
    if (!enableWebcamButton || !video) return;

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
    video.addEventListener("loadeddata", () => {
      if (backgroundCanvas && canvas) {
        backgroundCanvas.width = canvas.width;
        backgroundCanvas.height = canvas.height;
      }
      predictWebcam();
    });
  });
};
