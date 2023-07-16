import React, { useState, useRef, useEffect } from "react";
import { clamp, range } from "lodash";
import { swap } from "./swap";
import { calculateHeightShift } from "../calculations";
import useGridProps from "../hooks/useGridProps";

export function useCalculations({ order, containerRef }: CalculationsData) {
  const tempCoordinates = useRef(
    [...Array(order.length)].map(() => ({ x: 0, y: 0 }))
  );

  const [maxCols, setMaxCols] = useState(3);
  const [gridGap, setGridGap] = useState(0);
  const maxRows = Math.ceil(order.length / maxCols);

  const currentCol = useRef(0);
  const newCol = useRef(0);
  const currentRow = useRef(0);
  const newRow = useRef(0);

  const {
    columnWidth,
    gridRowHeights,
    offsetTopOfRows,
    oddNumberOfIndex,
    currentMaxHeightPerRow,
    getRowHeightDiff,
  } = useGridProps({
    containerRef,
    order,
    maxCols,
    maxRows,
  });

  const setCurrentRowCol = (index: number) => {
    currentRow.current = Math.floor(index / maxCols);
    currentCol.current = index % maxCols;
  };

  const setTempCoordinatesXY = (indexPosition: number, newIndex: number) => {
    const width = columnWidth;
    // Find the indexes that need to be updated based on the from and to indexes
    const indexesToUpdate = range(newIndex, indexPosition);
    // Check the direction we need to shift the indexes
    const direction = Math.sign(indexPosition - newIndex);

    if (direction) {
      for (let i = 0, j = indexesToUpdate.length; i < j; i += 1) {
        const thisIndex = indexesToUpdate[i];
        const thisIndexRow = Math.floor(thisIndex / maxCols);
        if (direction > 0) {
          const shiftDown = !((thisIndex + 1) % maxCols);
          tempCoordinates.current[order[thisIndex]] = {
            x: shiftDown ? -(maxCols - 1) * width : width,
            y: shiftDown ? currentMaxHeightPerRow[thisIndexRow] : 0,
          };
        } else if (direction < 0) {
          const shiftUp = !(thisIndex % maxCols);
          tempCoordinates.current[order[thisIndex]] = {
            x: shiftUp ? (maxCols - 1) * width : -width,
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

      tempCoordinates.current[order[indexPosition]] = {
        x: (newCol.current - currentCol.current) * width,
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

  const setTempCoordinatesRowShift = (
    indexPosition: number,
    newIndex: number
  ) => {
    const newOrder = swap(order, indexPosition, newIndex);
    const { rowHeightDiff } = getRowHeightDiff(newOrder);

    for (let i = 0; i < maxRows; i += 1) {
      // Shift the row after i
      if (rowHeightDiff[i] && i + 1 < maxRows) {
        const indexesToShift = newOrder.slice(
          (i + 1) * maxCols,
          (i + 2) * maxCols
        );
        // Add new height difference to each index in the row
        for (let j = 0, k = indexesToShift.length; j < k; j += 1) {
          tempCoordinates.current[indexesToShift[j]].y += rowHeightDiff[i];
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
    const indexPosition = currentIndexPosition.current || 0;
    // Reset the staged coordinates
    tempCoordinates.current = [...Array(order.length)].map(() => ({
      x: 0,
      y: 0,
    }));

    setTempCoordinatesXY(indexPosition, newIndex);
    if (newRow.current !== currentRow.current)
      setTempCoordinatesRowShift(indexPosition, newIndex);
  };

  const calculateNewCol = ({ mx }: { mx: number }) => {
    return Math.abs(
      clamp(Math.round(mx / columnWidth + currentCol.current), 0, maxCols - 1)
    );
  };

  const calculateNewRow = ({
    originalIndex,
    my,
  }: {
    originalIndex: number;
    my: number;
  }) => {
    // Position of the top of the index being moved relative to the top
    const yOffset = offsetTopOfRows[currentRow.current] + my;
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

  const calculateNewIndex = ({
    originalIndex,
    mx,
    my,
  }: {
    originalIndex: number;
    mx: number;
    my: number;
  }) => {
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
