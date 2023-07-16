import React, { useEffect, useRef } from "react";

function useGridProps({
  containerRef,
  orderByKey,
  maxRows,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  orderByKey: number[];
  maxRows: number;
}) {
  const columnWidth = useRef(0);
  const gridRowHeights = useRef<number[]>([]);
  const offsetTopOfRows = useRef<number[]>([]);

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

      offsetTopOfRows.current = [...Array(maxRows)].fill(
        containerRef.current.offsetTop
      );
    }
  }, [orderByKey, maxRows, containerRef]);

  return {
    columnWidth,
    gridRowHeights,
    offsetTopOfRows,
  };
}

export default useGridProps;
