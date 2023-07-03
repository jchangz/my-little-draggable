import { useRef, useState } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { swap } from "./helpers/swap";
import { useGridProps } from "./helpers/useGridProps";
import { useCalculations } from "./helpers/useCalculations";
import "./App.css";

function App() {
  const numberOfItems = 10;
  const [order, setOrder] = useState<Array<number>>(
    new Array(numberOfItems).fill(0).map((...[, i]) => i)
  );
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
    newCoordinates,
    tempCoordinates,
    calcNewIndex,
    initializeData,
    setCoordinates,
    setNewPosition,
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

  // Variables that get reassigned on first drag move
  let currentIndexPosition = 0;
  let thisIndex = 0;

  const bind = useDrag(
    ({ args: [originalIndex], down, active, first, movement: [mx, my] }) => {
      if (first) {
        currentIndexPosition = order.indexOf(originalIndex);
        thisIndex = currentIndexPosition;
        initializeData({ currentIndexPosition });
      }

      const newIndex = calcNewIndex({ originalIndex, mx, my });

      if (thisIndex !== newIndex) {
        setCoordinates({ currentIndexPosition, newIndex });

        thisIndex = newIndex;
      }

      api.start((index) => ({
        x:
          newCoordinates[index].x +
          (down && index === originalIndex ? mx : tempCoordinates[index].x),
        y:
          newCoordinates[index].y +
          (down && index === originalIndex ? my : tempCoordinates[index].y),
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
