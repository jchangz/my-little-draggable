import { describe, it, expect, assert } from "vitest";
import {
  calculateMaxHeightPerRow,
  calculateBottomPerRow,
  calculateHeightShift,
} from "../calculations";

const order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const itemHeights = [200, 300, 200, 500, 200, 200, 400, 400, 400, 200];
const offsetFromTop = 100;
const maxCols = 3;
const maxRows = Math.ceil(order.length / maxCols);
const originalMaxHeightPerRow = calculateMaxHeightPerRow(
  maxCols,
  maxRows,
  itemHeights
);

const newOrder = [0, 2, 4, 6, 7, 8, 3, 1, 5, 9];
const newHeights = newOrder.map((val) => itemHeights[val]);
const newMaxHeightPerRow = calculateMaxHeightPerRow(
  maxCols,
  maxRows,
  newHeights
);

describe("Calculate max height per row correctly", () => {
  it("Original order", () => {
    expect(originalMaxHeightPerRow).toEqual([300, 500, 400, 200]);
  });
  it("New order", () => {
    expect(newMaxHeightPerRow).toEqual([200, 400, 500, 200]);
  });
});

describe("Calculate bottom position of each row correctly", () => {
  it("Original order", () => {
    expect(
      calculateBottomPerRow(originalMaxHeightPerRow, offsetFromTop)
    ).toEqual([400, 900, 1300, 1500]);
  });
  it("New order", () => {
    expect(calculateBottomPerRow(newMaxHeightPerRow, offsetFromTop)).toEqual([
      300, 700, 1200, 1400,
    ]);
  });
});

describe("Calculate height shift correctly", () => {
  describe("Original Order", () => {
    it("Move from row 0 to 1", () => {
      expect(calculateHeightShift(1, 0, originalMaxHeightPerRow)).toEqual(300);
    });
    it("Move from row 0 to 2", () => {
      expect(calculateHeightShift(2, 0, originalMaxHeightPerRow)).toEqual(800);
    });
    it("Move from row 0 to 3", () => {
      expect(calculateHeightShift(3, 0, originalMaxHeightPerRow)).toEqual(1200);
    });
    it("Move from row 1 to 0", () => {
      expect(calculateHeightShift(0, 1, originalMaxHeightPerRow)).toEqual(-300);
    });
    it("Move from row 1 to 2", () => {
      expect(calculateHeightShift(2, 1, originalMaxHeightPerRow)).toEqual(500);
    });
    it("Move from row 1 to 3", () => {
      expect(calculateHeightShift(3, 1, originalMaxHeightPerRow)).toEqual(900);
    });
    it("Move from row 2 to 0", () => {
      expect(calculateHeightShift(0, 2, originalMaxHeightPerRow)).toEqual(-800);
    });
    it("Move from row 2 to 1", () => {
      expect(calculateHeightShift(1, 2, originalMaxHeightPerRow)).toEqual(-500);
    });
    it("Move from row 2 to 3", () => {
      expect(calculateHeightShift(3, 2, originalMaxHeightPerRow)).toEqual(400);
    });
    it("Move from row 3 to 0", () => {
      expect(calculateHeightShift(0, 3, originalMaxHeightPerRow)).toEqual(
        -1200
      );
    });
    it("Move from row 3 to 1", () => {
      expect(calculateHeightShift(1, 3, originalMaxHeightPerRow)).toEqual(-900);
    });
    it("Move from row 3 to 2", () => {
      expect(calculateHeightShift(2, 3, originalMaxHeightPerRow)).toEqual(-400);
    });
  });
  describe("New Order", () => {
    it("Move from row 0 to 1", () => {
      expect(calculateHeightShift(1, 0, newMaxHeightPerRow)).toEqual(200);
    });
    it("Move from row 0 to 2", () => {
      expect(calculateHeightShift(2, 0, newMaxHeightPerRow)).toEqual(600);
    });
    it("Move from row 0 to 3", () => {
      expect(calculateHeightShift(3, 0, newMaxHeightPerRow)).toEqual(1100);
    });
    it("Move from row 1 to 0", () => {
      expect(calculateHeightShift(0, 1, newMaxHeightPerRow)).toEqual(-200);
    });
    it("Move from row 1 to 2", () => {
      expect(calculateHeightShift(2, 1, newMaxHeightPerRow)).toEqual(400);
    });
    it("Move from row 1 to 3", () => {
      expect(calculateHeightShift(3, 1, newMaxHeightPerRow)).toEqual(900);
    });
    it("Move from row 2 to 0", () => {
      expect(calculateHeightShift(0, 2, newMaxHeightPerRow)).toEqual(-600);
    });
    it("Move from row 2 to 1", () => {
      expect(calculateHeightShift(1, 2, newMaxHeightPerRow)).toEqual(-400);
    });
    it("Move from row 2 to 3", () => {
      expect(calculateHeightShift(3, 2, newMaxHeightPerRow)).toEqual(500);
    });
    it("Move from row 3 to 0", () => {
      expect(calculateHeightShift(0, 3, newMaxHeightPerRow)).toEqual(-1100);
    });
    it("Move from row 3 to 1", () => {
      expect(calculateHeightShift(1, 3, newMaxHeightPerRow)).toEqual(-900);
    });
    it("Move from row 3 to 2", () => {
      expect(calculateHeightShift(2, 3, newMaxHeightPerRow)).toEqual(-500);
    });
  });
});
