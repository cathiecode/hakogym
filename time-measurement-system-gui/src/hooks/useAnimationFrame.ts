import { useEffect } from "react";

export default function useAnimationFrame(onAnimationFrame: () => void) {
  useEffect(() => {
    let animationFrame: number | undefined;
    const handleAnimationFrame = () => {
      onAnimationFrame();
      animationFrame = requestAnimationFrame(handleAnimationFrame);
    };

    animationFrame = requestAnimationFrame(handleAnimationFrame);

    return () => {
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onAnimationFrame]);
}
