import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  UserCircle,
  Smartphone,
  LogOut,
  Settings as SettingsIcon,
  Home,
  Mail,
  Lightbulb,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase.js';
import QR from '../assets/DemoQR.png';
import KnowledgeModal from './KnowledgeModal';

const NotificationAppProfile = ({ user, isMobile = false, setShowSidebarOverlay, setIsSidebarVisible }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null); // { top, left, transformOrigin }
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const dropdownRef = useRef(null);
  const qrPopupRef = useRef(null);
  const qrButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const rootRef = useRef(null);
  const hoverTimeout = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
      if (
        qrPopupRef.current &&
        !qrPopupRef.current.contains(event.target) &&
        qrButtonRef.current &&
        !qrButtonRef.current.contains(event.target)
      ) {
        setShowQrPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(hoverTimeout.current);
    };
  }, []);

  useEffect(() => {
    // When dropdown opens, calculate its position relative to the viewport and adjust if it would overflow the right edge
    if (showDropdown && profileButtonRef.current) {
      const btnRect = profileButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // w-64
      const dropdownHeight = 320; // approximate height; can be adjusted or measured
      const margin = 8;

      // Default place below the button, right-aligned to the button
      let top = btnRect.bottom + margin;
      let left = btnRect.right - dropdownWidth;

      // If left would be negative, clamp to margin
      if (left < margin) left = margin;

      // If dropdown would overflow right edge, adjust left
      const viewportWidth = window.innerWidth;
      if (left + dropdownWidth > viewportWidth - margin) {
        left = viewportWidth - dropdownWidth - margin;
      }

      // If not enough space below, place above the button
      if (top + dropdownHeight > window.innerHeight - margin) {
        top = btnRect.top - dropdownHeight - margin;
      }

      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
      });
    } else {
      setDropdownStyle(null);
    }
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (path) => {
    navigate(`/${path}`);
    if (isMobile) {
      setShowSidebarOverlay?.(false);
      setIsSidebarVisible?.(false);
    }
  };

  const handleAction = (action) => {
    if (isMobile) {
      setShowSidebarOverlay?.(false);
      setIsSidebarVisible?.(false);
    }
    setShowDropdown(false);
    setShowQrPopup(false);
    action();
  };

  const handleKnowledgeModal = () => {
    setShowKnowledgeModal(true);
    setShowDropdown(false);
    if (isMobile) {
      setShowSidebarOverlay?.(false);
      setIsSidebarVisible?.(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleMouseEnterQr = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowQrPopup(true), 200);
  };

  const handleMouseLeaveQr = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowQrPopup(false), 200);
  };

  const handleMouseEnterProfile = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowDropdown(true), 200);
  };

  const handleMouseLeaveProfile = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowDropdown(false), 200);
  };

  // Keep dropdown content in portal but positioned by computed dropdownStyle
  const dropdownContent =
    showDropdown && dropdownStyle
      ? createPortal(
          <div
            ref={dropdownRef}
            onMouseEnter={() => clearTimeout(hoverTimeout.current)}
            onMouseLeave={handleMouseLeaveProfile}
            style={dropdownStyle}
            className="bg-gradient-to-b from-white to-[#F5D9D1]/20 rounded-xl shadow-xl z-[2000] border-2 border-[#E65C52]/20 w-64 backdrop-blur-sm overflow-visible"
          >
            <div className="p-4 border-b-2 border-[#E65C52]/10 bg-gradient-to-r from-white to-[#F5D9D1]/30 rounded-t-xl">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#E65C52]/30"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-[#E65C52] to-[#E14C42] rounded-full flex items-center justify-center text-white text-base font-medium shadow-md">
                    {getInitials(user?.displayName || user?.email || 'S')}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#E14C42] truncate">
                    {user?.displayName || 'Suriya AD'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</p>
                </div>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 rounded-lg transition-colors"
                onClick={() => handleAction(handleKnowledgeModal)}
              >
                <Lightbulb className="w-4 h-4 text-[#E65C52]" />
                Knowledge
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 rounded-lg transition-colors"
                onClick={() => handleAction(() => handleNavigate('profile'))}
              >
                <UserCircle className="w-4 h-4 text-[#E65C52]" />
                Account
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 rounded-lg transition-colors"
                onClick={() => handleAction(() => handleNavigate('settings'))}
              >
                <SettingsIcon className="w-4 h-4 text-[#E65C52]" />
                Settings
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 rounded-lg transition-colors"
                onClick={() => handleAction(() => (window.location.href = 'https://yudle.vercel.app/'))}
              >
                <Home className="w-4 h-4 text-[#E65C52]" />
                Homepage
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 rounded-lg transition-colors"
                onClick={() => handleAction(() => handleNavigate('support'))}
              >
                <Mail className="w-4 h-4 text-[#E65C52]" />
                Get help
              </button>
              <div className="h-px bg-gradient-to-r from-transparent via-[#E65C52]/20 to-transparent my-1"></div>
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 rounded-lg transition-colors font-medium"
                onClick={() => handleAction(handleLogout)}
              >
                <LogOut className="w-4 h-4 text-[#E14C42]" />
                Sign out
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={rootRef}
        className="flex items-center gap-4 pr-5 pl-3 py-2 bg-gradient-to-r from-[#F5D9D1]/30 to-white/50 rounded-xl relative border border-[#E65C52]/20 shadow-lg"
        style={{ overflow: 'visible' }} // allow badges and popups to overflow
      >
        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-full bg-gradient-to-r from-white to-[#F5D9D1]/30 border border-[#E65C52]/20 hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 transition-all">
            <Bell className="w-5 h-5 text-[#E65C52] hover:text-[#E14C42] transition-colors" />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-[#E65C52] to-[#E14C42] rounded-full animate-pulse" />
          </button>
        </div>

        {/* QR Code Button */}
        <div className="relative">
          <button
            ref={qrButtonRef}
            onMouseEnter={handleMouseEnterQr}
            onMouseLeave={handleMouseLeaveQr}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-white to-[#F5D9D1]/30 rounded-lg border border-[#E65C52]/20 hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50 cursor-pointer transition-all shadow-sm"
          >
            <Smartphone className="w-4 h-4 text-[#E65C52]" />
            <span className="text-sm font-medium text-[#E14C42]">App</span>
          </button>

          {showQrPopup && (
            <div
              ref={qrPopupRef}
              onMouseEnter={() => clearTimeout(hoverTimeout.current)}
              onMouseLeave={handleMouseLeaveQr}
              className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-white to-[#F5D9D1]/20 rounded-xl shadow-xl p-4 z-[100] flex flex-col items-center w-52 border-2 border-[#E65C52]/20 backdrop-blur-sm"
              style={{ overflow: 'visible' }}
            >
              <div
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-white"
                aria-hidden
              />
              <div className="w-32 h-32 bg-white flex items-center justify-center rounded-lg border border-[#E65C52]/20">
                <img src={QR} alt="QR Code" className="w-28 h-28 rounded" />
              </div>
              <p className="text-sm font-medium text-[#E14C42] mt-2 text-center">Scan to Download Athena App</p>
              <p className="text-xs text-gray-500 mt-1 text-center">Available on iOS & Android</p>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <div className="relative">
          <button
            ref={profileButtonRef}
            onMouseEnter={handleMouseEnterProfile}
            onMouseLeave={handleMouseLeaveProfile}
            onClick={() => setShowDropdown((s) => !s)}
            className="focus:outline-none transition-transform hover:scale-105"
            aria-label="Profile menu"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User"
                className="w-9 h-9 rounded-full object-cover border-2 border-[#E65C52]/30 shadow-md"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-r from-[#E65C52] to-[#E14C42] rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
                {getInitials(user?.displayName || user?.email || 'S')}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown rendered via portal */}
      {dropdownContent}

      {showKnowledgeModal && (
        <KnowledgeModal
          isOpen={showKnowledgeModal}
          onClose={() => setShowKnowledgeModal(false)}
          setShowSidebarOverlay={setShowSidebarOverlay}
          setIsSidebarVisible={setIsSidebarVisible}
        />
      )}
    </>
  );
};

export default NotificationAppProfile;
