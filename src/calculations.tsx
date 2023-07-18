import { range } from "lodash";

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
