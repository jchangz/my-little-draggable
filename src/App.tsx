import { useState, useEffect, useRef, useCallback } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { swap } from "./hooks/swap";
import useCoordinates from "./hooks/useCoordinates";
import useMirror from "./hooks/useMirror";
import useAnimation from "./hooks/useAnimation";
import useWindowSize from "./hooks/useWindowSize";
import "./App.css";

function App() {
  const keys = ["D", "R", "A", "G", "g", "a", "B", "L", "E"];
  const defaultOrderArr = [...Array(keys.length)].map((_, i) => i);

  // The order of items based on grid position, resets on re-render
  const [order, setOrder] = useState(defaultOrderArr);
  // The order of items based on item key, keeping correct order on re-render
  const [orderByKey, setOrderByKey] = useState(defaultOrderArr);
  // Temp store of grid position order used to update orderByKey
  const tempOrder = useRef(defaultOrderArr);

  const [newCoordinates, setNewCoordinates] = useState<CoordinateData[]>([]);

  const currentIndexPosition = useRef(0);
  const thisIndex = useRef(0);

  // Reference to obtain necessary grid measurements
  const containerRef = useRef<HTMLDivElement>(null);
  // Element used to set boundary on useDrag gesture
  const boundsRef = useRef<HTMLDivElement>(null);
  // Hook to re-render on window size change
  const windowSize = useWindowSize();

  const {
    mirrorIndex,
    showMirror,
    mirror,
    setMirrorIndex,
    animateMirror,
    toggleMirror,
  } = useMirror({ newCoordinates });

  const {
    tempCoordinates,
    setCurrentRowCol,
    calculateNewIndex,
    setTempCoordinates,
  } = useCoordinates({
    order,
    containerRef,
  });

  const { animateWithClone, animateWithoutClone } = useAnimation({
    newCoordinates,
    tempCoordinates,
  });

  const [drag, dragApi] = useSprings(keys.length, () => ({
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

        const currentIndex = order.indexOf(originalIndex);
        currentIndexPosition.current = currentIndex;
        thisIndex.current = currentIndex;

        setCurrentRowCol(currentIndexPosition.current);
      }

      const newIndex = calculateNewIndex({ originalIndex, mx, my });

      if (
        thisIndex.current !== newIndex &&
        velocity[0] < 0.7 &&
        velocity[1] < 0.7
      ) {
        setTempCoordinates({ currentIndexPosition, newIndex });
        thisIndex.current = newIndex;
      }

      if (showMirror && currentTarget instanceof HTMLElement) {
        const { offsetTop: top, offsetLeft: left } = currentTarget;
        animateMirror({ originalIndex, top, left, mx, my });
        dragApi.start(animateWithClone({ originalIndex, down }));
      } else
        dragApi.start(animateWithoutClone({ originalIndex, down, mx, my }));

      // If user drags and releases beyond the velocity limit
      if (!active && thisIndex.current !== newIndex) {
        setTempCoordinates({ currentIndexPosition, newIndex });
        dragApi.start(animateWithoutClone({ originalIndex, down, mx, my }));
      }

      if (!active && currentIndexPosition.current !== newIndex) {
        const stagingCoordinates = newCoordinates;
        for (let i = 0, j = order.length; i < j; i += 1) {
          stagingCoordinates[i].x += tempCoordinates.current[i].x;
          stagingCoordinates[i].y += tempCoordinates.current[i].y;
          tempCoordinates.current[i].x = 0;
          tempCoordinates.current[i].y = 0;
        }
        setNewCoordinates(stagingCoordinates);

        setOrder(swap(order, currentIndexPosition.current, newIndex));
        tempOrder.current = swap(
          tempOrder.current,
          currentIndexPosition.current,
          newIndex
        );
      }

      if (!active && showMirror) setMirrorIndex(false);
    },
    {
      bounds: boundsRef,
      preventDefault: true,
    }
  );

  const toggleRender = useCallback(() => {
    setOrderByKey(tempOrder.current);
    setOrder([...Array(keys.length)].map((_, i) => i));
    setNewCoordinates([...Array(keys.length)].map(() => ({ x: 0, y: 0 })));
    dragApi.start(() => ({
      x: 0,
      y: 0,
      immediate: true,
    }));
  }, [dragApi, keys.length]);

  useEffect(() => {
    toggleRender();
  }, [windowSize, toggleRender]);

  return (
    <>
      <button onClick={toggleMirror}>Enable Mirror</button>
      <button onClick={toggleRender}>Rerender</button>
      <div className="parent" ref={boundsRef}>
        <div className="container" ref={containerRef}>
          {drag.map(({ x, y, opacity, zIndex, shadow }, i) => (
            <a.div
              {...bind(i)}
              className={`item-${orderByKey[i]}`}
              key={`item-${orderByKey[i]}`}
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
        {showMirror && typeof mirrorIndex === "number" && (
          <a.div
            className={`item-${orderByKey[mirrorIndex]}`}
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
