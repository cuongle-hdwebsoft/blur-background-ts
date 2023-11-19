import { ImageSegmenter, FilesetResolver, ImageSegmenterResult } from "@mediapipe/tasks-vision";
import scaleImageToFitCanvas from "./utils/scale-image-to-fit-canvas";

let imageSegmenter: ImageSegmenter;
let labels: string[] = [];
const runningMode = "IMAGE";
// const MODEL_ASSET_PATH = "/app/shared/models/deeplab_v3.tflite";
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

  imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_ASSET_PATH,
      delegate: "GPU",
    },
    outputCategoryMask: true,
    outputConfidenceMasks: true,
    runningMode: runningMode,
  });

  // Get all object in image
  labels = imageSegmenter.getLabels();

  console.log("Ready to test...");

  return imageSegmenter;
};

export const handleSegmentData = (
  result: ImageSegmenterResult,
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  backgroundCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  ctxBackground: CanvasRenderingContext2D
) => {
  if (!result.categoryMask) throw new Error("result.categoryMask is undefined");

  const { width, height } = result.categoryMask;

  // Person data
  const imageData = ctx.getImageData(0, 0, width, height).data;
  console.log("imageData", imageData);
  // Background data
  const segmentationMask = ctxBackground.getImageData(0, 0, width, height).data;

  // Clone data from original image
  var cloneCanvas = <HTMLCanvasElement>document.createElement("canvas");
  var cloneContext = <CanvasRenderingContext2D>canvas.getContext("2d", { willReadFrequently: true });
  cloneCanvas.width = width;
  cloneCanvas.height = width;
  cloneContext.drawImage(img, 0, 0);
  var cloneImageData = cloneContext.getImageData(0, 0, width, height).data;

  canvas.width = width;
  canvas.height = height;

  backgroundCanvas.width = width;
  backgroundCanvas.height = height;

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

      // segmentationMask[i * 4 + 0] = 255;
      // segmentationMask[i * 4 + 1] = 255;
      // segmentationMask[i * 4 + 2] = 255;
      // segmentationMask[i * 4 + 3] = 0;

      continue;
    }

    segmentationMask[i * 4 + 0] = r;
    segmentationMask[i * 4 + 1] = b;
    segmentationMask[i * 4 + 2] = g;
    segmentationMask[i * 4 + 3] = a;

    // imageData[i * 4 + 0] = 255;
    // imageData[i * 4 + 1] = 255;
    // imageData[i * 4 + 2] = 255;
    // imageData[i * 4 + 3] = 0;
  }

  console.table(obj);

  return {
    segmentationMask,
    imageData,
    width,
    height,
  };
};

export const imageCallback = (
  result: ImageSegmenterResult,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  optionPayload: OptionPayload
) => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  // Create a canvas called background canvas
  const backgroundCanvas = <HTMLCanvasElement>canvas.cloneNode(true);
  const ctxBackground = backgroundCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx || !ctxBackground) throw new Error("Canvas context does not exist");

  if (!result) throw new Error("ImageSegmenterResult does not exist");

  const { imageData, segmentationMask, width, height } = handleSegmentData(
    result,
    image,
    canvas,
    backgroundCanvas,
    ctx,
    ctxBackground
  );

  console.log("canvas.width", canvas.width);
  console.log("canvas.height", canvas.height);

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
};

export const handleEffectImage = (canvas: HTMLCanvasElement, image: HTMLImageElement, optionPayload: OptionPayload) => {
  imageSegmenter.segment(image, (result) => {
    imageCallback(result, canvas, image, optionPayload);
    // imageCallback(result, canvas, image, optionPayload);
  });
};
