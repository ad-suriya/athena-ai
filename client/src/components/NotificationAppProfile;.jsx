import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, UserCircle, Smartphone, LogOut, Settings as SettingsIcon, Home, Mail, Lightbulb } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase.js';
import QR from '../assets/DemoQR.png';
import KnowledgeModal from './KnowledgeModal';

const NotificationAppProfile = ({ user, isMobile = false, setShowSidebarOverlay, setIsSidebarVisible }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const dropdownRef = useRef(null);
  const qrPopupRef = useRef(null);
  const qrButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  let hoverTimeout = useRef(null);

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

  // Dropdown UI wrapped in portal
  const dropdownContent = showDropdown
    ? createPortal(
        <div
          ref={dropdownRef}
          onMouseEnter={() => clearTimeout(hoverTimeout.current)}
          onMouseLeave={handleMouseLeaveProfile}
          className="fixed top-14 right-4 bg-white rounded-lg shadow-lg z-[2000] border border-gray-300 w-64"
        >
          <div className="p-4 border-b border-gray-300 bg-white">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-base font-medium">
                  {getInitials(user?.displayName || user?.email || 'S')}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || 'Suriya AD'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</p>
              </div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
              onClick={() => handleAction(handleKnowledgeModal)}
            >
              <Lightbulb className="w-4 h-4" />
              Knowledge
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
              onClick={() => handleAction(() => handleNavigate('profile'))}
            >
              <UserCircle className="w-4 h-4" />
              Account
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
              onClick={() => handleAction(() => handleNavigate('settings'))}
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
              onClick={() => handleAction(() => (window.location.href = 'https://yudle.vercel.app/'))}
            >
              <Home className="w-4 h-4" />
              Homepage
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
              onClick={() => handleAction(() => handleNavigate('support'))}
            >
              <Mail className="w-4 h-4" />
              Get help
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-200 rounded"
              onClick={() => handleAction(handleLogout)}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg relative">
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" />
        </div>
        <div className="relative">
          <button
            ref={qrButtonRef}
            onMouseEnter={handleMouseEnterQr}
            onMouseLeave={handleMouseLeaveQr}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <Smartphone className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">App</span>
          </button>
          {showQrPopup && (
            <div
              ref={qrPopupRef}
              onMouseEnter={() => clearTimeout(hoverTimeout.current)}
              onMouseLeave={handleMouseLeaveQr}
              className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-[100] flex flex-col items-center w-48 border border-gray-300"
            >
              <div className="w-32 h-32 bg-white flex items-center justify-center">
                <img src={QR} alt="QR Code" className="w-28 h-28" />
              </div>
              <p className="text-sm font-medium text-gray-800 mt-2 text-center">Scan to Download Yudle App</p>
              <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" />
            </div>
          )}
        </div>
        <div className="relative">
          <button
            ref={profileButtonRef}
            onMouseEnter={handleMouseEnterProfile}
            onMouseLeave={handleMouseLeaveProfile}
            className="focus:outline-none"
            aria-label="Profile menu"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-orange-600 transition-colors">
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