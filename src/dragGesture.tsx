import React from "react";

export const animateWithClone =
  ({
    newCoordinates,
    tempCoordinates,
    originalIndex,
    down,
  }: {
    newCoordinates: Array<CoordinateData>;
    tempCoordinates: React.MutableRefObject<CoordinateData[]>;
    originalIndex: number;
    down: boolean;
  }) =>
  (index: number) => ({
    x: newCoordinates[index].x + tempCoordinates.current[index].x,
    y: newCoordinates[index].y + tempCoordinates.current[index].y,
    opacity: down && index === originalIndex ? 0.2 : 1,
    shadow: 0,
    zIndex: down && index === originalIndex ? 9 : 0,
  });

export const animateWithoutClone =
  ({
    newCoordinates,
    tempCoordinates,
    originalIndex,
    down,
    mx,
    my,
  }: {
    newCoordinates: Array<CoordinateData>;
    tempCoordinates: React.MutableRefObject<CoordinateData[]>;
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
