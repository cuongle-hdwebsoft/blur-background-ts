import { getIndexColorDataByPosPixcel } from "../../utils/pixcel";

const width = 3;
const height = 3;
const pixels = [
  1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
];

// 1 2 3
// 4 x 6
// 7 8 9

console.log(pixels);

const index = getIndexColorDataByPosPixcel(1, 1, width);

console.log("index", index);

// right
const ri = index + 4;
const rr = pixels[ri + 0];
const rb = pixels[ri + 1];
const rg = pixels[ri + 2];
const ra = pixels[ri + 3];
console.log("r", rr, rb, rg, ra);

// left
const li = index - 4;
const lr = pixels[li + 0];
const lb = pixels[li + 1];
const lg = pixels[li + 2];
const la = pixels[li + 3];
console.log("l", lr, lb, lg, la);

// upper
const ui = index - 4 * 3;
const ur = pixels[ui + 0];
const ub = pixels[ui + 1];
const ug = pixels[ui + 2];
const ua = pixels[ui + 3];

console.log("u", ur, ub, ug, ua);

// bottom
const bi = index + 4 * 3;
const br = pixels[bi + 0];
const bb = pixels[bi + 1];
const bg = pixels[bi + 2];
const ba = pixels[bi + 3];

console.log("b", br, bb, bg, ba);

// upper-left
const uli = index - 4 * 4;
const ulr = pixels[uli + 0];
const ulb = pixels[uli + 1];
const ulg = pixels[uli + 2];
const ula = pixels[uli + 3];

console.log("ul", ulr, ulb, ulg, ula);
