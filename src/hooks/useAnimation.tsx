import React from "react";

function useAnimation({
  newCoordinates,
  tempCoordinates,
}: {
  newCoordinates: CoordinateData[];
  tempCoordinates: React.MutableRefObject<CoordinateData[]>;
}) {
  const animateWithClone =
    ({ originalIndex, down }: { originalIndex: number; down: boolean }) =>
    (index: number) => ({
      x: newCoordinates[index].x + tempCoordinates.current[index].x,
      y: newCoordinates[index].y + tempCoordinates.current[index].y,
      opacity: down && index === originalIndex ? 0.2 : 1,
      shadow: 0,
      zIndex: down && index === originalIndex ? 9 : 0,
    });

  const animateWithoutClone =
    ({
      originalIndex,
      down,
      mx,
      my,
    }: {
      originalIndex: number;
      down: boolean;
      mx: number;
      my: number;
    }) =>
    (index: number) =>
      down && index === originalIndex
        ? {
            x: newCoordinates[index].x + mx,
            y: newCoordinates[index].y + my,
            shadow: 15,
            zIndex: 9,
            immediate: true,
          }
        : {
            x: newCoordinates[index].x + tempCoordinates.current[index].x,
            y: newCoordinates[index].y + tempCoordinates.current[index].y,
            shadow: 0,
            zIndex: 0,
            immediate: false,
          };

  const animateMirror = ({ originalIndex, top, left, mx, my }: MirrorData) => ({
    x: newCoordinates[originalIndex].x + mx,
    y: newCoordinates[originalIndex].y + my,
    top: top,
    left: left,
    immediate: true,
  });

  return {
    animateWithClone,
    animateWithoutClone,
    animateMirror,
  };
}

export default useAnimation;
