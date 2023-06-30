import { useEffect, useRef } from "react";

export function useCalculations({
  order,
  maxCols,
  maxRows,
  gridRowHeights,
  gridOffsetFromTop,
}) {
  const currentMaxHeightPerRow = useRef<Array<number>>([]);
  const offsetTopOfRows = useRef<Array<number>>([]);

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
  }, [order, maxCols, gridRowHeights]);

  const calcNewOffsetTopOfRows = () => {
    for (let i = 1; i < maxRows.current; i += 1) {
      offsetTopOfRows.current[i] =
        offsetTopOfRows.current[i - 1] + currentMaxHeightPerRow.current[i - 1];
    }
  };

  return {
    currentMaxHeightPerRow,
    offsetTopOfRows,
    calcNewOffsetTopOfRows,
  };
}
