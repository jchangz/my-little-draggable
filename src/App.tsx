import { useRef, useState } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { swap } from "./helpers/swap";
import { useCalculations } from "./helpers/useCalculations";
import useMirror from "./hooks/useMirror";
import "./App.css";

function App() {
  const numberOfItems = 10;
  const [order, setOrder] = useState<Array<number>>(
    new Array(numberOfItems).fill(0).map((...[, i]) => i)
  );
  const currentIndexPosition = useRef(0);
  const thisIndex = useRef(0);

  // Reference to obtain necessary grid measurements in useCalculations
  const containerRef = useRef<HTMLDivElement>(null);
  // Element used to set boundary on useDrag gesture
  const boundsRef = useRef<HTMLDivElement>(null);

  const {
    mirrorIndex,
    setMirrorIndex,
    showMirror,
    mirror,
    mirrorApi,
    toggleMirror,
  } = useMirror();

  const {
    calcNewIndex,
    initCoordinates,
    setCoordinates,
    setNewPosition,
    animateWithClone,
    animateWithoutClone,
    animateMirror,
  } = useCalculations({
    order,
    containerRef,
  });

  const [drag, dragApi] = useSprings(numberOfItems, () => ({
    x: 0,
    y: 0,
    opacity: 1,
    zIndex: 0,
    shadow: 0,
  }));

  const bind = useDrag(
    ({
      args: [originalIndex],
      currentTarget,
      down,
      active,
      first,
      velocity,
      movement: [mx, my],
    }) => {
      if (first) {
        if (showMirror) setMirrorIndex(originalIndex);

        currentIndexPosition.current = order.indexOf(originalIndex);
        thisIndex.current = currentIndexPosition.current;

        initCoordinates(currentIndexPosition.current);
      }

      if (showMirror && currentTarget instanceof HTMLElement) {
        const { offsetTop: top, offsetLeft: left } = currentTarget;
        mirrorApi.start(animateMirror({ originalIndex, top, left, mx, my }));
      }

      const newIndex = calcNewIndex({ originalIndex, mx, my });

      if (
        thisIndex.current !== newIndex &&
        velocity[0] < 0.7 &&
        velocity[1] < 0.7
      ) {
        setCoordinates({ currentIndexPosition, newIndex });
        thisIndex.current = newIndex;
      }

      if (showMirror) dragApi.start(animateWithClone({ originalIndex, down }));
      else dragApi.start(animateWithoutClone({ originalIndex, down, mx, my }));

      // If user drags and releases beyond the velocity limit
      if (!active && thisIndex.current !== newIndex) {
        setCoordinates({ currentIndexPosition, newIndex });
        dragApi.start(animateWithoutClone({ originalIndex, down, mx, my }));
      }

      if (!active && currentIndexPosition.current !== newIndex) {
        setNewPosition();
        setOrder(swap(order, currentIndexPosition.current, newIndex));
      }

      if (!active && showMirror) setMirrorIndex(false);
    },
    {
      bounds: boundsRef,
      preventDefault: true,
    }
  );

  return (
    <>
      <button onClick={toggleMirror}>Enable Mirror</button>
      <div className="parent" ref={boundsRef}>
        <div className="container" ref={containerRef}>
          {drag.map(({ x, y, opacity, zIndex, shadow }, i) => (
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
        {showMirror && mirrorIndex !== false && (
          <a.div
            className={`item-${mirrorIndex}`}
            id="item-mirror"
            style={mirror}
          >
            <div className="drag-item">
              <div className="bg-blue" />
            </div>
          </a.div>
        )}
      </div>
    </>
  );
}

export default App;
