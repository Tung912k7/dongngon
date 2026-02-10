import { useRef, useEffect } from "react";

export function useHorizontalScroll() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY == 0) return;
        // If vertical scroll is larger than horizontal, scroll horizontally
        // This allows normal horizontal scroll (e.g. shift+scroll) to work too
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
           e.preventDefault();
           el.scrollTo({
             left: el.scrollLeft + e.deltaY,
             behavior: "smooth"
           });
        }
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);

  return elRef;
}
