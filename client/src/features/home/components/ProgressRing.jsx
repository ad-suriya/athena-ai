import PropTypes from 'prop-types';

// Circular progress (0–1) with content centered inside.
const ProgressRing = ({ value, size = 120, stroke = 10, color = '#E65C52', track = '#F3ECEA', children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};

ProgressRing.propTypes = {
  value: PropTypes.number,
  size: PropTypes.number,
  stroke: PropTypes.number,
  color: PropTypes.string,
  track: PropTypes.string,
  children: PropTypes.node,
};

export default ProgressRing;
