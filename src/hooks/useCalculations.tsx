import React, { useRef } from "react";
import { clamp, range } from "lodash";
import { swap } from "./swap";
import useGridProps from "../hooks/useGridProps";

function useCalculations({ order, containerRef }: CalculationsData) {
  const tempCoordinates = useRef(
    [...Array(order.length)].map(() => ({ x: 0, y: 0 }))
  );

  const maxCols = 3;
  const maxRows = Math.ceil(order.length / maxCols);

  const curCol = useRef(0);
  const newCol = useRef(0);
  const curRow = useRef(0);
  const newRow = useRef(0);

  const {
    colWidth,
    gridRowHeights,
    offsetTopOfRows,
    oddNumberOfIndex,
    currentMaxHeightPerRow,
    getRowHeightDiff,
    calculateHeightShift,
  } = useGridProps({
    containerRef,
    order,
    maxCols,
    maxRows,
  });

  const setCurrentRowCol = (index: number) => {
    curRow.current = Math.floor(index / maxCols);
    curCol.current = index % maxCols;
  };

  const setTempCoordinatesXY = ({ curIndex, newIndex }: CoordinateData) => {
    // Find the indexes that need to be updated based on the from and to indexes
    const indexesToUpdate = range(newIndex, curIndex);
    // Check the direction we need to shift the indexes
    const direction = Math.sign(curIndex - newIndex);

    if (direction) {
      for (let i = 0, j = indexesToUpdate.length; i < j; i += 1) {
        const thisIndex = indexesToUpdate[i];
        const thisIndexRow = Math.floor(thisIndex / maxCols);
        if (direction > 0) {
          const shiftDown = !((thisIndex + 1) % maxCols);
          tempCoordinates.current[order[thisIndex]] = {
            x: shiftDown ? -(maxCols - 1) * colWidth : colWidth,
            y: shiftDown ? currentMaxHeightPerRow[thisIndexRow] : 0,
          };
        } else if (direction < 0) {
          const shiftUp = !(thisIndex % maxCols);
          tempCoordinates.current[order[thisIndex]] = {
            x: shiftUp ? (maxCols - 1) * colWidth : -colWidth,
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

      tempCoordinates.current[order[curIndex]] = {
        x: (newCol.current - curCol.current) * colWidth,
        y:
          newRow.current !== curRow.current
            ? calculateHeightShift(curRow.current, newRow.current)
            : 0,
      };
    }
  };

  const setTempCoordinatesRowShift = ({
    curIndex,
    newIndex,
  }: CoordinateData) => {
    const newOrder = swap(order, curIndex, newIndex);
    const { rowHeightDiff } = getRowHeightDiff(newOrder);

    for (let i = 0; i < maxRows; i += 1) {
      // Shift the row after i
      if (rowHeightDiff[i] && i + 1 < maxRows) {
        const indicesToShift = newOrder.slice(
          (i + 1) * maxCols,
          (i + 2) * maxCols
        );
        // Add new height difference to each index in the row
        for (let j = 0, k = indicesToShift.length; j < k; j += 1) {
          tempCoordinates.current[indicesToShift[j]].y += rowHeightDiff[i];
        }
      }
    }
  };

  const setTempCoordinates = ({
    currentIndexPosition,
    newIndex,
  }: {
    currentIndexPosition: React.RefObject<number>;
    newIndex: number;
  }) => {
    const curIndex = currentIndexPosition.current || 0;
    // Reset the staged coordinates
    tempCoordinates.current = [...Array(order.length)].map(() => ({
      x: 0,
      y: 0,
    }));

    setTempCoordinatesXY({ curIndex, newIndex });
    if (newRow.current !== curRow.current)
      setTempCoordinatesRowShift({ curIndex, newIndex });
  };

  const calculateNewCol = ({ mx }: CoordinateData) =>
    Math.abs(clamp(Math.round(mx / colWidth + curCol.current), 0, maxCols - 1));

  const calculateNewRow = ({ originalIndex, my }: CoordinateData) => {
    // Position of the top of the index being moved relative to the top
    const yOffset = offsetTopOfRows[curRow.current] + my;
    // The trigger point is halfway of the height of the current index
    const indexHeightHalfway = gridRowHeights[originalIndex] / 2;

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

  const calculateNewIndex = ({ originalIndex, mx, my }: CoordinateData) => {
    newCol.current = calculateNewCol({ mx });
    newRow.current = calculateNewRow({ originalIndex, my });
    return clamp(
      newRow.current * maxCols + newCol.current,
      0,
      order.length - 1
    );
  };

  return {
    tempCoordinates,
    setCurrentRowCol,
    calculateNewIndex,
    setTempCoordinates,
  };
}

export default useCalculations;
