import { useRef } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useGridProps } from "./helpers/useGridProps";
import "./App.css";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    gridColumnWidth,
    gridOffsetFromTop,
    gridRowHeights,
    gridGap,
    maxRows,
    maxCols,
  } = useGridProps(containerRef);
  const [springs, api] = useSprings(6, () => ({
    x: 0,
    y: 0,
    opacity: 0,
    shadow: 0,
    zIndex: 0,
  }));

  let order = [1, 2, 3, 4, 5, 6].map((...[, index]) => index);

  const getNewMaxHeights = (order: Array<number>) => {
    const rowHeightObj: RowData = {};

    order.forEach((val, i) => {
      const rowNum = Math.ceil((i + 1) / maxCols);
      if (!rowHeightObj[rowNum])
        rowHeightObj[rowNum] = gridRowHeights.current[val];
      else {
        if (gridRowHeights.current[val] > rowHeightObj[rowNum]) {
          rowHeightObj[rowNum] = gridRowHeights.current[val];
        }
      }
    });

    const arr: Array<number> = Object.values(rowHeightObj);
    return arr;
  };

  let currentMaxHeightPerRow: Array<number> = [];
  let currentIndexPosition = 0;
  const offsetTopOfRows = new Array(maxRows.current).fill(
    gridOffsetFromTop.current
  );

  const bind = useDrag(
    ({ args: [originalIndex], down, active, first, movement: [mx, my] }) => {
      if (down && mx === 0 && my === 0) thisIndex = originalIndex;

      if (first) {
        currentIndexPosition = order.indexOf(originalIndex);
        currentMaxHeightPerRow = getNewMaxHeights(order);
      }

      const currentRow = Math.floor(currentIndexPosition / maxCols);
      const currentCol = currentIndexPosition % maxCols;

      for (let i = 1; i < maxRows.current; i += 1) {
        offsetTopOfRows[i] =
          offsetTopOfRows[i - 1] + currentMaxHeightPerRow[i - 1];
      }
    },
    {
      bounds: containerRef,
      preventDefault: true,
    }
  );

  return (
    <>
      <div className="bodycon" ref={containerRef}>
        {springs.map(({ x, y, zIndex, shadow }, i) => (
          <a.div
            {...bind(i)}
            className={`item-${i}`}
            style={{
              x,
              y,
              zIndex,
              boxShadow: shadow.to(
                (s) => `rgba(0, 0, 0, 0.5) 0px ${s}px ${2 * s}px 0px`
              ),
            }}
          >
            <div className="drag-item">
              <div className="bg-red"></div>
            </div>
          </a.div>
        ))}
      </div>
    </>
  );
}

export default App;
