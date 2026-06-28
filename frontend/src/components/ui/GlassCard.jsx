import { use3DTilt } from '../../hooks/use3DTilt';

const GlassCard = ({
  children,
  className = '',
  tilt = false,
  glow = false,
  glowColor = 'blue',
  onClick,
  style = {}
}) => {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt(12);

  const glowStyles = {
    blue:   'hover:shadow-glow',
    purple: 'hover:shadow-glow-purple',
    green:  'hover:shadow-glow-green',
    red:    'hover:shadow-glow-red'
  };

  return (
    <div
      ref={tilt ? ref : null}
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      onClick={onClick}
      style={style}
      className={[
        'glass rounded-2xl transition-all duration-300',
        glow && glowStyles[glowColor],
        onClick && 'cursor-pointer',
        className
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
};

export default GlassCard;