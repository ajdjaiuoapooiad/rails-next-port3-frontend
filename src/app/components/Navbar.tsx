'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // ドロップダウンのアイコン

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  user_icon_url?: string;
  bg_image_url?: string;
  is_following?: boolean;
}

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // 現在の状態を反転させる
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const userId = localStorage.getItem('userId');
        const res = await fetch(`${apiUrl}/profiles/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });
        if (res.ok) {
          const userProfileData: UserProfile = await res.json();
          setCurrentUserProfile(userProfileData);
        } else {
          console.error('Failed to fetch current user profile');
          setCurrentUserProfile(null);
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
        setCurrentUserProfile(null);
      }
    };

    fetchCurrentUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const displayedUsername: string = currentUserProfile?.username ? (currentUserProfile.username.length > 10 ? currentUserProfile.username.slice(0, 10) + '...' : currentUserProfile.username) : '';

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="text-white text-lg focus:outline-none mr-4 sm:mr-8">
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <Link href="/posts" className="text-white text-lg font-bold">
            My Website
          </Link>
        </div>
        <div className="relative flex items-center space-x-4">
          {currentUserProfile ? (
            <div className="relative">
              <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                <div className="flex items-center">
                  {currentUserProfile.user_icon_url ? (
                    <img
                      src={currentUserProfile.user_icon_url}
                      alt={`${currentUserProfile.username}のアイコン`}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load user icon:', currentUserProfile.user_icon_url);
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-300" />
                  )}
                  <span className="text-white ml-2 text-sm hidden sm:inline">{displayedUsername}</span>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-300 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isDropdownOpen && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    プロフィール
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    設定
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    ログアウト
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
              <Link href="/auth/register" className="text-gray-300 hover:text-white">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </nav>
  );
};

export default Navbar;