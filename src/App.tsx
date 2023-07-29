import { useState, useEffect, useRef } from "react";
import { useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { swap } from "./hooks/swap";
import useCoordinates from "./hooks/useCoordinates";
import useMirror from "./hooks/useMirror";
import useAnimation from "./hooks/useAnimation";
import useRerender from "./hooks/useRerender";
import useWindowSize from "./hooks/useWindowSize";
import "./App.css";

function App() {
  const keys = ["D", "R", "A", "G", "g", "a", "B", "L", "E"];
  // Hook to re-render on window size change
  const windowSize = useWindowSize();
  // The order of items based on grid position, resets on re-render
  const [order, setOrder] = useState([...Array(keys.length)].map((_, i) => i));
  // Re-render hook which tracks the modified order of items
  const { orderByKey, setTempOrder, toggleRender } = useRerender({
    keys,
    windowSize,
  });
  // Keeps track of the transform translate values of the current order
  const [newCoordinates, setNewCoordinates] = useState<CoordinateData[]>([]);
  // Keeps track of the index we are at and check if switch into a new index
  const thisIndex = useRef(0);
  // Reference to obtain necessary grid measurements
  const draggableRef = useRef<HTMLUListElement>(null);
  // Element used to set boundary on useDrag gesture
  const boundsRef = useRef<HTMLDivElement>(null);

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
    initCoordinates,
    getCurrentIndexPosition,
    calculateNewIndex,
    setTempCoordinates,
  } = useCoordinates({
    order,
    orderByKey,
    draggableRef,
    windowSize,
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
        thisIndex.current = initCoordinates({ originalIndex });
      }

      const newIndex = calculateNewIndex({ originalIndex, mx, my });

      if (
        thisIndex.current !== newIndex &&
        velocity[0] < 0.7 &&
        velocity[1] < 0.7
      ) {
        setTempCoordinates({ newIndex });
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
        setTempCoordinates({ newIndex });
        dragApi.start(animateWithoutClone({ originalIndex, down, mx, my }));
      }

      // On drag finish, if we are in a new index, set new coordinates and reset temp coordinates
      if (!active && getCurrentIndexPosition() !== newIndex) {
        const stagingCoordinates = newCoordinates;
        for (let i = 0, j = order.length; i < j; i += 1) {
          stagingCoordinates[i].x += tempCoordinates.current[i].x;
          stagingCoordinates[i].y += tempCoordinates.current[i].y;
          tempCoordinates.current[i].x = 0;
          tempCoordinates.current[i].y = 0;
        }
        setNewCoordinates(stagingCoordinates);

        const currentIndexPosition = getCurrentIndexPosition();
        // Update new order of items
        setOrder(swap(order, currentIndexPosition, newIndex));
        // Store new order for re-rendering
        setTempOrder({ currentIndexPosition, newIndex });
      }

      if (!active && showMirror) setMirrorIndex(false);
    },
    {
      bounds: boundsRef,
      preventDefault: true,
    }
  );

  useEffect(() => {
    setOrder([...Array(keys.length)].map((_, i) => i));
    setNewCoordinates([...Array(keys.length)].map(() => ({ x: 0, y: 0 })));
    dragApi.start(() => ({
      x: 0,
      y: 0,
      immediate: true,
    }));
  }, [orderByKey, dragApi, keys.length]);

  return (
    <>
      <div className="parent" ref={boundsRef}>
        <button onClick={toggleMirror}>Enable Mirror</button>
        <button onClick={toggleRender}>Rerender</button>
        <ul className="draggable" ref={draggableRef}>
          {drag.map(({ x, y, opacity, zIndex, shadow }, i) => (
            <a.li
              {...bind(i)}
              className={`drag-${orderByKey[i]}`}
              key={`drag-${orderByKey[i]}`}
              style={{
                x,
                y,
                opacity,
                zIndex,
                boxShadow: shadow.to(
                  (s) => `rgba(0, 0, 0, 0.5) 0px ${s}px ${2 * s}px 0px`
                ),
              }}
            />
          ))}
        </ul>
        {showMirror && typeof mirrorIndex === "number" && (
          <a.div
            className={`draggable-mirror drag-${orderByKey[mirrorIndex]}`}
            style={mirror}
          />
        )}
      </div>
    </>
  );
}

export default App;
