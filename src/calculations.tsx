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
  order: number[],
  maxCols: number,
  maxRows: number,
  heightArr: number[]
) => {
  const currentMaxHeightPerRow = [];
  const heightSortedByOrder = order.map((index) => heightArr[index]);

  for (let i = 0; i < maxRows; i += 1) {
    const slice = heightSortedByOrder.slice(i * maxCols, (i + 1) * maxCols);
    currentMaxHeightPerRow.push(Math.max(...slice));
  }

  return currentMaxHeightPerRow;
};

/**
 * Calculate the y-shift of each row
 *
 * @param currentHeights - array of max heights per row of original order
 * @param newHeights - array of max heights per row of new order
 * @returns Array of y-translate values for rows that need to be shifted
 */
export const calculateRowHeightDiff = (
  currentHeights: number[],
  newHeights: number[]
) => {
  const rowHeightDiff: number[] = [];
  for (let i = 0; i < currentHeights.length; i += 1) {
    if (i === 0) rowHeightDiff.push(newHeights[i] - currentHeights[i]);
    else
      rowHeightDiff.push(
        newHeights[i] - currentHeights[i] + rowHeightDiff[i - 1]
      );
  }
  return { rowHeightDiff };
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
