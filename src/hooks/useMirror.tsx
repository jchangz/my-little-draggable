import { useState } from "react";
import { useSpring } from "@react-spring/web";

function useMirror({ newCoordinates }: { newCoordinates: CoordinateData[] }) {
  const [showMirror, setShowMirror] = useState(true);
  const [mirrorIndex, setMirrorIndex] = useState(false);
  const [mirror, mirrorApi] = useSpring(() => ({}));

  function toggleMirror() {
    setShowMirror((prev) => !prev);
  }

  const animateMirror = ({ originalIndex, top, left, mx, my }: NumberData) =>
    mirrorApi.start({
      x: newCoordinates[originalIndex].x + mx,
      y: newCoordinates[originalIndex].y + my,
      top: top,
      left: left,
      immediate: true,
    });

  return {
    mirrorIndex,
    showMirror,
    mirror,
    setMirrorIndex,
    animateMirror,
    toggleMirror,
  };
}

export default useMirror;
