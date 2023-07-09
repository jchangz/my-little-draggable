import { useState } from "react";
import { useSpring } from "@react-spring/web";

function useMirror() {
  const [showMirror, setShowMirror] = useState(true);
  const [mirrorIndex, setMirrorIndex] = useState(false);
  const [mirror, mirrorApi] = useSpring(() => ({}));

  function toggleMirror() {
    setShowMirror((prev) => !prev);
  }

  return {
    mirrorIndex,
    setMirrorIndex,
    showMirror,
    mirror,
    mirrorApi,
    toggleMirror,
  };
}

export default useMirror;
