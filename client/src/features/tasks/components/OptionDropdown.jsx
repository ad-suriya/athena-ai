import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Small popover list used for a task's status and category. Closes on outside click.
const OptionDropdown = ({
  isOpen,
  onClose,
  onChange,
  options,
  placeholder = 'Select an option'
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="absolute top-1 left-0 w-48 bg-white border border-gray-200 rounded-md shadow-md z-50">
        <div className="p-2">
          <div className="text-xs text-gray-500 mb-2">{placeholder}</div>
          <div className="space-y-1">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
                className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
                <span className={`text-xs ${
                  option.color ? `px-1 py-0.5 rounded ${option.color}` : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

OptionDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string,
  })).isRequired,
  placeholder: PropTypes.string,
};

export default OptionDropdown;
