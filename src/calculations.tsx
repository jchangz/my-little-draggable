import { range } from "lodash";

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

export const calculateHeightShift = (
  newRow: number,
  currentRow: number,
  originalHeightArr: Array<number>
) => {
  const heightToShiftValue = range(newRow, currentRow)
    .map((rr) => {
      const sign = newRow > currentRow ? 1 : -1;
      const adjust = newRow > currentRow ? rr - 1 : rr;
      return sign * originalHeightArr[Math.abs(adjust)];
    })
    .reduce((a, b) => a + b, 0);
  return heightToShiftValue;
};

export const calculateNewMaxHeights = (
  order: number[],
  maxCols: number,
  maxRows: number,
  rowHeights: number[],
  offsetFromTop: number
) => {
  const indexSortedByRows = [];
  const newRowBottom = [];

  for (let i = 0; i < maxRows; i += 1) {
    const slice = order.slice(i * maxCols, (i + 1) * maxCols);
    indexSortedByRows.push(slice);

    const heightMap = [];
    for (let i = 0, j = slice.length; i < j; i += 1) {
      heightMap.push(rowHeights[slice[i]]);
    }

    const heightOfRow: number =
      Math.max(...heightMap) + (i === 0 ? offsetFromTop : newRowBottom[i - 1]);
    newRowBottom.push(heightOfRow);
  }

  return { indexSortedByRows, newRowBottom };
};
