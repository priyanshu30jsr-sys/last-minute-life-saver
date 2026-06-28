import { useEffect, useRef } from 'react';

const ProgressRing = ({
  progress = 0,
  size = 80,
  strokeWidth = 6,
  color = '#4285F4',
  label = true
}) => {
  const circleRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.setProperty('--ring-offset', offset);
    circleRef.current.style.strokeDashoffset = offset;
  }, [offset]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="progress-ring-circle transition-all duration-1000"
          style={{ transitionDelay: '0.2s' }}
        />
      </svg>
      {label && (
        <span
          className="absolute text-white font-bold"
          style={{ fontSize: size * 0.22 }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

export default ProgressRing;