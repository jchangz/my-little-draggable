import React, { useState, useEffect } from "react";
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
  const [columnWidth, setColumnWidth] = useState(0);
  const [gridRowHeights, setGridRowHeights] = useState<number[]>([]);
  const [currentMaxHeightPerRow, setCurrentMaxHeightPerRow] = useState<
    number[]
  >([]);
  const [offsetTopOfRows, setOffsetTopOfRows] = useState<number[]>([]);
  const oddNumberOfIndex = order.length % maxCols;

  useEffect(() => {
    if (containerRef.current) {
      const itemArr = containerRef.current.children;
      const heightArr: number[] = [];

      if (itemArr.length < 1) return;

      [...itemArr].forEach((item, i) => {
        const { width, height } = item.getBoundingClientRect();

        if (i === 0) {
          setColumnWidth(width);

          // Set css property for the mirror element width
          document.documentElement.style.setProperty(
            "--col-width",
            width + "px"
          );
        }

        heightArr.push(height);
      });

      setGridRowHeights(heightArr);

      const maxHeightPerRow = calculateMaxHeightPerRow(
        order,
        maxCols,
        maxRows,
        heightArr
      );
      setCurrentMaxHeightPerRow(maxHeightPerRow);

      // Skip the last item as the first row starts at the offsetTop of the grid
      const offsetTopOfRows = maxHeightPerRow.slice(0, -1).reduce(
        (resultArray: number[], item, i) => {
          const newArray = resultArray;
          const val = item + resultArray[i];
          newArray.push(val);

          return newArray;
        },
        [containerRef.current.offsetTop]
      );

      setOffsetTopOfRows(offsetTopOfRows);
    }
  }, [order, orderByKey, maxCols, maxRows, containerRef]);

  const getRowHeightDiff = (order: number[]) => {
    // Get max heights of each row based on the new order
    const newMaxHeightPerRow = calculateMaxHeightPerRow(
      order,
      maxCols,
      maxRows,
      gridRowHeights
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
    oddNumberOfIndex,
    currentMaxHeightPerRow,
    getRowHeightDiff,
  };
}

export default useGridProps;
