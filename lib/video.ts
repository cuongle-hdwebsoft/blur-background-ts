import { ImageSegmenterResult } from "@mediapipe/tasks-vision";
import { imageSegmenter } from "./index.ts";

let canvas: HTMLCanvasElement;
let canvasCtx: CanvasRenderingContext2D | null;
let backgroundCanvas: HTMLCanvasElement;
let backgroundCtx: CanvasRenderingContext2D | null;
let video: HTMLVideoElement;
let videoWidth: number; // same as natualWidth
let videoHeight: number; // same as naturalHeight
let isRunning = false;
let internalCallback: (result: { imageData: ImageData; width: number; height: number }) => void;

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
      // Collect person pixels
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

  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = result.categoryMask.width;
  resultCanvas.height = result.categoryMask.height;
  const resultCanvasCtx = resultCanvas.getContext("2d");

  // There maybe an issue, when trying to use 2 canvas to blur video.
  // Draw person to main canvas -> Draw background to background canvas -> Draw background canvas to main canvas
  // BTW, just use resultCanvas to draw all of them.

  // Draw person to result canvas
  let uint8Array = new Uint8ClampedArray(imageData.buffer);
  let dataNew = new ImageData(uint8Array, result.categoryMask.width, result.categoryMask.height);
  resultCanvasCtx?.putImageData(dataNew, 0, 0);

  // Draw background to background canvas
  uint8Array = new Uint8ClampedArray(segmentationMask.buffer);
  dataNew = new ImageData(uint8Array, result.categoryMask.width, result.categoryMask.height);
  backgroundCtx?.putImageData(dataNew, 0, 0);

  // Draw a background canvas to main canvas
  resultCanvasCtx!.save();
  resultCanvasCtx!.globalCompositeOperation = "destination-over";

  // Blur background
  resultCanvasCtx!.filter = "blur(5px)";
  // canvasCtx.filter = "grayscale(100%)";
  resultCanvasCtx!.drawImage(
    backgroundCanvas,
    0,
    0,
    result.categoryMask.width,
    result.categoryMask.height,
    0,
    0,
    result.categoryMask.width,
    result.categoryMask.height
  );

  // --------------------------------
  // Example: Apply background color|
  // --------------------------------
  // canvasCtx.beginPath();
  // canvasCtx.fillStyle = "green";
  // canvasCtx.rect(0, 0, result.categoryMask.width, result.categoryMask.height);
  // canvasCtx.fill();

  resultCanvasCtx!.restore();

  internalCallback({
    imageData: resultCanvasCtx!.getImageData(0, 0, result.categoryMask.width, result.categoryMask.height),
    width: result.categoryMask.width,
    height: result.categoryMask.height,
  });

  window.requestAnimationFrame(predictWebcam);
}

let lastWebcamTime = -1;
const predictWebcam = () => {
  if (!video || !canvasCtx || imageSegmenter === undefined || !isRunning) return;

  if (video.currentTime === lastWebcamTime) {
    window.requestAnimationFrame(predictWebcam);
    return;
  }

  lastWebcamTime = video.currentTime;
  const startTimeMs = performance.now();

  imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
};

export const handleEffectVideo = (
  externalVideo: HTMLVideoElement,
  callback: (result: { imageData: ImageData; width: number; height: number }) => void
) => {
  video = externalVideo;
  internalCallback = callback;

  // segement on actual width/height
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;

  canvas = document.createElement("canvas");
  canvasCtx = canvas.getContext("2d");

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  backgroundCanvas = <HTMLCanvasElement>canvas.cloneNode();
  backgroundCtx = backgroundCanvas.getContext("2d", { willReadFrequently: true });

  imageSegmenter.setOptions({
    runningMode: "VIDEO",
  });
  isRunning = true;

  predictWebcam();
};

export const handleStopEffectVideo = () => {
  isRunning = false;
  video.pause();
};
