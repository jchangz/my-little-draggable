import { useRef } from "react";
import { clamp, range } from "lodash";
import { swap } from "./swap";
import useGridProps from "../hooks/useGridProps";

function useCoordinates({
  order,
  orderByKey,
  draggableRef,
  windowSize,
}: DraggableData) {
  const tempCoordinates = useRef(
    [...Array(order.length)].map(() => ({ x: 0, y: 0 }))
  );
  const currentIndexPosition = useRef(0);

  const maxCols = 3;
  const maxRows = Math.ceil(order.length / maxCols);

  const curCol = useRef(0);
  const newCol = useRef(0);
  const curRow = useRef(0);
  const newRow = useRef(0);

  const {
    colWidth,
    colOrphan,
    rowHeights,
    rowOffsetTop,
    curMaxHeightPerRow,
    getRowHeightDiff,
    getRowHeightShift,
  } = useGridProps({
    order,
    orderByKey,
    draggableRef,
    maxCols,
    maxRows,
    windowSize,
  });

  const initCoordinates = ({ originalIndex }: NumberData) => {
    const indexPosition = order.indexOf(originalIndex);
    currentIndexPosition.current = indexPosition;
    curRow.current = Math.floor(indexPosition / maxCols);
    curCol.current = indexPosition % maxCols;

    return indexPosition;
  };

  const getCurrentIndexPosition = () => currentIndexPosition.current;

  const setTempCoordinatesXY = ({ newIndex }: NumberData) => {
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
            x: shiftDown ? -(maxCols - 1) * colWidth : colWidth,
            y: shiftDown ? curMaxHeightPerRow[thisIndexRow] : 0,
          };
        } else if (direction < 0) {
          const shiftUp = !(thisIndex % maxCols);
          tempCoordinates.current[order[thisIndex]] = {
            x: shiftUp ? (maxCols - 1) * colWidth : -colWidth,
            y: shiftUp ? -curMaxHeightPerRow[thisIndexRow - 1] : 0,
          };
        }
      }

      if (
        newRow.current === maxRows - 1 &&
        colOrphan &&
        newCol.current >= colOrphan
      )
        newCol.current = colOrphan - 1;

      tempCoordinates.current[order[currentIndexPosition.current]] = {
        x: (newCol.current - curCol.current) * colWidth,
        y:
          newRow.current !== curRow.current
            ? getRowHeightShift(curRow.current, newRow.current)
            : 0,
      };
    }
  };

  const setTempCoordinatesRowShift = ({ newIndex }: NumberData) => {
    const newOrder = swap(order, currentIndexPosition.current, newIndex);
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

  const setTempCoordinates = ({ newIndex }: NumberData) => {
    // Reset the staged coordinates
    tempCoordinates.current = [...Array(order.length)].map(() => ({
      x: 0,
      y: 0,
    }));

    setTempCoordinatesXY({ newIndex });
    if (newRow.current !== curRow.current)
      setTempCoordinatesRowShift({ newIndex });
  };

  const calculateNewCol = ({ mx }: NumberData) =>
    Math.abs(clamp(Math.round(mx / colWidth + curCol.current), 0, maxCols - 1));

  const calculateNewRow = ({ originalIndex, my }: NumberData) => {
    // Position of the top of the index being moved relative to the top
    const yOffset = rowOffsetTop[curRow.current] + my;
    // The trigger point is halfway of the height of the current index
    const indexHeightHalfway = rowHeights[originalIndex] / 2;

    // Monitor each row
    for (let i = 0; i < maxRows; i += 1) {
      const offsetOfNextRow = rowOffsetTop[i + 1];
      if (offsetOfNextRow && yOffset < offsetOfNextRow - indexHeightHalfway) {
        return i;
      }
    }
    // Else return the last row
    return maxRows - 1;
  };

  const calculateNewIndex = ({ originalIndex, mx, my }: NumberData) => {
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
    initCoordinates,
    getCurrentIndexPosition,
    calculateNewIndex,
    setTempCoordinates,
  };
}

export default useCoordinates;
