'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  FaHome, FaUserFriends, FaCompass, FaVideo,
  FaRegUser, FaPlus, FaSearch, FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '@/contexts/authContext';
import AuthModal from '@/components/auth/AuthModal';

export default function MainLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');

  const openLogin = () => {
    setAuthView('login');
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthView('signup');
    setAuthModalOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-60 border-r fixed h-full overflow-y-auto">
        <div className="p-4">
          <Link href="/" className="text-xl font-bold flex items-center">
            <span className="text-red-500 mr-1">TikTok</span>
          </Link>
        </div>

        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="flex items-center p-3 hover:bg-gray-100 rounded-md mx-2"
              >
                <FaHome className="text-xl mr-3" />
                <span>For You</span>
              </Link>
            </li>
            <li>
              <Link
                href="/following"
                className="flex items-center p-3 hover:bg-gray-100 rounded-md mx-2"
              >
                <FaUserFriends className="text-xl mr-3" />
                <span>Following</span>
              </Link>
            </li>
            <li>
              <Link
                href="/explore"
                className="flex items-center p-3 hover:bg-gray-100 rounded-md mx-2"
              >
                <FaCompass className="text-xl mr-3" />
                <span>Explore</span>
              </Link>
            </li>
            <li>
              <Link
                href="/explore-users"
                className="flex items-center p-3 hover:bg-gray-100 rounded-md mx-2"
              >
                <FaSearch className="text-xl mr-3" />
                <span>Explore Users</span>
              </Link>
            </li>
            <li>
              <Link
                href="/live"
                className="flex items-center p-3 hover:bg-gray-100 rounded-md mx-2"
              >
                <FaVideo className="text-xl mr-3" />
                <span>LIVE</span>
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link
                  href={`/profile/${user?.id}`}
                  className="flex items-center p-3 hover:bg-gray-100 rounded-md mx-2"
                >
                  <FaRegUser className="text-xl mr-3" />
                  <span>My Profile</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {!isAuthenticated && (
          <div className="px-3 py-4 mt-2 border-t">
            <p className="text-sm text-gray-500 mb-4">
              Log in to follow creators, like videos, and view comments.
            </p>
            <button
              onClick={openLogin}
              className="w-full py-2 px-4 border rounded-md font-medium mb-2 hover:bg-gray-50"
            >
              Log in
            </button>
            <button
              onClick={openSignup}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-md font-medium hover:bg-red-600"
            >
              Sign up
            </button>
          </div>
        )}

        {isAuthenticated && (
          <div className="px-3 py-4 mt-2 border-t">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center font-bold text-gray-700">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold">@{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-2 px-4 border rounded-md font-medium hover:bg-gray-50 flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" /> Log out
            </button>
          </div>
        )}

        <div className="border-t px-3 py-4 text-xs text-gray-500">
          <p className="mb-2">© 2025 TikTok</p>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-60 flex-1">
        <div className="max-w-[1150px] mx-auto">
          {/* Top header with search */}
          <header className="h-16 border-b flex items-center justify-between px-4">
            <div className="w-1/3"></div>
            <div className="w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search accounts and videos"
                  className="w-full bg-gray-100 py-2 pl-10 pr-4 rounded-full"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="w-1/3 flex justify-end space-x-3 items-center">
              {isAuthenticated ? (
                <>
                  <Link href="/upload">
                    <button className="border px-3 py-1 rounded-md hover:bg-gray-50 flex items-center">
                      <FaPlus className="mr-2" /> Upload
                    </button>
                  </Link>
                  <Link
                    href={`/profile/${user?.id}`}
                    className="flex items-center hover:bg-gray-100 rounded-full p-1"
                  >
                    <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/upload">
                    <button className="border px-3 py-1 rounded-md hover:bg-gray-50 flex items-center">
                      <FaPlus className="mr-2" /> Upload
                    </button>
                  </Link>
                  <button
                    onClick={openLogin}
                    className="bg-red-500 text-white px-6 py-1 rounded-md hover:bg-red-600"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authView}
      />
    </div>
  );
}