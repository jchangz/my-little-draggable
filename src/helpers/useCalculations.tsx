import React, { useState, useRef, useEffect } from "react";
import { clamp, range } from "lodash";
import { swap } from "./swap";
import { calculateHeightShift } from "../calculations";
import useGridProps from "../hooks/useGridProps";

export function useCalculations({
  order,
  orderByKey,
  containerRef,
}: CalculationsData) {
  const [maxCols, setMaxCols] = useState(3);
  const [gridGap, setGridGap] = useState(0);
  const maxRows = Math.ceil(order.length / maxCols);

  const [newCoordinates, setNewCoordinates] = useState<CoordinateData[]>([]);
  const tempCoordinates = useRef(
    [...Array(order.length)].map(() => ({ x: 0, y: 0 }))
  );
  const {
    columnWidth,
    gridRowHeights,
    offsetTopOfRows,
    currentMaxHeightPerRow,
    getRowHeightDiff,
  } = useGridProps({
    containerRef,
    order,
    orderByKey,
    maxCols,
    maxRows,
  });

  const oddNumberOfIndex = order.length % maxCols;

  const currentCol = useRef(0);
  const newCol = useRef(0);
  const currentRow = useRef(0);
  const newRow = useRef(0);

  useEffect(() => {
    // Reset coordinates on re-render
    setNewCoordinates(
      [...Array(orderByKey.length)].map(() => ({ x: 0, y: 0 }))
    );
  }, [orderByKey, maxRows]);

  const initCoordinates = (index: number) => {
    currentRow.current = Math.floor(index / maxCols);
    currentCol.current = index % maxCols;
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

  const setXCoordinates = (indexPosition: number, newIndex: number) => {
    const width = columnWidth.current;
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

  const setYCoordinates = (indexPosition: number, newIndex: number) => {
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

  const setCoordinates = ({
    currentIndexPosition,
    newIndex,
  }: {
    currentIndexPosition: React.RefObject<number>;
    newIndex: number;
  }) => {
    const indexPosition = currentIndexPosition.current || 0;
    // Reset the staged coordinates
    for (let i = 0, j = tempCoordinates.current.length; i < j; i += 1) {
      tempCoordinates.current[i].x = 0;
      tempCoordinates.current[i].y = 0;
    }
    setXCoordinates(indexPosition, newIndex);
    if (newRow.current !== currentRow.current)
      setYCoordinates(indexPosition, newIndex);
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
    const yOffset = offsetTopOfRows[currentRow.current] + my;
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
    newCol.current = calcNewCol({ mx });
    newRow.current = calcNewRow({ originalIndex, my });
    return clamp(
      newRow.current * maxCols + newCol.current,
      0,
      order.length - 1
    );
  };

  const animateWithClone =
    ({ originalIndex, down }: { originalIndex: number; down: boolean }) =>
    (index: number) => ({
      x: newCoordinates[index].x + tempCoordinates.current[index].x,
      y: newCoordinates[index].y + tempCoordinates.current[index].y,
      opacity: down && index === originalIndex ? 0.2 : 1,
      shadow: 0,
      zIndex: down && index === originalIndex ? 9 : 0,
    });

  const animateWithoutClone =
    ({
      originalIndex,
      down,
      mx,
      my,
    }: {
      originalIndex: number;
      down: boolean;
      mx: number;
      my: number;
    }) =>
    (index: number) =>
      down && index === originalIndex
        ? {
            x: newCoordinates[index].x + mx,
            y: newCoordinates[index].y + my,
            shadow: 15,
            zIndex: 9,
            immediate: true,
          }
        : {
            x: newCoordinates[index].x + tempCoordinates.current[index].x,
            y: newCoordinates[index].y + tempCoordinates.current[index].y,
            shadow: 0,
            zIndex: 0,
            immediate: false,
          };

  const animateMirror = ({ originalIndex, top, left, mx, my }: MirrorData) => ({
    x: newCoordinates[originalIndex].x + mx,
    y: newCoordinates[originalIndex].y + my,
    top: top,
    left: left,
    immediate: true,
  });

  return {
    calcNewIndex,
    initCoordinates,
    setCoordinates,
    setNewPosition,
    animateWithClone,
    animateWithoutClone,
    animateMirror,
  };
}
