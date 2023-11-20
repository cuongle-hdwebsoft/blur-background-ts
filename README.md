# image-segmentation-ts

## Demo

### Blur

![alt](./docs/blur.png)

### Change background color

![alt](./docs/bg-color.png)

### Crop only person

![alt](./docs/crop-background.png)

### Change background to new image

![alt](./docs/bg-img.png)

[Here is the image that I used](https://www.freepik.com/free-photo/woman-with-headset-having-video-call-laptop_12457231.htm#page=3&query=person%20zoom&position=24&from_view=search&track=ais&uuid=bba742d7-d9ff-4ced-8327-6cc9f1f65924)

## Requirement

```
node 18
```

## Development

```
git clone ...
npm i
npm start
```

## Features

- Blur background
- Change background color
- Crop background image
- Change background to new image

## QA

[1. Why we cannot use putImage and blur effect together?](https://stackoverflow.com/questions/55173381/canvas-effects-such-as-filter-or-drop-shadow-not-applied-with-context-putimageda)

[2. How can I mix 2 image together?](https://stackoverflow.com/questions/6787899/combining-two-or-more-canvas-elements-with-some-sort-of-blending)

[2. What is the `globalCompositeOperation`?](https://www.w3schools.com/jsref/playcanvas.php?filename=playcanvas_globalcompop&preval=source-in)

[3. What is the core libray that I am using?](https://developers.google.com/mediapipe/api/solutions/js/tasks-vision)

[4. ImageSegmenter Class](https://developers.google.com/mediapipe/api/solutions/js/tasks-vision.imagesegmenter#imagesegmenter_class)

[5. Image segmentation guide for web](https://developers.google.com/mediapipe/solutions/vision/image_segmenter/web_js)

[6. Scaling an image to fit on canvas](https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas)

[7. The CanvasRenderingContext2D.putImageData() method of the Canvas 2D API paints data from the given ImageData object onto the canvas. If a dirty rectangle is provided, only the pixels from that rectangle are painted. This method is not affected by the canvas transformation matrix.]()

[8. CanvasRenderingContext2D: putImageData() method](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

[9. What is difference between `@mediapipe/tasks-vision` and `@mediapipe/selfie_segmentation` on npm?](https://github.com/google/mediapipe/issues/4251#issuecomment-1502232632)
