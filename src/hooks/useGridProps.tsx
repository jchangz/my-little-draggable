import { useState, useEffect } from "react";
import { range } from "lodash";

function useGridProps({
  order,
  orderByKey,
  draggableRef,
  maxCols,
  maxRows,
  windowSize,
}: GridData) {
  // Distance from top of window to first row
  const [offsetTop, setOffsetTop] = useState(0);
  // Width of each column
  const [colWidth, setColWidth] = useState(0);
  // Array of heights of each item in the grid
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  // Check if there are orphan indicies when we drag into the last row
  const colOrphan = order.length % maxCols;

  const calculateMaxHeightPerRow = (order: number[]) => {
    const maxHeightPerRow = [];
    const heightSortedByOrder = order.map((index) => rowHeights[index]);

    for (let i = 0; i < maxRows; i += 1) {
      const slice = heightSortedByOrder.slice(i * maxCols, (i + 1) * maxCols);
      maxHeightPerRow.push(Math.max(...slice));
    }

    return maxHeightPerRow;
  };
  // Max height of each row based on the current order
  const curMaxHeightPerRow = calculateMaxHeightPerRow(order);
  // Distance from the top of the window to each row
  const rowOffsetTop =
    // Skip the last item as the first row starts at the offsetTop of the grid
    curMaxHeightPerRow.slice(0, -1).reduce(
      (resultArray: number[], item, i) => {
        resultArray.push(item + resultArray[i]);
        return resultArray;
      },
      [offsetTop]
    );

  // Set the minimum height on the bounds container based on sum of max heights
  document.documentElement.style.setProperty(
    "--min-height",
    curMaxHeightPerRow.reduce((a, b) => a + b) + offsetTop + "px"
  );

  useEffect(() => {
    if (draggableRef.current) {
      const itemArr = draggableRef.current.children;
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
      setOffsetTop(draggableRef.current.offsetTop);
      setRowHeights(heightArr);
    }
    // This only needs to run when window size changes or we toggle re-render
  }, [windowSize, orderByKey, maxCols, maxRows, draggableRef]);

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
          curMaxHeightPerRow[i] +
          (i !== 0 ? rowHeightDiff[i - 1] : 0)
      );
    }

    return { rowHeightDiff };
  };

  // Calculate y-direction shift of the selected index
  // Returns the total sum of row heights
  const getRowHeightShift = (curRow: number, newRow: number) =>
    range(newRow, curRow)
      .map((rowNum) => {
        if (newRow > curRow) return curMaxHeightPerRow[Math.abs(rowNum - 1)];
        else return -curMaxHeightPerRow[rowNum];
      })
      .reduce((a, b) => a + b, 0);

  return {
    colWidth,
    colOrphan,
    rowHeights,
    rowOffsetTop,
    curMaxHeightPerRow,
    getRowHeightDiff,
    getRowHeightShift,
  };
}

export default useGridProps;
