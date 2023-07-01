import { useEffect, useRef, useState } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useGridProps } from "./helpers/useGridProps";
import { useCalculations } from "./helpers/useCalculations";
import "./App.css";

function App() {
  const numberOfItems = 6;
  const [order, setOrder] = useState<Array<number>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    gridColumnWidth,
    gridOffsetFromTop,
    gridRowHeights,
    gridGap,
    maxRows,
    maxCols,
  } = useGridProps(containerRef);
  const {
    currentMaxHeightPerRow,
    calcNewCol,
    calcNewRow,
    calcNewIndex,
    calcNewOffsetTopOfRows,
  } = useCalculations({
    order,
    maxCols,
    maxRows,
    gridColumnWidth,
    gridRowHeights,
    gridOffsetFromTop,
  });
  const [springs, api] = useSprings(numberOfItems, () => ({
    x: 0,
    y: 0,
    opacity: 0,
    shadow: 0,
    zIndex: 0,
  }));

  useEffect(() => {
    const arr = new Array(numberOfItems).fill(0).map((...[, i]) => i);
    setOrder(arr);
  }, []);

  // Variables that get reassigned on first drag move
  let currentIndexPosition = 0;
  let currentRow = 0;
  let currentCol = 0;

  const bind = useDrag(
    ({ args: [originalIndex], down, active, first, movement: [mx, my] }) => {
      if (first) {
        currentIndexPosition = order.indexOf(originalIndex);
        currentRow = Math.floor(currentIndexPosition / maxCols);
        currentCol = currentIndexPosition % maxCols;

        calcNewOffsetTopOfRows();
      }

      const newCol = calcNewCol({ currentCol, mx });
      const newRow = calcNewRow({ originalIndex, currentRow, my });
      const newIndex = calcNewIndex({ newCol, newRow });
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
