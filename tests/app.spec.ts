import { test, expect } from "@playwright/test";

const timeout = 1000;

test("switch columns", async ({ page }) => {
  await page.goto("./");

  const drag0 = page.locator("li.drag-0");
  const drag1 = page.locator("li.drag-1");
  const drag2 = page.locator("li.drag-2");

  await drag0.dragTo(drag1);
  await page.waitForTimeout(timeout);
  expect(await drag1.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: translate3d(-200px, 0px, 0px);"
  );

  await drag0.dragTo(drag2);
  await page.waitForTimeout(timeout);
  expect(await drag2.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: translate3d(-200px, 0px, 0px);"
  );

  await drag0.dragTo(drag1);
  await page.waitForTimeout(timeout);
  expect(await drag1.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: none;"
  );
  expect(await drag2.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: none;"
  );
});

test("switch rows", async ({ page }) => {
  await page.goto("./");

  const drag2 = page.locator("li.drag-2");
  const drag3 = page.locator("li.drag-3");
  const drag4 = page.locator("li.drag-4");
  const drag6 = page.locator("li.drag-6");
  const drag7 = page.locator("li.drag-7");

  await drag2.dragTo(drag4);
  await page.waitForTimeout(timeout);
  expect(await drag3.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: translate3d(400px, -400px, 0px);"
  );
  expect(await drag4.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: translate3d(-200px, 0px, 0px);"
  );

  await page.evaluate(() => window.scrollTo(0, 300));

  await drag2.dragTo(drag7);
  await page.waitForTimeout(timeout);
  expect(await drag6.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: translate3d(400px, -200px, 0px);"
  );
  expect(await drag7.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: translate3d(-200px, 0px, 0px);"
  );

  await drag2.dragTo(drag3);
  await page.waitForTimeout(timeout);
  expect(await drag3.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: none;"
  );
  expect(await drag4.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: none;"
  );
  expect(await drag6.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: none;"
  );
  expect(await drag7.getAttribute("style")).toBe(
    "opacity: 1; z-index: 0; box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0px 0px; transform: none;"
  );
});
