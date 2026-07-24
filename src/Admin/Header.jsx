import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MdMenu } from 'react-icons/md';
import {
  FiBell,
  FiUser,
  FiLogOut,
  FiCheckCircle,
  FiInfo,
  FiChevronDown,
  FiAward,
  FiCreditCard,
  FiX,
  FiCheck,
  FiHeart,
  FiMail,
  FiShield
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../Api/config';

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const routeTitles = {
  '/app': { title: 'Dashboard', subtitle: 'Overview of your mental wellness journey' },
  '/app/about': { title: 'About Mental Swasthya', subtitle: 'Empowering holistic health and mindfulness' },
  '/app/meditation': { title: 'Breathing Exercises', subtitle: 'Find peace and center through guided breathwork' },
  '/app/affirmations': { title: 'Positive Affirmations', subtitle: 'Daily uplifting thoughts for growth & peace' },
  '/app/meditation-playlist': { title: 'Meditation Playlist', subtitle: 'Calming audio tracks for inner tranquility' },
  '/app/achievements': { title: 'My Achievements', subtitle: 'Track your milestones and wellness rewards' },
  '/app/subscription': { title: 'Subscription Plans', subtitle: 'Unlock unlimited access to all features' },
  '/app/gift-cards': { title: 'Gift Cards', subtitle: 'Share the gift of mindfulness with loved ones' },
  '/app/contact': { title: 'Contact Support', subtitle: 'We are here to help and guide you' },
  '/app/users': { title: 'User Management', subtitle: 'Manage application users and permissions' },
};

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const bellRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const res = await axiosInstance.get('/notifications');
      const realList = res.data?.data?.notifications || [];
      const formatted = realList.map((item) => ({
        id: item._id,
        title: item.title,
        message: item.body,
        time: formatRelativeTime(item.createdAt),
        read: item.isRead,
        type: item.type === 'streak_milestone' ? 'achievement' : item.type === 'system' ? 'system' : 'info',
      }));
      setNotifications(formatted);
    } catch (err) {
      console.warn('Failed to load notifications from API:', err);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const routeInfo = routeTitles[location.pathname] || {
    title: 'Mental Swasthya',
    subtitle: 'Welcome to your wellness space',
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'AU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await axiosInstance.patch('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all notifications read on backend:', err);
    }
  };

  const toggleReadStatus = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    const nextRead = !target.read;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: nextRead } : n))
    );

    if (nextRead && typeof id === 'string' && id.length === 24) {
      try {
        await axiosInstance.patch(`/notifications/${id}/read`);
      } catch (err) {
        console.error('Failed to mark notification read on backend:', err);
      }
    }
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f6f9f3]/90 backdrop-blur-md border-b border-[#dde8d5] px-4 lg:px-8 py-3 transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* Left Side: Mobile Hamburger & Page Header Context */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-xl text-[#29401f] bg-white border border-[#dde8d5] hover:bg-[#eef6ea] transition-all duration-200 shadow-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Navigation Sidebar"
          >
            <MdMenu className="text-xl" />
          </button>

          <div>
            <h1 className="text-lg md:text-xl font-bold text-[#29401f] tracking-tight leading-tight">
              {routeInfo.title}
            </h1>
            <p className="hidden sm:block text-xs text-[#66785c] font-medium">
              {routeInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Bell Icon & Profile Dropdown */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Bell Icon Notification Dropdown Container */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsProfileOpen(false);
              }}
              className="relative p-2.5 rounded-full text-[#526447] hover:text-[#29401f] hover:bg-[#eef6ea] border border-[#d5e3cb] bg-white transition-all duration-200 shadow-sm focus:outline-none active:scale-95"
              aria-label="View Notifications"
            >
              <FiBell className="text-lg md:text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-sm border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#dde8d5] rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                {/* Popover Header */}
                <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#f7faf5] to-[#eef6ea] border-b border-[#dde8d5]">
                  <div className="flex items-center gap-2">
                    <FiBell className="text-[#526447]" />
                    <span className="font-semibold text-sm text-[#29401f]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#7d9667] text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#526447] hover:text-[#29401f] font-medium hover:underline flex items-center gap-1"
                    >
                      <FiCheck className="text-xs" /> Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#f0f5ed]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#7b8e70]">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleReadStatus(item.id)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-[#f6faf3] cursor-pointer transition-colors relative group ${
                          !item.read ? 'bg-[#f4f9f1]/70 font-medium' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {item.type === 'achievement' ? (
                            <div className="p-1.5 rounded-full bg-amber-100 text-amber-600">
                              <FiAward className="text-sm" />
                            </div>
                          ) : item.type === 'info' ? (
                            <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
                              <FiInfo className="text-sm" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-full bg-teal-100 text-teal-700">
                              <FiShield className="text-sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 pr-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-[#29401f]">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-[#7b8e70]">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#526447] mt-0.5 leading-snug">
                            {item.message}
                          </p>
                        </div>

                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        )}

                        <button
                          onClick={(e) => deleteNotification(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                          title="Dismiss"
                        >
                          <FiX className="text-xs" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-2 text-center bg-[#f9fbf8] border-t border-[#dde8d5]">
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[11px] text-[#66785c] hover:text-red-600 transition-colors font-medium"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown Container */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileOpen((prev) => !prev);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full bg-white hover:bg-[#eef6ea] border border-[#d5e3cb] transition-all duration-200 shadow-sm focus:outline-none active:scale-95 cursor-pointer"
              aria-label="User Profile Menu"
            >
              {user?.avatar || user?.profileImage ? (
                <img
                  src={user.avatar || user.profileImage}
                  alt={user?.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border border-[#b8caa9]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7d9667] to-[#526543] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {getInitials(user?.name)}
                </div>
              )}

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#29401f] leading-tight max-w-[120px] truncate">
                  {user?.name || 'User Profile'}
                </span>
                <span className="text-[10px] text-[#66785c] capitalize leading-tight">
                  {user?.role || 'Member'}
                </span>
              </div>

              <FiChevronDown className={`text-xs text-[#526447] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-[#dde8d5] rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                {/* Profile Header Info */}
                <div className="p-4 bg-gradient-to-br from-[#f8fbf6] to-[#eef6ea] border-b border-[#dde8d5] flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7d9667] to-[#526543] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                    {getInitials(user?.name)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-xs font-bold text-[#29401f] truncate">
                      {user?.name || 'User Account'}
                    </h3>
                    <p className="text-[11px] text-[#66785c] truncate">
                      {user?.email || 'user@mentalswasthya.com'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-[#344f28] bg-[#d9e8cf] rounded-full capitalize">
                      {user?.role || 'Member'}
                    </span>
                  </div>
                </div>

                {/* Profile Options */}
                <div className="p-2">
                  <Link
                    to="/app/achievements"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#3b4e31] hover:bg-[#f0f6ec] hover:text-[#29401f] rounded-xl transition-colors"
                  >
                    <FiAward className="text-[#66785c] text-sm" />
                    <span>My Achievements</span>
                  </Link>

                  <Link
                    to="/app/subscription"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#3b4e31] hover:bg-[#f0f6ec] hover:text-[#29401f] rounded-xl transition-colors"
                  >
                    <FiCreditCard className="text-[#66785c] text-sm" />
                    <span>Subscription Plan</span>
                  </Link>

                  <Link
                    to="/app/contact"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#3b4e31] hover:bg-[#f0f6ec] hover:text-[#29401f] rounded-xl transition-colors"
                  >
                    <FiMail className="text-[#66785c] text-sm" />
                    <span>Contact Support</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="p-2 border-t border-[#dde8d5] bg-[#fafcf9]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <FiLogOut className="text-sm" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

