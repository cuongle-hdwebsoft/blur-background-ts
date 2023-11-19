import { TYPE, createImageSegmenter, handleEffectImage } from "./lib";

window.onload = function () {
  createImageSegmenter().then(() => {
    let image = <HTMLImageElement>document.getElementById("image");
    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    handleEffectImage(canvas, image, { type: TYPE.BLUR });

    // canvas = <HTMLCanvasElement>document.getElementById("canvas-bg-color");
    // handleEffectImage(canvas, image, { type: TYPE.BG_COLOR, color: "blue" });

    // canvas = <HTMLCanvasElement>document.getElementById("canvas-crop");
    // handleEffectImage(canvas, image, { type: TYPE.CROP });

    // canvas = <HTMLCanvasElement>document.getElementById("canvas-img");
    // const bgImg = <HTMLImageElement>document.getElementById("bg-img");
    // handleEffectImage(canvas, image, { type: TYPE.IMAGE, imgSrc: bgImg });
  });
};
