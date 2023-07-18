import React, { useState, useEffect } from "react";
import { range } from "lodash";

function useGridProps({
  containerRef,
  order,
  maxCols,
  maxRows,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  order: number[];
  maxCols: number;
  maxRows: number;
}) {
  // Distance from top of window to first row
  const [offsetTop, setOffsetTop] = useState(0);
  // Width of each column
  const [colWidth, setColWidth] = useState(0);
  // Array of heights of each item in the grid
  const [gridRowHeights, setGridRowHeights] = useState<number[]>([]);
  // Check if there are orphan indicies when we drag into the last row
  const oddNumberOfIndex = order.length % maxCols;

  const calculateMaxHeightPerRow = (order: number[]) => {
    const maxHeightPerRow = [];
    const heightSortedByOrder = order.map((index) => gridRowHeights[index]);

    for (let i = 0; i < maxRows; i += 1) {
      const slice = heightSortedByOrder.slice(i * maxCols, (i + 1) * maxCols);
      maxHeightPerRow.push(Math.max(...slice));
    }

    return maxHeightPerRow;
  };
  // Max height of each row based on the current order
  const currentMaxHeightPerRow = calculateMaxHeightPerRow(order);
  // Distance from the top of the window to each row
  const offsetTopOfRows =
    // Skip the last item as the first row starts at the offsetTop of the grid
    currentMaxHeightPerRow.slice(0, -1).reduce(
      (resultArray: number[], item, i) => {
        resultArray.push(item + resultArray[i]);
        return resultArray;
      },
      [offsetTop]
    );

  useEffect(() => {
    if (containerRef.current) {
      const itemArr = containerRef.current.children;
      const heightArr: number[] = [];

      if (itemArr.length < 1) return;

      [...itemArr].forEach((item, i) => {
        const { width, height } = item.getBoundingClientRect();

        if (i === 0) {
          setColWidth(width);

          // Set css property for the mirror element width
          document.documentElement.style.setProperty(
            "--col-width",
            width + "px"
          );
        }

        heightArr.push(height);
      });
      setOffsetTop(containerRef.current.offsetTop);
      setGridRowHeights(heightArr);
    }
    // This only needs to run when window size changes or we toggle re-render
    // But we would need to prop drill orderByKey and windowSize
    // Using order causes it to re-render everytime we finish dragging
    // However it seems performance impact is negligible...
  }, [order, maxCols, maxRows, containerRef]);

  // Check the difference in row heights between the original and new order
  // The difference is used to translate the row position
  const getRowHeightDiff = (order: number[]) => {
    // Array of y-translate values for rows that need to be shifted
    const rowHeightDiff: number[] = [];
    // Get max heights of each row based on the new order
    const newMaxHeightPerRow = calculateMaxHeightPerRow(order);
    // Get the y-coordinates to shift the row heights based on the new order
    for (let i = 0; i < maxRows; i += 1) {
      rowHeightDiff.push(
        newMaxHeightPerRow[i] -
          currentMaxHeightPerRow[i] +
          (i !== 0 ? rowHeightDiff[i - 1] : 0)
      );
    }

    return { rowHeightDiff };
  };

  // Calculate y-direction shift of the selected index
  // Returns the total sum of row heights
  const calculateHeightShift = (curRow: number, newRow: number) =>
    range(newRow, curRow)
      .map((rowNum) => {
        if (newRow > curRow)
          return currentMaxHeightPerRow[Math.abs(rowNum - 1)];
        else return -currentMaxHeightPerRow[rowNum];
      })
      .reduce((a, b) => a + b, 0);

  return {
    colWidth,
    gridRowHeights,
    offsetTopOfRows,
    oddNumberOfIndex,
    currentMaxHeightPerRow,
    getRowHeightDiff,
    calculateHeightShift,
  };
}

export default useGridProps;
