import React, { useEffect, useRef } from "react";
import {
  calculateMaxHeightPerRow,
  calculateRowHeightDiff,
} from "../calculations";

function useGridProps({
  containerRef,
  order,
  orderByKey,
  maxCols,
  maxRows,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  order: number[];
  orderByKey: number[];
  maxCols: number;
  maxRows: number;
}) {
  const offsetTop = useRef(0);
  const columnWidth = useRef(0);
  const gridRowHeights = useRef<number[]>([]);
  const currentMaxHeightPerRow = calculateMaxHeightPerRow(
    order,
    maxCols,
    maxRows,
    gridRowHeights.current
  );
  // Skip the last item as the first row starts at the offsetTop of the grid
  const offsetTopOfRows = currentMaxHeightPerRow.slice(0, -1).reduce(
    (resultArray: number[], item, i) => {
      const newArray = resultArray;
      const val = item + resultArray[i];
      newArray.push(val);

      return newArray;
    },
    [offsetTop.current]
  );

  useEffect(() => {
    if (containerRef.current) {
      const itemArr = containerRef.current.children;
      const heightArr: number[] = [];

      if (itemArr.length < 1) return;

      [...itemArr].forEach((item, i) => {
        const { width, height } = item.getBoundingClientRect();

        if (i === 0) {
          columnWidth.current = width;

          // Set css property for the mirror element width
          document.documentElement.style.setProperty(
            "--col-width",
            width + "px"
          );
        }

        heightArr.push(height);
      });

      gridRowHeights.current = heightArr;
      offsetTop.current = containerRef.current.offsetTop;
    }
  }, [orderByKey, maxRows, containerRef]);

  const getRowHeightDiff = (order: number[]) => {
    // Get max heights of each row based on the new order
    const newMaxHeightPerRow = calculateMaxHeightPerRow(
      order,
      maxCols,
      maxRows,
      gridRowHeights.current
    );
    // Get the y-coordinates to shift the row heights based on the new order
    const { rowHeightDiff } = calculateRowHeightDiff(
      currentMaxHeightPerRow,
      newMaxHeightPerRow
    );

    return { rowHeightDiff };
  };

  return {
    columnWidth,
    gridRowHeights,
    offsetTopOfRows,
    currentMaxHeightPerRow,
    getRowHeightDiff,
  };
}

export default useGridProps;
