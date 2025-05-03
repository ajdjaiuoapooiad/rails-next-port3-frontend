'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon, BellIcon } from '@heroicons/react/20/solid';
import NotificationList from './notifications/NotificationList';

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

interface Notification {
  id: number;
  recipient_id: number;
  sender_id: number | null;
  notifiable_type: string;
  notifiable_id: number;
  notification_type: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfileShort {
  id: number;
  username: string;
}

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 通知関連のステート
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [senders, setSenders] = useState<{ [userId: number]: UserProfileShort }>({});
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);

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

  const openNotificationsDropdown = () => {
    setIsNotificationsDropdownOpen(true);
  };

  const closeNotificationsDropdown = () => {
    setIsNotificationsDropdownOpen(false);
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
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        closeNotificationsDropdown();
      }
    };

    if (isDropdownOpen || isNotificationsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutsideDropdown);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, [isDropdownOpen, isNotificationsDropdownOpen]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data: Notification[] = await response.json();
            const sortedNotifications = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setNotifications(sortedNotifications);

            // 送信者情報を取得 (上位5件のみ)
            sortedNotifications.slice(0, 5).forEach(async (notification) => {
              if (notification.sender_id && !senders[notification.sender_id]) {
                try {
                  const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${notification.sender_id}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (profileResponse.ok) {
                    const profileData: UserProfileShort = await profileResponse.json();
                    setSenders((prevSenders) => ({ ...prevSenders, [profileData.id]: profileData }));
                  }
                } catch (error) {
                  console.error('Error fetching sender profile for notification:', error);
                }
              }
            });
          } else {
            console.error('Failed to fetch notifications in Navbar');
          }
        }
      } catch (error) {
        console.error('Error fetching notifications in Navbar:', error);
      }
    };

    fetchNotifications();
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
        <div className="relative flex items-center space-x-4">
          <div
            ref={notificationsDropdownRef}
            onMouseEnter={openNotificationsDropdown}
            onMouseLeave={closeNotificationsDropdown}
            className="relative"
          >
            <button className="text-gray-300 hover:text-white focus:outline-none">
              <BellIcon className="h-6 w-6" />
              {notifications.filter(n => !n.read_at).length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {notifications.filter(n => !n.read_at).length > 5 ? '5+' : notifications.filter(n => !n.read_at).length}
                </span>
              )}
            </button>
            {isNotificationsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-2">
                  {notifications.length > 0 ? (
                    <NotificationList
                      notifications={notifications.slice(0, 5)}
                      senders={senders}
                    />
                  ) : (
                    <div className="text-gray-600 p-2">まだ通知はありません。</div>
                  )}
                  {notifications.length > 5 && (
                    <Link href="/notifications" className="block text-center text-blue-500 hover:underline p-2">
                      すべて表示
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {currentUserProfile ? (
            <>
              <Link href="/auth/login" className="text-gray-300 hover:text-white">
                メッセージ
              </Link>
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
            </>
          ) : (
            <div className="space-x-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white">
                ログイン
              </Link>
              <Link href="/auth/register" className="text-gray-300 hover:text-white">
                新規登録
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