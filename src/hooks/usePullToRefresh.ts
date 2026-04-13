import { useRef, useEffect, useState, useCallback } from "react";

interface Options {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: Options) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pulling || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(dy * 0.5, threshold * 1.5));
      }
    },
    [pulling, refreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
    setPulling(false);
  }, [pullDistance, threshold, refreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current ?? document;
    el.addEventListener("touchstart", handleTouchStart as EventListener, { passive: true });
    el.addEventListener("touchmove", handleTouchMove as EventListener, { passive: true });
    el.addEventListener("touchend", handleTouchEnd as EventListener);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart as EventListener);
      el.removeEventListener("touchmove", handleTouchMove as EventListener);
      el.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, pullDistance, refreshing, threshold };
}
