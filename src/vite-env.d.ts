/// <reference types="vite/client" />

import React from "react";

export {};

export declare global {
  interface GridData {
    containerRef: React.RefObject<HTMLDivElement>;
    order: number[];
    orderByKey: number[];
    maxCols: number;
    maxRows: number;
    windowSize: number;
  }
  interface RowData {
    [id: number]: number[];
  }
  interface CoordinateData {
    [id: string]: number;
  }
  interface CalculationsData {
    order: number[];
    orderByKey: number[];
    containerRef: React.RefObject<HTMLDivElement>;
    windowSize: number;
  }
}
