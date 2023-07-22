export default function createMockEl(width: number, height: number) {
  const div = document.createElement("div");
  Object.assign(div.style, {
    width: width + "px",
    height: height + "px",
  });
  div.getBoundingClientRect = () => ({
    width,
    height,
    x: 0,
    y: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    toJSON: () => 0,
  });
  return div;
}
