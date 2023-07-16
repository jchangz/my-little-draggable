import { useState, useEffect } from "react";
import { debounce } from "lodash";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState(0);

  useEffect(() => {
    function handleResize() {
      setWindowSize(window.innerWidth);
    }
    const debouncedResize = debounce(handleResize, 100);

    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  return windowSize;
}
