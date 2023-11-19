const rangeConvertor = (
  value: number,
  oldRange: { min: number; max: number },
  newRange: { min: number; max: number }
) => {
  const { max: maxOldRange, min: minOldRange } = oldRange;
  const { max: maxNewRange, min: minNewRange } = newRange;

  const oldRangeVal = maxOldRange - minOldRange;
  const newRangeVal = maxNewRange - minNewRange;

  return ((value - minOldRange) * newRangeVal) / (oldRangeVal + minNewRange);
};

export default rangeConvertor;
