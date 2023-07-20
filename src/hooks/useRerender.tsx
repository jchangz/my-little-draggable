import { useState, useEffect, useCallback, useRef } from "react";
import { swap } from "./swap";

function useRerender({
  keys,
  windowSize,
}: {
  keys: string[];
  windowSize: number;
}) {
  // The order of items based on item key, keeping correct order on re-render
  const [orderByKey, setOrderByKey] = useState(
    [...Array(keys.length)].map((_, i) => i)
  );
  // Temp store of grid position order used to update orderByKey
  const tempOrder = useRef([...Array(keys.length)].map((_, i) => i));

  const toggleRender = useCallback(() => {
    setOrderByKey(tempOrder.current);
  }, []);

  const setTempOrder = ({
    currentIndexPosition,
    newIndex,
  }: {
    currentIndexPosition: number;
    newIndex: number;
  }) => {
    tempOrder.current = swap(tempOrder.current, currentIndexPosition, newIndex);
  };

  useEffect(() => {
    // Re-render on window size changes
    toggleRender();
  }, [windowSize, toggleRender]);

  return {
    orderByKey,
    setTempOrder,
    toggleRender,
  };
}

export default useRerender;
