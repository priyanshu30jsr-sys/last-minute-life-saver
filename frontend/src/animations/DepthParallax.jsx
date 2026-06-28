import { useRef, useEffect, Children } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps children in depth-stacked parallax layers.
 *
 * Simple usage (auto-wraps each child in a layer):
 * <DepthParallax speeds={[0.2, 0.5, 1]}>
 *   <BackgroundLayer />
 *   <MidLayer />
 *   <ForegroundLayer />
 * </DepthParallax>
 *
 * Render-prop usage:
 * <DepthParallax speeds={[0.3, 0.7]}>
 *   {(speeds) => speeds.map((s, i) => <div key={i}>...</div>)}
 * </DepthParallax>
 */
const DepthParallax = ({
  children,
  speeds    = [0.2, 0.5, 0.9],
  className = '',
  height    = 'auto'
}) => {
  const containerRef = useRef(null);
  const layerRefs    = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const triggers = layerRefs.current
      .filter(Boolean)
      .map((el, i) => {
        const speed = speeds[i] ?? 0.5;
        return gsap.to(el, {
          yPercent: -25 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger:    containerRef.current,
            start:      'top bottom',
            end:        'bottom top',
            scrub:      1.2
          }
        });
      });

    return () => {
      triggers.forEach(t => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
    };
  }, [speeds]);

  const childArray = Children.toArray(children);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {childArray.map((child, i) => (
        <div
          key={i}
          ref={el => layerRefs.current[i] = el}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: i + 1 }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default DepthParallax;