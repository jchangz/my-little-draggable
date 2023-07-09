/// <reference types="vite/client" />

import React from "react";

export {};

export declare global {
  interface RowData {
    [id: number]: Array<number>;
  }
  interface CoordinateData {
    [id: string]: number;
  }
  interface CalculationsData {
    order: Array<number>;
    containerRef: React.RefObject<HTMLDivElement>;
  }
  interface MirrorData {
    originalIndex: number;
    mx: number;
    my: number;
    top: number;
    left: number;
  }
}
