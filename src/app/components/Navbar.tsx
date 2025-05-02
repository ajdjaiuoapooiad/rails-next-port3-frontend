'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { UserCircleIcon } from '@heroicons/react/24/solid'; // デフォルトのUserアイコン

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  user_icon_url?: string;
  bg_image_url?: string;
  is_following?: boolean; // 現在のユーザーがこのプロフィールをフォローしているか
}

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null); // ログインユーザーのプロフィール情報

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
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
        <div className="flex items-center space-x-4">
          {currentUserProfile ? (
            <div className="flex items-center">
              {currentUserProfile.user_icon_url ? (
                <img
                  src={currentUserProfile.user_icon_url}
                  alt={`${currentUserProfile.username}のアイコン`}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load user icon:', currentUserProfile.user_icon_url);
                    (e.target as HTMLImageElement).onerror = null; // 無限ループを防ぐ
                    (e.target as HTMLImageElement).src = ''; // エラーになったらsrcをクリア
                  }}
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-300" />
              )}
              <span className="text-white ml-2 text-sm">{displayedUsername}</span>
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