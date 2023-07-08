import { clamp, range } from "lodash";
import { swap } from "./swap";

const getHeightShift = (
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

export function useCalculations({
  order,
  tempCoordinates,
  newCoordinates,
  setNewCoordinates,
  maxCols,
  maxRows,
  gridColumnWidth,
  gridRowHeights,
  gridOffsetFromTop,
  offsetTopOfRows,
  currentMaxHeightPerRow,
  currentRowBottom,
}: CalculationsData) {
  const oddNumberOfIndex = order.length % maxCols;
  let currentCol: number;
  let newCol: number;
  let currentRow: number;
  let newRow: number;

  const initializeData = ({
    currentIndexPosition,
  }: {
    currentIndexPosition: number;
  }) => {
    currentRow = Math.floor(currentIndexPosition / maxCols);
    currentCol = currentIndexPosition % maxCols;
  };

  const setNewPosition = () => {
    const stagingCoordinates = newCoordinates;
    for (let i = 0, j = order.length; i < j; i += 1) {
      stagingCoordinates[i].x += tempCoordinates[i].x;
      stagingCoordinates[i].y += tempCoordinates[i].y;
    }
    setNewCoordinates(stagingCoordinates);
  };

  const getNewMaxHeights = (order: Array<number>) => {
    const indexSortedByRows = [];
    const newRowBottom = [];

    for (let i = 0; i < maxRows; i += 1) {
      const slice = order.slice(i * maxCols, (i + 1) * maxCols);
      indexSortedByRows.push(slice);

      const heightMap = slice.map((index) => {
        return gridRowHeights.current[index];
      });
      const heightOfRow: number =
        Math.max(...heightMap) +
        (i === 0 ? gridOffsetFromTop.current : newRowBottom[i - 1]);
      newRowBottom.push(heightOfRow);
    }

    return { indexSortedByRows, newRowBottom };
  };

  const setXCoordinates = ({
    currentIndexPosition,
    newIndex,
  }: {
    currentIndexPosition: number;
    newIndex: number;
  }) => {
    // Find the indexes that need to be updated based on the from and to indexes
    const indexesToUpdate = range(newIndex, currentIndexPosition);
    // Check the direction we need to shift the indexes
    const direction = Math.sign(currentIndexPosition - newIndex);

    if (direction) {
      for (let i = 0, j = indexesToUpdate.length; i < j; i += 1) {
        const thisIndex = indexesToUpdate[i];
        const thisIndexRow = Math.floor(thisIndex / maxCols);
        if (direction > 0) {
          const shiftDown = !((thisIndex + 1) % maxCols);
          tempCoordinates[order[thisIndex]] = {
            x: shiftDown
              ? -(maxCols - 1) * gridColumnWidth.current
              : gridColumnWidth.current,
            y: shiftDown ? currentMaxHeightPerRow[thisIndexRow] : 0,
          };
        } else if (direction < 0) {
          const shiftUp = !(thisIndex % maxCols);
          tempCoordinates[order[thisIndex]] = {
            x: shiftUp
              ? (maxCols - 1) * gridColumnWidth.current
              : -gridColumnWidth.current,
            y: shiftUp ? -currentMaxHeightPerRow[thisIndexRow - 1] : 0,
          };
        }
      }

      if (
        newRow === maxRows - 1 &&
        oddNumberOfIndex &&
        newCol >= oddNumberOfIndex
      )
        newCol = oddNumberOfIndex - 1;

      tempCoordinates[order[currentIndexPosition]] = {
        x: (newCol - currentCol) * gridColumnWidth.current,
        y:
          newRow !== currentRow
            ? getHeightShift(newRow, currentRow, currentMaxHeightPerRow)
            : 0,
      };
    }
  };

  const setYCoordinates = ({
    currentIndexPosition,
    newIndex,
  }: {
    currentIndexPosition: number;
    newIndex: number;
  }) => {
    const newOrder = swap(order, currentIndexPosition, newIndex);
    // Runs when switching to a new row, we need to keep the new coordinates updated
    const { indexSortedByRows, newRowBottom } = getNewMaxHeights(newOrder);
    const length = currentMaxHeightPerRow.length;
    // Shift all items rows with height differences
    for (let i = 0, h = newRowBottom.length; i < h; i += 1) {
      const heightDiff = newRowBottom[i] - currentRowBottom[i];

      if (heightDiff && i + 1 < length) {
        const nextIndex = indexSortedByRows[i + 1];
        for (let j = 0, k = nextIndex.length; j < k; j += 1) {
          // Add new height difference to each index in the row
          tempCoordinates[nextIndex[j]].y += heightDiff;
        }
      }
    }
  };

  const setCoordinates = ({
    currentIndexPosition,
    newIndex,
  }: {
    currentIndexPosition: number;
    newIndex: number;
  }) => {
    // Reset the staged coordinates
    for (let i = 0, j = tempCoordinates.length; i < j; i += 1) {
      tempCoordinates[i].x = 0;
      tempCoordinates[i].y = 0;
    }
    setXCoordinates({
      currentIndexPosition,
      newIndex,
    });
    if (newRow !== currentRow)
      setYCoordinates({ currentIndexPosition, newIndex });
  };

  const calcNewCol = ({ mx }: { mx: number }) => {
    return Math.abs(
      clamp(
        Math.round(mx / gridColumnWidth.current + currentCol),
        0,
        maxCols - 1
      )
    );
  };

  const calcNewRow = ({
    originalIndex,
    my,
  }: {
    originalIndex: number;
    my: number;
  }) => {
    // Position of the top of the index being moved relative to the top
    const yOffset = offsetTopOfRows[currentRow] + my;
    // The trigger point is halfway of the height of the current index
    const indexHeightHalfway = gridRowHeights.current[originalIndex] / 2;

    // Monitor each row
    for (let i = 0; i < maxRows; i += 1) {
      const offsetOfNextRow = offsetTopOfRows[i + 1];
      if (offsetOfNextRow && yOffset < offsetOfNextRow - indexHeightHalfway) {
        return i;
      }
    }
    // Else return the last row
    return maxRows - 1;
  };

  const calcNewIndex = ({
    originalIndex,
    mx,
    my,
  }: {
    originalIndex: number;
    mx: number;
    my: number;
  }) => {
    newCol = calcNewCol({ mx });
    newRow = calcNewRow({ originalIndex, my });
    return clamp(newRow * maxCols + newCol, 0, order.length - 1);
  };

  return {
    calcNewIndex,
    initializeData,
    setCoordinates,
    setNewPosition,
  };
}
