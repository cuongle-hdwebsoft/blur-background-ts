# image-segmentation-ts

- 🎆 Use latest [MediaPipe Solution](https://developers.google.com/mediapipe/solutions)
- 🎉 Written in TypeScript

## Demo

[Try demo here](https://codesandbox.io/s/practical-browser-xz4g7j?file=/index.html)

## Result example

### Blur

- `handleEffectImage(canvas, image, { type: TYPE.BLUR })`

![alt](./docs/blur.png)

### Change background color

- `handleEffectImage(canvas, image, { type: TYPE.BG_COLOR, color: "blue" });`

![alt](./docs/bg-color.png)

### Crop only person

- `handleEffectImage(canvas, image, { type: TYPE.CROP });`

![alt](./docs/crop-background.png)

### Change background to new image

- `handleEffectImage(canvas, image, { type: TYPE.IMAGE, imgSrc: bgImg });`

![alt](./docs/bg-img.png)

[Here is the image that I used](https://www.freepik.com/free-photo/woman-with-headset-having-video-call-laptop_12457231.htm#page=3&query=person%20zoom&position=24&from_view=search&track=ais&uuid=bba742d7-d9ff-4ced-8327-6cc9f1f65924)

## Getting started

- Init segmentation

```
import { imageSegmenter, init, handleEffectVideo, handleEffectImage } from "./lib/index";

await init();
```

- Blur background image

```
const image = <HTMLImageElement>document.getElementById("image");
canvas = <HTMLCanvasElement>document.getElementById("canvas");
handleEffectImage(canvas, image, { type: TYPE.BLUR });
```

- Blur webcam background

```
const video = <HTMLVideoElement>document.querySelector("video");
const canvas = <HTMLCanvasElement>document.getElementById("canvas-video");

video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
video.addEventListener("loadeddata", () => handleEffectVideo(canvas, video));
```

## Requirement

```
node 18
```

## Development

```
git clone https://github.com/cuongle-hdwebsoft/image-segmentation-ts
npm i
nvm use
npm run dev
```

## QA

[1. Why we cannot use putImage and blur effect together?](https://stackoverflow.com/questions/55173381/canvas-effects-such-as-filter-or-drop-shadow-not-applied-with-context-putimageda)
[2. How can I mix 2 image together?](https://stackoverflow.com/questions/6787899/combining-two-or-more-canvas-elements-with-some-sort-of-blending)
[2. What is the `globalCompositeOperation`?](https://www.w3schools.com/jsref/playcanvas.php?filename=playcanvas_globalcompop&preval=source-in)
[3. What is the core libray that I am using?](https://developers.google.com/mediapipe/api/solutions/js/tasks-vision)
[4. `ImageSegmenter` Class](https://developers.google.com/mediapipe/api/solutions/js/tasks-vision.imagesegmenter#imagesegmenter_class)
[5. Image segmentation guide for web](https://developers.google.com/mediapipe/solutions/vision/image_segmenter/web_js)
[6. Scaling an image to fit on canvas](https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas)
[7. The `CanvasRenderingContext2D.putImageData()` method of the Canvas 2D API paints data from the given `ImageData` object onto the canvas. If a dirty rectangle is provided, only the pixels from that rectangle are painted. This method is not affected by the canvas transformation matrix.](<https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData#:~:text=The%20CanvasRenderingContext2D.putImageData()%20method%20of%20the%20Canvas%202D%20API%20paints%20data%20from%20the%20given%20ImageData%20object%20onto%20the%20canvas.%20If%20a%20dirty%20rectangle%20is%20provided%2C%20only%20the%20pixels%20from%20that%20rectangle%20are%20painted.%20This%20method%20is%20not%20affected%20by%20the%20canvas%20transformation%20matrix.>)
[8. CanvasRenderingContext2D: `putImageData()` method](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
[9. What is difference between `@mediapipe/tasks-vision` and `@mediapipe/selfie_segmentation` on npm?](https://github.com/google/mediapipe/issues/4251#issuecomment-1502232632)

## Contact

Contact to me through email <cuong.leminh@hdwebsoft.dev> or create [an issue](https://github.com/cuongle-hdwebsoft/image-segmentation-ts/issues).

## Reference

[https://github.com/akhil-rana/virtual-bg](https://github.com/akhil-rana/virtual-bg)
