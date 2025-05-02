'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-md transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex justify-end">
        <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M18.27 16.27a1 1 0 01-1.414 1.414L12 13.414l-4.853 4.272a1 1 0 01-1.414-1.414L10.586 12 6.314 7.728a1 1 0 011.414-1.414L12 10.586l4.272-4.853a1 1 0 011.414 1.414L13.414 12l4.853 4.272z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <nav className="p-4">
        {/* プロフィール情報 */}
        <Link href="/profile" className="flex items-center mb-4">
        <div className="h-8 w-8 rounded-full bg-gray-400 mr-2" /> {/* アバター */}
        <div>
        <p className="text-sm font-semibold text-white">ユーザー名</p>
        <p className="text-xs text-gray-400">@ハンドル名</p>
        </div>
        </Link>

        {/* 主要なナビゲーションリンク */}
        <Link href="/home" className="block py-2 text-gray-300 hover:text-white">
        ホーム
        </Link>
        <Link href="/notifications" className="block py-2 text-gray-300 hover:text-white">
        通知
        </Link>
        <Link href="/messages" className="block py-2 text-gray-300 hover:text-white">
        メッセージ
        </Link>
        <Link href="/bookmarks" className="block py-2 text-gray-300 hover:text-white">
        ブックマーク
        </Link>
        <Link href="/lists" className="block py-2 text-gray-300 hover:text-white">
        リスト
        </Link>
        <Link href="/communities" className="block py-2 text-gray-300 hover:text-white">
        コミュニティ
        </Link>
        <Link href="/explore" className="block py-2 text-gray-300 hover:text-white">
        探索
        </Link>

        <hr className="border-t border-gray-700 my-4" /> {/* 区切り線 */}

        {/* 設定・アカウント */}
        <Link href="/users/1/profile" className="block py-2 text-gray-300 hover:text-white">
        プロフィール
        </Link>
        <Link href="/settings/account" className="block py-2 text-gray-300 hover:text-white">
        設定とプライバシー
        </Link>
        <Link href="/logout" className="block py-2 text-gray-300 hover:text-white">
        ログアウト
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;