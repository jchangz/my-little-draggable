export const calculateRowHeights = (
  order: number[],
  maxRows: number,
  maxCols: number,
  heightArr: number[],
  offsetFromTop: number
) => {
  if (!heightArr.length)
    return { currentMaxHeightPerRow: [], currentRowBottom: [] };
  const heightsSortedByOrder = order.map((val) => heightArr[val]);
  const currentMaxHeightPerRow = [];
  for (let i = 0; i < maxRows; i += 1) {
    const slice = heightsSortedByOrder.slice(i * maxCols, (i + 1) * maxCols);
    currentMaxHeightPerRow.push(Math.max(...slice));
  }

  const currentRowBottom = currentMaxHeightPerRow.reduce(
    (resultArray: number[], item, i) => {
      const newArray = resultArray;
      const val = item + (i === 0 ? offsetFromTop : resultArray[i - 1]);
      newArray.push(val);

      return newArray;
    },
    []
  );

  return { currentMaxHeightPerRow, currentRowBottom };
};
