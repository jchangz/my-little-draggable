import { useEffect, useRef, useState } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { swap } from "./helpers/swap";
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
    calcNewCol,
    calcNewRow,
    calcNewIndex,
    calcNewOffsetTopOfRows,
    setNewPosition,
    setXCoordinates,
    setYCoordinates,
    getNewPosition,
    getTempPosition,
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
  let thisIndex = 0;

  const bind = useDrag(
    ({ args: [originalIndex], down, active, first, movement: [mx, my] }) => {
      if (first) {
        currentIndexPosition = order.indexOf(originalIndex);
        currentRow = Math.floor(currentIndexPosition / maxCols);
        currentCol = currentIndexPosition % maxCols;
        thisIndex = currentIndexPosition;

        calcNewOffsetTopOfRows();
      }

      const newCol = calcNewCol({ currentCol, mx });
      const newRow = calcNewRow({ originalIndex, currentRow, my });
      const newIndex = calcNewIndex({ newCol, newRow });

      if (thisIndex !== newIndex) {
        setXCoordinates({
          currentIndexPosition,
          newIndex,
          currentCol,
          newCol,
          currentRow,
          newRow,
        });
        if (newRow !== currentRow)
          setYCoordinates({ currentIndexPosition, newIndex });

        thisIndex = newIndex;
      }

      api.start((index) => ({
        x:
          getNewPosition(index).x +
          (down && index === originalIndex ? mx : getTempPosition(index).x),
        y:
          getNewPosition(index).y +
          (down && index === originalIndex ? my : getTempPosition(index).y),
        shadow: down && index === originalIndex ? 15 : 0,
        zIndex: down && index === originalIndex ? 99 : 0,
        immediate: index === originalIndex ? down : false,
      }));
      if (!active && currentIndexPosition !== newIndex) {
        setNewPosition();
        setOrder(swap(order, currentIndexPosition, newIndex));
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
