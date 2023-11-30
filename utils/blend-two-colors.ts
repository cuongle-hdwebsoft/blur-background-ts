const blend_two_colors = (
  colorRGBA1: [number, number, number, number],
  colorRGBA2: [number, number, number, number]
) => {
  const alpha = 255 - ((255 - colorRGBA1[3]) * (255 - colorRGBA2[3])) / 255;
  const red = (colorRGBA1[0] * (255 - colorRGBA2[3]) + colorRGBA2[0] * colorRGBA2[3]) / 255;
  const green = (colorRGBA1[1] * (255 - colorRGBA2[3]) + colorRGBA2[1] * colorRGBA2[3]) / 255;
  const blue = (colorRGBA1[2] * (255 - colorRGBA2[3]) + colorRGBA2[2] * colorRGBA2[3]) / 255;
  return [Math.round(red), Math.round(green), Math.round(blue), Math.round(alpha)];
};

export default blend_two_colors;
