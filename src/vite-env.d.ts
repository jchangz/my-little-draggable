/// <reference types="vite/client" />

import React from "react";

export {};

export declare global {
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
  interface MirrorData {
    originalIndex: number;
    mx: number;
    my: number;
    top: number;
    left: number;
  }
}
