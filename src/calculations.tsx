import { range } from "lodash";

/**
 * Calculate the max height of each row
 *
 * @param maxCols
 * @param maxRows
 * @param heightArr - heights of each index sorted by order
 * @returns
 */
export const calculateMaxHeightPerRow = (
  maxCols: number,
  maxRows: number,
  heightArr: number[]
) => {
  const currentMaxHeightPerRow = [];

  for (let i = 0; i < maxRows; i += 1) {
    const slice = heightArr.slice(i * maxCols, (i + 1) * maxCols);
    currentMaxHeightPerRow.push(Math.max(...slice));
  }

  return currentMaxHeightPerRow;
};

/**
 * Calculate the distance to bottom of each row
 *
 * @param rowHeightArr - max height of each row
 * @param offsetFromTop - distance from top to first row
 * @returns Array of distance to bottom of each row
 */
export const calculateBottomPerRow = (
  rowHeightArr: number[],
  offsetFromTop: number
) => {
  return rowHeightArr.reduce((resultArray: number[], item, i) => {
    resultArray.push(item + (i === 0 ? offsetFromTop : resultArray[i - 1]));
    return resultArray;
  }, []);
};

/**
 * Calculate y-direction shift of the selected index
 *
 * @param newRow - row being dragged to
 * @param curRow - row being dragged from
 * @param rowHeight - array of each row height
 * @returns The total sum of row heights
 */
export const calculateHeightShift = (
  newRow: number,
  curRow: number,
  rowHeight: number[]
) =>
  range(newRow, curRow)
    .map((rowNum) => {
      if (newRow > curRow) return rowHeight[Math.abs(rowNum - 1)];
      else return -rowHeight[rowNum];
    })
    .reduce((a, b) => a + b, 0);

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
  console.log(indexSortedByRows, newRowBottom);
  return { indexSortedByRows, newRowBottom };
};
