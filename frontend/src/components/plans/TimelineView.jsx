import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StepCard from './StepCard';

gsap.registerPlugin(ScrollTrigger);

const TimelineView = ({ steps = [], onComplete, onSkip, loading }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('.tl-item');

    items.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, x: i % 2 === 0 ? -30 : 30, y: 10 },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.55,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start:   'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [steps.length]);

  if (!steps || steps.length === 0) return null;

  // Group steps by day number
  const grouped = steps.reduce((acc, step, i) => {
    const day = step.day || Math.floor(i / 3) + 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push({ ...step, originalIndex: i });
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative">
      {/* Vertical spine */}
      <div className="absolute left-[22px] top-4 bottom-4 w-px"
        style={{
          background: 'linear-gradient(to bottom, #4285F4, #8B5CF6, transparent)'
        }}
      />

      <div className="flex flex-col gap-8">
        {Object.entries(grouped).map(([day, daySteps]) => (
          <div key={day}>
            {/* Day label */}
            <div className="flex items-center gap-3 mb-4 ml-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-11 h-11 rounded-xl bg-gblu/20 border border-gblu/30
                  flex items-center justify-center flex-shrink-0 z-10"
              >
                <span className="text-gblu text-xs font-black">D{day}</span>
              </motion.div>
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-white/25 text-xs font-semibold uppercase tracking-widest">
                Day {day}
              </span>
            </div>

            {/* Steps for this day */}
            <div className="flex flex-col gap-3 pl-14">
              {daySteps.map((step) => (
                <div key={step._id || step.originalIndex} className="tl-item relative">
                  {/* Connector dot */}
                  <motion.div
                    className={`absolute -left-[34px] top-4 w-3 h-3 rounded-full border-2 z-10
                      ${step.completed
                        ? 'bg-ggrn  border-ggrn'
                        : step.skipped
                        ? 'bg-gred/30 border-gred/40'
                        : 'bg-navy   border-gblu/50'
                      }`}
                    animate={!step.completed && !step.skipped ? {
                      boxShadow: [
                        '0 0 0px rgba(66,133,244,0)',
                        '0 0 10px rgba(66,133,244,0.7)',
                        '0 0 0px rgba(66,133,244,0)'
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <StepCard
                    step={step}
                    index={step.originalIndex}
                    onComplete={onComplete}
                    onSkip={onSkip}
                    loading={loading}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;