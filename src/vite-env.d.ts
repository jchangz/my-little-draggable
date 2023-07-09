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
    maxCols: number;
    maxRows: React.RefObject;
    gridColumnWidth: React.RefObject;
    gridRowHeights: React.RefObject;
    gridOffsetFromTop: React.RefObject;
  }
  interface MirrorData {
    mx: number;
    my: number;
    top: number;
    left: number;
  }
}
