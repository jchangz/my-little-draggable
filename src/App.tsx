import { useRef, useState } from "react";
import { useSpring, useSprings, a } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { swap } from "./helpers/swap";
import { useCalculations } from "./helpers/useCalculations";
import { animateWithClone, animateWithoutClone } from "./dragGesture";
import "./App.css";

function App() {
  const numberOfItems = 10;
  const [order, setOrder] = useState<Array<number>>(
    new Array(numberOfItems).fill(0).map((...[, i]) => i)
  );
  const [showMirror, setShowMirror] = useState(true);
  const [mirrorIndex, setMirrorIndex] = useState(false);

  const currentIndexPosition = useRef(0);
  const thisIndex = useRef(0);

  // DOM references
  const boundsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  const {
    newCoordinates,
    tempCoordinates,
    calcNewIndex,
    initCoordinates,
    setCoordinates,
    setNewPosition,
  } = useCalculations({
    order,
    containerRef,
  });

  const [mirror, mirrorApi] = useSpring(
    ({ mx, my, top, left }: MirrorData) => ({
      to: { x: mx, y: my, top: top, left: left },
    }),
    []
  );

  const [springs, api] = useSprings(numberOfItems, () => ({
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
        mirrorApi.start({
          x: newCoordinates[originalIndex].x + mx,
          y: newCoordinates[originalIndex].y + my,
          top: currentTarget.offsetTop,
          left: currentTarget.offsetLeft,
          immediate: true,
        });
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

      if (showMirror)
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

      // If user drags and releases beyond the velocity limit
      if (!active && thisIndex.current !== newIndex) {
        setCoordinates({ currentIndexPosition, newIndex });
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

  function toggleMirror() {
    setShowMirror((prev) => !prev);
  }

  return (
    <>
      <button onClick={toggleMirror}>Enable Mirror</button>
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
        {showMirror && mirrorIndex !== false && (
          <a.div
            className={`item-${mirrorIndex}`}
            id="item-mirror"
            ref={mirrorRef}
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
