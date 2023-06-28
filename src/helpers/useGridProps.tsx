import { RefObject, useState, useEffect, useRef } from "react";

export function useGridProps(ref: RefObject<HTMLDivElement>) {
  const gridColumnWidth = useRef(0);
  const gridRowHeights = useRef<Array<Array<number>>>([]);
  const gridOffsetFromTop = useRef(0);
  const gridGap = useRef({ x: 0, y: 0 });
  const maxRows = useRef(0);
  const [maxCols, setMaxCols] = useState(0);

  useEffect(() => {
    // Used to find the height of all grid items per row
    const rowData: RowData = {};

    // Used to calculate the x grid gap
    let offsetRight = 0;
    let offsetLeft = 0;

    if (ref.current) {
      const imgElementArray = ref.current.children;
      [...imgElementArray].forEach((item, i) => {
        const { width, height, top, left, right } =
          item.getBoundingClientRect();

        if (imgElementArray.length > 1) {
          if (i === 0) {
            gridOffsetFromTop.current = top;
            gridColumnWidth.current = width;
            offsetRight = right;
          }
          if (i === 1) offsetLeft = left;
        }

        const topInteger = Math.round(top);
        if (!rowData[topInteger]) rowData[topInteger] = [];
        rowData[topInteger].push(height);
      });

      // Calculate the x grid gap
      gridGap.current.x = Math.round(offsetLeft - offsetRight);

      // Calculate the y grid gap
      const rowOffsetFromTop = Object.keys(rowData);
      const numberOfRows = rowOffsetFromTop.length;
      if (numberOfRows > 1) {
        const firstRowOffsetTop = parseInt(rowOffsetFromTop[0]);
        const secondRowOffsetTop = parseInt(rowOffsetFromTop[1]);
        const firstRowMaxHeight = Math.max(...rowData[firstRowOffsetTop]);
        gridGap.current.y =
          secondRowOffsetTop - (firstRowOffsetTop + firstRowMaxHeight);
      }

      const rowHeights = Object.values(rowData);
      gridRowHeights.current = [].concat(...rowHeights);
      maxRows.current = Math.ceil(
        imgElementArray.length / rowHeights[0].length
      );
      setMaxCols(rowHeights[0].length);
    }
  }, [ref]);

  return {
    gridColumnWidth,
    gridOffsetFromTop,
    gridRowHeights,
    gridGap,
    maxRows,
    maxCols,
  };
}
