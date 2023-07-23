/// <reference types="vite/client" />

import React from "react";

export {};

export declare global {
  interface CoordinateData {
    x: number;
    y: number;
  }
  interface NumberData {
    [id: string]: number;
  }
  interface GridData {
    order: number[];
    orderByKey: number[];
    draggableRef: React.RefObject<HTMLUListElement>;
    maxCols: number;
    maxRows: number;
    windowSize: number;
  }
  interface DraggableData {
    order: number[];
    orderByKey: number[];
    draggableRef: React.RefObject<HTMLUListElement>;
    windowSize: number;
  }
}
