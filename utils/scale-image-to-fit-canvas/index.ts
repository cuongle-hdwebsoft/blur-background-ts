const scaleImageToFitCanvas = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  options?: {
    objectFit: "contain" | "cover";
    center?: boolean;
  }
) => {
  const { width: canvasW, height: canvasH } = canvas;
  const { naturalWidth: imageW, naturalHeight: imageH } = image;

  const ctx = canvas.getContext("2d");

  if (options?.objectFit === "cover") {
    return ctx?.drawImage(image, 0, 0, imageW, imageH, 0, 0, canvasW, canvasH);
  }

  const ratioW = canvasW / imageW;
  const ratioH = canvasH / imageH;

  const ratio = Math.min(ratioW, ratioH);

  const scaledImageW = ratio * imageW;
  const scaledImageH = ratio * imageH;

  const shiftToCenterX = canvasW / 2 - scaledImageW / 2;
  const shiftToCenterH = canvasH / 2 - scaledImageH / 2;

  ctx?.drawImage(
    image,
    0,
    0,
    imageW,
    imageH,
    options?.center ? shiftToCenterX : 0,
    options?.center ? shiftToCenterH : 0,
    scaledImageW,
    scaledImageH
  );
};

export default scaleImageToFitCanvas;
