import { ImageSegmenter } from "@mediapipe/tasks-vision";
import { createImageSegmenter, handleEffectImage } from "./image";
import { handleEffectVideo, handleStopEffectVideo } from "./video";

export let imageSegmenter: ImageSegmenter;

export const init = async () => {
  imageSegmenter = await createImageSegmenter();
  console.log("Done init");
};

export const destroy = () => {
  imageSegmenter.close();
};

export { handleEffectVideo, handleEffectImage, handleStopEffectVideo };
