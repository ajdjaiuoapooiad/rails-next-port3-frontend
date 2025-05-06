'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { UserCircleIcon,  } from '@heroicons/react/24/solid';
import { ChevronDownIcon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid'; // ログアウトアイコンを追加
import NotificationList from './notifications/NotificationList';
import { UserProfile, Notification } from '../utils/types';
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface NavbarProps {}


const Navbar: React.FC<NavbarProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // 通知関連のステート
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [senders, setSenders] = useState<{ [userId: number]: UserProfile }>({});
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();


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

  const userId = localStorage.getItem('userId');

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
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCurrentUserProfile();
    } else {
      setLoading(false); // userId がない場合も loading を false に設定
    }
  }, [userId]);

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
                    const profileData: UserProfile = await profileResponse.json();
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

  const displayedUsername: string = currentUserProfile?.display_name || currentUserProfile?.username ? (currentUserProfile.display_name || currentUserProfile.username).length > 10 ? (currentUserProfile.display_name || currentUserProfile.username).slice(0, 10) + '...' : (currentUserProfile.display_name || currentUserProfile.username) : '';

  const handleLogout = () => {
      Swal.fire({
        title: 'ログアウトしますか？',
        text: 'ログアウトすると、再度ログインが必要になります。',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ログアウト',
        cancelButtonText: 'キャンセル',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // クライアントサイドの認証情報を削除
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            setCurrentUserProfile(null); // プロフィール情報をクリア
  
            Swal.fire({
              icon: 'success',
              title: 'ログアウト成功',
              showConfirmButton: false,
              timer: 1500,
            });
  
            router.push('/auth/login');
          } catch (error: any) {
            Swal.fire({
              icon: 'error',
              title: 'ログアウト中にエラーが発生しました',
              text: error.message || 'ログアウト処理中に予期せぬエラーが発生しました。',
            });
          }
        }
      });
    };
  


  return (
    <nav className="bg-gray-800 p-4 border-b border-gray-700">
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
          <Link href="/posts" className="text-white text-lg font-bold hover:text-gray-200 transition-colors">
            My Website
          </Link>
        </div>
        <div className="relative flex items-center space-x-4">
          {loading ? (
            <>
              <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
              <Skeleton className="h-8 w-48 bg-gray-700" />
            </>
          ) : currentUserProfile ? (
            <>
              <div
                ref={notificationsDropdownRef}
                onMouseEnter={openNotificationsDropdown}
                onMouseLeave={closeNotificationsDropdown}
                className="relative"
              >
                <button className="text-gray-300 hover:text-white focus:outline-none">
                  <span className="sr-only">Notifications</span>
                  <BellIcon className="h-6 w-6" />
                  <AnimatePresence>
                    {notifications.filter(n => !n.read_at).length > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
                      >
                        {notifications.filter(n => !n.read_at).length > 5 ? '5+' : notifications.filter(n => !n.read_at).length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <AnimatePresence>
                  {isNotificationsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/messages" className="text-gray-300 hover:text-white  transition-colors hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>

              </Link>
              <div className="relative" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                  <div className="flex items-center">
                    {currentUserProfile.user_icon_url ? (
                      <img
                        src={currentUserProfile.user_icon_url}
                        alt={`${currentUserProfile.display_name || currentUserProfile.username || '不明'}のアイコン`}
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
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-300 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                    >
                      <Link href={`/users/${userId}/profile`} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                        プロフィール
                      </Link>
                      <Link href={`/users/${userId}`} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors">
                        設定
                      </Link>
                      {/* ログアウトボタンの修正 */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-red-500 hover:bg-gray-100 transition-colors w-full text-left focus:outline-none"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        ログアウト
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="space-x-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white hover:underline transition-colors">
                ログイン
              </Link>
              <Link href="/auth/register" className="text-gray-300 hover:text-white hover:underline transition-colors">
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

