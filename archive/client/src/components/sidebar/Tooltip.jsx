import PropTypes from 'prop-types';

// Hover tooltip shown above or to the right of its child.
const Tooltip = ({ children, text, position = "top" }) => {
  return (
    <div className="relative group">
      {children}
      <div
        className={`
          absolute z-[200] px-2 py-1 text-xs text-white bg-gray-900/90 rounded-lg
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap backdrop-blur-sm
          ${position === "top" ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2" : ""}
          ${position === "right" ? "left-full ml-2 top-1/2 transform -translate-y-1/2" : ""}
        `}
      >
        {text}
        <div
          className={`
            absolute w-0 h-0
            ${position === "top" ? "top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-900/90" : ""}
          `}
        />
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'right']),
};

export default Tooltip;
