import { useState, useEffect, useRef } from "react";
import { clamp, range } from "lodash";
import { swap } from "./swap";

const getHeightShift = (newRow, currentRow, originalHeightArr) => {
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
  maxCols,
  maxRows,
  gridColumnWidth,
  gridRowHeights,
  gridOffsetFromTop,
}) {
  const [newCoordinates, setNewCoordinates] = useState<Array<object>>(
    new Array(order.length).fill(0).map(() => ({ x: 0, y: 0 }))
  );
  const tempCoordinates = new Array(order.length)
    .fill(0)
    .map(() => ({ x: 0, y: 0 }));
  const currentMaxHeightPerRow = useRef<Array<number>>([]);
  const currentRowBottom = useRef<Array<number>>([]);
  const offsetTopOfRows = useRef<Array<number>>([]);
  const newPosition = useRef<Array<object>>([]);
  let currentCol: number;
  let newCol: number;
  let currentRow: number;
  let newRow: number;

  useEffect(() => {
    newPosition.current = new Array(order.length)
      .fill(0)
      .map(() => ({ x: 0, y: 0 }));
  }, [order.length]);

  useEffect(() => {
    offsetTopOfRows.current = new Array(maxRows.current).fill(
      gridOffsetFromTop.current
    );
  }, [maxRows, gridOffsetFromTop]);

  useEffect(() => {
    const rowHeightObj: { [id: number]: number } = {};
    order.forEach((val: number, i: number) => {
      const rowNum = Math.ceil((i + 1) / maxCols);
      if (!rowHeightObj[rowNum])
        rowHeightObj[rowNum] = gridRowHeights.current[val];
      else {
        if (gridRowHeights.current[val] > rowHeightObj[rowNum]) {
          rowHeightObj[rowNum] = gridRowHeights.current[val];
        }
      }
    });

    currentMaxHeightPerRow.current = Object.values(rowHeightObj);

    currentRowBottom.current = currentMaxHeightPerRow.current.reduce(
      (resultArray, item, i) => {
        const newArray = resultArray;
        const val =
          item + (i === 0 ? gridOffsetFromTop.current : resultArray[i - 1]);
        newArray.push(val);
        return newArray;
      },
      []
    );
  }, [order, maxCols, gridRowHeights, gridOffsetFromTop]);

  const initializeData = ({
    currentIndexPosition,
  }: {
    currentIndexPosition: number;
  }) => {
    currentRow = Math.floor(currentIndexPosition / maxCols);
    currentCol = currentIndexPosition % maxCols;
    calcNewOffsetTopOfRows();
  };

  const calcNewOffsetTopOfRows = () => {
    for (let i = 1; i < maxRows.current; i += 1) {
      offsetTopOfRows.current[i] =
        offsetTopOfRows.current[i - 1] + currentMaxHeightPerRow.current[i - 1];
    }
  };

  const setNewPosition = () => {
    for (let i = 0; i < newPosition.current.length; i += 1) {
      newPosition.current[i].x += tempCoordinates[i].x;
      newPosition.current[i].y += tempCoordinates[i].y;
    }
    setNewCoordinates(newPosition.current);
    reset();
  };

  const reset = () => {
    tempCoordinates.forEach((v) => {
      v.x = 0;
      v.y = 0;
    });
  };

  const getNewMaxHeights = (order: Array<number>) => {
    const numberOfRows = Math.ceil(order.length / maxCols);
    const indexSortedByRows = [];
    const newRowBottom = [];

    for (let i = 0; i < numberOfRows; i += 1) {
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

  const setXCoordinates = ({ currentIndexPosition, newIndex }) => {
    // Find the indexes that need to be updated based on the from and to indexes
    const indexesToUpdate = range(newIndex, currentIndexPosition);
    // Check the direction we need to shift the indexes
    const direction = Math.sign(currentIndexPosition - newIndex);

    if (direction) {
      for (let i = 0; i < indexesToUpdate.length; i += 1) {
        const thisIndex = indexesToUpdate[i];
        const thisIndexRow = Math.floor(thisIndex / maxCols);
        if (direction > 0) {
          const shiftDown = !((thisIndex + 1) % maxCols);
          tempCoordinates[order[thisIndex]] = {
            x: shiftDown
              ? -(maxCols - 1) * gridColumnWidth.current
              : gridColumnWidth.current,
            y: shiftDown ? currentMaxHeightPerRow.current[thisIndexRow] : 0,
          };
        } else if (direction < 0) {
          const shiftUp = !(thisIndex % maxCols);
          tempCoordinates[order[thisIndex]] = {
            x: shiftUp
              ? (maxCols - 1) * gridColumnWidth.current
              : -gridColumnWidth.current,
            y: shiftUp ? -currentMaxHeightPerRow.current[thisIndexRow - 1] : 0,
          };
        }
      }
      tempCoordinates[order[currentIndexPosition]] = {
        x: (newCol - currentCol) * gridColumnWidth.current,
        y:
          newRow !== currentRow
            ? getHeightShift(newRow, currentRow, currentMaxHeightPerRow.current)
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
    // Shift all items rows with height differences
    for (let i = 0; i < newRowBottom.length; i += 1) {
      const heightDiff = newRowBottom[i] - currentRowBottom.current[i];

      if (heightDiff && i + 1 < currentMaxHeightPerRow.current.length) {
        for (let j = 0; j < indexSortedByRows[i + 1].length; j += 1) {
          // Add new height difference to each index in the row
          tempCoordinates[indexSortedByRows[i + 1][j]].y += heightDiff;
        }
      }
    }
  };

  const setCoordinates = ({ currentIndexPosition, newIndex }) => {
    // Reset the staged coordinates
    reset();
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
    for (let i = 0; i < maxRows.current; i += 1) {
      // Calculate and return the new row
      if (
        offsetTopOfRows.current[i + 1] &&
        offsetTopOfRows.current[currentRow] + my <
          offsetTopOfRows.current[i + 1] -
            gridRowHeights.current[originalIndex] / 2
      ) {
        return i;
      }
    }
    // When we are in the last row
    return offsetTopOfRows.current.length - 1;
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
    newCoordinates,
    tempCoordinates,
    calcNewIndex,
    initializeData,
    setCoordinates,
    setNewPosition,
  };
}
