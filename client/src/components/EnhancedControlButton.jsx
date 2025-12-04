// EnhancedControlButton.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Settings } from 'lucide-react';
import { auth } from '../firebase.js';

const EnhancedControlButton = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const DropdownContent = () => (
    <div 
      ref={dropdownRef}
      className={`w-64 rounded-lg shadow-xl overflow-hidden bg-white border border-gray-100
      transition-all duration-300 origin-top-right transform
      ${isDropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
        zIndex: 999999,
        boxShadow: '0 10px 35px -5px rgba(0, 0, 0, 0.25), 0 10px 20px -15px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="py-1">
        <div 
          className="px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors duration-200 text-gray-800 hover:bg-red-50"
          onClick={handleLogout}
        >
          <div className="p-2 rounded-full bg-red-100">
            <LogOut size={16} className="text-red-600" />
          </div>
          <div>
            <p className="font-medium">Logout</p>
            <p className="text-xs opacity-70">Sign out of your account</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="control-button-wrapper">
      <div className="control-button-shadow"></div>
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`control-button flex items-center gap-2 py-2 px-4 rounded-full transition-all duration-300 bg-white text-gray-800
          ${isDropdownOpen ? 'shadow-active' : ''}`}
      >
        <Settings size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : ''}`} />
        <span className="font-medium">Controls</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Portal dropdown */}
      {typeof document !== 'undefined' && createPortal(<DropdownContent />, document.body)}
    </div>
  );
};

export default EnhancedControlButton;