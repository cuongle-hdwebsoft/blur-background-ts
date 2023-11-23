/**
 * Calculates the index of a pixel in a one-dimensional array representing image data.
 * @param x The x-coordinate of the pixel.
 * @param y The y-coordinate of the pixel.
 * @param w The width of the image.
 * @returns The index of the pixel in the image data array, considering RGBA channels.
 */
const getIndexColorDataByPosPixcel = (x: number, y: number, w: number) => {
  return (y * w + x) * 4;
};

export { getIndexColorDataByPosPixcel };
