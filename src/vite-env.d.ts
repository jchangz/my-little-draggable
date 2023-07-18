/// <reference types="vite/client" />

import React from "react";

export {};

export declare global {
  interface GridData {
    containerRef: React.RefObject<HTMLDivElement>;
    order: number[];
    maxCols: number;
    maxRows: number;
  }
  interface RowData {
    [id: number]: number[];
  }
  interface CoordinateData {
    [id: string]: number;
  }
  interface CalculationsData {
    order: number[];
    containerRef: React.RefObject<HTMLDivElement>;
  }
}
