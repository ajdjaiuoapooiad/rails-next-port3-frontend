'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { UserCircleIcon } from '@heroicons/react/24/solid'; // Userアイコンをインポート

interface User {
  username: string;
  // 他のユーザー情報 (必要に応じて追加)
}

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // ログインユーザーの状態

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    // ここでログインしているユーザーの情報を取得する処理を記述します
    // 例：APIからユーザー情報を取得
    const fetchCurrentUser = async () => {
      try {
        // 仮のAPIエンドポイント
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const userId = localStorage.getItem('userId'); // ログインユーザーのIDを取得 (例: localStorageから取得)
        const res = await fetch(`${apiUrl}/profiles/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });
        if (res.ok) {
          const userData: User = await res.json();
          setCurrentUser(userData);
        } else {
          console.error('Failed to fetch current user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const displayedUsername: string = currentUser?.username ? (currentUser.username.length > 10 ? currentUser.username.slice(0, 10) + '...' : currentUser.username) : '';

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
          {currentUser ? (
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-gray-300" />
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