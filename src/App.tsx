import { useRef, useState } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { swap } from "./helpers/swap";
import { useGridProps } from "./helpers/useGridProps";
import { useCalculations } from "./helpers/useCalculations";
import { animateWithClone, animateWithoutClone } from "./dragGesture";
import "./App.css";

function App() {
  const numberOfItems = 10;
  const [order, setOrder] = useState<Array<number>>(
    new Array(numberOfItems).fill(0).map((...[, i]) => i)
  );
  const [showClone, setShowClone] = useState(true);
  const boundsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
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
    opacity: 1,
    zIndex: 0,
    shadow: 0,
  }));

  // Variables that get reassigned on first drag move
  let currentIndexPosition = 0;
  let thisIndex = 0;

  const bind = useDrag(
    ({
      args: [originalIndex],
      currentTarget,
      down,
      active,
      first,
      movement: [mx, my],
    }) => {
      if (first) {
        currentIndexPosition = order.indexOf(originalIndex);
        thisIndex = currentIndexPosition;
        initializeData({ currentIndexPosition });

        if (cloneRef.current && currentTarget instanceof HTMLElement) {
          cloneRef.current.className = currentTarget.className;
          cloneRef.current.style.display = "block";
          cloneRef.current.style.top = `${currentTarget.offsetTop}px`;
          cloneRef.current.style.left = `${currentTarget.offsetLeft}px`;
        }
      }

      if (cloneRef.current)
        cloneRef.current.style.transform = `translate3D(${
          newCoordinates[originalIndex].x + mx
        }px, ${newCoordinates[originalIndex].y + my}px, 0)`;

      const newIndex = calcNewIndex({ originalIndex, mx, my });

      if (thisIndex !== newIndex) {
        setCoordinates({ currentIndexPosition, newIndex });
        thisIndex = newIndex;
      }
      tempCoordinates.forEach((res) => {
        console.log(res);
      });
      if (showClone)
        api.start(
          animateWithClone({
            newCoordinates,
            tempCoordinates,
            originalIndex,
            down,
          })
        );
      else
        api.start(
          animateWithoutClone({
            newCoordinates,
            tempCoordinates,
            originalIndex,
            down,
            mx,
            my,
          })
        );

      if (!active && currentIndexPosition !== newIndex) {
        setNewPosition();
        setOrder(swap(order, currentIndexPosition, newIndex));
      }

      if (!active && cloneRef.current) {
        cloneRef.current.style.display = "none";
      }
    },
    {
      bounds: boundsRef,
      preventDefault: true,
    }
  );

  function toggleClone() {
    setShowClone((prev) => !prev);
  }

  return (
    <>
      <button onClick={toggleClone}>Show Clone</button>
      <div className="parent" ref={boundsRef}>
        <div className="container" ref={containerRef}>
          {springs.map(({ x, y, opacity, zIndex, shadow }, i) => (
            <a.div
              {...bind(i)}
              className={`item-${i}`}
              style={{
                x,
                y,
                opacity,
                zIndex,
                boxShadow: shadow.to(
                  (s) => `rgba(0, 0, 0, 0.5) 0px ${s}px ${2 * s}px 0px`
                ),
              }}
            >
              <div className="drag-item">
                <div className="bg-red" />
              </div>
            </a.div>
          ))}
        </div>
        {showClone && (
          <div
            id="item-clone"
            ref={cloneRef}
            style={{ width: gridColumnWidth.current, display: "none" }}
          >
            <div className="drag-item">
              <div className="bg-blue" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
