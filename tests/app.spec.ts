import { test, expect } from "@playwright/test";

test("switch columns", async ({ page }) => {
  await page.goto("./");
  const drag0 = page.locator("li.drag-0");
  const drag1 = page.locator("li.drag-1");
  const drag2 = page.locator("li.drag-2");

  await drag0.dragTo(drag1);
  await expect(drag1).toHaveCSS("transform", "matrix(1, 0, 0, 1, -200, 0)");

  await drag0.dragTo(drag2);
  await expect(drag2).toHaveCSS("transform", "matrix(1, 0, 0, 1, -200, 0)");

  await drag0.dragTo(drag1);
  await expect(drag1).toHaveCSS("transform", "none");
  await expect(drag2).toHaveCSS("transform", "none");
});

test("switch rows", async ({ page }) => {
  await page.goto("./");
  const drag2 = page.locator("li.drag-2");
  const drag3 = page.locator("li.drag-3");
  const drag4 = page.locator("li.drag-4");
  const drag6 = page.locator("li.drag-6");
  const drag7 = page.locator("li.drag-7");

  await drag2.dragTo(drag4);
  await expect(drag3).toHaveCSS("transform", "matrix(1, 0, 0, 1, 400, -400)");
  await expect(drag4).toHaveCSS("transform", "matrix(1, 0, 0, 1, -200, 0)");

  await page.evaluate(() => window.scrollTo(0, 300));

  await drag2.dragTo(drag7);
  await expect(drag6).toHaveCSS("transform", "matrix(1, 0, 0, 1, 400, -200)");
  await expect(drag7).toHaveCSS("transform", "matrix(1, 0, 0, 1, -200, 0)");

  await drag2.dragTo(drag3);
  await expect(drag3).toHaveCSS("transform", "none");
  await expect(drag4).toHaveCSS("transform", "none");
  await expect(drag6).toHaveCSS("transform", "none");
  await expect(drag7).toHaveCSS("transform", "none");
});

test("check re-render", async ({ page }) => {
  await page.goto("./");
  const drag0 = page.locator("li.drag-0");
  const drag8 = page.locator("li.drag-8");

  await page.evaluate(() => window.scrollTo(0, 300));
  await drag0.dragTo(drag8);
  await page.getByRole("button", { name: "Rerender" }).click();

  await expect(drag0).toHaveCSS("transform", "none");
  await expect(drag8).toHaveCSS("transform", "none");
});

test("check mirror", async ({ page }) => {
  await page.goto("./");
  const drag0 = page.locator("li.drag-0");
  const mirror = page.locator(".draggable-mirror");
  const box = (await drag0.boundingBox()) || {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(mirror).toBeVisible();
  await page.mouse.up();

  await page.getByRole("button", { name: "Enable Mirror" }).click();

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(mirror).not.toBeVisible();
});
