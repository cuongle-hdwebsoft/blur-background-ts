import { ImageSegmenter, ImageSegmenterResult } from "@mediapipe/tasks-vision";
import { imageSegmenter } from "./index.ts";

let canvas: HTMLCanvasElement;
let canvasCtx: CanvasRenderingContext2D | null;
let backgroundCanvas: HTMLCanvasElement;
let backgroundCtx: CanvasRenderingContext2D | null;
let video: HTMLVideoElement;
let videoWidth: number; // same as natualWidth
let videoHeight: number; // same as naturalHeight

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

  // Draw person to main canvas
  let uint8Array = new Uint8ClampedArray(imageData.buffer);
  let dataNew = new ImageData(uint8Array, result.categoryMask.width, result.categoryMask.height);
  canvasCtx.putImageData(dataNew, 0, 0);

  // Draw background to background canvas
  uint8Array = new Uint8ClampedArray(segmentationMask.buffer);
  dataNew = new ImageData(uint8Array, result.categoryMask.width, result.categoryMask.height);
  backgroundCtx?.putImageData(dataNew, 0, 0);

  // Draw a background canvas to main canvas
  canvasCtx.save();
  canvasCtx.globalCompositeOperation = "destination-over";

  // Blur background
  canvasCtx.filter = "blur(1px)";
  canvasCtx.drawImage(
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

  // Apply background color
  // canvasCtx.beginPath();
  // canvasCtx.fillStyle = "red";
  // canvasCtx.rect(0, 0, result.categoryMask.width, result.categoryMask.height);
  // canvasCtx.fill();

  canvasCtx.restore();

  window.requestAnimationFrame(predictWebcam);
}

let lastWebcamTime = -1;
const predictWebcam = () => {
  if (!video || !canvasCtx || imageSegmenter === undefined) return;

  if (video.currentTime === lastWebcamTime) {
    window.requestAnimationFrame(predictWebcam);
    return;
  }

  lastWebcamTime = video.currentTime;
  const startTimeMs = performance.now();

  imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
};

export const handleEffectVideo = (externalCanvas: HTMLCanvasElement, externalVideo: HTMLVideoElement) => {
  canvas = externalCanvas;
  canvasCtx = externalCanvas.getContext("2d", { willReadFrequently: true });
  backgroundCanvas = <HTMLCanvasElement>externalCanvas.cloneNode();
  backgroundCtx = backgroundCanvas.getContext("2d", { willReadFrequently: true });
  video = externalVideo;

  // segement on actual width/height
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;

  predictWebcam();
};
