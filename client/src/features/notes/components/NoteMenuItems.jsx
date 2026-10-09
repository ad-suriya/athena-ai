import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';
import { menuIconClass, menuItemThemeClass } from '../utils/menuStyles';

// Building blocks for NoteOptionsMenu, themed for light/dark mode.

const accentClass = (isDarkMode) => (isDarkMode ? 'text-[#E65C52]/60' : 'text-[#E65C52]');

// A menu button. Optional right side: a shortcut `hint`, or a submenu chevron
// with an optional `submenuLabel`.
export const MenuItem = ({ isDarkMode, icon: Icon, label, onClick, hint, hasSubmenu = false, submenuLabel }) => {
  const hasRight = Boolean(hint) || hasSubmenu;
  const icon = <Icon size={16} className={menuIconClass(isDarkMode)} />;

  let right = null;
  if (hint) {
    right = <span className={`text-xs ${accentClass(isDarkMode)}`}>{hint}</span>;
  } else if (hasSubmenu && submenuLabel) {
    right = (
      <div className="flex items-center">
        <span className={`text-xs mr-2 ${accentClass(isDarkMode)}`}>
          {submenuLabel}
        </span>
        <ChevronRight size={16} className={accentClass(isDarkMode)} />
      </div>
    );
  } else if (hasSubmenu) {
    right = <ChevronRight size={16} className={accentClass(isDarkMode)} />;
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center ${hasRight ? 'justify-between ' : ''}w-full px-4 py-2.5 text-sm transition-colors ${menuItemThemeClass(isDarkMode)}`}
    >
      {hasRight ? (
        <>
          <div className="flex items-center">
            {icon}
            {label}
          </div>
          {right}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
};

MenuItem.propTypes = {
  isDarkMode: PropTypes.bool,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  hint: PropTypes.string,
  hasSubmenu: PropTypes.bool,
  submenuLabel: PropTypes.string,
};

const ToggleSwitch = ({ isDarkMode, checked, onChange }) => (
  <div className="flex items-center">
    <div
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked
          ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42]'
          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`}
      onClick={onChange}
    >
      <div
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-md ${
          checked ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </div>
  </div>
);

ToggleSwitch.propTypes = {
  isDarkMode: PropTypes.bool,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// A row with a label and an on/off switch.
export const MenuToggleItem = ({ isDarkMode, icon: Icon, label, checked, onChange }) => (
  <div className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`}>
    <div className="flex items-center">
      <Icon size={16} className={menuIconClass(isDarkMode)} />
      {label}
    </div>
    <ToggleSwitch isDarkMode={isDarkMode} checked={checked} onChange={onChange} />
  </div>
);

MenuToggleItem.propTypes = {
  isDarkMode: PropTypes.bool,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export const MenuDivider = ({ isDarkMode }) => (
  <div className={`my-1 h-px ${isDarkMode ? 'bg-[#E65C52]/20' : 'bg-[#E65C52]/10'}`}></div>
);

MenuDivider.propTypes = {
  isDarkMode: PropTypes.bool,
};
