import { imageSegmenter } from "./index";
import { ImageSegmenter, FilesetResolver, ImageSegmenterResult } from "@mediapipe/tasks-vision";
import scaleImageToFitCanvas from "../utils/scale-image-to-fit-canvas";

let labels: string[] = [];
const runningMode = "IMAGE";
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_ASSET_PATH = "https://storage.googleapis.com/mediapipe-assets/deeplabv3.tflite?generation=1661875711618421";

export enum TYPE {
  BLUR = "BLUR",
  BG_COLOR = "BG_COLOR",
  CROP = "CROP",
  IMAGE = "IMAGE",
}

export type OptionPayload =
  | { type: TYPE.BLUR }
  | { type: TYPE.BG_COLOR; color: string }
  | { type: TYPE.CROP }
  | { type: TYPE.IMAGE; imgSrc: HTMLImageElement };

// Prepare the task for running inferences
export const createImageSegmenter = async () => {
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  const internalImageSegmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_ASSET_PATH,
      delegate: "GPU",
    },
    outputCategoryMask: true,
    outputConfidenceMasks: true,
    runningMode: runningMode,
  });

  // Get all object in image
  labels = internalImageSegmenter.getLabels();

  console.log("labels", labels);
  console.log("Ready to test...");

  return internalImageSegmenter;
};

export const handleSegmentData = (
  result: ImageSegmenterResult,
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  ctxBackground: CanvasRenderingContext2D
) => {
  if (!result.categoryMask) throw new Error("result.categoryMask is undefined");

  const { width, height } = result.categoryMask;

  // Person data
  const imageData = ctx.getImageData(0, 0, width, height).data;

  // Background data
  const segmentationMask = ctxBackground.getImageData(0, 0, width, height).data;

  // Clone data from original image
  const cloneCanvas = <HTMLCanvasElement>document.createElement("canvas");
  const cloneContext = <CanvasRenderingContext2D>cloneCanvas.getContext("2d", { willReadFrequently: true });
  cloneCanvas.width = width;
  cloneCanvas.height = width;
  cloneContext.drawImage(image, 0, 0, width, height);
  const cloneImageData = cloneContext.getImageData(0, 0, width, height).data;

  // 1 mask -> r,b,g,a -> 1 pixel -> class in original image
  const mask = result.categoryMask.getAsUint8Array();

  const obj = {};
  for (let i = 0; i < mask.length; i++) {
    const r = cloneImageData[i * 4 + 0];
    const b = cloneImageData[i * 4 + 1];
    const g = cloneImageData[i * 4 + 2];
    const a = cloneImageData[i * 4 + 3];

    if (!obj[mask[i]]) obj[mask[i]] = 1;
    else obj[mask[i]]++;

    if (labels[mask[i]] === "person") {
      imageData[i * 4 + 0] = r;
      imageData[i * 4 + 1] = b;
      imageData[i * 4 + 2] = g;
      imageData[i * 4 + 3] = a;

      continue;
    }

    segmentationMask[i * 4 + 0] = r;
    segmentationMask[i * 4 + 1] = b;
    segmentationMask[i * 4 + 2] = g;
    segmentationMask[i * 4 + 3] = a;
  }

  return {
    segmentationMask,
    imageData,
    width,
    height,
  };
};

export const imageCallback = (
  result: ImageSegmenterResult,
  image: HTMLImageElement,
  optionPayload: OptionPayload,
  callback: (result: { imageData: ImageData; width: number; height: number }) => void
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  // Create a canvas called background canvas
  const backgroundCanvas = <HTMLCanvasElement>canvas.cloneNode(true);
  const ctxBackground = backgroundCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx || !ctxBackground) throw new Error("Canvas context does not exist");

  if (!result) throw new Error("ImageSegmenterResult does not exist");

  if (!result.categoryMask) throw new Error("categoryMask does not exist");

  backgroundCanvas.width = result.categoryMask.width;
  backgroundCanvas.height = result.categoryMask.height;

  // Set canvas width/ height to make `putImageData` can override full existing pixels from ImageData
  // Otherwise, Althought we give it full ImageData but it actually does not use full of it.
  // Please read the 7st in README
  canvas.width = result.categoryMask.width; // same as image.natualWidth
  canvas.height = result.categoryMask.height; // same as image.natualHeight

  const { imageData, segmentationMask, width, height } = handleSegmentData(result, image, ctx, ctxBackground);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctxBackground.clearRect(0, 0, canvas.width, canvas.height);

  // Draw only background to second canvas
  let uint8Array = new Uint8ClampedArray(segmentationMask.buffer);
  let dataNew = new ImageData(uint8Array, width, height);
  ctxBackground.putImageData(dataNew, 0, 0);

  // Draw only person to main canvas
  uint8Array = new Uint8ClampedArray(imageData.buffer);
  dataNew = new ImageData(uint8Array, width, height);
  ctx.putImageData(dataNew, 0, 0);

  // Draw blur background to main canvas
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";

  if (optionPayload.type === TYPE.BLUR) {
    // Apply blur effect
    ctx.filter = "blur(20px)";
    ctx.drawImage(backgroundCanvas, 0, 0);
  } else if (optionPayload.type === TYPE.BG_COLOR) {
    // Apply color background
    ctx.beginPath();
    ctx.fillStyle = optionPayload.color;
    ctx.rect(0, 0, width, height);
    ctx.fill();
  } else if (optionPayload.type === TYPE.IMAGE) {
    scaleImageToFitCanvas(canvas, optionPayload.imgSrc, { objectFit: "cover" });
  } else if (optionPayload.type === TYPE.CROP) {
    //
  }

  ctx.restore();

  callback({ imageData: ctx.getImageData(0, 0, width, height, { colorSpace: "srgb" }), height, width });
};

export const handleEffectImage = async (
  image: HTMLImageElement,
  optionPayload: OptionPayload,
  callback: (result: { imageData: ImageData; width: number; height: number }) => void
) => {
  await imageSegmenter.setOptions({
    runningMode: "IMAGE",
  });

  imageSegmenter.segment(image, (result) => imageCallback(result, image, optionPayload, callback));
};
