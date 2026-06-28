

const MorphingBlob = ({ color = '#8B5CF6', size = 500, opacity = 0.15, className = '' }) => (
  <div
    className={`blob-morph pointer-events-none ${className}`}
    style={{
      width:    size,
      height:   size,
      background: `radial-gradient(circle, ${color}66, ${color}11)`,
      filter:   'blur(60px)',
      opacity,
      position: 'absolute',
      animation: 'blobMorph 8s ease-in-out infinite'
    }}
  />
);

export default MorphingBlob;