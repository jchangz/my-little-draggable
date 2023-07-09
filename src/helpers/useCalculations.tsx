import { useState, useRef, useEffect } from "react";
import { clamp, range } from "lodash";
import { swap } from "./swap";
import {
  calculateRowHeights,
  calculateHeightShift,
  calculateNewMaxHeights,
} from "../calculations";

export function useCalculations({ order, containerRef }: CalculationsData) {
  const [maxCols, setMaxCols] = useState(3);
  const [gridGap, setGridGap] = useState(0);
  const maxRows = Math.ceil(order.length / maxCols);

  const [newCoordinates, setNewCoordinates] = useState<CoordinateData[]>([]);
  const tempCoordinates = useRef(
    [...Array(order.length)].map(() => ({ x: 0, y: 0 }))
  );

  const columnWidth = useRef(0);
  const gridOffsetFromTop = useRef(0);
  const gridRowHeights = useRef<number[]>([]);
  const offsetTopOfRows = useRef<number[]>([]);
  const oddNumberOfIndex = order.length % maxCols;

  const { currentMaxHeightPerRow, currentRowBottom } = calculateRowHeights(
    order,
    maxRows,
    maxCols,
    gridRowHeights.current,
    gridOffsetFromTop.current
  );

  const currentCol = useRef(0);
  const newCol = useRef(0);
  const currentRow = useRef(0);
  const newRow = useRef(0);

  useEffect(() => {
    gridOffsetFromTop.current = containerRef.current?.offsetTop || 0;

    if (containerRef.current) {
      const itemArr = containerRef.current.children;
      const heightArr: number[] = [];
      if (itemArr.length < 1) return;

      [...itemArr].forEach((item, i) => {
        const { width, height } = item.getBoundingClientRect();

        if (i === 0) columnWidth.current = width;

        heightArr.push(height);
      });

      document.documentElement.style.setProperty(
        "--col-width",
        columnWidth.current + "px"
      );

      gridRowHeights.current = heightArr;
    }

    offsetTopOfRows.current = [...Array(maxRows)].fill(
      gridOffsetFromTop.current
    );

    setNewCoordinates([...Array(order.length)].map(() => ({ x: 0, y: 0 })));
  }, [maxRows, containerRef, order.length]);

  const initCoordinates = (index: number) => {
    currentRow.current = Math.floor(index / maxCols);
    currentCol.current = index % maxCols;

    // Calculate new offset top of rows
    for (let i = 1, j = maxRows; i < j; i += 1) {
      offsetTopOfRows.current[i] =
        offsetTopOfRows.current[i - 1] + currentMaxHeightPerRow[i - 1];
    }
  };

  const setNewPosition = () => {
    const stagingCoordinates = newCoordinates;
    for (let i = 0, j = order.length; i < j; i += 1) {
      stagingCoordinates[i].x += tempCoordinates.current[i].x;
      stagingCoordinates[i].y += tempCoordinates.current[i].y;
    }
    setNewCoordinates(stagingCoordinates);
    for (let i = 0, j = tempCoordinates.current.length; i < j; i += 1) {
      tempCoordinates.current[i].x = 0;
      tempCoordinates.current[i].y = 0;
    }
  };

  const setXCoordinates = ({
    currentIndexPosition,
    newIndex,
  }: {
    currentIndexPosition: number;
    newIndex: number;
  }) => {
    // Find the indexes that need to be updated based on the from and to indexes
    const indexesToUpdate = range(newIndex, currentIndexPosition.current);
    // Check the direction we need to shift the indexes
    const direction = Math.sign(currentIndexPosition.current - newIndex);

    if (direction) {
      for (let i = 0, j = indexesToUpdate.length; i < j; i += 1) {
        const thisIndex = indexesToUpdate[i];
        const thisIndexRow = Math.floor(thisIndex / maxCols);
        if (direction > 0) {
          const shiftDown = !((thisIndex + 1) % maxCols);
          tempCoordinates.current[order[thisIndex]] = {
            x: shiftDown
              ? -(maxCols - 1) * columnWidth.current
              : columnWidth.current,
            y: shiftDown ? currentMaxHeightPerRow[thisIndexRow] : 0,
          };
        } else if (direction < 0) {
          const shiftUp = !(thisIndex % maxCols);
          tempCoordinates.current[order[thisIndex]] = {
            x: shiftUp
              ? (maxCols - 1) * columnWidth.current
              : -columnWidth.current,
            y: shiftUp ? -currentMaxHeightPerRow[thisIndexRow - 1] : 0,
          };
        }
      }

      if (
        newRow.current === maxRows - 1 &&
        oddNumberOfIndex &&
        newCol.current >= oddNumberOfIndex
      )
        newCol.current = oddNumberOfIndex - 1;

      tempCoordinates.current[order[currentIndexPosition.current]] = {
        x: (newCol.current - currentCol.current) * columnWidth.current,
        y:
          newRow !== currentRow
            ? calculateHeightShift(
                newRow.current,
                currentRow.current,
                currentMaxHeightPerRow
              )
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
    const newOrder = swap(order, currentIndexPosition.current, newIndex);
    const { indexSortedByRows, newRowBottom } = calculateNewMaxHeights(
      newOrder,
      maxCols,
      maxRows,
      gridRowHeights.current,
      gridOffsetFromTop.current
    );
    const length = currentMaxHeightPerRow.length;
    // Shift all items rows with height differences
    for (let i = 0, h = newRowBottom.length; i < h; i += 1) {
      const heightDiff = newRowBottom[i] - currentRowBottom[i];

      if (heightDiff && i + 1 < length) {
        const nextIndex = indexSortedByRows[i + 1];
        for (let j = 0, k = nextIndex.length; j < k; j += 1) {
          // Add new height difference to each index in the row
          tempCoordinates.current[nextIndex[j]].y += heightDiff;
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
    for (let i = 0, j = tempCoordinates.current.length; i < j; i += 1) {
      tempCoordinates.current[i].x = 0;
      tempCoordinates.current[i].y = 0;
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
        Math.round(mx / columnWidth.current + currentCol.current),
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
    const yOffset = offsetTopOfRows.current[currentRow.current] + my;
    // The trigger point is halfway of the height of the current index
    const indexHeightHalfway = gridRowHeights.current[originalIndex] / 2;

    // Monitor each row
    for (let i = 0; i < maxRows; i += 1) {
      const offsetOfNextRow = offsetTopOfRows.current[i + 1];
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
    newCol.current = calcNewCol({ mx });
    newRow.current = calcNewRow({ originalIndex, my });
    return clamp(
      newRow.current * maxCols + newCol.current,
      0,
      order.length - 1
    );
  };

  return {
    newCoordinates,
    tempCoordinates,
    calcNewIndex,
    initCoordinates,
    setCoordinates,
    setNewPosition,
  };
}
